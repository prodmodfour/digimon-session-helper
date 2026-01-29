import { eq } from 'drizzle-orm'
import { db, encounters } from '../../db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Encounter ID is required',
    })
  }

  const [encounter] = await db.select().from(encounters).where(eq(encounters.id, id))

  if (!encounter) {
    throw createError({
      statusCode: 404,
      message: `Encounter with ID ${id} not found`,
    })
  }

  return encounter
})
