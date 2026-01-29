<script setup lang="ts">
import { ATTACK_DATABASE, getAttacksForStage, type AttackTemplate } from '../data/attacks'
import type { DigimonStage } from '../types'

interface Props {
  stage: DigimonStage
  maxAttacks: number
  currentAttacks: Array<{
    id: string
    name: string
    type: 'simple' | 'complex'
    range: 'melee' | 'short' | 'medium' | 'long'
    damageModifier: number
    accuracyModifier: number
    tags: string[]
    effect: string
  }>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'add', attack: Props['currentAttacks'][0]): void
  (e: 'remove', index: number): void
}>()

const showSelector = ref(false)
const searchQuery = ref('')
const filterStage = ref<'all' | DigimonStage>('all')

const availableAttacks = computed(() => {
  let attacks: AttackTemplate[]

  if (filterStage.value === 'all') {
    attacks = getAttacksForStage(props.stage)
  } else {
    attacks = ATTACK_DATABASE.filter((a) => a.stage === filterStage.value || a.stage === 'any')
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    attacks = attacks.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.effect.toLowerCase().includes(query) ||
        a.tags.some((t) => t.toLowerCase().includes(query))
    )
  }

  // Exclude already added attacks
  const currentIds = props.currentAttacks.map((a) => a.id)
  return attacks.filter((a) => !currentIds.includes(a.id))
})

function selectAttack(template: AttackTemplate) {
  const attack = {
    id: template.id,
    name: template.name,
    type: template.type,
    range: template.range,
    damageModifier: template.damageModifier,
    accuracyModifier: template.accuracyModifier,
    tags: [...template.tags],
    effect: template.effect,
  }
  emit('add', attack)

  if (props.currentAttacks.length + 1 >= props.maxAttacks) {
    showSelector.value = false
  }
}

function getTypeColor(type: 'simple' | 'complex') {
  return type === 'simple' ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Current attacks -->
    <div v-if="currentAttacks.length > 0" class="space-y-2">
      <div
        v-for="(attack, index) in currentAttacks"
        :key="attack.id"
        class="bg-digimon-dark-700 rounded-lg p-3 flex justify-between items-start"
      >
        <div class="flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-semibold text-white">{{ attack.name }}</span>
            <span :class="['text-xs px-2 py-0.5 rounded', getTypeColor(attack.type)]">
              {{ attack.type }}
            </span>
            <span class="text-xs text-digimon-dark-400 capitalize">{{ attack.range }}</span>
          </div>
          <div class="text-sm text-digimon-dark-400 mt-1">
            <span v-if="attack.damageModifier !== 0">
              DMG {{ attack.damageModifier >= 0 ? '+' : '' }}{{ attack.damageModifier }}
            </span>
            <span v-if="attack.accuracyModifier !== 0" class="ml-2">
              ACC {{ attack.accuracyModifier >= 0 ? '+' : '' }}{{ attack.accuracyModifier }}
            </span>
          </div>
          <div v-if="attack.tags.length > 0" class="flex gap-1 mt-2 flex-wrap">
            <span
              v-for="tag in attack.tags"
              :key="tag"
              class="text-xs bg-digimon-dark-600 text-digimon-dark-300 px-2 py-0.5 rounded"
            >
              {{ tag }}
            </span>
          </div>
          <p v-if="attack.effect" class="text-sm text-digimon-dark-300 mt-2">{{ attack.effect }}</p>
        </div>
        <button
          type="button"
          class="text-red-400 hover:text-red-300 text-sm ml-2"
          @click="emit('remove', index)"
        >
          Remove
        </button>
      </div>
    </div>

    <!-- Add attack button -->
    <div v-if="currentAttacks.length < maxAttacks">
      <button
        v-if="!showSelector"
        type="button"
        class="w-full border-2 border-dashed border-digimon-dark-600 rounded-lg p-4
               text-digimon-dark-400 hover:border-digimon-dark-500 hover:text-digimon-dark-300
               transition-colors"
        @click="showSelector = true"
      >
        + Add Attack from Database ({{ currentAttacks.length }}/{{ maxAttacks }})
      </button>

      <!-- Attack selector -->
      <div v-else class="border border-digimon-dark-600 rounded-lg p-4 bg-digimon-dark-750">
        <div class="flex justify-between items-center mb-4">
          <h4 class="font-semibold text-white">Select Attack</h4>
          <button
            type="button"
            class="text-digimon-dark-400 hover:text-white"
            @click="showSelector = false"
          >
            ✕
          </button>
        </div>

        <!-- Search and filter -->
        <div class="flex gap-2 mb-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search attacks..."
            class="flex-1 bg-digimon-dark-700 border border-digimon-dark-600 rounded px-3 py-2
                   text-white text-sm focus:border-digimon-orange-500 focus:outline-none"
          />
          <select
            v-model="filterStage"
            class="bg-digimon-dark-700 border border-digimon-dark-600 rounded px-3 py-2
                   text-white text-sm focus:border-digimon-orange-500 focus:outline-none"
          >
            <option value="all">Current Stage</option>
            <option value="fresh">Fresh</option>
            <option value="in-training">In-Training</option>
            <option value="rookie">Rookie</option>
            <option value="champion">Champion</option>
            <option value="ultimate">Ultimate</option>
            <option value="mega">Mega</option>
          </select>
        </div>

        <!-- Attack list -->
        <div class="max-h-64 overflow-y-auto space-y-2">
          <button
            v-for="attack in availableAttacks"
            :key="attack.id"
            type="button"
            class="w-full text-left bg-digimon-dark-700 hover:bg-digimon-dark-600 rounded-lg p-3
                   transition-colors"
            @click="selectAttack(attack)"
          >
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-semibold text-white">{{ attack.name }}</span>
              <span :class="['text-xs px-2 py-0.5 rounded', getTypeColor(attack.type)]">
                {{ attack.type }}
              </span>
              <span class="text-xs text-digimon-dark-400 capitalize">{{ attack.range }}</span>
              <span class="text-xs text-digimon-dark-500 capitalize">({{ attack.stage }})</span>
            </div>
            <div class="text-xs text-digimon-dark-400 mt-1">
              <span v-if="attack.damageModifier !== 0">
                DMG {{ attack.damageModifier >= 0 ? '+' : '' }}{{ attack.damageModifier }}
              </span>
              <span v-if="attack.accuracyModifier !== 0" class="ml-2">
                ACC {{ attack.accuracyModifier >= 0 ? '+' : '' }}{{ attack.accuracyModifier }}
              </span>
            </div>
            <p class="text-xs text-digimon-dark-300 mt-1 line-clamp-2">{{ attack.effect }}</p>
          </button>

          <div v-if="availableAttacks.length === 0" class="text-center py-4 text-digimon-dark-400">
            No attacks found
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
