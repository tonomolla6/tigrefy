/**
 * Borra TODAS las tablas de la BD apuntada por .env (debe ser dev).
 * Por seguridad, aborta si la URL contiene "tigrefy-publicher0" (prod).
 *
 * Uso: node --env-file=.env scripts/wipe-dev-db.mjs --confirm
 */

import { createClient } from '@libsql/client'

if (!process.argv.includes('--confirm')) {
  console.error('✗ Falta flag --confirm.')
  process.exit(1)
}

const url = process.env.TURSO_DATABASE_URL
const token = process.env.TURSO_AUTH_TOKEN

if (!url || !token) {
  console.error('✗ Falta TURSO_DATABASE_URL/TOKEN en env')
  process.exit(1)
}

if (url.includes('tigrefy-publicher0') && !url.includes('tigrefy-dev')) {
  console.error(`✗ ABORTADO: la URL parece de PROD: ${url}`)
  console.error('  Solo se permite borrar URLs que contengan "tigrefy-dev"')
  process.exit(1)
}

const db = createClient({ url, authToken: token })

console.log(`Conectado a: ${url}`)

const tables = await db.execute(
  `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
)

if (tables.rows.length === 0) {
  console.log('No hay tablas que borrar.')
  process.exit(0)
}

console.log(`Tablas a borrar (${tables.rows.length}):`)
tables.rows.forEach(t => console.log(`  - ${t.name}`))

await db.execute('PRAGMA foreign_keys = OFF')

for (const row of tables.rows) {
  await db.execute(`DROP TABLE IF EXISTS "${row.name}"`)
  process.stdout.write(`  ✗ ${row.name}\n`)
}

console.log('\n✓ DB vaciada. Ahora corre: npm run db:migrate')
