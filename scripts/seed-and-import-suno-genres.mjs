/**
 * Pobla la tabla `genres` con la taxonomía canónica de Tigrefy y asigna
 * géneros a las canciones existentes resolviendo los tags Suno mediante el
 * mapeo SUNO_TO_CANONICAL.
 *
 * Idempotente: usa INSERT OR IGNORE en `genres` y ON CONFLICT DO NOTHING en
 * `song_genres`, así que se puede ejecutar varias veces sin duplicar.
 *
 * Uso:
 *   node --env-file=.env scripts/seed-and-import-suno-genres.mjs
 *   node --env-file=.env.production scripts/seed-and-import-suno-genres.mjs
 *
 * ============================================================================
 * TAXONOMÍA CANÓNICA — fuente de verdad
 * ============================================================================
 *
 * Tigrefy usa 10 géneros macro a nivel canción (modelo M:N `song_genres`).
 * Las canciones se generan con Suno AI y traen tags por-track; este script
 * mapea esos tags al catálogo cerrado.
 *
 *   1. Tech House          — tech house, deep tech, minimal tech house
 *   2. Techno              — techno, edm, industrial, hardstyle, minimal techno
 *   3. Reggaeton           — reggaeton, dembow, dancehall, urbano latino,
 *                            colombian urbano
 *   4. Trap                — trap, latin trap
 *   5. Rap                 — rap
 *   6. Rumba & Flamenco    — rumba-pop, flamenco-pop, flamenco, rumba,
 *                            spanish rumba-pop, rumba-ska, bulería,
 *                            flamenco-bulería
 *   7. Pop Latino          — pop, pop latino, world music, worldmusic
 *   8. Corridos Tumbados   — corrido bélico tumbado, regional mexicano
 *   9. Tropical            — tropical, tropical vibes, verano,
 *                            cumbia, latin cumbia, afrobeat latino
 *  10. Otros               — cajón de sastre
 *
 * Decisiones razonadas:
 * - Tech House ≠ Techno: suenan muy distinto (Ibiza/club vs festival/rave)
 *   y son los dos buckets más poblados — separados.
 * - EDM/Hardstyle/Industrial → Techno: misma familia electrónica dura.
 * - Trap ≠ Reggaeton ≠ Rap: solapan pero son subculturas distintas.
 * - Pop, world music → Pop Latino: 4 amigos españoles, "pop" sin más es
 *   latino por defecto.
 *
 * Tags Suno descartados (descriptores, no géneros):
 *   storytelling, épico, cinematográfico, introspectiva, motivacional,
 *   ibiza party, club, street anthem, autotune, catchy hook, BPM, key,
 *   palmas, cajón, flamenco guitar (instrumentación), 808, dark melodic
 *   synths, heavy sub bass, anthemic, rap-sung, singalong, etc.
 *
 * Si aparecen tags Suno nuevos que NO estén en SUNO_TO_CANONICAL ni en
 * IGNORED_TAG_PATTERNS, el script los reporta como warning y los asigna a
 * "Otros" — luego ampliáis el diccionario abajo.
 * ============================================================================
 */

import { createClient } from '@libsql/client'

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error('✗ Faltan TURSO_DATABASE_URL/TURSO_AUTH_TOKEN. Usa --env-file=.env')
  process.exit(1)
}

// Catálogo cerrado, ordenado.
const CANONICAL_GENRES = [
  'Tech House',
  'Techno',
  'Reggaeton',
  'Trap',
  'Rap',
  'Rumba & Flamenco',
  'Pop Latino',
  'Corridos Tumbados',
  'Tropical',
  'Otros',
]

// Tags Suno → género canónico. Comparación case-insensitive y trim.
const SUNO_TO_CANONICAL = {
  // Tech House
  'tech house': 'Tech House',
  'tech-house': 'Tech House',
  'deep tech': 'Tech House',
  'minimal tech house': 'Tech House',
  // Techno (incluye EDM, hardstyle, industrial)
  'techno': 'Techno',
  'techno festival': 'Techno',
  'edm': 'Techno',
  'minimal techno': 'Techno',
  'industrial techno': 'Techno',
  'industrial': 'Techno',
  'hardstyle': 'Techno',
  // Reggaeton (incluye dembow, dancehall, urbano latino)
  'reggaeton': 'Reggaeton',
  'reggaetón': 'Reggaeton',
  'reggaetón ligero': 'Reggaeton',
  'reggaeton ligero': 'Reggaeton',
  'reggaeton perreo': 'Reggaeton',
  'urbano latino': 'Reggaeton',
  'colombian urbano': 'Reggaeton',
  'dembow': 'Reggaeton',
  'dancehall': 'Reggaeton',
  'dancehall influence': 'Reggaeton',
  // Trap
  'trap': 'Trap',
  'latin trap': 'Trap',
  // Rap
  'rap': 'Rap',
  // Rumba & Flamenco (incluye bulería y rumba-ska, palo español)
  'spanish rumba-pop': 'Rumba & Flamenco',
  'rumba-pop': 'Rumba & Flamenco',
  'rumba-pop motivacional': 'Rumba & Flamenco',
  'flamenco-pop': 'Rumba & Flamenco',
  'flamenco': 'Rumba & Flamenco',
  'rumba': 'Rumba & Flamenco',
  'rumba-ska': 'Rumba & Flamenco',
  'rumba-ska festiva': 'Rumba & Flamenco',
  'flamenco-bulería': 'Rumba & Flamenco',
  'flamenco-buleria': 'Rumba & Flamenco',
  'bulería': 'Rumba & Flamenco',
  'buleria': 'Rumba & Flamenco',
  // Pop Latino
  'pop': 'Pop Latino',
  'pop latino': 'Pop Latino',
  'latin pop': 'Pop Latino',
  'world music': 'Pop Latino',
  'worldmusic': 'Pop Latino',
  // Corridos Tumbados
  'corrido bélico tumbado': 'Corridos Tumbados',
  'corrido belico tumbado': 'Corridos Tumbados',
  'regional mexicano': 'Corridos Tumbados',
  // Tropical (incluye cumbia, afrobeat latino y vibes playeros)
  'tropical': 'Tropical',
  'tropical vibes': 'Tropical',
  'verano': 'Tropical',
  'cumbia': 'Tropical',
  'latin cumbia': 'Tropical',
  'afrobeat': 'Tropical',
  'afrobeat latino': 'Tropical',
  'afrobeat latino bailable': 'Tropical',
}

// Tags que se ignoran (no son géneros, son descriptores). Patrones flexibles
// porque Suno los devuelve mezclados con valores libres (BPM, tonalidad...).
const IGNORED_EXACT = new Set([
  'storytelling', 'épico', 'epico', 'cinematográfico', 'cinematografico',
  'cinematográfica', 'cinematografica', 'introspectiva', 'introspectivo',
  'motivacional', 'ibiza party', 'club', 'street anthem',
  'estribillo de estadio', 'anthemic', 'anthemic singalong chorus',
  'singalong chorus', 'autotune', 'catchy hook', 'rap-sung vocals',
  'flamenco guitar', 'cajón & handclaps', 'cajon & handclaps',
  'palmas ascendentes', 'dark melodic synths', 'heavy sub bass',
  '808 cinematográfico', '808 cinematografico', 'upbeat', 'dark',
  'épico con guitarra y 808 cinematográfico',
  // Descriptores de voz/instrumentación (no son géneros)
  'voz flamenca', 'voz flamenca masculina', 'voz flamenca femenina',
  'efectos a coro', 'a coro', 'coro',
  // Mood/atmósfera adicionales
  'sentimental', 'una canción sentimental', 'festiva', 'festivo',
  'bailable', 'luminosa', 'luminoso', 'oscura', 'oscuro',
  // Genéricos demasiado amplios
  'dance',
])

// Patrones (regex) que también se ignoran: BPM, tonalidad...
const IGNORED_PATTERNS = [
  /^\d+\s*[-–]?\s*\d*\s*bpm$/i,        // "95 bpm", "100-104 BPM"
  /^[a-g][#b]?\s+(major|minor)$/i,     // "e minor", "C# major"
  /tumbado.*con.*guitarra/i,           // descriptores largos
]

// Asignación inicial: TÍTULO de canción → tags Suno tal cual los escribió el usuario.
// El script resuelve título → songId leyendo la tabla `songs`.
//
// Si tienes una canción cuyo título en la BD difiere del que aparece aquí,
// edítalo abajo o usa la columna `id` directamente cambiando esta estructura.
// NOTA: las claves son los títulos EXACTOS tal como están en la BD.
const SONG_SUNO_TAGS = {
  'Encerrado en el CECOT':                ['Techno Festival', 'EDM', 'Tech-House'],
  'Ibiza Vibra':                          ['tech house', 'Ibiza party', 'storytelling'],
  'Corazón de Tigre':                     ['Pop latino', 'Reggaetón ligero'],
  'Tigres de la Sombra':                  ['Corrido bélico tumbado'],
  'Peñíscola Paradise':                   ['Verano', 'Tropical vibes'],
  'Barea: Tgrs Music Sessions, Vol. 1':   ['trap', 'reggaeton'],
  'Sabe a Sol':                           ['Spanish rumba-pop', 'flamenco guitar', 'cajón & handclaps', 'upbeat', 'anthemic singalong chorus'],
  'Tarde Pa’ Querer':                     ['Spanish rumba-pop', 'flamenco guitar', 'cajón & handclaps', 'upbeat', 'anthemic singalong chorus'],
  'Esto Es Un Mierdón':                   ['Minimal Tech House', 'Deep Tech'],
  'Esto Es Aún Peor':                     ['tech house', 'deep tech'],
  // Donde Duele el Aire: aunque Suno la etiquetó como flamenco/pop/rumba,
  // sonoramente es flamenco-pop puro, no pop latino. Omitimos 'pop'.
  'Donde Duele el Aire':                  ['flamenco', 'rumba'],
  'Bicente: Tgrs Music Sessions, Vol. 3': ['industrial', 'reggaeton', 'minimal techno'],
  'Óscar: Tgrs Music Sessions, Vol. 2':   ['reggaeton', 'urbano latino', 'colombian urbano', 'dancehall influence', 'dembow', '95 bpm', 'e minor', 'dark melodic synths', 'heavy sub bass', 'catchy hook', 'rap-sung vocals', 'autotune', 'street anthem', 'club'],
  // Calle Sin Mapa: el prompt Suno real es "Rumba-pop luminosa".
  'Calle Sin Mapa':                       ['rumba-pop', 'luminosa'],
  'Bar de las Dos':                       ['rumba-pop', 'flamenco-pop'],
  'Nubes De Tormenta':                    ['rap', 'cinematográfica', 'introspectiva'],
  'Komorebi: Tgrs Music Sessions, Vol. 8':['industrial techno', 'hardstyle'],
  'Omar en Altura':                       ['reggaetón', 'dembow', 'tropical'],
  'Operación Calzoncillo':                ['rumba-ska festiva'],
  'Penagos: Tgrs Music Sessions, Vol. 13':['afrobeat latino bailable'],
  'Tigre Soy':                            ['voz flamenca masculina', 'flamenco-bulería', 'efectos a coro', 'sentimental'],
  'Omar Está Soltero (Versión 2)':        ['latin cumbia', 'dance', 'upbeat'],
  'La Esquina del Hoy':                   ['rumba-pop'],
  // Canciones existentes en la BD aún sin tags Suno aportados:
  //   BOF, Me Vas A Extrañar, Omar Está Soltero (Versión 1).
  // Asígnalas desde /admin (tab Canciones → editar → seleccionar géneros)
  // o añádelas aquí cuando recuperes el prompt Suno.
}

const norm = (s) => String(s).trim().toLowerCase()

function classifyTag(tag) {
  const t = norm(tag)
  if (IGNORED_EXACT.has(t)) return { kind: 'ignored' }
  if (IGNORED_PATTERNS.some(re => re.test(t))) return { kind: 'ignored' }
  if (SUNO_TO_CANONICAL[t]) return { kind: 'mapped', canonical: SUNO_TO_CANONICAL[t] }
  return { kind: 'unknown' }
}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function main() {
  console.log(`DB: ${process.env.TURSO_DATABASE_URL}\n`)

  // 1. Insertar géneros canónicos (idempotente).
  console.log('→ Insertando géneros canónicos...')
  for (const name of CANONICAL_GENRES) {
    await db.execute({ sql: 'INSERT OR IGNORE INTO genres (name) VALUES (?)', args: [name] })
  }
  const genresRows = await db.execute('SELECT id, name FROM genres')
  const genreIdByName = new Map(genresRows.rows.map(r => [r.name, r.id]))
  console.log(`  ✓ ${genresRows.rows.length} géneros en BD`)

  // 2. Resolver songId por título.
  console.log('\n→ Resolviendo canciones por título...')
  const titles = Object.keys(SONG_SUNO_TAGS)
  const placeholders = titles.map(() => '?').join(', ')
  const songsResult = await db.execute({
    sql: `SELECT id, title FROM songs WHERE title IN (${placeholders})`,
    args: titles,
  })
  const songIdByTitle = new Map(songsResult.rows.map(r => [r.title, r.id]))

  const notFound = titles.filter(t => !songIdByTitle.has(t))
  if (notFound.length) {
    console.log(`  ⚠ ${notFound.length} título(s) no encontrados en BD (se omiten):`)
    notFound.forEach(t => console.log(`     - ${t}`))
  }
  console.log(`  ✓ ${songIdByTitle.size}/${titles.length} canciones resueltas`)

  // 3. Procesar cada canción y crear filas en song_genres.
  console.log('\n→ Asignando géneros a canciones...')
  const stats = {
    songsProcessed: 0,
    assignments: 0,
    unknownTags: new Map(), // tag → count
  }

  for (const [title, tags] of Object.entries(SONG_SUNO_TAGS)) {
    const songId = songIdByTitle.get(title)
    if (!songId) continue

    const canonicalSet = new Set()
    for (const tag of tags) {
      const c = classifyTag(tag)
      if (c.kind === 'mapped') canonicalSet.add(c.canonical)
      else if (c.kind === 'unknown') {
        stats.unknownTags.set(tag, (stats.unknownTags.get(tag) ?? 0) + 1)
      }
    }

    // Si ningún tag mapeó a género real, asignar 'Otros'.
    if (canonicalSet.size === 0) canonicalSet.add('Otros')

    for (const canonical of canonicalSet) {
      const genreId = genreIdByName.get(canonical)
      if (!genreId) {
        console.error(`  ✗ Género canónico "${canonical}" no existe en BD (bug interno)`)
        continue
      }
      await db.execute({
        sql: 'INSERT INTO song_genres (song_id, genre_id) VALUES (?, ?) ON CONFLICT DO NOTHING',
        args: [songId, genreId],
      })
      stats.assignments++
    }

    stats.songsProcessed++
    console.log(`  ✓ ${title.padEnd(35)} → ${[...canonicalSet].join(', ')}`)
  }

  // 4. Resumen.
  console.log(`\n✓ Procesadas ${stats.songsProcessed} canciones, ${stats.assignments} relaciones song_genres.`)

  if (stats.unknownTags.size > 0) {
    console.log(`\n⚠ Tags Suno desconocidos (no mapeados, no descartados):`)
    for (const [tag, count] of stats.unknownTags) {
      console.log(`     "${tag}" (×${count})`)
    }
    console.log('  → Considera añadirlos a SUNO_TO_CANONICAL o IGNORED_EXACT.')
  }

  // 5. Conteo por género para validación.
  console.log('\n→ Conteo final por género:')
  const counts = await db.execute(`
    SELECT g.name, COUNT(sg.song_id) as count
    FROM genres g
    LEFT JOIN song_genres sg ON sg.genre_id = g.id
    GROUP BY g.id, g.name
    ORDER BY count DESC, g.name
  `)
  for (const row of counts.rows) {
    console.log(`  ${String(row.name).padEnd(20)} ${row.count}`)
  }
}

main().catch(err => {
  console.error('\n✗ Error:', err)
  process.exit(1)
})
