import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

let db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function useDB() {
  if (db) return db

  const config = useRuntimeConfig()

  const client = createClient({
    url: config.tursoUrl,
    authToken: config.tursoToken
  })

  db = drizzle(client, { schema })

  return db
}

// Re-exportar todo el schema para facilitar imports
export * from './schema'

// Helper para parsear campos JSON
export function parseJsonField<T>(value: string | null): T[] {
  if (!value) return []
  try {
    return JSON.parse(value)
  } catch {
    return []
  }
}
