import { eq } from 'drizzle-orm'
import { db, digimon, type Digimon } from '../../db'

type UpdateDigimonBody = Partial<Omit<Digimon, 'id' | 'createdAt' | 'updatedAt'>>

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody<UpdateDigimonBody>(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Digimon ID is required',
    })
  }

  // Check if digimon exists
  const [existing] = await db.select().from(digimon).where(eq(digimon.id, id))

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: `Digimon with ID ${id} not found`,
    })
  }

  // Update digimon
  const updateData = {
    ...body,
    updatedAt: new Date(),
  }

  await db.update(digimon).set(updateData).where(eq(digimon.id, id))

  // Return updated digimon
  const [updated] = await db.select().from(digimon).where(eq(digimon.id, id))
  return updated
})
