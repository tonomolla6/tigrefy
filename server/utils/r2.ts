/**
 * Cliente R2 para leer objetos desde Cloudflare R2
 *
 * En Cloudflare Pages/Workers, usamos el binding nativo de R2
 * En desarrollo local, usamos fetch con URLs firmadas o el S3 API
 */

/**
 * Obtiene un objeto de R2 como string
 * @param key - Key del objeto (sin / inicial). Ej: tracks/abc123/index.m3u8
 * @returns Contenido del objeto como string, o null si no existe
 */
export async function getR2Object(key: string): Promise<string | null> {
  const config = useRuntimeConfig()

  // En Cloudflare, usar el binding R2 nativo si está disponible
  // @ts-ignore - R2 binding disponible en runtime de Cloudflare
  if (typeof globalThis.__env__ !== 'undefined' && globalThis.__env__.R2_BUCKET) {
    try {
      // @ts-ignore
      const object = await globalThis.__env__.R2_BUCKET.get(key)
      if (!object) return null
      return await object.text()
    } catch (error) {
      console.error('Error fetching from R2 binding:', error)
      return null
    }
  }

  // Fallback: usar S3 API via fetch (compatible con R2)
  try {
    const url = `https://${config.r2AccountId}.r2.cloudflarestorage.com/${config.r2BucketName}/${key}`

    // Generar headers de autenticación AWS Signature V4
    const headers = await generateAwsSignatureHeaders(
      'GET',
      url,
      config.r2AccessKeyId,
      config.r2SecretAccessKey,
      config.r2AccountId
    )

    const response = await fetch(url, { headers })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`R2 fetch failed: ${response.status}`)
    }

    return await response.text()
  } catch (error: any) {
    console.error('Error fetching from R2:', error)
    throw error
  }
}

/**
 * Obtiene un objeto de R2 como ArrayBuffer (para binarios)
 * @param key - Key del objeto
 * @returns ArrayBuffer del objeto, o null si no existe
 */
export async function getR2ObjectBuffer(key: string): Promise<ArrayBuffer | null> {
  const config = useRuntimeConfig()

  // @ts-ignore - R2 binding
  if (typeof globalThis.__env__ !== 'undefined' && globalThis.__env__.R2_BUCKET) {
    try {
      // @ts-ignore
      const object = await globalThis.__env__.R2_BUCKET.get(key)
      if (!object) return null
      return await object.arrayBuffer()
    } catch (error) {
      console.error('Error fetching from R2 binding:', error)
      return null
    }
  }

  // Fallback: usar S3 API via fetch
  try {
    const url = `https://${config.r2AccountId}.r2.cloudflarestorage.com/${config.r2BucketName}/${key}`

    const headers = await generateAwsSignatureHeaders(
      'GET',
      url,
      config.r2AccessKeyId,
      config.r2SecretAccessKey,
      config.r2AccountId
    )

    const response = await fetch(url, { headers })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`R2 fetch failed: ${response.status}`)
    }

    return await response.arrayBuffer()
  } catch (error: any) {
    console.error('Error fetching from R2:', error)
    throw error
  }
}

/**
 * Sube un objeto a R2
 * @param key - Key del objeto
 * @param body - Contenido del objeto
 * @param contentType - Tipo MIME del objeto
 */
export async function putR2Object(
  key: string,
  body: ArrayBuffer | Uint8Array | string,
  contentType: string
): Promise<void> {
  const config = useRuntimeConfig()

  // @ts-ignore - R2 binding
  if (typeof globalThis.__env__ !== 'undefined' && globalThis.__env__.R2_BUCKET) {
    // @ts-ignore
    await globalThis.__env__.R2_BUCKET.put(key, body, {
      httpMetadata: { contentType }
    })
    return
  }

  // Fallback: usar S3 API via fetch
  const url = `https://${config.r2AccountId}.r2.cloudflarestorage.com/${config.r2BucketName}/${key}`

  const headers = await generateAwsSignatureHeaders(
    'PUT',
    url,
    config.r2AccessKeyId,
    config.r2SecretAccessKey,
    config.r2AccountId,
    contentType
  )

  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body,
  })

  if (!response.ok) {
    throw new Error(`R2 upload failed: ${response.status}`)
  }
}

/**
 * Genera headers de autenticación AWS Signature V4 para R2
 * Simplificado para operaciones básicas GET/PUT
 */
async function generateAwsSignatureHeaders(
  method: string,
  url: string,
  accessKeyId: string,
  secretAccessKey: string,
  accountId: string,
  contentType?: string
): Promise<Record<string, string>> {
  const parsedUrl = new URL(url)
  const date = new Date()
  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)

  const host = parsedUrl.host
  const path = parsedUrl.pathname

  // Headers canónicos
  const headers: Record<string, string> = {
    'host': host,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
  }

  if (contentType) {
    headers['content-type'] = contentType
  }

  const signedHeaders = Object.keys(headers).sort().join(';')
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map(k => `${k}:${headers[k]}\n`)
    .join('')

  // Request canónico
  const canonicalRequest = [
    method,
    path,
    '', // query string
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD'
  ].join('\n')

  // String to sign
  const algorithm = 'AWS4-HMAC-SHA256'
  const region = 'auto'
  const service = 's3'
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`

  const canonicalRequestHash = await sha256Hex(canonicalRequest)
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    canonicalRequestHash
  ].join('\n')

  // Signing key
  const kDate = await hmacSha256(`AWS4${secretAccessKey}`, dateStamp)
  const kRegion = await hmacSha256(kDate, region)
  const kService = await hmacSha256(kRegion, service)
  const kSigning = await hmacSha256(kService, 'aws4_request')

  // Signature
  const signature = await hmacSha256Hex(kSigning, stringToSign)

  // Authorization header
  const authorization = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  return {
    'Authorization': authorization,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
    ...(contentType ? { 'Content-Type': contentType } : {})
  }
}

async function sha256Hex(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function hmacSha256(key: ArrayBuffer | string, message: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const keyData = typeof key === 'string' ? encoder.encode(key) : key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message))
}

async function hmacSha256Hex(key: ArrayBuffer, message: string): Promise<string> {
  const signature = await hmacSha256(key, message)
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
