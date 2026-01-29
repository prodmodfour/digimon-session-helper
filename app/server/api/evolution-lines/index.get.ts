import { eq } from 'drizzle-orm'
import { db, evolutionLines } from '../../db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const partnerId = query.partnerId as string | undefined

  if (partnerId) {
    return db.select().from(evolutionLines).where(eq(evolutionLines.partnerId, partnerId))
  }

  return db.select().from(evolutionLines)
})
