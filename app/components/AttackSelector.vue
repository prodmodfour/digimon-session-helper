<script setup lang="ts">
import { ATTACK_DATABASE, getAttacksForStage, type AttackTemplate } from '../data/attacks'
import type { DigimonStage } from '../types'

// DDA 1.4 Attack structure
interface Attack {
  id: string
  name: string
  range: 'melee' | 'ranged'
  type: 'damage' | 'support'
  tags: string[]
  effect?: string
  description: string
}

interface Props {
  stage: DigimonStage
  maxAttacks: number
  currentAttacks: Attack[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'add', attack: Attack): void
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
        a.description.toLowerCase().includes(query) ||
        a.tags.some((t) => t.toLowerCase().includes(query))
    )
  }

  // Exclude already added attacks
  const currentIds = props.currentAttacks.map((a) => a.id)
  return attacks.filter((a) => !currentIds.includes(a.id))
})

function selectAttack(template: AttackTemplate) {
  const attack: Attack = {
    id: template.id,
    name: template.name,
    range: template.range,
    type: template.type,
    tags: [...template.tags],
    effect: template.effect,
    description: template.description,
  }
  emit('add', attack)

  if (props.currentAttacks.length + 1 >= props.maxAttacks) {
    showSelector.value = false
  }
}

function getRangeColor(range: 'melee' | 'ranged') {
  return range === 'melee' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'
}

function getTypeColor(type: 'damage' | 'support') {
  return type === 'damage' ? 'bg-orange-900/30 text-orange-400' : 'bg-green-900/30 text-green-400'
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
            <span :class="['text-xs px-2 py-0.5 rounded', getRangeColor(attack.range)]">
              [{{ attack.range === 'melee' ? 'Melee' : 'Ranged' }}]
            </span>
            <span :class="['text-xs px-2 py-0.5 rounded', getTypeColor(attack.type)]">
              [{{ attack.type === 'damage' ? 'Damage' : 'Support' }}]
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
          <div v-if="attack.effect" class="mt-1">
            <span class="text-xs bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded">
              Effect: {{ attack.effect }}
            </span>
          </div>
          <p v-if="attack.description" class="text-sm text-digimon-dark-400 mt-2 italic">
            {{ attack.description }}
          </p>
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
        class="text-sm text-digimon-orange-400 hover:text-digimon-orange-300 transition-colors"
        @click="showSelector = true"
      >
        + Add Attack from Database
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
            <option value="ultra">Ultra</option>
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
              <span :class="['text-xs px-2 py-0.5 rounded', getRangeColor(attack.range)]">
                [{{ attack.range === 'melee' ? 'Melee' : 'Ranged' }}]
              </span>
              <span :class="['text-xs px-2 py-0.5 rounded', getTypeColor(attack.type)]">
                [{{ attack.type === 'damage' ? 'Damage' : 'Support' }}]
              </span>
              <span class="text-xs text-digimon-dark-500 capitalize">({{ attack.stage }})</span>
            </div>
            <div v-if="attack.tags.length > 0" class="flex gap-1 mt-1 flex-wrap">
              <span
                v-for="tag in attack.tags"
                :key="tag"
                class="text-xs bg-digimon-dark-600 text-digimon-dark-300 px-1 py-0.5 rounded"
              >
                {{ tag }}
              </span>
            </div>
            <div v-if="attack.effect" class="mt-1">
              <span class="text-xs bg-purple-900/30 text-purple-400 px-1 py-0.5 rounded">
                {{ attack.effect }}
              </span>
            </div>
            <p class="text-xs text-digimon-dark-400 mt-1 line-clamp-2 italic">{{ attack.description }}</p>
          </button>

          <div v-if="availableAttacks.length === 0" class="text-center py-4 text-digimon-dark-400">
            No attacks found
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
