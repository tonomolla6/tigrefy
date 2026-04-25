/**
 * Migra todos los MP3 de public/audio/ a HLS en R2 + actualiza audio_url en Turso.
 *
 * Pasos por canción (las que tengan audio_url empezando por "/audio/"):
 *   1. Extrae filename de audio_url
 *   2. Convierte MP3 → HLS con ffmpeg en output/tracks/<songId>/
 *   3. Sube todos los archivos a R2 bajo tracks/<songId>/
 *   4. Actualiza songs.audio_url = <songId> en Turso
 *
 * Las canciones ya migradas (audio_url no contiene "/") se saltan.
 *
 * Uso:
 *   node --env-file=.env scripts/migrate-mp3-to-hls.mjs           # dev
 *   node --env-file=.env.production scripts/migrate-mp3-to-hls.mjs  # prod
 *
 * Idempotente: si ya hay HLS en R2 lo sobrescribe; si audio_url ya es ID, la salta.
 */

import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import { join, basename } from 'node:path'
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
    console.error(`✗ Falta variable de entorno: ${k}`)
    process.exit(1)
  }
}

const PUBLIC_AUDIO_DIR = join(process.cwd(), 'public', 'audio')
const OUTPUT_DIR = join(process.cwd(), 'output', 'tracks')

// ============================================================
// FFmpeg: MP3 → HLS (segmentos AAC de 3s)
// ============================================================
async function convertToHls(inputPath, outputDir) {
  await fs.mkdir(outputDir, { recursive: true })
  const args = [
    '-y',                                    // overwrite
    '-i', inputPath,
    '-c:a', 'aac',
    '-b:a', '128k',
    '-vn',                                   // no video
    '-hls_time', '3',
    '-hls_list_size', '0',
    '-hls_segment_filename', join(outputDir, 'segment%03d.ts'),
    join(outputDir, 'index.m3u8'),
  ]

  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stderr = ''
    proc.stderr.on('data', d => { stderr += d.toString() })
    proc.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(`ffmpeg exit ${code}: ${stderr.slice(-500)}`))
    })
    proc.on('error', reject)
  })
}

// ============================================================
// R2: AWS Sig V4 PUT
// ============================================================
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

async function uploadToR2(key, body, contentType) {
  const url = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_MEDIA_BUCKET}/${key}`
  const headers = sigV4Headers({ method: 'PUT', url, body, contentType })
  const res = await fetch(url, { method: 'PUT', headers, body })
  if (!res.ok) throw new Error(`PUT ${key} → ${res.status}: ${(await res.text()).slice(0, 200)}`)
}

async function uploadHlsDir(localDir, songId) {
  const files = await fs.readdir(localDir)
  for (const file of files) {
    const content = await fs.readFile(join(localDir, file))
    const key = `tracks/${songId}/${file}`
    let contentType = 'application/octet-stream'
    if (file.endsWith('.m3u8')) contentType = 'application/vnd.apple.mpegurl'
    else if (file.endsWith('.ts')) contentType = 'video/MP2T'
    await uploadToR2(key, content, contentType)
  }
  return files.length
}

// ============================================================
// Main
// ============================================================
async function main() {
  console.log('=== Migración MP3 → HLS + R2 ===')
  console.log(`Bucket Turso: ${TURSO_DATABASE_URL}`)
  console.log(`Bucket R2:    ${R2_MEDIA_BUCKET}\n`)

  const db = createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN })
  const songs = await db.execute('SELECT id, title, audio_url FROM songs')

  let migrated = 0
  let skipped = 0
  let failed = 0

  for (const row of songs.rows) {
    const songId = row.id
    const audioUrl = row.audio_url
    const title = row.title

    // Ya migrada (audioUrl es ID, no path)
    if (!audioUrl.startsWith('/')) {
      console.log(`⊘ ${title.padEnd(45)} ya migrada (audio_url=${audioUrl})`)
      skipped++
      continue
    }

    const filename = basename(audioUrl)
    const mp3Path = join(PUBLIC_AUDIO_DIR, filename)

    // ¿Existe el MP3 local?
    try {
      await fs.access(mp3Path)
    } catch {
      console.error(`✗ ${title.padEnd(45)} MP3 no encontrado: ${mp3Path}`)
      failed++
      continue
    }

    const outDir = join(OUTPUT_DIR, songId)
    process.stdout.write(`→ ${title.padEnd(45)} `)

    try {
      // 1. Convertir
      process.stdout.write('convirtiendo... ')
      await convertToHls(mp3Path, outDir)

      // 2. Subir a R2
      process.stdout.write('subiendo... ')
      const fileCount = await uploadHlsDir(outDir, songId)

      // 3. Actualizar Turso
      process.stdout.write('BD... ')
      await db.execute({ sql: 'UPDATE songs SET audio_url = ? WHERE id = ?', args: [songId, songId] })

      console.log(`✓ (${fileCount} archivos)`)
      migrated++
    } catch (err) {
      console.log(`✗ ${err.message}`)
      failed++
    }
  }

  console.log(`\n✓ Migradas: ${migrated}`)
  if (skipped > 0) console.log(`⊘ Saltadas: ${skipped}`)
  if (failed > 0) console.log(`✗ Fallidas: ${failed}`)
}

main().catch(err => {
  console.error('\n✗ Fatal:', err)
  process.exit(1)
})
