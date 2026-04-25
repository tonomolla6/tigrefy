/**
 * Cliente R2.
 *
 * - En Cloudflare Workers, usa el binding nativo R2_BUCKET (más rápido).
 * - En desarrollo Node.js, usa la S3 API con AWS Signature V4.
 */

import type { H3Event } from 'h3'

interface R2Binding {
  get(key: string): Promise<R2Object | null>
  put(key: string, value: ArrayBuffer | Uint8Array | string, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>
  delete(key: string): Promise<unknown>
}

interface R2Object {
  body: ReadableStream
  arrayBuffer(): Promise<ArrayBuffer>
  text(): Promise<string>
  size: number
  httpEtag: string
}

function getBinding(event?: H3Event): R2Binding | null {
  if (!event) return null
  const cf = (event.context as any)?.cloudflare
  return cf?.env?.R2_BUCKET ?? null
}

/**
 * Lee un objeto de R2 como string. Devuelve null si no existe.
 */
export async function getR2Object(key: string, event?: H3Event): Promise<string | null> {
  const binding = getBinding(event)
  if (binding) {
    const object = await binding.get(key)
    if (!object) return null
    return await object.text()
  }
  return s3Get(key, 'text') as Promise<string | null>
}

/**
 * Lee un objeto de R2 como ArrayBuffer. Devuelve null si no existe.
 */
export async function getR2ObjectBuffer(key: string, event?: H3Event): Promise<ArrayBuffer | null> {
  const binding = getBinding(event)
  if (binding) {
    const object = await binding.get(key)
    if (!object) return null
    return await object.arrayBuffer()
  }
  return s3Get(key, 'buffer') as Promise<ArrayBuffer | null>
}

/**
 * Sube un objeto a R2 con su Content-Type.
 */
export async function putR2Object(
  key: string,
  body: ArrayBuffer | Uint8Array | string,
  contentType: string,
  event?: H3Event
): Promise<void> {
  const binding = getBinding(event)
  if (binding) {
    await binding.put(key, body, { httpMetadata: { contentType } })
    return
  }
  await s3Put(key, body, contentType)
}

// ============================================================
// Fallback S3 API (solo dev local)
// ============================================================

async function s3Get(key: string, format: 'text' | 'buffer'): Promise<string | ArrayBuffer | null> {
  const config = useRuntimeConfig()
  const url = `https://${config.r2AccountId}.r2.cloudflarestorage.com/${config.r2BucketName}/${key}`
  const headers = await sigV4Headers('GET', url, '')
  const response = await fetch(url, { headers })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`R2 GET ${key} → ${response.status}`)
  return format === 'text' ? await response.text() : await response.arrayBuffer()
}

async function s3Put(key: string, body: ArrayBuffer | Uint8Array | string, contentType: string): Promise<void> {
  const config = useRuntimeConfig()
  const url = `https://${config.r2AccountId}.r2.cloudflarestorage.com/${config.r2BucketName}/${key}`
  const bodyBuffer = typeof body === 'string' ? new TextEncoder().encode(body) : body
  const bodyArray = bodyBuffer instanceof ArrayBuffer ? new Uint8Array(bodyBuffer) : bodyBuffer
  const headers = await sigV4Headers('PUT', url, bodyArray, contentType)
  const response = await fetch(url, { method: 'PUT', headers, body: bodyArray })
  if (!response.ok) throw new Error(`R2 PUT ${key} → ${response.status}`)
}

async function sigV4Headers(
  method: string,
  url: string,
  body: Uint8Array | string,
  contentType?: string
): Promise<Record<string, string>> {
  const config = useRuntimeConfig()
  const parsed = new URL(url)
  const date = new Date()
  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)
  const payloadHash = await sha256Hex(body)

  const headers: Record<string, string> = {
    host: parsed.host,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
  }
  if (contentType) headers['content-type'] = contentType

  const signedHeaders = Object.keys(headers).sort().join(';')
  const canonicalHeaders = Object.keys(headers).sort().map(k => `${k}:${headers[k]}\n`).join('')
  const canonicalRequest = [method, parsed.pathname, '', canonicalHeaders, signedHeaders, payloadHash].join('\n')

  const region = 'auto'
  const service = 's3'
  const credScope = `${dateStamp}/${region}/${service}/aws4_request`
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credScope, await sha256Hex(canonicalRequest)].join('\n')

  const kDate = await hmac(`AWS4${config.r2SecretAccessKey}`, dateStamp)
  const kRegion = await hmac(kDate, region)
  const kService = await hmac(kRegion, service)
  const kSigning = await hmac(kService, 'aws4_request')
  const signature = await hmacHex(kSigning, stringToSign)

  return {
    Authorization: `AWS4-HMAC-SHA256 Credential=${config.r2AccessKeyId}/${credScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
    ...(contentType ? { 'Content-Type': contentType } : {}),
  }
}

async function sha256Hex(data: string | Uint8Array): Promise<string> {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hmac(key: ArrayBuffer | string, message: string): Promise<ArrayBuffer> {
  const keyData = typeof key === 'string' ? new TextEncoder().encode(key) : key
  const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message))
}

async function hmacHex(key: ArrayBuffer, message: string): Promise<string> {
  const sig = await hmac(key, message)
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}
