/**
 * Sube los archivos de @ffmpeg/core a R2 bajo ffmpeg/.
 * Necesario porque el .wasm es ~30 MiB y supera el límite de assets
 * de Cloudflare Workers (25 MiB).
 *
 * Uso:
 *   node --env-file=.env scripts/upload-ffmpeg-to-r2.mjs            # dev
 *   node --env-file=.env.production scripts/upload-ffmpeg-to-r2.mjs # prod
 */

import { readFile } from 'node:fs/promises'
import { createHash, createHmac } from 'node:crypto'
import { resolve } from 'node:path'

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

const FILES = [
  { src: 'node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js', key: 'ffmpeg/ffmpeg-core.js', type: 'text/javascript' },
  { src: 'node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm', key: 'ffmpeg/ffmpeg-core.wasm', type: 'application/wasm' },
]

function sigV4Headers({ method, url, body, contentType }) {
  const parsed = new URL(url)
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)
  const payloadHash = createHash('sha256').update(body || '').digest('hex')

  const headers = { host: parsed.host, 'x-amz-date': amzDate, 'x-amz-content-sha256': payloadHash }
  if (contentType) headers['content-type'] = contentType

  const signedHeaders = Object.keys(headers).sort().join(';')
  const canonicalHeaders = Object.keys(headers).sort().map(k => `${k}:${headers[k]}\n`).join('')
  const canonicalRequest = [method, parsed.pathname, '', canonicalHeaders, signedHeaders, payloadHash].join('\n')

  const region = 'auto', service = 's3'
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

console.log(`=== Subiendo ffmpeg core a ${R2_MEDIA_BUCKET} ===`)

for (const { src, key, type } of FILES) {
  const body = await readFile(resolve(process.cwd(), src))
  const url = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_MEDIA_BUCKET}/${key}`
  const headers = sigV4Headers({ method: 'PUT', url, body, contentType: type })

  process.stdout.write(`→ ${key} (${(body.length / 1024 / 1024).toFixed(1)} MB)... `)
  const res = await fetch(url, { method: 'PUT', headers, body })
  if (!res.ok) {
    console.log(`✗ ${res.status}`)
    console.error(await res.text())
    process.exit(1)
  }
  console.log('✓')
}

console.log('\nAccesibles en:')
console.log(`  https://${process.env.R2_MEDIA_DOMAIN}/ffmpeg/ffmpeg-core.js`)
console.log(`  https://${process.env.R2_MEDIA_DOMAIN}/ffmpeg/ffmpeg-core.wasm`)
