import { eq } from 'drizzle-orm'
import { db, encounters, type Encounter } from '../../db'

type UpdateEncounterBody = Partial<Omit<Encounter, 'id' | 'createdAt' | 'updatedAt'>>

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody<UpdateEncounterBody>(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Encounter ID is required',
    })
  }

  // Check if encounter exists
  const [existing] = await db.select().from(encounters).where(eq(encounters.id, id))

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: `Encounter with ID ${id} not found`,
    })
  }

  // Update encounter
  const updateData = {
    ...body,
    updatedAt: new Date(),
  }

  await db.update(encounters).set(updateData).where(eq(encounters.id, id))

  // Return updated encounter
  const [updated] = await db.select().from(encounters).where(eq(encounters.id, id))
  return updated
})
