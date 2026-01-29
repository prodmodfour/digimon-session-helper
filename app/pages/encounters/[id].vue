<script setup lang="ts">
import type { Encounter } from '../../server/db/schema'
import type { CombatParticipant, BattleLogEntry, Hazard } from '../../composables/useEncounters'
import type { Digimon } from '../../server/db/schema'
import type { Tamer } from '../../server/db/schema'

definePageMeta({
  title: 'Encounter',
})

const route = useRoute()
const router = useRouter()

const {
  currentEncounter,
  loading,
  error,
  fetchEncounter,
  updateEncounter,
  createParticipant,
  addParticipant,
  removeParticipant,
  startCombat,
  nextTurn,
  endCombat,
  addBattleLogEntry,
  getCurrentParticipant,
  addHazard,
  removeHazard,
  updateHazard,
} = useEncounters()

const { digimonList, fetchDigimon, rollInitiative: rollDigimonInitiative, calculateDerivedStats: calcDigimonStats } = useDigimon()
const { tamers, fetchTamers, calculateDerivedStats: calcTamerStats } = useTamers()

const showAddParticipant = ref(false)
const selectedEntityType = ref<'digimon' | 'tamer'>('digimon')
const selectedEntityId = ref('')
const addQuantity = ref(1)

// Entity lookup maps
const digimonMap = computed(() => {
  const map = new Map<string, Digimon>()
  digimonList.value.forEach((d) => map.set(d.id, d))
  return map
})

const tamerMap = computed(() => {
  const map = new Map<string, Tamer>()
  tamers.value.forEach((t) => map.set(t.id, t))
  return map
})

// Participants sorted by turn order
const sortedParticipants = computed(() => {
  if (!currentEncounter.value) return []
  const participants = currentEncounter.value.participants as CombatParticipant[]
  const turnOrder = currentEncounter.value.turnOrder as string[]
  return turnOrder.map((id) => participants.find((p) => p.id === id)).filter(Boolean) as CombatParticipant[]
})

// Current active participant
const activeParticipant = computed(() => {
  if (!currentEncounter.value) return null
  return getCurrentParticipant(currentEncounter.value)
})

// Battle log
const battleLog = computed(() => {
  if (!currentEncounter.value) return []
  return (currentEncounter.value.battleLog as BattleLogEntry[]).slice().reverse()
})

// Hazards
const hazards = computed(() => {
  if (!currentEncounter.value) return []
  return currentEncounter.value.hazards as Hazard[]
})

// Get entity details for a participant
function getEntityDetails(participant: CombatParticipant) {
  if (participant.type === 'digimon') {
    const digimon = digimonMap.value.get(participant.entityId)
    if (!digimon) return null
    const derived = calcDigimonStats(digimon)
    return {
      name: digimon.name,
      species: digimon.species,
      stage: digimon.stage,
      isEnemy: digimon.isEnemy,
      stats: digimon.baseStats,
      derived,
      icon: digimon.isEnemy ? '👹' : '🦖',
      spriteUrl: digimon.spriteUrl,
    }
  } else {
    const tamer = tamerMap.value.get(participant.entityId)
    if (!tamer) return null
    const derived = calcTamerStats(tamer)
    return {
      name: tamer.name,
      species: 'Tamer',
      stage: tamer.campaignLevel,
      isEnemy: false,
      stats: tamer.attributes,
      derived,
      icon: '👤',
      spriteUrl: null,
    }
  }
}

// Add participant handler - supports adding multiple of the same entity
async function handleAddParticipant() {
  if (!currentEncounter.value || !selectedEntityId.value) return

  const quantity = addQuantity.value || 1

  for (let i = 0; i < quantity; i++) {
    let initiative = 0
    let initiativeRoll = 0
    let maxWounds = 5

    if (selectedEntityType.value === 'digimon') {
      const digimon = digimonMap.value.get(selectedEntityId.value)
      if (digimon) {
        const result = rollDigimonInitiative(digimon)
        initiative = result.total
        initiativeRoll = result.roll
        const derived = calcDigimonStats(digimon)
        maxWounds = derived.woundBoxes
      }
    } else {
      const tamer = tamerMap.value.get(selectedEntityId.value)
      if (tamer) {
        // Tamer initiative: 3d6 + Agility
        initiativeRoll = Math.floor(Math.random() * 6) + 1 +
          Math.floor(Math.random() * 6) + 1 +
          Math.floor(Math.random() * 6) + 1
        initiative = initiativeRoll + tamer.attributes.agility
        const derived = calcTamerStats(tamer)
        maxWounds = derived.woundBoxes
      }
    }

    const participant = createParticipant(
      selectedEntityType.value,
      selectedEntityId.value,
      initiative,
      initiativeRoll,
      maxWounds
    )

    await addParticipant(currentEncounter.value.id, participant)
  }

  showAddParticipant.value = false
  selectedEntityId.value = ''
  addQuantity.value = 1
}

// Remove participant
async function handleRemoveParticipant(participantId: string) {
  if (!currentEncounter.value) return
  if (confirm('Remove this participant from the encounter?')) {
    await removeParticipant(currentEncounter.value.id, participantId)
  }
}

// Start combat
async function handleStartCombat() {
  if (!currentEncounter.value) return
  if (sortedParticipants.value.length < 2) {
    alert('Need at least 2 participants to start combat')
    return
  }

  // Mark first participant as active
  const participants = currentEncounter.value.participants as CombatParticipant[]
  const turnOrder = currentEncounter.value.turnOrder as string[]
  const firstId = turnOrder[0]
  const first = participants.find((p) => p.id === firstId)
  if (first) {
    first.isActive = true
  }

  await updateEncounter(currentEncounter.value.id, { participants })
  await startCombat(currentEncounter.value.id)

  const entity = first ? getEntityDetails(first) : null
  if (entity) {
    await addBattleLogEntry(currentEncounter.value.id, {
      round: 1,
      actorId: first!.id,
      actorName: entity.name,
      action: 'Combat started',
      target: null,
      result: `${entity.name}'s turn begins`,
      damage: null,
      effects: [],
    })
  }
}

// Next turn
async function handleNextTurn() {
  if (!currentEncounter.value) return

  const current = activeParticipant.value
  const entity = current ? getEntityDetails(current) : null

  await nextTurn(currentEncounter.value.id)

  // Refetch to get updated state
  await fetchEncounter(currentEncounter.value.id)

  const newActive = activeParticipant.value
  const newEntity = newActive ? getEntityDetails(newActive) : null

  if (newEntity && currentEncounter.value) {
    await addBattleLogEntry(currentEncounter.value.id, {
      round: currentEncounter.value.round,
      actorId: newActive!.id,
      actorName: newEntity.name,
      action: 'Turn started',
      target: null,
      result: `${newEntity.name}'s turn begins`,
      damage: null,
      effects: [],
    })
  }
}

// End combat
async function handleEndCombat() {
  if (!currentEncounter.value) return
  if (confirm('End this combat encounter?')) {
    await endCombat(currentEncounter.value.id)
    await addBattleLogEntry(currentEncounter.value.id, {
      round: currentEncounter.value.round,
      actorId: 'system',
      actorName: 'System',
      action: 'Combat ended',
      target: null,
      result: 'The encounter has concluded',
      damage: null,
      effects: [],
    })
  }
}

// Use action (simple or complex)
async function useAction(type: 'simple' | 'complex', description: string) {
  if (!currentEncounter.value || !activeParticipant.value) return

  const participants = currentEncounter.value.participants as CombatParticipant[]
  const active = participants.find((p) => p.id === activeParticipant.value!.id)
  if (!active) return

  if (type === 'simple' && active.actionsRemaining.simple > 0) {
    active.actionsRemaining.simple -= 1
  } else if (type === 'complex' && active.actionsRemaining.complex > 0) {
    active.actionsRemaining.complex -= 1
    active.actionsRemaining.simple = Math.max(0, active.actionsRemaining.simple - 1)
  } else {
    return // No actions remaining
  }

  await updateEncounter(currentEncounter.value.id, { participants })

  const entity = getEntityDetails(active)
  if (entity) {
    await addBattleLogEntry(currentEncounter.value.id, {
      round: currentEncounter.value.round,
      actorId: active.id,
      actorName: entity.name,
      action: `${type} action`,
      target: null,
      result: description,
      damage: null,
      effects: [],
    })
  }
}

// Change stance
async function changeStance(stance: CombatParticipant['currentStance']) {
  if (!currentEncounter.value || !activeParticipant.value) return

  const participants = currentEncounter.value.participants as CombatParticipant[]
  const active = participants.find((p) => p.id === activeParticipant.value!.id)
  if (!active) return

  active.currentStance = stance
  await updateEncounter(currentEncounter.value.id, { participants })

  const entity = getEntityDetails(active)
  if (entity) {
    await addBattleLogEntry(currentEncounter.value.id, {
      round: currentEncounter.value.round,
      actorId: active.id,
      actorName: entity.name,
      action: 'Changed stance',
      target: null,
      result: `Switched to ${stance} stance`,
      damage: null,
      effects: [],
    })
  }
}

// Re-roll initiative for a participant
async function rerollInitiative(participantId: string) {
  if (!currentEncounter.value) return

  const participants = currentEncounter.value.participants as CombatParticipant[]
  const participant = participants.find((p) => p.id === participantId)
  if (!participant) return

  let initiative = 0
  let initiativeRoll = 0

  if (participant.type === 'digimon') {
    const digimon = digimonMap.value.get(participant.entityId)
    if (digimon) {
      const result = rollDigimonInitiative(digimon)
      initiative = result.total
      initiativeRoll = result.roll
    }
  } else {
    const tamer = tamerMap.value.get(participant.entityId)
    if (tamer) {
      initiativeRoll = Math.floor(Math.random() * 6) + 1 +
        Math.floor(Math.random() * 6) + 1 +
        Math.floor(Math.random() * 6) + 1
      initiative = initiativeRoll + tamer.attributes.agility
    }
  }

  participant.initiative = initiative
  participant.initiativeRoll = initiativeRoll

  // Resort turn order
  const turnOrder = [...participants]
    .sort((a, b) => b.initiative - a.initiative)
    .map((p) => p.id)

  await updateEncounter(currentEncounter.value.id, { participants, turnOrder })
}

// Update wounds for a participant
async function updateWounds(participantId: string, wounds: number) {
  if (!currentEncounter.value) return

  const participants = currentEncounter.value.participants as CombatParticipant[]
  const participant = participants.find((p) => p.id === participantId)
  if (!participant) return

  const previousWounds = participant.currentWounds
  participant.currentWounds = wounds
  await updateEncounter(currentEncounter.value.id, { participants })

  const entity = getEntityDetails(participant)
  if (entity) {
    const diff = wounds - previousWounds
    if (diff !== 0) {
      await addBattleLogEntry(currentEncounter.value.id, {
        round: currentEncounter.value.round,
        actorId: participant.id,
        actorName: entity.name,
        action: diff > 0 ? 'Took damage' : 'Healed',
        target: null,
        result: diff > 0 ? `${entity.name} took ${diff} wound(s)` : `${entity.name} healed ${Math.abs(diff)} wound(s)`,
        damage: diff > 0 ? diff : null,
        effects: [],
      })
    }
  }
}

// Add effect to a participant
async function addEffect(participantId: string, effect: CombatParticipant['activeEffects'][0]) {
  if (!currentEncounter.value) return

  const participants = currentEncounter.value.participants as CombatParticipant[]
  const participant = participants.find((p) => p.id === participantId)
  if (!participant) return

  participant.activeEffects = [...participant.activeEffects, effect]
  await updateEncounter(currentEncounter.value.id, { participants })

  const entity = getEntityDetails(participant)
  if (entity) {
    await addBattleLogEntry(currentEncounter.value.id, {
      round: currentEncounter.value.round,
      actorId: participant.id,
      actorName: entity.name,
      action: 'Effect applied',
      target: null,
      result: `${effect.name} applied to ${entity.name}`,
      damage: null,
      effects: [effect.name],
    })
  }
}

// Remove effect from a participant
async function removeEffect(participantId: string, effectId: string) {
  if (!currentEncounter.value) return

  const participants = currentEncounter.value.participants as CombatParticipant[]
  const participant = participants.find((p) => p.id === participantId)
  if (!participant) return

  const effect = participant.activeEffects.find((e) => e.id === effectId)
  participant.activeEffects = participant.activeEffects.filter((e) => e.id !== effectId)
  await updateEncounter(currentEncounter.value.id, { participants })

  const entity = getEntityDetails(participant)
  if (entity && effect) {
    await addBattleLogEntry(currentEncounter.value.id, {
      round: currentEncounter.value.round,
      actorId: participant.id,
      actorName: entity.name,
      action: 'Effect removed',
      target: null,
      result: `${effect.name} removed from ${entity.name}`,
      damage: null,
      effects: [],
    })
  }
}

// Selected participant for detailed view
const selectedParticipantId = ref<string | null>(null)
const selectedParticipant = computed(() => {
  if (!selectedParticipantId.value || !currentEncounter.value) return null
  const participants = currentEncounter.value.participants as CombatParticipant[]
  return participants.find((p) => p.id === selectedParticipantId.value) || null
})

onMounted(async () => {
  await Promise.all([
    fetchEncounter(route.params.id as string),
    fetchDigimon(),
    fetchTamers(),
  ])
})

// Available entities to add (all entities - can add multiples)
const availableDigimon = computed(() => digimonList.value)
const availableTamers = computed(() => tamers.value)

function getStanceColor(stance: string) {
  const colors: Record<string, string> = {
    neutral: 'bg-gray-600',
    defensive: 'bg-blue-600',
    offensive: 'bg-red-600',
    sniper: 'bg-purple-600',
    brave: 'bg-yellow-600',
  }
  return colors[stance] || 'bg-gray-600'
}

// Hazard handlers
async function handleAddHazard(hazard: Hazard) {
  if (!currentEncounter.value) return
  await addHazard(currentEncounter.value.id, hazard)
  await addBattleLogEntry(currentEncounter.value.id, {
    round: currentEncounter.value.round,
    actorId: 'system',
    actorName: 'Environment',
    action: 'Hazard added',
    target: null,
    result: `${hazard.name} is now active (${hazard.affectedArea})`,
    damage: null,
    effects: [hazard.name],
  })
}

async function handleRemoveHazard(hazardId: string) {
  if (!currentEncounter.value) return
  const hazard = hazards.value.find((h) => h.id === hazardId)
  await removeHazard(currentEncounter.value.id, hazardId)
  if (hazard) {
    await addBattleLogEntry(currentEncounter.value.id, {
      round: currentEncounter.value.round,
      actorId: 'system',
      actorName: 'Environment',
      action: 'Hazard removed',
      target: null,
      result: `${hazard.name} is no longer active`,
      damage: null,
      effects: [],
    })
  }
}

async function handleUpdateHazard(hazard: Hazard) {
  if (!currentEncounter.value) return
  await updateHazard(currentEncounter.value.id, hazard)
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading && !currentEncounter" class="text-center py-12">
      <div class="text-digimon-dark-400">Loading encounter...</div>
    </div>

    <div v-else-if="error" class="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
      {{ error }}
    </div>

    <div v-else-if="!currentEncounter" class="text-center py-12">
      <div class="text-6xl mb-4">❌</div>
      <h2 class="text-xl font-semibold text-white mb-2">Encounter Not Found</h2>
      <NuxtLink to="/encounters" class="text-digimon-orange-400 hover:text-digimon-orange-300">
        Return to Encounters
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex justify-between items-start mb-6">
        <div>
          <NuxtLink to="/encounters" class="text-digimon-dark-400 hover:text-white text-sm mb-2 inline-block">
            &larr; Back to Encounters
          </NuxtLink>
          <h1 class="font-display text-3xl font-bold text-white">{{ currentEncounter.name }}</h1>
          <p v-if="currentEncounter.description" class="text-digimon-dark-400">
            {{ currentEncounter.description }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <span
            :class="[
              'text-sm px-3 py-1 rounded uppercase font-semibold',
              currentEncounter.phase === 'setup' && 'bg-blue-900/30 text-blue-400',
              currentEncounter.phase === 'combat' && 'bg-red-900/30 text-red-400',
              currentEncounter.phase === 'ended' && 'bg-gray-900/30 text-gray-400',
            ]"
          >
            {{ currentEncounter.phase }}
          </span>
          <span v-if="currentEncounter.phase === 'combat'" class="text-white font-semibold">
            Round {{ currentEncounter.round }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Turn Order / Participants -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Combat Controls -->
          <div class="bg-digimon-dark-800 rounded-xl p-4 border border-digimon-dark-700">
            <div class="flex gap-3 flex-wrap">
              <button
                v-if="currentEncounter.phase === 'setup'"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                @click="handleStartCombat"
              >
                ▶ Start Combat
              </button>
              <button
                v-if="currentEncounter.phase === 'combat'"
                class="bg-digimon-orange-500 hover:bg-digimon-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                @click="handleNextTurn"
              >
                Next Turn →
              </button>
              <button
                v-if="currentEncounter.phase === 'combat'"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                @click="handleEndCombat"
              >
                End Combat
              </button>
              <button
                v-if="currentEncounter.phase !== 'ended'"
                class="bg-digimon-dark-700 hover:bg-digimon-dark-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                @click="showAddParticipant = true"
              >
                + Add Participant
              </button>
            </div>
          </div>

          <!-- Turn Order List -->
          <div class="space-y-3">
            <div
              v-for="(participant, index) in sortedParticipants"
              :key="participant.id"
              :class="[
                'bg-digimon-dark-800 rounded-xl p-4 border-2 transition-all',
                participant.isActive ? 'border-digimon-orange-500 shadow-lg shadow-digimon-orange-500/20' : 'border-digimon-dark-700',
              ]"
            >
              <div class="flex gap-4">
                <!-- Turn indicator -->
                <div class="flex flex-col items-center justify-center w-12">
                  <div
                    :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      participant.isActive ? 'bg-digimon-orange-500 text-white' : 'bg-digimon-dark-700 text-digimon-dark-400',
                    ]"
                  >
                    {{ index + 1 }}
                  </div>
                  <div class="text-xs text-digimon-dark-400 mt-1">
                    {{ participant.initiative }}
                  </div>
                </div>

                <!-- Entity info -->
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <div class="w-10 h-10 rounded bg-digimon-dark-700 flex items-center justify-center overflow-hidden">
                      <img
                        v-if="getEntityDetails(participant)?.spriteUrl"
                        :src="getEntityDetails(participant)!.spriteUrl!"
                        :alt="getEntityDetails(participant)?.name || 'participant'"
                        class="max-w-full max-h-full object-contain"
                      />
                      <span v-else class="text-2xl">{{ getEntityDetails(participant)?.icon }}</span>
                    </div>
                    <div>
                      <h3 class="font-semibold text-white">
                        {{ getEntityDetails(participant)?.name || 'Unknown' }}
                      </h3>
                      <div class="text-xs text-digimon-dark-400">
                        {{ getEntityDetails(participant)?.species }}
                        <span v-if="getEntityDetails(participant)?.isEnemy" class="text-red-400 ml-1">(Enemy)</span>
                      </div>
                    </div>
                    <div :class="['ml-auto px-2 py-0.5 rounded text-xs uppercase', getStanceColor(participant.currentStance)]">
                      {{ participant.currentStance }}
                    </div>
                  </div>

                  <!-- Wounds bar -->
                  <div class="mb-2">
                    <div class="flex items-center gap-2 text-xs">
                      <span class="text-digimon-dark-400">Wounds:</span>
                      <div class="flex-1 h-2 bg-digimon-dark-600 rounded-full overflow-hidden">
                        <div
                          class="h-full transition-all duration-300"
                          :class="[
                            participant.currentWounds === 0 ? 'bg-green-500' :
                            participant.currentWounds < participant.maxWounds / 2 ? 'bg-yellow-500' :
                            participant.currentWounds < participant.maxWounds ? 'bg-orange-500' : 'bg-red-500'
                          ]"
                          :style="{ width: `${((participant.maxWounds - participant.currentWounds) / participant.maxWounds) * 100}%` }"
                        />
                      </div>
                      <span class="text-digimon-dark-300">{{ participant.currentWounds }}/{{ participant.maxWounds }}</span>
                    </div>
                  </div>

                  <!-- Actions remaining -->
                  <div class="flex gap-4 text-sm">
                    <div class="flex items-center gap-2">
                      <span class="text-digimon-dark-400">Simple:</span>
                      <div class="flex gap-1">
                        <div
                          v-for="i in 2"
                          :key="`simple-${i}`"
                          :class="[
                            'w-4 h-4 rounded',
                            i <= participant.actionsRemaining.simple ? 'bg-blue-500' : 'bg-digimon-dark-600',
                          ]"
                        />
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-digimon-dark-400">Complex:</span>
                      <div class="flex gap-1">
                        <div
                          :class="[
                            'w-4 h-4 rounded',
                            participant.actionsRemaining.complex > 0 ? 'bg-purple-500' : 'bg-digimon-dark-600',
                          ]"
                        />
                      </div>
                    </div>
                    <button
                      class="ml-auto text-xs text-digimon-dark-400 hover:text-white"
                      @click.stop="selectedParticipantId = participant.id"
                    >
                      Manage →
                    </button>
                  </div>

                  <!-- Effects -->
                  <div v-if="participant.activeEffects.length > 0" class="flex flex-wrap gap-1 mt-2">
                    <span
                      v-for="effect in participant.activeEffects"
                      :key="effect.id"
                      :class="[
                        'text-xs px-2 py-0.5 rounded',
                        effect.type === 'buff' && 'bg-green-900/30 text-green-400',
                        effect.type === 'debuff' && 'bg-red-900/30 text-red-400',
                        effect.type === 'status' && 'bg-yellow-900/30 text-yellow-400',
                      ]"
                      :title="effect.description"
                    >
                      {{ effect.name }} ({{ effect.duration }})
                    </span>
                  </div>
                </div>

                <!-- Actions (when active) -->
                <div v-if="participant.isActive && currentEncounter.phase === 'combat'" class="flex flex-col gap-2">
                  <button
                    class="text-xs bg-digimon-dark-700 hover:bg-digimon-dark-600 text-white px-2 py-1 rounded"
                    @click="rerollInitiative(participant.id)"
                  >
                    🎲 Reroll
                  </button>
                  <button
                    class="text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 px-2 py-1 rounded"
                    @click="handleRemoveParticipant(participant.id)"
                  >
                    Remove
                  </button>
                </div>
                <div v-else-if="currentEncounter.phase === 'setup'" class="flex flex-col gap-2">
                  <button
                    class="text-xs bg-digimon-dark-700 hover:bg-digimon-dark-600 text-white px-2 py-1 rounded"
                    @click="rerollInitiative(participant.id)"
                  >
                    🎲 Reroll
                  </button>
                  <button
                    class="text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 px-2 py-1 rounded"
                    @click="handleRemoveParticipant(participant.id)"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div v-if="sortedParticipants.length === 0" class="text-center py-8 text-digimon-dark-400">
              No participants yet. Add Tamers and Digimon to begin.
            </div>
          </div>
        </div>

        <!-- Right sidebar -->
        <div class="space-y-4">
          <!-- Active Turn Actions -->
          <div v-if="activeParticipant && currentEncounter.phase === 'combat'" class="bg-digimon-dark-800 rounded-xl p-4 border border-digimon-orange-500">
            <h3 class="font-display text-lg font-semibold text-digimon-orange-400 mb-3">
              {{ getEntityDetails(activeParticipant)?.name }}'s Turn
            </h3>

            <!-- Quick Actions -->
            <div class="space-y-2 mb-4">
              <button
                :disabled="activeParticipant.actionsRemaining.simple === 0"
                class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                       text-white px-3 py-2 rounded text-sm font-medium"
                @click="useAction('simple', 'Used simple action')"
              >
                Use Simple Action
              </button>
              <button
                :disabled="activeParticipant.actionsRemaining.complex === 0"
                class="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed
                       text-white px-3 py-2 rounded text-sm font-medium"
                @click="useAction('complex', 'Used complex action')"
              >
                Use Complex Action
              </button>
            </div>

            <!-- Stance Selector -->
            <div>
              <label class="block text-sm text-digimon-dark-400 mb-2">Change Stance</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="stance in ['neutral', 'defensive', 'offensive', 'sniper', 'brave'] as const"
                  :key="stance"
                  :class="[
                    'px-2 py-1 rounded text-xs capitalize transition-colors',
                    activeParticipant.currentStance === stance
                      ? getStanceColor(stance) + ' text-white'
                      : 'bg-digimon-dark-700 text-digimon-dark-300 hover:bg-digimon-dark-600',
                  ]"
                  @click="changeStance(stance)"
                >
                  {{ stance }}
                </button>
              </div>
            </div>
          </div>

          <!-- Environmental Hazards -->
          <div class="bg-digimon-dark-800 rounded-xl p-4 border border-digimon-dark-700">
            <h3 class="font-display text-lg font-semibold text-white mb-3">Environmental Hazards</h3>
            <HazardManager
              :hazards="hazards"
              @add="handleAddHazard"
              @remove="handleRemoveHazard"
              @update="handleUpdateHazard"
            />
          </div>

          <!-- Battle Log -->
          <div class="bg-digimon-dark-800 rounded-xl p-4 border border-digimon-dark-700">
            <h3 class="font-display text-lg font-semibold text-white mb-3">Battle Log</h3>
            <div class="space-y-2 max-h-96 overflow-y-auto">
              <div
                v-for="entry in battleLog"
                :key="entry.id"
                class="text-sm border-l-2 border-digimon-dark-600 pl-3 py-1"
              >
                <div class="text-digimon-dark-400 text-xs">
                  Round {{ entry.round }} • {{ entry.actorName }}
                </div>
                <div class="text-white">{{ entry.result }}</div>
              </div>
              <div v-if="battleLog.length === 0" class="text-digimon-dark-400 text-sm">
                No actions yet.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Participant Modal -->
      <Teleport to="body">
        <div
          v-if="showAddParticipant"
          class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          @click.self="showAddParticipant = false"
        >
          <div class="bg-digimon-dark-800 rounded-xl p-6 w-full max-w-md border border-digimon-dark-700">
            <h2 class="font-display text-xl font-semibold text-white mb-4">Add Participant</h2>

            <div class="mb-4">
              <label class="block text-sm text-digimon-dark-400 mb-2">Type</label>
              <div class="flex gap-2">
                <button
                  :class="[
                    'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
                    selectedEntityType === 'digimon'
                      ? 'bg-digimon-orange-500 text-white'
                      : 'bg-digimon-dark-700 text-digimon-dark-400',
                  ]"
                  @click="selectedEntityType = 'digimon'; selectedEntityId = ''"
                >
                  🦖 Digimon
                </button>
                <button
                  :class="[
                    'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
                    selectedEntityType === 'tamer'
                      ? 'bg-digimon-orange-500 text-white'
                      : 'bg-digimon-dark-700 text-digimon-dark-400',
                  ]"
                  @click="selectedEntityType = 'tamer'; selectedEntityId = ''"
                >
                  👤 Tamer
                </button>
              </div>
            </div>

            <div class="mb-6">
              <label class="block text-sm text-digimon-dark-400 mb-2">
                Select {{ selectedEntityType === 'digimon' ? 'Digimon' : 'Tamer' }}
              </label>
              <select
                v-model="selectedEntityId"
                class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded-lg px-3 py-2
                       text-white focus:border-digimon-orange-500 focus:outline-none"
              >
                <option value="">Choose...</option>
                <template v-if="selectedEntityType === 'digimon'">
                  <option v-for="d in availableDigimon" :key="d.id" :value="d.id">
                    {{ d.name }} ({{ d.stage }}) {{ d.isEnemy ? '- Enemy' : '' }}
                  </option>
                </template>
                <template v-else>
                  <option v-for="t in availableTamers" :key="t.id" :value="t.id">
                    {{ t.name }}
                  </option>
                </template>
              </select>
            </div>

            <div class="mb-6">
              <label class="block text-sm text-digimon-dark-400 mb-2">Quantity</label>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="w-10 h-10 bg-digimon-dark-700 hover:bg-digimon-dark-600 rounded-lg text-white font-bold"
                  @click="addQuantity = Math.max(1, addQuantity - 1)"
                >
                  -
                </button>
                <input
                  v-model.number="addQuantity"
                  type="number"
                  min="1"
                  max="20"
                  class="w-20 bg-digimon-dark-700 border border-digimon-dark-600 rounded-lg px-3 py-2
                         text-white text-center focus:border-digimon-orange-500 focus:outline-none"
                />
                <button
                  type="button"
                  class="w-10 h-10 bg-digimon-dark-700 hover:bg-digimon-dark-600 rounded-lg text-white font-bold"
                  @click="addQuantity = Math.min(20, addQuantity + 1)"
                >
                  +
                </button>
              </div>
              <p class="text-xs text-digimon-dark-400 mt-2">
                Each will roll initiative separately (3d6 + Agility)
              </p>
            </div>

            <div class="flex gap-3">
              <button
                :disabled="!selectedEntityId"
                class="flex-1 bg-digimon-orange-500 hover:bg-digimon-orange-600 disabled:opacity-50
                       text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                @click="handleAddParticipant"
              >
                Add {{ addQuantity > 1 ? `${addQuantity}x` : '' }} & Roll Initiative
              </button>
              <button
                class="flex-1 bg-digimon-dark-700 hover:bg-digimon-dark-600 text-white px-4 py-2
                       rounded-lg font-semibold transition-colors"
                @click="showAddParticipant = false"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Participant Management Modal -->
      <Teleport to="body">
        <div
          v-if="selectedParticipant"
          class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          @click.self="selectedParticipantId = null"
        >
          <div class="bg-digimon-dark-800 rounded-xl p-6 w-full max-w-lg border border-digimon-dark-700 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-3">
                <span class="text-3xl">{{ getEntityDetails(selectedParticipant)?.icon }}</span>
                <div>
                  <h2 class="font-display text-xl font-semibold text-white">
                    {{ getEntityDetails(selectedParticipant)?.name }}
                  </h2>
                  <div class="text-sm text-digimon-dark-400">
                    {{ getEntityDetails(selectedParticipant)?.species }}
                  </div>
                </div>
              </div>
              <button
                class="text-digimon-dark-400 hover:text-white text-xl"
                @click="selectedParticipantId = null"
              >
                ✕
              </button>
            </div>

            <!-- Wound Tracker -->
            <div class="mb-6">
              <h3 class="font-semibold text-white mb-3">Wounds</h3>
              <WoundTracker
                :max-wounds="selectedParticipant.maxWounds"
                :current-wounds="selectedParticipant.currentWounds"
                :name="getEntityDetails(selectedParticipant)?.name || 'Unknown'"
                @update="(wounds) => updateWounds(selectedParticipant!.id, wounds)"
              />
            </div>

            <!-- Effect Manager -->
            <EffectManager
              :effects="selectedParticipant.activeEffects"
              :participant-name="getEntityDetails(selectedParticipant)?.name || 'Unknown'"
              @add="(effect) => addEffect(selectedParticipant!.id, effect)"
              @remove="(effectId) => removeEffect(selectedParticipant!.id, effectId)"
            />

            <!-- Quick Stats -->
            <div class="mt-6 bg-digimon-dark-700 rounded-lg p-4">
              <h3 class="font-semibold text-white mb-3">Combat Stats</h3>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span class="text-digimon-dark-400">Initiative:</span>
                  <span class="text-white ml-2">{{ selectedParticipant.initiative }}</span>
                </div>
                <div>
                  <span class="text-digimon-dark-400">Stance:</span>
                  <span class="text-white ml-2 capitalize">{{ selectedParticipant.currentStance }}</span>
                </div>
                <div>
                  <span class="text-digimon-dark-400">Simple Actions:</span>
                  <span class="text-white ml-2">{{ selectedParticipant.actionsRemaining.simple }}/2</span>
                </div>
                <div>
                  <span class="text-digimon-dark-400">Complex Actions:</span>
                  <span class="text-white ml-2">{{ selectedParticipant.actionsRemaining.complex }}/1</span>
                </div>
              </div>
            </div>

            <button
              class="w-full mt-4 bg-digimon-dark-700 hover:bg-digimon-dark-600 text-white px-4 py-2
                     rounded-lg font-semibold transition-colors"
              @click="selectedParticipantId = null"
            >
              Close
            </button>
          </div>
        </div>
      </Teleport>
    </template>
  </div>
</template>
