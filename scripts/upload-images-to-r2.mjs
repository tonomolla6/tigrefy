/**
 * Sube todas las imágenes de public/covers/ y public/artists/ a R2.
 *
 * Mantiene los mismos paths: public/covers/foo.jpg → R2 covers/foo.jpg
 * Idempotente: si ya existe un archivo, lo sobrescribe.
 *
 * Uso: node --env-file=.env scripts/upload-images-to-r2.mjs
 */

import { readdir, readFile, stat } from 'node:fs/promises'
import { join, extname } from 'node:path'
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

const PUBLIC_DIR = join(process.cwd(), 'public')
const FOLDERS = ['covers', 'artists']

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

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
  const canonicalRequest = [method, parsed.pathname, '', canonicalHeaders, signedHeaders, payloadHash].join('\n')

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

async function uploadFile(localPath, r2Key) {
  const body = await readFile(localPath)
  const ext = extname(r2Key).toLowerCase()
  const contentType = MIME_BY_EXT[ext] || 'application/octet-stream'
  const url = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_MEDIA_BUCKET}/${r2Key}`
  const headers = awsSigV4Headers({ method: 'PUT', url, body, contentType })
  const res = await fetch(url, { method: 'PUT', headers, body })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PUT ${r2Key} → ${res.status}: ${text.slice(0, 200)}`)
  }
}

async function listFiles(dir) {
  try {
    const entries = await readdir(dir)
    const files = []
    for (const entry of entries) {
      const full = join(dir, entry)
      const s = await stat(full)
      if (s.isFile()) files.push({ name: entry, path: full })
    }
    return files
  } catch (err) {
    if (err.code === 'ENOENT') return []
    throw err
  }
}

async function main() {
  console.log('=== Migración de imágenes a R2 ===')
  console.log(`Bucket: ${R2_MEDIA_BUCKET}`)
  console.log(`Origen: ${PUBLIC_DIR}\n`)

  let total = 0
  let failed = 0

  for (const folder of FOLDERS) {
    const dir = join(PUBLIC_DIR, folder)
    const files = await listFiles(dir)
    if (files.length === 0) {
      console.log(`📁 ${folder}/ → 0 archivos (saltado)`)
      continue
    }
    console.log(`📁 ${folder}/ → ${files.length} archivos`)
    for (const file of files) {
      const key = `${folder}/${file.name}`
      try {
        await uploadFile(file.path, key)
        process.stdout.write(`  ✓ ${file.name}\n`)
        total++
      } catch (err) {
        process.stdout.write(`  ✗ ${file.name} — ${err.message}\n`)
        failed++
      }
    }
  }

  console.log(`\n✓ Subidos: ${total}`)
  if (failed > 0) console.log(`✗ Fallidos: ${failed}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
