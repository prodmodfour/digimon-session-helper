<script setup lang="ts">
const attackRoll = ref(0)
const defenseRoll = ref(0)
const attackerDamage = ref(0)
const defenderArmor = ref(0)
const stageBonus = ref(0)

const netSuccesses = computed(() => Math.max(0, attackRoll.value - defenseRoll.value))
const rawDamage = computed(() => netSuccesses.value + attackerDamage.value + stageBonus.value)
const finalDamage = computed(() => Math.max(0, rawDamage.value - defenderArmor.value))

const damageBreakdown = computed(() => {
  const parts = []
  if (netSuccesses.value > 0) parts.push(`${netSuccesses.value} successes`)
  if (attackerDamage.value > 0) parts.push(`${attackerDamage.value} DMG`)
  if (stageBonus.value > 0) parts.push(`${stageBonus.value} stage`)
  if (defenderArmor.value > 0) parts.push(`-${defenderArmor.value} ARM`)
  return parts.join(' + ')
})

function reset() {
  attackRoll.value = 0
  defenseRoll.value = 0
  attackerDamage.value = 0
  defenderArmor.value = 0
  stageBonus.value = 0
}
</script>

<template>
  <div class="bg-digimon-dark-800 rounded-xl p-4 border border-digimon-dark-700">
    <h3 class="font-display text-lg font-semibold text-white mb-3">Damage Calculator</h3>

    <div class="grid grid-cols-2 gap-3 mb-4">
      <!-- Attacker -->
      <div>
        <label class="block text-xs text-digimon-dark-400 mb-1">Attack Roll</label>
        <input
          v-model.number="attackRoll"
          type="number"
          min="0"
          class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded px-2 py-1
                 text-white text-center focus:border-digimon-orange-500 focus:outline-none"
        />
      </div>
      <div>
        <label class="block text-xs text-digimon-dark-400 mb-1">Defense Roll</label>
        <input
          v-model.number="defenseRoll"
          type="number"
          min="0"
          class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded px-2 py-1
                 text-white text-center focus:border-digimon-orange-500 focus:outline-none"
        />
      </div>
      <div>
        <label class="block text-xs text-digimon-dark-400 mb-1">Attacker DMG</label>
        <input
          v-model.number="attackerDamage"
          type="number"
          min="0"
          class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded px-2 py-1
                 text-white text-center focus:border-digimon-orange-500 focus:outline-none"
        />
      </div>
      <div>
        <label class="block text-xs text-digimon-dark-400 mb-1">Defender ARM</label>
        <input
          v-model.number="defenderArmor"
          type="number"
          min="0"
          class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded px-2 py-1
                 text-white text-center focus:border-digimon-orange-500 focus:outline-none"
        />
      </div>
      <div class="col-span-2">
        <label class="block text-xs text-digimon-dark-400 mb-1">Stage Bonus</label>
        <input
          v-model.number="stageBonus"
          type="number"
          min="0"
          class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded px-2 py-1
                 text-white text-center focus:border-digimon-orange-500 focus:outline-none"
        />
      </div>
    </div>

    <!-- Result -->
    <div class="bg-digimon-dark-700 rounded-lg p-3 mb-3">
      <div class="flex justify-between items-center mb-2">
        <span class="text-digimon-dark-400">Net Successes:</span>
        <span class="text-white font-semibold">{{ netSuccesses }}</span>
      </div>
      <div class="flex justify-between items-center mb-2">
        <span class="text-digimon-dark-400">Raw Damage:</span>
        <span class="text-white font-semibold">{{ rawDamage }}</span>
      </div>
      <div class="flex justify-between items-center pt-2 border-t border-digimon-dark-600">
        <span class="text-digimon-orange-400 font-semibold">Final Damage:</span>
        <span class="text-digimon-orange-400 font-bold text-xl">{{ finalDamage }}</span>
      </div>
      <div v-if="damageBreakdown" class="text-xs text-digimon-dark-400 mt-2">
        {{ damageBreakdown }}
      </div>
    </div>

    <button
      class="w-full bg-digimon-dark-700 hover:bg-digimon-dark-600 text-digimon-dark-300 px-3 py-1 rounded text-sm"
      @click="reset"
    >
      Reset
    </button>
  </div>
</template>
