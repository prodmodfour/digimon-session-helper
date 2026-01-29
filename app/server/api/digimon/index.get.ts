import { eq } from 'drizzle-orm'
import { db, digimon } from '../../db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  // Optional filters
  const partnerId = query.partnerId as string | undefined
  const isEnemy = query.isEnemy === 'true'

  let queryBuilder = db.select().from(digimon)

  if (partnerId) {
    queryBuilder = queryBuilder.where(eq(digimon.partnerId, partnerId)) as typeof queryBuilder
  }

  if (query.isEnemy !== undefined) {
    queryBuilder = queryBuilder.where(eq(digimon.isEnemy, isEnemy)) as typeof queryBuilder
  }

  const allDigimon = await queryBuilder
  return allDigimon
})
