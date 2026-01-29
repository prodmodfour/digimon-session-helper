import { db, encounters } from '../../db'

export default defineEventHandler(async () => {
  const allEncounters = await db.select().from(encounters)
  return allEncounters
})
