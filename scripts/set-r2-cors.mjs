/**
 * Configura la política CORS del bucket R2.
 *
 * Necesario porque algunos <img> usan crossorigin="anonymous" para extraer
 * el color dominante con canvas. Sin CORS el navegador rechaza la imagen.
 *
 * Lee credenciales del .env apuntado por --env-file.
 *
 * Uso:
 *   node --env-file=.env scripts/set-r2-cors.mjs
 *   node --env-file=.env.production scripts/set-r2-cors.mjs
 */

import { createHash, createHmac } from 'node:crypto'

const {
  R2_ACCOUNT_ID,
  R2_MEDIA_ACCESS_KEY_ID,
  R2_MEDIA_SECRET_ACCESS_KEY,
  R2_MEDIA_BUCKET = 'tigrefy',
} = process.env

for (const [k, v] of Object.entries({ R2_ACCOUNT_ID, R2_MEDIA_ACCESS_KEY_ID, R2_MEDIA_SECRET_ACCESS_KEY })) {
  if (!v) {
    console.error(`✗ Falta variable de entorno: ${k}`)
    process.exit(1)
  }
}

// Política permisiva para GETs de imágenes públicas.
// Aceptamos cualquier origen porque las covers son contenido público.
const CORS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>HEAD</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
    <MaxAgeSeconds>3600</MaxAgeSeconds>
  </CORSRule>
</CORSConfiguration>`

function awsSigV4Headers({ method, url, body, contentType }) {
  const parsed = new URL(url)
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)
  const payloadHash = createHash('sha256').update(body || '').digest('hex')

  const headers = {
    host: parsed.host,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
  }
  if (contentType) headers['content-type'] = contentType

  const signedHeaders = Object.keys(headers).sort().join(';')
  const canonicalHeaders = Object.keys(headers).sort().map(k => `${k}:${headers[k]}\n`).join('')
  const queryString = parsed.search ? parsed.search.slice(1) : ''
  const canonicalRequest = [method, parsed.pathname, queryString, canonicalHeaders, signedHeaders, payloadHash].join('\n')

  const region = 'auto'
  const service = 's3'
  const credScope = `${dateStamp}/${region}/${service}/aws4_request`
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credScope, createHash('sha256').update(canonicalRequest).digest('hex')].join('\n')

  const kDate = createHmac('sha256', `AWS4${R2_MEDIA_SECRET_ACCESS_KEY}`).update(dateStamp).digest()
  const kRegion = createHmac('sha256', kDate).update(region).digest()
  const kService = createHmac('sha256', kRegion).update(service).digest()
  const kSigning = createHmac('sha256', kService).update('aws4_request').digest()
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex')

  return {
    Authorization: `AWS4-HMAC-SHA256 Credential=${R2_MEDIA_ACCESS_KEY_ID}/${credScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
    ...(contentType ? { 'Content-Type': contentType } : {}),
  }
}

const url = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_MEDIA_BUCKET}?cors`
const headers = awsSigV4Headers({ method: 'PUT', url, body: CORS_XML, contentType: 'application/xml' })

console.log(`Configurando CORS en bucket: ${R2_MEDIA_BUCKET}`)
const res = await fetch(url, { method: 'PUT', headers, body: CORS_XML })

if (!res.ok) {
  console.error(`✗ Error (${res.status}):`)
  console.error(await res.text())
  process.exit(1)
}

console.log(`✓ CORS configurado correctamente`)
console.log(`\nPolítica aplicada:`)
console.log(`  AllowedOrigin: *`)
console.log(`  AllowedMethod: GET, HEAD`)
console.log(`  AllowedHeader: *`)
console.log(`\nLas peticiones con crossorigin="anonymous" ahora funcionarán.`)
