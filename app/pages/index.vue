<script setup lang="ts">
definePageMeta({
  title: 'Dashboard',
})

const { tamers, fetchTamers } = useTamers()
const { digimonList, fetchDigimon } = useDigimon()
const { encounters, fetchEncounters } = useEncounters()

// Fetch data on mount
onMounted(async () => {
  await Promise.all([fetchTamers(), fetchDigimon(), fetchEncounters()])
})

// Computed stats
const stats = computed(() => [
  { label: 'Tamers', value: tamers.value.length, color: 'text-digimon-orange-400' },
  { label: 'Digimon', value: digimonList.value.length, color: 'text-digimon-stage-champion' },
  { label: 'Encounters', value: encounters.value.length, color: 'text-green-400' },
])

// Active encounters (in combat phase)
const activeEncounters = computed(() =>
  encounters.value.filter((e) => e.phase === 'combat')
)

// Recent encounters
const recentEncounters = computed(() =>
  [...encounters.value]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)
)

const quickActions = [
  { name: 'New Tamer', description: 'Create a new Tamer character', path: '/library/tamers/new', icon: '👤' },
  { name: 'New Digimon', description: 'Create a new Digimon', path: '/library/digimon/new', icon: '🦖' },
  { name: 'New Encounter', description: 'Start a combat encounter', path: '/encounters', icon: '⚔️' },
  { name: 'Player View', description: 'Open player TV display', path: '/player', icon: '📺' },
]

function getPhaseColor(phase: string) {
  const colors: Record<string, string> = {
    setup: 'bg-blue-900/30 text-blue-400',
    combat: 'bg-red-900/30 text-red-400',
    ended: 'bg-gray-900/30 text-gray-400',
  }
  return colors[phase] || 'bg-gray-900/30 text-gray-400'
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Welcome Header -->
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-white mb-2">
        Welcome to DDA 1.4 Session Helper
      </h1>
      <p class="text-digimon-dark-400">
        Manage your Digimon Digital Adventure 1.4 tabletop RPG sessions
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Stats Cards -->
        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="bg-digimon-dark-800 rounded-xl p-4 border border-digimon-dark-700"
          >
            <p class="text-sm text-digimon-dark-400 mb-1">{{ stat.label }}</p>
            <p :class="['text-3xl font-display font-bold', stat.color]">
              {{ stat.value }}
            </p>
          </div>
        </div>

        <!-- Active Encounters Alert -->
        <div v-if="activeEncounters.length > 0" class="bg-red-900/20 border border-red-500 rounded-xl p-4">
          <h2 class="font-display text-lg font-semibold text-red-400 mb-3">
            ⚔️ Active Combat ({{ activeEncounters.length }})
          </h2>
          <div class="space-y-2">
            <NuxtLink
              v-for="encounter in activeEncounters"
              :key="encounter.id"
              :to="`/encounters/${encounter.id}`"
              class="block bg-digimon-dark-800 rounded-lg p-3 hover:bg-digimon-dark-700 transition-colors"
            >
              <div class="flex justify-between items-center">
                <span class="font-semibold text-white">{{ encounter.name }}</span>
                <span class="text-sm text-red-400">Round {{ encounter.round }}</span>
              </div>
              <div class="text-sm text-digimon-dark-400">
                {{ (encounter.participants as unknown[])?.length || 0 }} participants
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Quick Actions -->
        <div>
          <h2 class="font-display text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div class="grid grid-cols-2 gap-4">
            <NuxtLink
              v-for="action in quickActions"
              :key="action.path"
              :to="action.path"
              class="bg-digimon-dark-800 rounded-xl p-4 border border-digimon-dark-700
                     hover:border-digimon-orange-500 transition-all group"
            >
              <div class="text-2xl mb-2">{{ action.icon }}</div>
              <h3 class="font-semibold text-white group-hover:text-digimon-orange-400 transition-colors">
                {{ action.name }}
              </h3>
              <p class="text-sm text-digimon-dark-400">{{ action.description }}</p>
            </NuxtLink>
          </div>
        </div>

        <!-- Recent Encounters -->
        <div v-if="recentEncounters.length > 0">
          <div class="flex justify-between items-center mb-4">
            <h2 class="font-display text-xl font-semibold text-white">Recent Encounters</h2>
            <NuxtLink to="/encounters" class="text-sm text-digimon-orange-400 hover:text-digimon-orange-300">
              View all →
            </NuxtLink>
          </div>
          <div class="space-y-3">
            <NuxtLink
              v-for="encounter in recentEncounters"
              :key="encounter.id"
              :to="`/encounters/${encounter.id}`"
              class="block bg-digimon-dark-800 rounded-xl p-4 border border-digimon-dark-700
                     hover:border-digimon-dark-600 transition-colors"
            >
              <div class="flex justify-between items-start">
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-white">{{ encounter.name }}</h3>
                    <span :class="['text-xs px-2 py-0.5 rounded uppercase', getPhaseColor(encounter.phase)]">
                      {{ encounter.phase }}
                    </span>
                  </div>
                  <p class="text-sm text-digimon-dark-400 mt-1">
                    {{ (encounter.participants as unknown[])?.length || 0 }} participants
                    <span v-if="encounter.phase === 'combat'">• Round {{ encounter.round }}</span>
                  </p>
                </div>
                <span class="text-xs text-digimon-dark-500">
                  {{ new Date(encounter.updatedAt).toLocaleDateString() }}
                </span>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Stage Reference Card -->
        <div class="bg-digimon-dark-800 rounded-xl p-6 border border-digimon-dark-700">
          <h2 class="font-display text-xl font-semibold text-white mb-4">Stage Reference</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-digimon-dark-400 text-left">
                  <th class="pb-3 pr-4">Stage</th>
                  <th class="pb-3 pr-4">DP</th>
                  <th class="pb-3 pr-4">Move</th>
                  <th class="pb-3 pr-4">Wounds</th>
                  <th class="pb-3 pr-4">Brains</th>
                  <th class="pb-3 pr-4">Attacks</th>
                  <th class="pb-3">Bonus</th>
                </tr>
              </thead>
              <tbody class="text-white">
                <tr>
                  <td class="py-2 pr-4"><span class="text-digimon-stage-fresh">Fresh</span></td>
                  <td class="py-2 pr-4">5</td>
                  <td class="py-2 pr-4">2</td>
                  <td class="py-2 pr-4">0</td>
                  <td class="py-2 pr-4">0</td>
                  <td class="py-2 pr-4">1</td>
                  <td class="py-2">0</td>
                </tr>
                <tr>
                  <td class="py-2 pr-4"><span class="text-digimon-stage-intraining">In-Training</span></td>
                  <td class="py-2 pr-4">15</td>
                  <td class="py-2 pr-4">4</td>
                  <td class="py-2 pr-4">1</td>
                  <td class="py-2 pr-4">1</td>
                  <td class="py-2 pr-4">2</td>
                  <td class="py-2">0</td>
                </tr>
                <tr>
                  <td class="py-2 pr-4"><span class="text-digimon-stage-rookie">Rookie</span></td>
                  <td class="py-2 pr-4">25</td>
                  <td class="py-2 pr-4">6</td>
                  <td class="py-2 pr-4">2</td>
                  <td class="py-2 pr-4">3</td>
                  <td class="py-2 pr-4">2</td>
                  <td class="py-2">1</td>
                </tr>
                <tr>
                  <td class="py-2 pr-4"><span class="text-digimon-stage-champion">Champion</span></td>
                  <td class="py-2 pr-4">40</td>
                  <td class="py-2 pr-4">8</td>
                  <td class="py-2 pr-4">5</td>
                  <td class="py-2 pr-4">5</td>
                  <td class="py-2 pr-4">3</td>
                  <td class="py-2">2</td>
                </tr>
                <tr>
                  <td class="py-2 pr-4"><span class="text-digimon-stage-ultimate">Ultimate</span></td>
                  <td class="py-2 pr-4">55</td>
                  <td class="py-2 pr-4">10</td>
                  <td class="py-2 pr-4">7</td>
                  <td class="py-2 pr-4">7</td>
                  <td class="py-2 pr-4">4</td>
                  <td class="py-2">3</td>
                </tr>
                <tr>
                  <td class="py-2 pr-4"><span class="text-digimon-stage-mega">Mega</span></td>
                  <td class="py-2 pr-4">70</td>
                  <td class="py-2 pr-4">12</td>
                  <td class="py-2 pr-4">10</td>
                  <td class="py-2 pr-4">10</td>
                  <td class="py-2 pr-4">5</td>
                  <td class="py-2">4</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Sidebar - Tools -->
      <div class="space-y-4">
        <DiceRoller />
        <DamageCalculator />
      </div>
    </div>
  </div>
</template>
