<script setup lang="ts">
import type { Digimon } from '../../../server/db/schema'
import { STAGE_CONFIG, type DigimonStage } from '../../../types'

definePageMeta({
  title: 'Edit Digimon',
})

const route = useRoute()
const router = useRouter()
const { fetchDigimonById, updateDigimon, loading, error } = useDigimon()
const { tamers, fetchTamers } = useTamers()

const digimon = ref<Digimon | null>(null)
const initialLoading = ref(true)

const form = reactive({
  name: '',
  species: '',
  stage: 'rookie' as DigimonStage,
  attribute: 'data' as 'vaccine' | 'data' | 'virus' | 'free',
  family: '',
  type: '',
  baseStats: {
    accuracy: 3,
    damage: 3,
    dodge: 3,
    armor: 3,
    health: 3,
  },
  attacks: [] as Digimon['attacks'],
  qualities: [] as Digimon['qualities'],
  dataOptimization: '',
  partnerId: '' as string | null,
  isEnemy: false,
  notes: '',
  spriteUrl: '',
})

const stages: DigimonStage[] = ['fresh', 'in-training', 'rookie', 'champion', 'ultimate', 'mega']
const attributes = ['vaccine', 'data', 'virus', 'free'] as const

const currentStageConfig = computed(() => STAGE_CONFIG[form.stage])

// DP calculation - DDA 1.4 rules:
// Stats cost 1 DP per point
// Qualities have variable DP costs (can be positive, negative, or zero)
const dpUsedOnStats = computed(() => {
  return Object.values(form.baseStats).reduce((a, b) => a + b, 0)
})

const dpUsedOnQualities = computed(() => {
  return form.qualities.reduce((total, q) => total + (q.dpCost || 0), 0)
})

const dpUsed = computed(() => {
  return dpUsedOnStats.value + dpUsedOnQualities.value
})

const dpRemaining = computed(() => {
  return currentStageConfig.value.dp - dpUsed.value
})

// Toggle for custom attack form
const showCustomAttackForm = ref(false)

// New attack form - DDA 1.4 structure
const newAttack = reactive({
  name: '',
  range: 'melee' as 'melee' | 'ranged',
  type: 'damage' as 'damage' | 'support',
  tags: [] as string[],
  effect: '' as string | undefined,
  description: '',
})

type Attack = Digimon['attacks'][0]

function handleAddAttack(attack: Attack) {
  form.attacks = [...form.attacks, attack]
}

// Get available tags based on owned qualities
const availableAttackTags = computed(() => {
  const tags: Array<{ id: string; name: string; description: string }> = []

  for (const quality of form.qualities) {
    // Qualities that grant attack tags
    if (quality.id === 'weapon') {
      tags.push({ id: 'weapon', name: `Weapon ${quality.ranks || 1}`, description: 'Weapon attack' })
    }
    if (quality.id === 'armor-piercing') {
      tags.push({ id: 'armor-piercing', name: `Armor Piercing ${quality.ranks || 1}`, description: 'Ignores armor' })
    }
    if (quality.id === 'charge-attack') {
      tags.push({ id: 'charge-attack', name: 'Charge Attack', description: 'Move and attack' })
    }
    if (quality.id === 'signature-move') {
      tags.push({ id: 'signature-move', name: 'Signature Move', description: 'Powerful attack with cooldown' })
    }
    if (quality.id === 'certain-strike') {
      tags.push({ id: 'certain-strike', name: 'Certain Strike', description: 'Reroll accuracy' })
    }
    if (quality.id === 'area-attack') {
      // Add all area attack types
      tags.push({ id: 'area-blast', name: 'Area Attack: Blast', description: 'Explosion at target' })
      tags.push({ id: 'area-burst', name: 'Area Attack: Burst', description: 'Area around self' })
      tags.push({ id: 'area-cone', name: 'Area Attack: Cone', description: 'Cone shape' })
      tags.push({ id: 'area-line', name: 'Area Attack: Line', description: 'Line from self' })
      tags.push({ id: 'area-pass', name: 'Area Attack: Pass', description: 'Line through targets' })
      tags.push({ id: 'area-close-blast', name: 'Area Attack: Close Blast', description: 'Adjacent explosion' })
    }
    // Attack effects
    if (quality.id.startsWith('effect-')) {
      const effectName = quality.name
      tags.push({ id: quality.id, name: effectName, description: quality.description })
    }
  }

  return tags
})

// Get available effect tags based on owned qualities (3.09 Attack Effects)
const availableEffectTags = computed(() => {
  return form.qualities
    .filter((q) => q.id.startsWith('effect-'))
    .map((q) => ({ id: q.id.replace('effect-', ''), name: q.name }))
})

function addTagToAttack(tagName: string) {
  if (!newAttack.tags.includes(tagName)) {
    newAttack.tags = [...newAttack.tags, tagName]
  }
}

function removeTagFromAttack(tagName: string) {
  newAttack.tags = newAttack.tags.filter((t) => t !== tagName)
}

function addCustomAttack() {
  if (!newAttack.name) return
  form.attacks = [
    ...form.attacks,
    {
      id: `attack-${Date.now()}`,
      name: newAttack.name,
      range: newAttack.range,
      type: newAttack.type,
      tags: [...newAttack.tags],
      effect: newAttack.effect || undefined,
      description: newAttack.description,
    },
  ]
  // Reset form
  newAttack.name = ''
  newAttack.range = 'melee'
  newAttack.type = 'damage'
  newAttack.tags = []
  newAttack.effect = ''
  newAttack.description = ''
  showCustomAttackForm.value = false
}

function removeAttack(index: number) {
  form.attacks = form.attacks.filter((_, i) => i !== index)
}

type Quality = Digimon['qualities'][0]

function handleAddQuality(quality: Quality) {
  form.qualities = [...form.qualities, quality]
}

function removeQuality(index: number) {
  form.qualities = form.qualities.filter((_, i) => i !== index)
}

// Old free-form tag functions removed - now using quality-based tags

// Sprite preview
const spriteError = ref(false)
function handleSpriteError() {
  spriteError.value = true
}
watch(() => form.spriteUrl, () => {
  spriteError.value = false
})

onMounted(async () => {
  await fetchTamers()
  const id = route.params.id as string
  const fetched = await fetchDigimonById(id)
  if (fetched) {
    digimon.value = fetched
    form.name = fetched.name
    form.species = fetched.species
    form.stage = fetched.stage as DigimonStage
    form.attribute = fetched.attribute
    form.family = fetched.family
    form.type = fetched.type
    Object.assign(form.baseStats, fetched.baseStats)
    form.attacks = [...(fetched.attacks || [])]
    form.qualities = [...(fetched.qualities || [])]
    form.dataOptimization = fetched.dataOptimization || ''
    form.partnerId = fetched.partnerId
    form.isEnemy = fetched.isEnemy
    form.notes = fetched.notes || ''
    form.spriteUrl = fetched.spriteUrl || ''
  }
  initialLoading.value = false
})

async function handleSubmit() {
  if (!digimon.value) return
  const updated = await updateDigimon(digimon.value.id, {
    name: form.name,
    species: form.species,
    stage: form.stage,
    attribute: form.attribute,
    family: form.family,
    type: form.type,
    baseStats: { ...form.baseStats },
    attacks: [...form.attacks],
    qualities: [...form.qualities],
    dataOptimization: form.dataOptimization || undefined,
    partnerId: form.partnerId || undefined,
    isEnemy: form.isEnemy,
    notes: form.notes || undefined,
    spriteUrl: form.spriteUrl || undefined,
  })
  if (updated) {
    router.push('/library/digimon')
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="mb-8">
      <NuxtLink to="/library/digimon" class="text-digimon-dark-400 hover:text-white text-sm mb-2 inline-block">
        &larr; Back to Digimon
      </NuxtLink>
      <h1 class="font-display text-3xl font-bold text-white">Edit Digimon</h1>
    </div>

    <div v-if="initialLoading" class="text-center py-12">
      <div class="text-digimon-dark-400">Loading digimon...</div>
    </div>

    <div v-else-if="!digimon" class="text-center py-12">
      <div class="text-6xl mb-4">❌</div>
      <h2 class="text-xl font-semibold text-white mb-2">Digimon Not Found</h2>
      <NuxtLink
        to="/library/digimon"
        class="text-digimon-orange-400 hover:text-digimon-orange-300"
      >
        Return to Digimon list
      </NuxtLink>
    </div>

    <form v-else class="space-y-8" @submit.prevent="handleSubmit">
      <!-- Basic Info -->
      <div class="bg-digimon-dark-800 rounded-xl p-6 border border-digimon-dark-700">
        <h2 class="font-display text-xl font-semibold text-white mb-4">Basic Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-digimon-dark-400 mb-1">Name</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded-lg px-3 py-2
                     text-white focus:border-digimon-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-sm text-digimon-dark-400 mb-1">Species</label>
            <input
              v-model="form.species"
              type="text"
              required
              class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded-lg px-3 py-2
                     text-white focus:border-digimon-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-sm text-digimon-dark-400 mb-1">Stage</label>
            <select
              v-model="form.stage"
              class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded-lg px-3 py-2
                     text-white focus:border-digimon-orange-500 focus:outline-none capitalize"
            >
              <option v-for="stage in stages" :key="stage" :value="stage" class="capitalize">
                {{ stage }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-digimon-dark-400 mb-1">Attribute</label>
            <select
              v-model="form.attribute"
              class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded-lg px-3 py-2
                     text-white focus:border-digimon-orange-500 focus:outline-none capitalize"
            >
              <option v-for="attr in attributes" :key="attr" :value="attr" class="capitalize">
                {{ attr }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-digimon-dark-400 mb-1">Family</label>
            <input
              v-model="form.family"
              type="text"
              class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded-lg px-3 py-2
                     text-white focus:border-digimon-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-sm text-digimon-dark-400 mb-1">Type</label>
            <input
              v-model="form.type"
              type="text"
              class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded-lg px-3 py-2
                     text-white focus:border-digimon-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label class="block text-sm text-digimon-dark-400 mb-1">Partner Tamer (Optional)</label>
            <select
              v-model="form.partnerId"
              class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded-lg px-3 py-2
                     text-white focus:border-digimon-orange-500 focus:outline-none"
            >
              <option :value="null">No Partner (Wild/Enemy)</option>
              <option v-for="tamer in tamers" :key="tamer.id" :value="tamer.id">
                {{ tamer.name }}
              </option>
            </select>
          </div>
          <div class="flex items-end">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.isEnemy"
                type="checkbox"
                class="w-5 h-5 bg-digimon-dark-700 border border-digimon-dark-600 rounded
                       text-digimon-orange-500 focus:ring-digimon-orange-500"
              />
              <span class="text-white">This is an enemy Digimon</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Stage Info -->
      <div class="bg-digimon-dark-700/50 rounded-xl p-4 border border-digimon-dark-600">
        <h3 class="font-semibold text-digimon-orange-400 mb-2 capitalize">{{ form.stage }} Stage Stats</h3>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <span class="text-digimon-dark-400">DP:</span>
            <span class="text-white ml-1">{{ currentStageConfig.dp }}</span>
          </div>
          <div>
            <span class="text-digimon-dark-400">Movement:</span>
            <span class="text-white ml-1">{{ currentStageConfig.movement }}</span>
          </div>
          <div>
            <span class="text-digimon-dark-400">Wound Bonus:</span>
            <span class="text-white ml-1">+{{ currentStageConfig.woundBonus }}</span>
          </div>
          <div>
            <span class="text-digimon-dark-400">BIT:</span>
            <span class="text-white ml-1">{{ currentStageConfig.brains }}</span>
          </div>
          <div>
            <span class="text-digimon-dark-400">Attacks:</span>
            <span class="text-white ml-1">{{ currentStageConfig.attacks }}</span>
          </div>
        </div>
      </div>

      <!-- Base Stats -->
      <div class="bg-digimon-dark-800 rounded-xl p-6 border border-digimon-dark-700">
        <div class="flex justify-between items-center mb-4">
          <h2 class="font-display text-xl font-semibold text-white">Base Stats</h2>
          <div class="flex flex-col items-end gap-1">
            <span
              :class="[
                'text-sm px-3 py-1 rounded',
                dpRemaining === 0 && 'bg-green-900/30 text-green-400',
                dpRemaining > 0 && 'bg-yellow-900/30 text-yellow-400',
                dpRemaining < 0 && 'bg-red-900/30 text-red-400',
              ]"
            >
              {{ dpRemaining }} DP remaining
            </span>
            <span class="text-xs text-digimon-dark-400">
              Stats: {{ dpUsedOnStats }} | Qualities: {{ dpUsedOnQualities }} | Total: {{ dpUsed }} / {{ currentStageConfig.dp }}
            </span>
          </div>
        </div>
        <div class="grid grid-cols-5 gap-4">
          <div class="text-center">
            <label class="block text-sm text-digimon-dark-400 mb-2">Accuracy</label>
            <input
              v-model.number="form.baseStats.accuracy"
              type="number"
              min="1"
              class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded-lg px-2 py-2
                     text-white text-center focus:border-digimon-orange-500 focus:outline-none"
            />
          </div>
          <div class="text-center">
            <label class="block text-sm text-digimon-dark-400 mb-2">Damage</label>
            <input
              v-model.number="form.baseStats.damage"
              type="number"
              min="1"
              class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded-lg px-2 py-2
                     text-white text-center focus:border-digimon-orange-500 focus:outline-none"
            />
          </div>
          <div class="text-center">
            <label class="block text-sm text-digimon-dark-400 mb-2">Dodge</label>
            <input
              v-model.number="form.baseStats.dodge"
              type="number"
              min="1"
              class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded-lg px-2 py-2
                     text-white text-center focus:border-digimon-orange-500 focus:outline-none"
            />
          </div>
          <div class="text-center">
            <label class="block text-sm text-digimon-dark-400 mb-2">Armor</label>
            <input
              v-model.number="form.baseStats.armor"
              type="number"
              min="1"
              class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded-lg px-2 py-2
                     text-white text-center focus:border-digimon-orange-500 focus:outline-none"
            />
          </div>
          <div class="text-center">
            <label class="block text-sm text-digimon-dark-400 mb-2">Health</label>
            <input
              v-model.number="form.baseStats.health"
              type="number"
              min="1"
              class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded-lg px-2 py-2
                     text-white text-center focus:border-digimon-orange-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <!-- Attacks -->
      <div class="bg-digimon-dark-800 rounded-xl p-6 border border-digimon-dark-700">
        <h2 class="font-display text-xl font-semibold text-white mb-4">
          Attacks ({{ form.attacks.length }} / {{ currentStageConfig.attacks }})
        </h2>

        <!-- Attack Selector from Database -->
        <AttackSelector
          :stage="form.stage"
          :max-attacks="currentStageConfig.attacks"
          :current-attacks="form.attacks"
          @add="handleAddAttack"
          @remove="removeAttack"
        />

        <!-- Custom attack toggle -->
        <div v-if="form.attacks.length < currentStageConfig.attacks" class="mt-4">
          <button
            v-if="!showCustomAttackForm"
            type="button"
            class="text-sm text-digimon-dark-400 hover:text-digimon-orange-400 transition-colors"
            @click="showCustomAttackForm = true"
          >
            + Create Custom Attack (not in database)
          </button>

          <!-- Custom attack form -->
          <div v-else class="border border-digimon-dark-600 rounded-lg p-4 bg-digimon-dark-750">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-semibold text-digimon-dark-300">Create Custom Attack</h3>
              <button
                type="button"
                class="text-digimon-dark-400 hover:text-white text-sm"
                @click="showCustomAttackForm = false"
              >
                Cancel
              </button>
            </div>
            <!-- Name -->
            <div>
              <label class="text-xs text-digimon-dark-400">Attack Name</label>
              <input
                v-model="newAttack.name"
                type="text"
                placeholder="Attack name"
                class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded px-3 py-2
                       text-white text-sm focus:border-digimon-orange-500 focus:outline-none mt-1"
              />
            </div>

            <!-- Range and Type (DDA 1.4 core tags) -->
            <div class="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label class="text-xs text-digimon-dark-400">[Range]</label>
                <select
                  v-model="newAttack.range"
                  class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded px-3 py-2
                         text-white text-sm focus:border-digimon-orange-500 focus:outline-none mt-1"
                >
                  <option value="melee">[Melee]</option>
                  <option value="ranged">[Ranged]</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-digimon-dark-400">[Type]</label>
                <select
                  v-model="newAttack.type"
                  class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded px-3 py-2
                         text-white text-sm focus:border-digimon-orange-500 focus:outline-none mt-1"
                >
                  <option value="damage">[Damage]</option>
                  <option value="support">[Support]</option>
                </select>
              </div>
            </div>

            <!-- Quality-based Tags -->
            <div class="mt-3">
              <label class="text-xs text-digimon-dark-400">Tags (from owned qualities)</label>
              <div v-if="availableAttackTags.length === 0" class="text-xs text-digimon-dark-500 mt-1">
                No attack-modifying qualities owned. Add qualities like Weapon, Armor Piercing, Area Attack, etc.
              </div>
              <div v-else class="flex flex-wrap gap-2 mt-1">
                <button
                  v-for="tag in availableAttackTags"
                  :key="tag.id"
                  type="button"
                  :class="[
                    'text-xs px-2 py-1 rounded transition-colors',
                    newAttack.tags.includes(tag.name)
                      ? 'bg-digimon-orange-500 text-white'
                      : 'bg-digimon-dark-600 text-digimon-dark-300 hover:bg-digimon-dark-500'
                  ]"
                  :title="tag.description"
                  @click="newAttack.tags.includes(tag.name) ? removeTagFromAttack(tag.name) : addTagToAttack(tag.name)"
                >
                  {{ tag.name }}
                </button>
              </div>
              <div v-if="newAttack.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
                <span class="text-xs text-digimon-dark-400">Selected:</span>
                <span
                  v-for="tag in newAttack.tags"
                  :key="tag"
                  class="text-xs bg-digimon-orange-500/20 text-digimon-orange-400 px-2 py-0.5 rounded flex items-center gap-1"
                >
                  {{ tag }}
                  <button type="button" class="text-red-400 hover:text-red-300" @click="removeTagFromAttack(tag)">&times;</button>
                </span>
              </div>
            </div>

            <!-- Effect (from effect qualities) -->
            <div class="mt-3">
              <label class="text-xs text-digimon-dark-400">Effect (optional)</label>
              <select
                v-model="newAttack.effect"
                class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded px-3 py-2
                       text-white text-sm focus:border-digimon-orange-500 focus:outline-none mt-1"
              >
                <option value="">No effect</option>
                <option v-for="effect in availableEffectTags" :key="effect.id" :value="effect.name">
                  {{ effect.name }}
                </option>
              </select>
              <p v-if="availableEffectTags.length === 0" class="text-xs text-digimon-dark-500 mt-1">
                Add effect qualities (Poison, Paralysis, etc.) to enable attack effects.
              </p>
            </div>

            <!-- Description -->
            <div class="mt-3">
              <label class="text-xs text-digimon-dark-400">Description (flavor text)</label>
              <textarea
                v-model="newAttack.description"
                rows="2"
                placeholder="Describe the attack's appearance and style..."
                class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded px-3 py-2
                       text-white text-sm focus:border-digimon-orange-500 focus:outline-none resize-none mt-1"
              />
            </div>
            <button
              type="button"
              class="mt-3 bg-digimon-orange-500 hover:bg-digimon-orange-600 text-white px-4 py-2 rounded text-sm"
              @click="addCustomAttack"
            >
              Add Custom Attack
            </button>
          </div>
        </div>
      </div>

      <!-- Qualities -->
      <div class="bg-digimon-dark-800 rounded-xl p-6 border border-digimon-dark-700">
        <h2 class="font-display text-xl font-semibold text-white mb-4">Qualities</h2>
        <QualitySelector
          :stage="form.stage"
          :current-qualities="form.qualities"
          @add="handleAddQuality"
          @remove="removeQuality"
        />
      </div>

      <!-- Sprite -->
      <div class="bg-digimon-dark-800 rounded-xl p-6 border border-digimon-dark-700">
        <h2 class="font-display text-xl font-semibold text-white mb-4">Sprite / Image</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm text-digimon-dark-400 mb-1">Sprite URL</label>
            <input
              v-model="form.spriteUrl"
              type="url"
              placeholder="https://example.com/digimon-sprite.png"
              class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded-lg px-3 py-2
                     text-white focus:border-digimon-orange-500 focus:outline-none"
            />
            <p class="text-xs text-digimon-dark-500 mt-1">
              Enter a URL to a sprite or image. Common sources: Wikimon, DigimonWiki
            </p>
          </div>
          <div class="flex items-center justify-center">
            <div
              v-if="form.spriteUrl && !spriteError"
              class="w-32 h-32 bg-digimon-dark-700 rounded-lg overflow-hidden flex items-center justify-center"
            >
              <img
                :src="form.spriteUrl"
                :alt="form.name || 'Digimon sprite'"
                class="max-w-full max-h-full object-contain"
                @error="handleSpriteError"
              />
            </div>
            <div
              v-else
              class="w-32 h-32 bg-digimon-dark-700 rounded-lg flex items-center justify-center text-digimon-dark-500"
            >
              <span v-if="spriteError" class="text-red-400 text-xs text-center px-2">Failed to load image</span>
              <span v-else class="text-4xl">?</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="bg-digimon-dark-800 rounded-xl p-6 border border-digimon-dark-700">
        <h2 class="font-display text-xl font-semibold text-white mb-4">Notes</h2>
        <textarea
          v-model="form.notes"
          rows="4"
          placeholder="Evolution requirements, special abilities, personality..."
          class="w-full bg-digimon-dark-700 border border-digimon-dark-600 rounded-lg px-3 py-2
                 text-white focus:border-digimon-orange-500 focus:outline-none resize-none"
        />
      </div>

      <!-- Error message -->
      <div v-if="error" class="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
        {{ error }}
      </div>

      <!-- Submit -->
      <div class="flex gap-4">
        <button
          type="submit"
          :disabled="loading"
          class="bg-digimon-orange-500 hover:bg-digimon-orange-600 disabled:opacity-50
                 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          {{ loading ? 'Saving...' : 'Save Changes' }}
        </button>
        <NuxtLink
          to="/library/digimon"
          class="bg-digimon-dark-700 hover:bg-digimon-dark-600 text-white px-6 py-2 rounded-lg
                 font-semibold transition-colors"
        >
          Cancel
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
