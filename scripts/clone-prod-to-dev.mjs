/**
 * Clona schema + datos de la BD de PROD a la de DEV en Turso.
 *
 * Lee:
 *   - PROD: TURSO_DATABASE_URL + TURSO_AUTH_TOKEN del .env.production
 *   - DEV : TURSO_DATABASE_URL + TURSO_AUTH_TOKEN del .env
 *
 * Borra TODOS los datos de dev y los reemplaza por los de prod.
 * Por seguridad requiere flag --confirm.
 *
 * Uso:
 *   node scripts/clone-prod-to-dev.mjs --confirm
 */

import { createClient } from '@libsql/client'
import { readFileSync } from 'node:fs'

if (!process.argv.includes('--confirm')) {
  console.error('✗ Falta flag --confirm. Esto BORRA todo en dev.')
  console.error('  Uso: node scripts/clone-prod-to-dev.mjs --confirm')
  process.exit(1)
}

function parseEnv(path) {
  const out = {}
  const lines = readFileSync(path, 'utf8').split('\n')
  for (const line of lines) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (m) out[m[1]] = m[2].trim()
  }
  return out
}

const devEnv = parseEnv('.env')
const prodEnv = parseEnv('.env.production')

if (!devEnv.TURSO_DATABASE_URL || !devEnv.TURSO_AUTH_TOKEN) {
  console.error('✗ .env no tiene TURSO_DATABASE_URL/TOKEN')
  process.exit(1)
}
if (!prodEnv.TURSO_DATABASE_URL || !prodEnv.TURSO_AUTH_TOKEN) {
  console.error('✗ .env.production no tiene TURSO_DATABASE_URL/TOKEN')
  process.exit(1)
}
if (devEnv.TURSO_DATABASE_URL === prodEnv.TURSO_DATABASE_URL) {
  console.error('✗ DEV y PROD apuntan a la misma URL. Abortando.')
  process.exit(1)
}

console.log(`PROD: ${prodEnv.TURSO_DATABASE_URL}`)
console.log(`DEV : ${devEnv.TURSO_DATABASE_URL}`)
console.log('')

const prod = createClient({ url: prodEnv.TURSO_DATABASE_URL, authToken: prodEnv.TURSO_AUTH_TOKEN })
const dev = createClient({ url: devEnv.TURSO_DATABASE_URL, authToken: devEnv.TURSO_AUTH_TOKEN })

// Orden de inserción (parents → children) para respetar FKs.
// Para borrar usaremos el orden inverso.
const TABLES_INSERT_ORDER = [
  'users',
  'artists',
  'genres',
  'albums',
  'songs',
  'playlists',
  'playlist_songs',
  'saved_playlists',
  'saved_albums',
  'artist_followers',
  'song_likes',
  'song_genres',
  'user_favorites',
  'user_play_history',
  'user_search_history',
  'user_sessions',
]

async function listTables(client) {
  const r = await client.execute(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle%'`)
  return r.rows.map(row => row.name)
}

async function tableColumns(client, table) {
  const r = await client.execute(`PRAGMA table_info("${table}")`)
  return r.rows.map(row => row.name)
}

async function copyTable(table) {
  const cols = await tableColumns(dev, table)
  if (cols.length === 0) {
    console.log(`  ⚠ ${table}: no existe en dev (saltado)`)
    return { copied: 0, skipped: true }
  }

  const colList = cols.map(c => `"${c}"`).join(', ')
  const placeholders = cols.map(() => '?').join(', ')

  const src = await prod.execute(`SELECT ${colList} FROM "${table}"`)
  if (src.rows.length === 0) return { copied: 0, skipped: false }

  // libsql client soporta batch
  const stmts = src.rows.map(row => ({
    sql: `INSERT INTO "${table}" (${colList}) VALUES (${placeholders})`,
    args: cols.map(c => row[c])
  }))

  // Insertar en chunks de 500 para no sobrecargar
  const CHUNK = 500
  for (let i = 0; i < stmts.length; i += CHUNK) {
    await dev.batch(stmts.slice(i, i + CHUNK), 'write')
  }

  return { copied: src.rows.length, skipped: false }
}

async function main() {
  // 1. Listar tablas que existen en ambas
  const devTables = new Set(await listTables(dev))
  const prodTables = new Set(await listTables(prod))

  console.log(`Tablas en prod: ${prodTables.size}`)
  console.log(`Tablas en dev : ${devTables.size}\n`)

  const missingInDev = [...prodTables].filter(t => !devTables.has(t))
  if (missingInDev.length > 0) {
    console.error(`✗ Tablas en prod pero no en dev (corre primero "npm run db:migrate"):`)
    missingInDev.forEach(t => console.error(`  - ${t}`))
    process.exit(1)
  }

  // 2. Borrar dev en orden inverso (FKs)
  console.log('→ Vaciando dev...')
  await dev.execute('PRAGMA foreign_keys = OFF')
  for (const table of [...TABLES_INSERT_ORDER].reverse()) {
    if (!devTables.has(table)) continue
    await dev.execute(`DELETE FROM "${table}"`)
    process.stdout.write(`  ✓ ${table}\n`)
  }

  // 3. Copiar prod → dev en orden parents-first
  console.log('\n→ Copiando datos prod → dev...')
  let total = 0
  for (const table of TABLES_INSERT_ORDER) {
    if (!prodTables.has(table)) {
      console.log(`  ⚠ ${table}: no existe en prod (saltado)`)
      continue
    }
    const { copied } = await copyTable(table)
    console.log(`  ✓ ${table.padEnd(25)} ${copied} filas`)
    total += copied
  }

  await dev.execute('PRAGMA foreign_keys = ON')

  console.log(`\n✓ Clonado completado: ${total} filas copiadas`)
}

main().catch(err => {
  console.error('\n✗ Error:', err)
  process.exit(1)
})
