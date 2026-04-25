/**
 * Borra carpetas tracks/<id>/ del bucket R2 que no correspondan a ninguna canción
 * existente en Turso. Útil tras experimentos o migraciones fallidas.
 *
 * Uso:
 *   node --env-file=.env scripts/clean-r2-orphan-tracks.mjs            # dev
 *   node --env-file=.env.production scripts/clean-r2-orphan-tracks.mjs # prod
 *   añade --confirm para ejecutar borrado real (sin él hace dry-run)
 */

import { createHash, createHmac } from 'node:crypto'
import { createClient } from '@libsql/client'

const {
  TURSO_DATABASE_URL,
  TURSO_AUTH_TOKEN,
  R2_ACCOUNT_ID,
  R2_MEDIA_ACCESS_KEY_ID,
  R2_MEDIA_SECRET_ACCESS_KEY,
  R2_MEDIA_BUCKET = 'tigrefy',
} = process.env

for (const [k, v] of Object.entries({ TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, R2_ACCOUNT_ID, R2_MEDIA_ACCESS_KEY_ID, R2_MEDIA_SECRET_ACCESS_KEY })) {
  if (!v) {
    console.error(`✗ Falta variable: ${k}`)
    process.exit(1)
  }
}

const DRY_RUN = !process.argv.includes('--confirm')

function sigV4Headers({ method, url, body = '', contentType }) {
  const parsed = new URL(url)
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)
  const payloadHash = createHash('sha256').update(body || '').digest('hex')

  const headers = { host: parsed.host, 'x-amz-date': amzDate, 'x-amz-content-sha256': payloadHash }
  if (contentType) headers['content-type'] = contentType

  const signedHeaders = Object.keys(headers).sort().join(';')
  const canonicalHeaders = Object.keys(headers).sort().map(k => `${k}:${headers[k]}\n`).join('')
  const queryString = parsed.search ? parsed.search.slice(1).split('&').sort().join('&') : ''
  const canonicalRequest = [method, parsed.pathname, queryString, canonicalHeaders, signedHeaders, payloadHash].join('\n')

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

async function listAll(prefix) {
  const all = []
  let token = null
  do {
    const params = new URLSearchParams({ 'list-type': '2', prefix })
    if (token) params.set('continuation-token', token)
    const url = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_MEDIA_BUCKET}?${params.toString()}`
    const headers = sigV4Headers({ method: 'GET', url })
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`LIST → ${res.status}: ${(await res.text()).slice(0, 200)}`)
    const xml = await res.text()
    const keys = [...xml.matchAll(/<Key>([^<]+)<\/Key>/g)].map(m => m[1])
    all.push(...keys)
    const isTruncated = /<IsTruncated>true<\/IsTruncated>/.test(xml)
    const m = xml.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/)
    token = isTruncated && m ? m[1] : null
  } while (token)
  return all
}

async function deleteKey(key) {
  const url = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_MEDIA_BUCKET}/${key}`
  const headers = sigV4Headers({ method: 'DELETE', url })
  const res = await fetch(url, { method: 'DELETE', headers })
  if (!res.ok && res.status !== 404) throw new Error(`DELETE ${key} → ${res.status}`)
}

async function main() {
  console.log(`=== Limpieza tracks/ huérfanos en R2 ===`)
  console.log(`Bucket: ${R2_MEDIA_BUCKET}`)
  console.log(`Mode  : ${DRY_RUN ? 'DRY-RUN (añade --confirm para borrar)' : 'BORRADO REAL'}\n`)

  // 1. IDs vivos en Turso
  const db = createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN })
  const songs = await db.execute('SELECT id FROM songs')
  const validIds = new Set(songs.rows.map(r => r.id))
  console.log(`Canciones en Turso: ${validIds.size}`)

  // 2. Listar todo lo que hay en R2 bajo tracks/
  const keys = await listAll('tracks/')
  console.log(`Archivos en R2 tracks/: ${keys.length}`)

  // 3. Agrupar por id
  const byId = new Map()
  for (const key of keys) {
    const m = key.match(/^tracks\/([^/]+)\//)
    if (!m) continue
    const id = m[1]
    if (!byId.has(id)) byId.set(id, [])
    byId.get(id).push(key)
  }

  // 4. Identificar huérfanos
  const orphanIds = [...byId.keys()].filter(id => !validIds.has(id))
  if (orphanIds.length === 0) {
    console.log(`\n✓ No hay tracks/ huérfanos`)
    return
  }

  console.log(`\nTracks huérfanos: ${orphanIds.length}`)
  let totalFiles = 0
  for (const id of orphanIds) {
    const files = byId.get(id)
    console.log(`  ${id} (${files.length} archivos)`)
    totalFiles += files.length
  }
  console.log(`Total archivos a borrar: ${totalFiles}\n`)

  if (DRY_RUN) {
    console.log('Dry-run terminado. Vuelve a lanzar con --confirm para borrar de verdad.')
    return
  }

  let deleted = 0
  for (const id of orphanIds) {
    for (const key of byId.get(id)) {
      await deleteKey(key)
      deleted++
      if (deleted % 50 === 0) process.stdout.write(`  ${deleted}/${totalFiles}\r`)
    }
  }
  console.log(`\n✓ Borrados ${deleted} archivos`)
}

main().catch(err => {
  console.error('\n✗', err)
  process.exit(1)
})
