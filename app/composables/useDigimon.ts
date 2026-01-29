import type { Digimon } from '../server/db/schema'
import { STAGE_CONFIG, type DigimonStage } from '../types'

export interface CreateDigimonData {
  name: string
  species: string
  stage: DigimonStage
  attribute: 'vaccine' | 'data' | 'virus' | 'free'
  family: string
  type: string
  baseStats: {
    accuracy: number
    damage: number
    dodge: number
    armor: number
    health: number
  }
  attacks?: Digimon['attacks']
  qualities?: Digimon['qualities']
  dataOptimization?: string
  partnerId?: string
  isEnemy?: boolean
  notes?: string
  spriteUrl?: string
}

export function useDigimon() {
  const digimonList = ref<Digimon[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDigimon(filters?: { partnerId?: string; isEnemy?: boolean }) {
    loading.value = true
    error.value = null
    try {
      const query = new URLSearchParams()
      if (filters?.partnerId) query.set('partnerId', filters.partnerId)
      if (filters?.isEnemy !== undefined) query.set('isEnemy', String(filters.isEnemy))

      const url = query.toString() ? `/api/digimon?${query}` : '/api/digimon'
      digimonList.value = await $fetch<Digimon[]>(url)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch digimon'
      console.error('Failed to fetch digimon:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchDigimonById(id: string): Promise<Digimon | null> {
    loading.value = true
    error.value = null
    try {
      return await $fetch<Digimon>(`/api/digimon/${id}`)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch digimon'
      console.error('Failed to fetch digimon:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createDigimon(data: CreateDigimonData): Promise<Digimon | null> {
    loading.value = true
    error.value = null
    try {
      const newDigimon = await $fetch<Digimon>('/api/digimon', {
        method: 'POST',
        body: data,
      })
      digimonList.value = [...digimonList.value, newDigimon]
      return newDigimon
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create digimon'
      console.error('Failed to create digimon:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateDigimon(id: string, data: Partial<Digimon>): Promise<Digimon | null> {
    loading.value = true
    error.value = null
    try {
      const updated = await $fetch<Digimon>(`/api/digimon/${id}`, {
        method: 'PUT',
        body: data,
      })
      digimonList.value = digimonList.value.map((d) => (d.id === id ? updated : d))
      return updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update digimon'
      console.error('Failed to update digimon:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteDigimon(id: string): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      await $fetch(`/api/digimon/${id}`, { method: 'DELETE' })
      digimonList.value = digimonList.value.filter((d) => d.id !== id)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete digimon'
      console.error('Failed to delete digimon:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  // Calculate derived stats from base stats and stage
  function calculateDerivedStats(digimon: Digimon) {
    const { baseStats, stage } = digimon
    const config = STAGE_CONFIG[stage as DigimonStage]

    const agility = baseStats.accuracy + baseStats.dodge
    const body = Math.floor((baseStats.damage + baseStats.armor + baseStats.health) / 3)

    return {
      agility,
      body,
      woundBoxes: baseStats.health + config.woundBonus,
      ram: Math.floor(agility / 2),
      cpu: Math.floor(body / 2),
      bit: config.brains,
      movement: config.movement,
      stageBonus: config.stageBonus,
    }
  }

  // Roll initiative for a digimon (3d6 + Agility)
  function rollInitiative(digimon: Digimon): { total: number; roll: number } {
    const derived = calculateDerivedStats(digimon)
    const roll =
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1
    return {
      roll,
      total: roll + derived.agility,
    }
  }

  // Get stage configuration
  function getStageConfig(stage: DigimonStage) {
    return STAGE_CONFIG[stage]
  }

  return {
    digimonList,
    loading,
    error,
    fetchDigimon,
    fetchDigimonById,
    createDigimon,
    updateDigimon,
    deleteDigimon,
    calculateDerivedStats,
    rollInitiative,
    getStageConfig,
  }
}
