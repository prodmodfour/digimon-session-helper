import { db, evolutionLines } from '../../db'
import { generateId } from '../../utils/id'

interface CreateEvolutionLineBody {
  name: string
  description?: string
  chain: Array<{
    stage: 'fresh' | 'in-training' | 'rookie' | 'champion' | 'ultimate' | 'mega'
    species: string
    digimonId: string | null
    requirements: {
      type: 'battles' | 'xp' | 'bond' | 'item' | 'special'
      description: string
      value: number | null
      itemName: string | null
    } | null
  }>
  partnerId?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateEvolutionLineBody>(event)

  if (!body.name || !body.chain || body.chain.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Name and chain are required',
    })
  }

  const id = generateId()
  const now = new Date()

  const newEvolutionLine = {
    id,
    name: body.name,
    description: body.description || '',
    chain: body.chain,
    partnerId: body.partnerId || null,
    currentStageIndex: 0,
    evolutionProgress: {
      battlesWon: 0,
      xpEarned: 0,
      bondLevel: 0,
      itemsCollected: [],
    },
    createdAt: now,
    updatedAt: now,
  }

  await db.insert(evolutionLines).values(newEvolutionLine)

  return newEvolutionLine
})
