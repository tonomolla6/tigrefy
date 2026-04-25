/**
 * Diagnóstico de configuración R2 + URL Token Authentication.
 *
 * 1. Sube un archivo de prueba al bucket vía S3 API.
 * 2. Genera una URL firmada y la prueba contra el dominio público.
 * 3. Prueba la misma URL SIN token para detectar si Token Auth está activo.
 *
 * Uso: node --env-file=.env scripts/test-r2-setup.mjs
 */

import { createHash, createHmac } from 'node:crypto'

const {
  R2_ACCOUNT_ID,
  R2_MEDIA_ACCESS_KEY_ID,
  R2_MEDIA_SECRET_ACCESS_KEY,
  R2_MEDIA_BUCKET = 'tigrefy',
  R2_MEDIA_DOMAIN,
  R2_SIGNING_SECRET,
} = process.env

const required = {
  R2_ACCOUNT_ID,
  R2_MEDIA_ACCESS_KEY_ID,
  R2_MEDIA_SECRET_ACCESS_KEY,
  R2_MEDIA_DOMAIN,
  R2_SIGNING_SECRET,
}

for (const [k, v] of Object.entries(required)) {
  if (!v) {
    console.error(`✗ Falta variable de entorno: ${k}`)
    process.exit(1)
  }
}

const TEST_KEY = 'covers/_diagnostic.txt'
const TEST_BODY = `tigrefy r2 diagnostic ${new Date().toISOString()}`

function awsSigV4Headers({ method, url, body, accessKeyId, secretAccessKey, contentType }) {
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
  const canonicalRequest = [method, parsed.pathname, '', canonicalHeaders, signedHeaders, payloadHash].join('\n')

  const region = 'auto'
  const service = 's3'
  const credScope = `${dateStamp}/${region}/${service}/aws4_request`
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credScope, createHash('sha256').update(canonicalRequest).digest('hex')].join('\n')

  const kDate = createHmac('sha256', `AWS4${secretAccessKey}`).update(dateStamp).digest()
  const kRegion = createHmac('sha256', kDate).update(region).digest()
  const kService = createHmac('sha256', kRegion).update(service).digest()
  const kSigning = createHmac('sha256', kService).update('aws4_request').digest()
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex')

  return {
    Authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
    ...(contentType ? { 'Content-Type': contentType } : {}),
  }
}

function signPath(path, expires, secret) {
  const sig = createHmac('sha256', secret).update(`${path}${expires}`).digest()
  return Buffer.from(sig).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function step(label, fn) {
  process.stdout.write(`\n→ ${label}\n`)
  try {
    const result = await fn()
    return result
  } catch (err) {
    console.error(`  ✗ ${err.message}`)
    throw err
  }
}

console.log('=== Diagnóstico R2 ===')
console.log(`Account: ${R2_ACCOUNT_ID}`)
console.log(`Bucket:  ${R2_MEDIA_BUCKET}`)
console.log(`Domain:  ${R2_MEDIA_DOMAIN}`)

// 1. Subir archivo de prueba vía S3 API
const s3Url = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_MEDIA_BUCKET}/${TEST_KEY}`
await step(`1. Subir ${TEST_KEY} vía S3 API`, async () => {
  const headers = awsSigV4Headers({
    method: 'PUT',
    url: s3Url,
    body: TEST_BODY,
    accessKeyId: R2_MEDIA_ACCESS_KEY_ID,
    secretAccessKey: R2_MEDIA_SECRET_ACCESS_KEY,
    contentType: 'text/plain',
  })
  const res = await fetch(s3Url, { method: 'PUT', headers, body: TEST_BODY })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PUT falló (${res.status}): ${text.slice(0, 200)}`)
  }
  console.log(`  ✓ Subida OK (${res.status})`)
})

// 2. Probar dominio público SIN firma
const publicPath = `/${TEST_KEY}`
const publicUrl = `https://${R2_MEDIA_DOMAIN}${publicPath}`

const noTokenStatus = await step(`2. GET ${publicUrl} (sin token)`, async () => {
  const res = await fetch(publicUrl)
  console.log(`  ← HTTP ${res.status}`)
  return res.status
})

// 3. Probar con firma HMAC
const expires = Math.floor(Date.now() / 1000) + 300
const token = signPath(publicPath, expires, R2_SIGNING_SECRET)
const signedUrl = `${publicUrl}?expires=${expires}&token=${token}`

const signedStatus = await step(`3. GET con firma (${publicPath})`, async () => {
  const res = await fetch(signedUrl)
  console.log(`  ← HTTP ${res.status}`)
  if (res.ok) {
    const body = await res.text()
    console.log(`  ← Body: "${body.slice(0, 80)}"`)
  } else {
    const text = await res.text()
    console.log(`  ← Body: ${text.slice(0, 200)}`)
  }
  return res.status
})

// 4. Diagnóstico
console.log('\n=== Resultado ===')
const noToken = noTokenStatus === 200
const signedOk = signedStatus === 200

if (signedOk && !noToken) {
  console.log('✓ PERFECTO: URL Token Authentication está activo y la firma valida.')
} else if (signedOk && noToken) {
  console.log('⚠ El bucket sirve archivos públicamente SIN token (Token Auth NO activo).')
  console.log('  → Activa "URL Token Authentication" en R2 settings con el mismo secreto.')
} else if (!signedOk && noToken) {
  console.log('⚠ El dominio sirve público pero la firma NO valida.')
  console.log('  → Token Auth no está activo Y el secreto puede estar mal.')
} else {
  console.log('✗ Ni con token ni sin token funciona.')
  console.log(`  → Status sin token: ${noTokenStatus}, status firmado: ${signedStatus}`)
  console.log('  → Revisa: dominio conectado al bucket, secreto correcto, propagación DNS.')
}
console.log(`\nURL firmada de prueba (válida 5 min):\n${signedUrl}`)
