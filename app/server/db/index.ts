import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

// Get database path from runtime config or use default
const dbPath = process.env.NUXT_DB_PATH || './data/digimon.db'

// Create SQLite connection
const sqlite = new Database(dbPath)

// Enable WAL mode for better concurrent performance
sqlite.pragma('journal_mode = WAL')

// Create Drizzle instance with schema
export const db = drizzle(sqlite, { schema })

// Export schema for use in other files
export * from './schema'
