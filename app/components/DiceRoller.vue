<script setup lang="ts">
interface RollResult {
  id: string
  dice: string
  rolls: number[]
  modifier: number
  total: number
  timestamp: Date
}

const history = ref<RollResult[]>([])
const diceCount = ref(3)
const diceSides = ref(6)
const modifier = ref(0)
const isRolling = ref(false)

const presets = [
  { label: '3d6', dice: 3, sides: 6, mod: 0 },
  { label: '3d6+5', dice: 3, sides: 6, mod: 5 },
  { label: '3d6+10', dice: 3, sides: 6, mod: 10 },
  { label: '1d6', dice: 1, sides: 6, mod: 0 },
  { label: '2d6', dice: 2, sides: 6, mod: 0 },
]

function rollDice() {
  isRolling.value = true

  setTimeout(() => {
    const rolls: number[] = []
    for (let i = 0; i < diceCount.value; i++) {
      rolls.push(Math.floor(Math.random() * diceSides.value) + 1)
    }

    const total = rolls.reduce((a, b) => a + b, 0) + modifier.value

    const result: RollResult = {
      id: `roll-${Date.now()}`,
      dice: `${diceCount.value}d${diceSides.value}${modifier.value >= 0 ? '+' : ''}${modifier.value !== 0 ? modifier.value : ''}`,
      rolls,
      modifier: modifier.value,
      total,
      timestamp: new Date(),
    }

    history.value = [result, ...history.value.slice(0, 9)]
    isRolling.value = false
  }, 300)
}

function applyPreset(preset: typeof presets[0]) {
  diceCount.value = preset.dice
  diceSides.value = preset.sides
  modifier.value = preset.mod
  rollDice()
}

function clearHistory() {
  history.value = []
}
</script>

<template>
  <div class="bg-digimon-dark-800 rounded-xl p-4 border border-digimon-dark-700">
    <h3 class="font-display text-lg font-semibold text-white mb-3">Dice Roller</h3>

    <!-- Quick presets -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="preset in presets"
        :key="preset.label"
        class="px-3 py-1 bg-digimon-dark-700 hover:bg-digimon-dark-600 text-white text-sm rounded transition-colors"
        @click="applyPreset(preset)"
      >
        {{ preset.label }}
      </button>
    </div>

    <!-- Custom roll -->
    <div class="flex gap-2 mb-4">
      <input
        v-model.number="diceCount"
        type="number"
        min="1"
        max="10"
        class="w-16 bg-digimon-dark-700 border border-digimon-dark-600 rounded px-2 py-1
               text-white text-center focus:border-digimon-orange-500 focus:outline-none"
      />
      <span class="text-white self-center">d</span>
      <input
        v-model.number="diceSides"
        type="number"
        min="2"
        max="100"
        class="w-16 bg-digimon-dark-700 border border-digimon-dark-600 rounded px-2 py-1
               text-white text-center focus:border-digimon-orange-500 focus:outline-none"
      />
      <span class="text-white self-center">+</span>
      <input
        v-model.number="modifier"
        type="number"
        class="w-16 bg-digimon-dark-700 border border-digimon-dark-600 rounded px-2 py-1
               text-white text-center focus:border-digimon-orange-500 focus:outline-none"
      />
      <button
        :disabled="isRolling"
        class="flex-1 bg-digimon-orange-500 hover:bg-digimon-orange-600 disabled:opacity-50
               text-white px-4 py-1 rounded font-semibold transition-colors"
        @click="rollDice"
      >
        {{ isRolling ? '🎲...' : 'Roll' }}
      </button>
    </div>

    <!-- Results history -->
    <div v-if="history.length > 0" class="space-y-2">
      <div class="flex justify-between items-center">
        <span class="text-xs text-digimon-dark-400">History</span>
        <button class="text-xs text-digimon-dark-400 hover:text-white" @click="clearHistory">
          Clear
        </button>
      </div>
      <div
        v-for="(result, index) in history"
        :key="result.id"
        :class="[
          'p-2 rounded transition-all',
          index === 0 ? 'bg-digimon-orange-500/20 border border-digimon-orange-500/50' : 'bg-digimon-dark-700',
        ]"
      >
        <div class="flex justify-between items-center">
          <span class="text-sm text-digimon-dark-400">{{ result.dice }}</span>
          <span :class="['font-bold text-lg', index === 0 ? 'text-digimon-orange-400' : 'text-white']">
            {{ result.total }}
          </span>
        </div>
        <div class="text-xs text-digimon-dark-400">
          [{{ result.rolls.join(', ') }}]{{ result.modifier !== 0 ? ` ${result.modifier >= 0 ? '+' : ''}${result.modifier}` : '' }}
        </div>
      </div>
    </div>
  </div>
</template>
