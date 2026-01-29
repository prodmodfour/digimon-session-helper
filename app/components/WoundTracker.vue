<script setup lang="ts">
interface Props {
  maxWounds: number
  currentWounds: number
  name: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update', wounds: number): void
}>()

const wounds = ref(props.currentWounds)

watch(() => props.currentWounds, (newVal) => {
  wounds.value = newVal
})

function takeDamage(amount: number = 1) {
  wounds.value = Math.min(props.maxWounds, wounds.value + amount)
  emit('update', wounds.value)
}

function heal(amount: number = 1) {
  wounds.value = Math.max(0, wounds.value - amount)
  emit('update', wounds.value)
}

function setWounds(value: number) {
  wounds.value = Math.max(0, Math.min(props.maxWounds, value))
  emit('update', wounds.value)
}

const healthPercent = computed(() => {
  return ((props.maxWounds - wounds.value) / props.maxWounds) * 100
})

const healthStatus = computed(() => {
  const percent = healthPercent.value
  if (percent >= 75) return { color: 'bg-green-500', label: 'Healthy' }
  if (percent >= 50) return { color: 'bg-yellow-500', label: 'Wounded' }
  if (percent >= 25) return { color: 'bg-orange-500', label: 'Critical' }
  if (percent > 0) return { color: 'bg-red-500', label: 'Near Death' }
  return { color: 'bg-red-900', label: 'Defeated' }
})
</script>

<template>
  <div class="bg-digimon-dark-700 rounded-lg p-3">
    <div class="flex justify-between items-center mb-2">
      <span class="text-sm font-medium text-white">{{ name }}</span>
      <span :class="['text-xs px-2 py-0.5 rounded', healthStatus.color]">
        {{ healthStatus.label }}
      </span>
    </div>

    <!-- Health bar -->
    <div class="h-3 bg-digimon-dark-600 rounded-full mb-2 overflow-hidden">
      <div
        :class="['h-full transition-all duration-300', healthStatus.color]"
        :style="{ width: `${healthPercent}%` }"
      />
    </div>

    <!-- Wound boxes -->
    <div class="flex flex-wrap gap-1 mb-3">
      <button
        v-for="i in maxWounds"
        :key="i"
        :class="[
          'w-5 h-5 rounded border-2 transition-colors',
          i <= wounds
            ? 'bg-red-500 border-red-400'
            : 'bg-digimon-dark-600 border-digimon-dark-500 hover:border-digimon-dark-400',
        ]"
        @click="setWounds(i <= wounds ? i - 1 : i)"
      />
    </div>

    <!-- Controls -->
    <div class="flex gap-2">
      <button
        class="flex-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
        @click="takeDamage(1)"
      >
        +1 Wound
      </button>
      <button
        class="flex-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm"
        @click="heal(1)"
      >
        -1 Wound
      </button>
    </div>

    <div class="text-center text-xs text-digimon-dark-400 mt-2">
      {{ wounds }} / {{ maxWounds }} wounds
    </div>
  </div>
</template>
