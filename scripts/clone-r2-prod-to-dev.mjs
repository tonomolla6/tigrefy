/**
 * Clona los archivos de audio HLS desde el bucket R2 de PROD al de DEV.
 *
 * Necesario tras `clone-prod-to-dev.mjs` (que copia la BD): la BD trae los
 * songIds de prod pero los `tracks/<songId>/*` viven en el bucket de prod
 * (`tigrefy`). Sin esto, dev intenta reproducir audio que no existe en su
 * bucket (`tigrefy-dev`).
 *
 * Lee:
 *   - PROD: R2_ACCOUNT_ID, R2_MEDIA_ACCESS_KEY_ID, R2_MEDIA_SECRET_ACCESS_KEY,
 *           R2_MEDIA_BUCKET de .env.production
 *   - DEV:  los mismos de .env (account_id es el mismo, las keys distintas)
 *
 * Por seguridad requiere flag --confirm.
 *
 * Uso:
 *   node scripts/clone-r2-prod-to-dev.mjs --confirm
 */

import { readFileSync } from 'node:fs'
import { createHash, createHmac } from 'node:crypto'

if (!process.argv.includes('--confirm')) {
  console.error('✗ Falta flag --confirm.')
  console.error('  Uso: node scripts/clone-r2-prod-to-dev.mjs --confirm')
  process.exit(1)
}

function parseEnv(path) {
  const out = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (m) out[m[1]] = m[2].trim()
  }
  return out
}

const dev = parseEnv('.env')
const prod = parseEnv('.env.production')

const REQUIRED = ['R2_ACCOUNT_ID', 'R2_MEDIA_ACCESS_KEY_ID', 'R2_MEDIA_SECRET_ACCESS_KEY', 'R2_MEDIA_BUCKET']
for (const k of REQUIRED) {
  if (!dev[k]) { console.error(`✗ Falta ${k} en .env`); process.exit(1) }
  if (!prod[k]) { console.error(`✗ Falta ${k} en .env.production`); process.exit(1) }
}
if (dev.R2_MEDIA_BUCKET === prod.R2_MEDIA_BUCKET) {
  console.error('✗ DEV y PROD apuntan al mismo bucket. Abortando.')
  process.exit(1)
}

console.log(`PROD bucket: ${prod.R2_MEDIA_BUCKET}`)
console.log(`DEV  bucket: ${dev.R2_MEDIA_BUCKET}`)
console.log()

const PREFIX = 'tracks/'
const ENDPOINT = `https://${prod.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

// Devuelve los headers SigV4 firmados para R2/S3.
// Importante: las queries van también canonicalizadas.
function sigV4({ method, bucket, key, query = '', body, contentType, creds }) {
  const url = new URL(`${ENDPOINT}/${bucket}/${key}${query}`)
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)
  const payloadHash = body
    ? createHash('sha256').update(body).digest('hex')
    : createHash('sha256').update('').digest('hex')

  const headers = {
    host: url.host,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
  }
  if (contentType) headers['content-type'] = contentType

  const signedHeaders = Object.keys(headers).sort().join(';')
  const canonicalHeaders = Object.keys(headers).sort().map(k => `${k}:${headers[k]}\n`).join('')
  // Canonical query string: ordenar y URL-encode los valores
  const canonicalQuery = url.search
    ? [...url.searchParams.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')
    : ''
  const canonicalRequest = [
    method,
    url.pathname,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')

  const region = 'auto'
  const service = 's3'
  const credScope = `${dateStamp}/${region}/${service}/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credScope,
    createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n')

  const kDate = createHmac('sha256', `AWS4${creds.secret}`).update(dateStamp).digest()
  const kRegion = createHmac('sha256', kDate).update(region).digest()
  const kService = createHmac('sha256', kRegion).update(service).digest()
  const kSigning = createHmac('sha256', kService).update('aws4_request').digest()
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex')

  return {
    url: url.toString(),
    headers: {
      Authorization: `AWS4-HMAC-SHA256 Credential=${creds.key}/${credScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': payloadHash,
      ...(contentType ? { 'Content-Type': contentType } : {}),
    },
  }
}

async function listObjects(bucket, prefix, creds) {
  // ListObjectsV2: GET /{bucket}?list-type=2&prefix=...
  const allKeys = []
  let continuationToken = null
  do {
    const params = new URLSearchParams({
      'list-type': '2',
      prefix,
      'max-keys': '1000',
    })
    if (continuationToken) params.set('continuation-token', continuationToken)
    const query = '?' + params.toString()
    const { url, headers } = sigV4({ method: 'GET', bucket, key: '', query, creds })
    const res = await fetch(url, { method: 'GET', headers })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`LIST ${bucket} → ${res.status}: ${text.slice(0, 300)}`)
    }
    const xml = await res.text()
    // Parser XML rudimentario (lo justo para sacar <Key> y <NextContinuationToken>)
    const keys = [...xml.matchAll(/<Key>([^<]+)<\/Key>/g)].map(m => m[1])
    allKeys.push(...keys)
    const nextMatch = xml.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/)
    continuationToken = nextMatch ? nextMatch[1] : null
  } while (continuationToken)
  return allKeys
}

async function getObject(bucket, key, creds) {
  const { url, headers } = sigV4({ method: 'GET', bucket, key, creds })
  const res = await fetch(url, { method: 'GET', headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GET ${key} → ${res.status}: ${text.slice(0, 200)}`)
  }
  const contentType = res.headers.get('content-type') || 'application/octet-stream'
  const buf = new Uint8Array(await res.arrayBuffer())
  return { body: buf, contentType }
}

async function headObject(bucket, key, creds) {
  const { url, headers } = sigV4({ method: 'HEAD', bucket, key, creds })
  const res = await fetch(url, { method: 'HEAD', headers })
  return res.ok
}

async function putObject(bucket, key, body, contentType, creds) {
  const { url, headers } = sigV4({ method: 'PUT', bucket, key, body, contentType, creds })
  const res = await fetch(url, { method: 'PUT', headers, body })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PUT ${key} → ${res.status}: ${text.slice(0, 200)}`)
  }
}

async function main() {
  const prodCreds = { key: prod.R2_MEDIA_ACCESS_KEY_ID, secret: prod.R2_MEDIA_SECRET_ACCESS_KEY }
  const devCreds  = { key: dev.R2_MEDIA_ACCESS_KEY_ID,  secret: dev.R2_MEDIA_SECRET_ACCESS_KEY }

  console.log(`→ Listando objetos en ${prod.R2_MEDIA_BUCKET} con prefijo "${PREFIX}"...`)
  const keys = await listObjects(prod.R2_MEDIA_BUCKET, PREFIX, prodCreds)
  console.log(`  ${keys.length} objetos encontrados\n`)

  if (keys.length === 0) {
    console.log('Nada que copiar.')
    return
  }

  console.log(`→ Copiando a ${dev.R2_MEDIA_BUCKET}...`)
  let copied = 0, skipped = 0, failed = 0
  for (const key of keys) {
    try {
      // Skip si ya existe en dev (idempotente).
      if (await headObject(dev.R2_MEDIA_BUCKET, key, devCreds)) {
        skipped++
        process.stdout.write(`  · ${key} (ya existe)\n`)
        continue
      }
      const { body, contentType } = await getObject(prod.R2_MEDIA_BUCKET, key, prodCreds)
      await putObject(dev.R2_MEDIA_BUCKET, key, body, contentType, devCreds)
      copied++
      process.stdout.write(`  ✓ ${key} (${(body.length / 1024).toFixed(0)} KB)\n`)
    } catch (err) {
      failed++
      process.stdout.write(`  ✗ ${key} — ${err.message}\n`)
    }
  }

  console.log(`\n✓ Copiados: ${copied}`)
  if (skipped > 0) console.log(`· Saltados: ${skipped}`)
  if (failed > 0) console.log(`✗ Fallidos: ${failed}`)
}

main().catch(err => {
  console.error('\n✗ Error:', err)
  process.exit(1)
})
