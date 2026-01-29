<script setup lang="ts">
import type { Tamer, Digimon, Encounter } from '../../server/db/schema'
import type { CombatParticipant } from '../../composables/useEncounters'
import type { EvolutionLine } from '../../server/db/schema'
import type { EvolutionChainEntry, EvolutionProgress } from '../../composables/useEvolution'
import type { DigimonStage } from '../../types'
import { STAGE_CONFIG } from '../../types'

definePageMeta({
  layout: 'player',
  title: 'Player Dashboard',
})

const route = useRoute()
const tamerId = computed(() => route.params.tamerId as string)

// State
const tamer = ref<Tamer | null>(null)
const partnerDigimon = ref<Digimon[]>([])
const evolutionLines = ref<EvolutionLine[]>([])
const activeEncounter = ref<Encounter | null>(null)
const loading = ref(true)
const lastRefresh = ref(new Date())

// Composables
const { fetchTamer, calculateDerivedStats: calcTamerStats } = useTamers()
const { fetchDigimon, calculateDerivedStats: calcDigimonStats } = useDigimon()
const { encounters, fetchEncounters, getCurrentParticipant } = useEncounters()
const { fetchEvolutionLines, getCurrentStage, getNextStage, canEvolve } = useEvolution()

// Auto-refresh every 5 seconds
let refreshInterval: ReturnType<typeof setInterval>

async function loadData() {
  loading.value = true
  try {
    // Fetch tamer
    const fetchedTamer = await fetchTamer(tamerId.value)
    tamer.value = fetchedTamer

    if (fetchedTamer) {
      // Fetch partner Digimon
      await fetchDigimon({ partnerId: fetchedTamer.id })
      partnerDigimon.value = await $fetch<Digimon[]>(`/api/digimon?partnerId=${fetchedTamer.id}`)

      // Fetch evolution lines
      const lines = await $fetch<EvolutionLine[]>(`/api/evolution-lines?partnerId=${fetchedTamer.id}`)
      evolutionLines.value = lines

      // Fetch encounters to find active one
      await fetchEncounters()
      const active = encounters.value.find((e) => e.phase === 'combat')
      if (active) {
        // Check if this tamer or their Digimon are participating
        const participants = active.participants as CombatParticipant[]
        const isParticipating = participants.some(
          (p) =>
            (p.type === 'tamer' && p.entityId === fetchedTamer.id) ||
            (p.type === 'digimon' && partnerDigimon.value.some((d) => d.id === p.entityId))
        )
        if (isParticipating) {
          activeEncounter.value = active
        } else {
          activeEncounter.value = null
        }
      } else {
        activeEncounter.value = null
      }
    }

    lastRefresh.value = new Date()
  } catch (e) {
    console.error('Failed to load player data:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
  // Auto-refresh
  refreshInterval = setInterval(loadData, 5000)
})

onUnmounted(() => {
  clearInterval(refreshInterval)
})

// Computed
const tamerStats = computed(() => (tamer.value ? calcTamerStats(tamer.value) : null))

const myParticipants = computed(() => {
  if (!activeEncounter.value || !tamer.value) return []
  const participants = activeEncounter.value.participants as CombatParticipant[]
  return participants.filter(
    (p) =>
      (p.type === 'tamer' && p.entityId === tamer.value!.id) ||
      (p.type === 'digimon' && partnerDigimon.value.some((d) => d.id === p.entityId))
  )
})

const currentTurnParticipant = computed(() => {
  if (!activeEncounter.value) return null
  return getCurrentParticipant(activeEncounter.value)
})

const isMyTurn = computed(() => {
  if (!currentTurnParticipant.value || !tamer.value) return false
  return myParticipants.value.some((p) => p.id === currentTurnParticipant.value!.id)
})

function getStageColor(stage: DigimonStage): string {
  const colors: Record<DigimonStage, string> = {
    fresh: 'text-digimon-stage-fresh',
    'in-training': 'text-digimon-stage-intraining',
    rookie: 'text-digimon-stage-rookie',
    champion: 'text-digimon-stage-champion',
    ultimate: 'text-digimon-stage-ultimate',
    mega: 'text-digimon-stage-mega',
  }
  return colors[stage] || 'text-gray-400'
}

function getParticipantName(participant: CombatParticipant): string {
  if (participant.type === 'tamer') {
    return tamer.value?.name || 'Unknown'
  }
  const digimon = partnerDigimon.value.find((d) => d.id === participant.entityId)
  return digimon?.name || 'Unknown'
}

// Clear selection
const selectedTamerId = useCookie<string | null>('player-tamer-id')
function switchCharacter() {
  selectedTamerId.value = null
  navigateTo('/player')
}
</script>

<template>
  <div class="min-h-screen bg-digimon-dark-900">
    <!-- Header -->
    <header class="bg-digimon-dark-800 border-b border-digimon-dark-700 sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-14">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-gradient-to-br from-digimon-orange-500 to-digimon-orange-700 rounded-lg flex items-center justify-center">
              <span class="text-white font-display font-bold text-sm">D</span>
            </div>
            <span class="font-display text-white font-semibold">Player View</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-xs text-digimon-dark-400">
              Last updated: {{ lastRefresh.toLocaleTimeString() }}
            </span>
            <button
              class="text-sm text-digimon-dark-400 hover:text-white"
              @click="loadData"
            >
              Refresh
            </button>
            <button
              class="text-sm text-digimon-dark-400 hover:text-white"
              @click="switchCharacter"
            >
              Switch
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-6">
      <div v-if="loading && !tamer" class="text-center py-12">
        <div class="text-digimon-dark-400">Loading your character...</div>
      </div>

      <div v-else-if="!tamer" class="text-center py-12">
        <div class="text-6xl mb-4">❌</div>
        <h2 class="text-xl font-semibold text-white mb-2">Character Not Found</h2>
        <button
          class="text-digimon-orange-400 hover:text-digimon-orange-300"
          @click="switchCharacter"
        >
          Select a different character
        </button>
      </div>

      <template v-else>
        <!-- Active Combat Alert -->
        <div v-if="activeEncounter" :class="[
          'mb-6 rounded-xl p-4 border-2',
          isMyTurn
            ? 'bg-digimon-orange-500/20 border-digimon-orange-500 animate-pulse'
            : 'bg-red-900/20 border-red-500/50'
        ]">
          <div class="flex items-center justify-between">
            <div>
              <h2 :class="['font-display text-lg font-semibold', isMyTurn ? 'text-digimon-orange-400' : 'text-red-400']">
                {{ isMyTurn ? "⚔️ IT'S YOUR TURN!" : '⚔️ Combat Active' }}
              </h2>
              <p class="text-digimon-dark-300 text-sm">
                {{ activeEncounter.name }} • Round {{ activeEncounter.round }}
              </p>
            </div>
            <div v-if="!isMyTurn && currentTurnParticipant" class="text-right">
              <div class="text-sm text-digimon-dark-400">Current Turn:</div>
              <div class="text-white font-semibold">
                {{ getParticipantName(currentTurnParticipant) }}
              </div>
            </div>
          </div>

          <!-- My participants in combat -->
          <div v-if="myParticipants.length > 0" class="mt-4 grid gap-3">
            <div
              v-for="participant in myParticipants"
              :key="participant.id"
              :class="[
                'bg-digimon-dark-800 rounded-lg p-3',
                participant.isActive && 'ring-2 ring-digimon-orange-500'
              ]"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-semibold text-white">{{ getParticipantName(participant) }}</span>
                <span :class="[
                  'text-xs px-2 py-0.5 rounded capitalize',
                  participant.currentStance === 'offensive' && 'bg-red-900/50 text-red-400',
                  participant.currentStance === 'defensive' && 'bg-blue-900/50 text-blue-400',
                  participant.currentStance === 'neutral' && 'bg-gray-700 text-gray-300',
                  participant.currentStance === 'sniper' && 'bg-purple-900/50 text-purple-400',
                  participant.currentStance === 'brave' && 'bg-yellow-900/50 text-yellow-400',
                ]">
                  {{ participant.currentStance }}
                </span>
              </div>

              <!-- Health bar -->
              <div class="mb-2">
                <div class="flex items-center gap-2 text-xs">
                  <span class="text-digimon-dark-400">HP:</span>
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
                  <span class="text-digimon-dark-300">{{ participant.maxWounds - participant.currentWounds }}/{{ participant.maxWounds }}</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-4 text-xs">
                <div class="flex items-center gap-1">
                  <span class="text-digimon-dark-400">Simple:</span>
                  <div class="flex gap-0.5">
                    <div v-for="i in 2" :key="i" :class="['w-3 h-3 rounded', i <= participant.actionsRemaining.simple ? 'bg-blue-500' : 'bg-digimon-dark-600']" />
                  </div>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-digimon-dark-400">Complex:</span>
                  <div :class="['w-3 h-3 rounded', participant.actionsRemaining.complex > 0 ? 'bg-purple-500' : 'bg-digimon-dark-600']" />
                </div>
              </div>

              <!-- Effects -->
              <div v-if="participant.activeEffects.length > 0" class="flex flex-wrap gap-1 mt-2">
                <span
                  v-for="effect in participant.activeEffects"
                  :key="effect.id"
                  :class="[
                    'text-xs px-1.5 py-0.5 rounded',
                    effect.type === 'buff' && 'bg-green-900/30 text-green-400',
                    effect.type === 'debuff' && 'bg-red-900/30 text-red-400',
                    effect.type === 'status' && 'bg-yellow-900/30 text-yellow-400',
                  ]"
                >
                  {{ effect.name }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Column -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Tamer Card -->
            <div class="bg-digimon-dark-800 rounded-xl p-6 border border-digimon-dark-700">
              <div class="flex items-start gap-4 mb-4">
                <div class="w-20 h-20 bg-digimon-dark-700 rounded-full flex items-center justify-center text-4xl shrink-0">
                  👤
                </div>
                <div>
                  <h1 class="font-display text-2xl font-bold text-white">{{ tamer.name }}</h1>
                  <p class="text-digimon-dark-400">Age {{ tamer.age }} • {{ tamer.campaignLevel }} campaign</p>
                  <div class="flex gap-4 mt-2 text-sm">
                    <span class="text-digimon-dark-300">
                      <span class="text-digimon-dark-400">Wounds:</span>
                      {{ tamer.currentWounds }}/{{ tamerStats?.woundBoxes }}
                    </span>
                    <span class="text-digimon-dark-300">
                      <span class="text-digimon-dark-400">Inspiration:</span>
                      {{ tamer.inspiration }}/{{ tamerStats?.maxInspiration }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Attributes -->
              <div class="grid grid-cols-5 gap-2 mb-4">
                <div v-for="(value, attr) in tamer.attributes" :key="attr" class="text-center bg-digimon-dark-700 rounded-lg p-2">
                  <div class="text-xs text-digimon-dark-400 uppercase">{{ attr }}</div>
                  <div class="text-lg font-semibold text-white">{{ value }}</div>
                </div>
              </div>

              <!-- Derived Stats -->
              <div class="flex flex-wrap gap-4 text-sm">
                <span><span class="text-digimon-dark-400">Speed:</span> <span class="text-white">{{ tamerStats?.speed }}</span></span>
                <span><span class="text-digimon-dark-400">Accuracy:</span> <span class="text-white">{{ tamerStats?.accuracyPool }}</span></span>
                <span><span class="text-digimon-dark-400">Dodge:</span> <span class="text-white">{{ tamerStats?.dodgePool }}</span></span>
                <span><span class="text-digimon-dark-400">Damage:</span> <span class="text-white">{{ tamerStats?.damage }}</span></span>
                <span><span class="text-digimon-dark-400">Armor:</span> <span class="text-white">{{ tamerStats?.armor }}</span></span>
              </div>
            </div>

            <!-- Partner Digimon -->
            <div v-for="digimon in partnerDigimon" :key="digimon.id" class="bg-digimon-dark-800 rounded-xl p-6 border border-digimon-dark-700">
              <div class="flex items-start gap-4 mb-4">
                <div class="w-20 h-20 bg-digimon-dark-700 rounded-lg flex items-center justify-center text-4xl shrink-0">
                  🦖
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h2 class="font-display text-xl font-semibold text-white">{{ digimon.name }}</h2>
                    <span :class="['text-sm capitalize', getStageColor(digimon.stage as DigimonStage)]">
                      {{ digimon.stage }}
                    </span>
                  </div>
                  <p class="text-digimon-dark-400 text-sm">{{ digimon.species }} • {{ digimon.attribute }}</p>

                  <!-- Health -->
                  <div class="mt-2">
                    <div class="flex items-center gap-2 text-sm">
                      <span class="text-digimon-dark-400">Wounds:</span>
                      <div class="flex-1 max-w-32 h-2 bg-digimon-dark-600 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-green-500 transition-all"
                          :style="{ width: `${((calcDigimonStats(digimon).woundBoxes - digimon.currentWounds) / calcDigimonStats(digimon).woundBoxes) * 100}%` }"
                        />
                      </div>
                      <span class="text-digimon-dark-300">{{ calcDigimonStats(digimon).woundBoxes - digimon.currentWounds }}/{{ calcDigimonStats(digimon).woundBoxes }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Stats -->
              <div class="grid grid-cols-5 gap-2 mb-4">
                <div class="text-center bg-digimon-dark-700 rounded-lg p-2">
                  <div class="text-xs text-digimon-dark-400">ACC</div>
                  <div class="text-lg font-semibold text-white">{{ digimon.baseStats.accuracy }}</div>
                </div>
                <div class="text-center bg-digimon-dark-700 rounded-lg p-2">
                  <div class="text-xs text-digimon-dark-400">DMG</div>
                  <div class="text-lg font-semibold text-white">{{ digimon.baseStats.damage }}</div>
                </div>
                <div class="text-center bg-digimon-dark-700 rounded-lg p-2">
                  <div class="text-xs text-digimon-dark-400">DOD</div>
                  <div class="text-lg font-semibold text-white">{{ digimon.baseStats.dodge }}</div>
                </div>
                <div class="text-center bg-digimon-dark-700 rounded-lg p-2">
                  <div class="text-xs text-digimon-dark-400">ARM</div>
                  <div class="text-lg font-semibold text-white">{{ digimon.baseStats.armor }}</div>
                </div>
                <div class="text-center bg-digimon-dark-700 rounded-lg p-2">
                  <div class="text-xs text-digimon-dark-400">HP</div>
                  <div class="text-lg font-semibold text-white">{{ digimon.baseStats.health }}</div>
                </div>
              </div>

              <!-- Derived Stats -->
              <div class="flex flex-wrap gap-4 text-sm mb-4">
                <span><span class="text-digimon-dark-400">Agility:</span> <span class="text-white">{{ calcDigimonStats(digimon).agility }}</span></span>
                <span><span class="text-digimon-dark-400">Body:</span> <span class="text-white">{{ calcDigimonStats(digimon).body }}</span></span>
                <span><span class="text-digimon-dark-400">Move:</span> <span class="text-white">{{ calcDigimonStats(digimon).movement }}</span></span>
                <span><span class="text-digimon-dark-400">Stage Bonus:</span> <span class="text-white">+{{ calcDigimonStats(digimon).stageBonus }}</span></span>
              </div>

              <!-- Attacks -->
              <div v-if="digimon.attacks && digimon.attacks.length > 0">
                <h3 class="text-sm font-semibold text-digimon-dark-400 mb-2">Attacks</h3>
                <div class="space-y-2">
                  <div
                    v-for="attack in digimon.attacks"
                    :key="attack.id"
                    class="bg-digimon-dark-700 rounded-lg p-3"
                  >
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-white">{{ attack.name }}</span>
                      <span :class="[
                        'text-xs px-1.5 py-0.5 rounded',
                        attack.type === 'simple' ? 'bg-blue-900/50 text-blue-400' : 'bg-purple-900/50 text-purple-400'
                      ]">
                        {{ attack.type }}
                      </span>
                      <span class="text-xs text-digimon-dark-400 capitalize">{{ attack.range }}</span>
                    </div>
                    <div v-if="attack.effect" class="text-sm text-digimon-dark-300 mt-1">
                      {{ attack.effect }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Evolution Lines -->
            <div v-for="line in evolutionLines" :key="line.id" class="bg-digimon-dark-800 rounded-xl p-6 border border-digimon-dark-700">
              <h3 class="font-display text-lg font-semibold text-white mb-4">{{ line.name }}</h3>

              <!-- Chain visualization -->
              <div class="flex items-center gap-2 flex-wrap mb-4">
                <template v-for="(entry, index) in (line.chain as EvolutionChainEntry[])" :key="index">
                  <div
                    :class="[
                      'px-3 py-1.5 rounded-lg text-sm font-medium border',
                      index === line.currentStageIndex
                        ? 'bg-digimon-orange-500/20 border-digimon-orange-500 text-digimon-orange-400'
                        : index < line.currentStageIndex
                          ? 'bg-green-900/20 border-green-500/30 text-green-400'
                          : 'bg-digimon-dark-700 border-digimon-dark-600 text-digimon-dark-400',
                    ]"
                  >
                    {{ entry.species }}
                  </div>
                  <span v-if="index < (line.chain as EvolutionChainEntry[]).length - 1" class="text-digimon-dark-500">→</span>
                </template>
              </div>

              <!-- Next evolution requirements -->
              <div v-if="getNextStage(line)" class="text-sm">
                <span class="text-digimon-dark-400">Next:</span>
                <span :class="['ml-1', getStageColor(getNextStage(line)!.stage)]">{{ getNextStage(line)!.species }}</span>
                <span :class="['ml-2', canEvolve(line).canEvolve ? 'text-green-400' : 'text-yellow-400']">
                  ({{ canEvolve(line).reason }})
                </span>
              </div>
              <div v-else class="text-sm text-green-400">
                Maximum evolution reached!
              </div>

              <!-- Progress -->
              <div class="flex gap-4 mt-2 text-xs text-digimon-dark-400">
                <span>Battles: {{ (line.evolutionProgress as EvolutionProgress).battlesWon }}</span>
                <span>XP: {{ (line.evolutionProgress as EvolutionProgress).xpEarned }}</span>
                <span>Bond: {{ (line.evolutionProgress as EvolutionProgress).bondLevel }}</span>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-4">
            <!-- Dice Roller -->
            <DiceRoller />

            <!-- Quick Reference -->
            <div class="bg-digimon-dark-800 rounded-xl p-4 border border-digimon-dark-700">
              <h3 class="font-display text-lg font-semibold text-white mb-3">Quick Reference</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-digimon-dark-400">Simple Actions</span>
                  <span class="text-white">2 per turn</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-digimon-dark-400">Complex Actions</span>
                  <span class="text-white">1 per turn</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-digimon-dark-400">Movement</span>
                  <span class="text-white">= Simple Action</span>
                </div>
                <div class="border-t border-digimon-dark-600 my-2" />
                <div class="text-digimon-dark-400">
                  <strong class="text-white">Attack:</strong> 3d6 + Accuracy vs 3d6 + Dodge
                </div>
                <div class="text-digimon-dark-400">
                  <strong class="text-white">Damage:</strong> Net Successes + Damage + Stage Bonus - Armor
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="tamer.notes" class="bg-digimon-dark-800 rounded-xl p-4 border border-digimon-dark-700">
              <h3 class="font-display text-lg font-semibold text-white mb-3">Notes</h3>
              <p class="text-digimon-dark-300 text-sm whitespace-pre-wrap">{{ tamer.notes }}</p>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>
