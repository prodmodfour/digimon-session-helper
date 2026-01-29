import Database from 'better-sqlite3'
import { readFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Ensure data directory exists
const dataDir = join(__dirname, '..', 'data')
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

// Connect to database
const dbPath = join(dataDir, 'digimon.db')
console.log(`Creating database at: ${dbPath}`)
const db = new Database(dbPath)

// Enable WAL mode
db.pragma('journal_mode = WAL')

// Read migration file
const migrationPath = join(__dirname, '..', 'server', 'db', 'migrations', '0000_nappy_mesmero.sql')
const migration = readFileSync(migrationPath, 'utf-8')

// Split by statement-breakpoint and execute each statement
const statements = migration.split('--> statement-breakpoint')

for (const statement of statements) {
  const sql = statement.trim()
  if (sql) {
    console.log(`Executing: ${sql.slice(0, 50)}...`)
    try {
      db.exec(sql)
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('  (table already exists, skipping)')
      } else {
        throw err
      }
    }
  }
}

console.log('Migration complete!')

// Verify tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
console.log('Tables created:', tables.map(t => t.name).join(', '))

db.close()
