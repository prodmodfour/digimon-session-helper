import { eq } from 'drizzle-orm'
import { db, evolutionLines } from '../../db'
import type { EvolutionLine } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Evolution line ID is required',
    })
  }

  const body = await readBody<Partial<EvolutionLine>>(event)

  // Check if evolution line exists
  const [existing] = await db.select().from(evolutionLines).where(eq(evolutionLines.id, id))

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: `Evolution line with ID ${id} not found`,
    })
  }

  // Update evolution line
  const updateData = {
    ...body,
    updatedAt: new Date(),
  }

  await db.update(evolutionLines).set(updateData).where(eq(evolutionLines.id, id))

  // Return updated evolution line
  const [updated] = await db.select().from(evolutionLines).where(eq(evolutionLines.id, id))
  return updated
})
