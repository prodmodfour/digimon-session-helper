import { db, tamers } from '../../db'

export default defineEventHandler(async () => {
  const allTamers = await db.select().from(tamers)
  return allTamers
})
