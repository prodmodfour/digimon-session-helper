// Environmental hazard templates for encounters
// GMs can select from these or create custom hazards

export interface HazardTemplate {
  id: string
  name: string
  description: string
  effect: string
  affectedArea: string
  duration: number | null // null = permanent until removed
  category: 'terrain' | 'weather' | 'digital' | 'trap' | 'other'
  severity: 'minor' | 'moderate' | 'severe'
}

export const HAZARD_DATABASE: HazardTemplate[] = [
  // === TERRAIN HAZARDS ===
  {
    id: 'lava-pool',
    name: 'Lava Pool',
    description: 'A pool of molten lava that burns anything that touches it.',
    effect: 'Any creature that enters or starts turn in this area takes 3 damage (ignores armor).',
    affectedArea: '10ft radius',
    duration: null,
    category: 'terrain',
    severity: 'severe',
  },
  {
    id: 'spike-pit',
    name: 'Spike Pit',
    description: 'A concealed pit filled with sharp spikes.',
    effect: 'Creature falling in takes 2 damage and is restrained until they use a complex action to escape.',
    affectedArea: '5ft square',
    duration: null,
    category: 'terrain',
    severity: 'moderate',
  },
  {
    id: 'quicksand',
    name: 'Quicksand',
    description: 'Treacherous sand that pulls creatures down.',
    effect: 'Movement through this area costs double. Ending turn here requires Agility check or become restrained.',
    affectedArea: '15ft radius',
    duration: null,
    category: 'terrain',
    severity: 'moderate',
  },
  {
    id: 'ice-floor',
    name: 'Icy Surface',
    description: 'A slippery frozen surface.',
    effect: 'Movement through this area requires Agility check or fall prone. Running causes automatic fall.',
    affectedArea: 'Varies',
    duration: null,
    category: 'terrain',
    severity: 'minor',
  },
  {
    id: 'difficult-terrain',
    name: 'Difficult Terrain',
    description: 'Rough, uneven ground that slows movement.',
    effect: 'Movement through this area costs double.',
    affectedArea: 'Varies',
    duration: null,
    category: 'terrain',
    severity: 'minor',
  },
  {
    id: 'cliff-edge',
    name: 'Cliff Edge',
    description: 'A dangerous drop-off.',
    effect: 'Creatures pushed over edge take fall damage based on height. Flying creatures unaffected.',
    affectedArea: 'Edge',
    duration: null,
    category: 'terrain',
    severity: 'severe',
  },

  // === WEATHER HAZARDS ===
  {
    id: 'sandstorm',
    name: 'Sandstorm',
    description: 'A violent storm of swirling sand.',
    effect: 'All ranged attacks have -2 accuracy. Visibility reduced to short range.',
    affectedArea: 'Entire battlefield',
    duration: 5,
    category: 'weather',
    severity: 'moderate',
  },
  {
    id: 'heavy-rain',
    name: 'Heavy Rain',
    description: 'Torrential downpour that obscures vision.',
    effect: 'Fire attacks deal -2 damage. Visibility reduced. Ground becomes slippery.',
    affectedArea: 'Entire battlefield',
    duration: null,
    category: 'weather',
    severity: 'minor',
  },
  {
    id: 'blizzard',
    name: 'Blizzard',
    description: 'A fierce snowstorm with biting cold.',
    effect: 'Non-ice Digimon take 1 damage at start of turn. Ice Digimon gain +1 to all stats.',
    affectedArea: 'Entire battlefield',
    duration: 4,
    category: 'weather',
    severity: 'severe',
  },
  {
    id: 'intense-heat',
    name: 'Intense Heat',
    description: 'Sweltering temperatures that drain energy.',
    effect: 'Non-fire Digimon lose 1 simple action per turn. Fire Digimon gain +1 damage.',
    affectedArea: 'Entire battlefield',
    duration: null,
    category: 'weather',
    severity: 'moderate',
  },
  {
    id: 'lightning-storm',
    name: 'Lightning Storm',
    description: 'Electrical storm with frequent lightning strikes.',
    effect: 'At end of each round, roll d6. On 1-2, random participant takes 2 electric damage.',
    affectedArea: 'Entire battlefield',
    duration: 3,
    category: 'weather',
    severity: 'moderate',
  },

  // === DIGITAL HAZARDS ===
  {
    id: 'data-corruption',
    name: 'Data Corruption Zone',
    description: 'An area where digital data is unstable.',
    effect: 'Digimon in this area cannot use complex attacks. Healing effects are halved.',
    affectedArea: '20ft radius',
    duration: null,
    category: 'digital',
    severity: 'moderate',
  },
  {
    id: 'virus-field',
    name: 'Virus Field',
    description: 'A corrupted area that empowers virus-type Digimon.',
    effect: 'Virus Digimon gain +2 to damage. Vaccine Digimon take -2 to damage.',
    affectedArea: 'Varies',
    duration: null,
    category: 'digital',
    severity: 'moderate',
  },
  {
    id: 'data-stream',
    name: 'Data Stream',
    description: 'A flowing stream of raw digital data.',
    effect: 'Creatures in stream are pushed 10ft in stream direction. Can ride stream for +20ft movement.',
    affectedArea: 'Linear path',
    duration: null,
    category: 'digital',
    severity: 'minor',
  },
  {
    id: 'firewall',
    name: 'Firewall',
    description: 'A defensive barrier of digital fire.',
    effect: 'Blocks all ranged attacks that pass through. Entering deals 2 fire damage.',
    affectedArea: 'Wall',
    duration: 3,
    category: 'digital',
    severity: 'moderate',
  },
  {
    id: 'null-zone',
    name: 'Null Zone',
    description: 'An area where digital abilities are suppressed.',
    effect: 'All attack modifiers are negated (set to 0). Qualities and special effects don\'t work.',
    affectedArea: '15ft radius',
    duration: 2,
    category: 'digital',
    severity: 'severe',
  },
  {
    id: 'evolution-accelerator',
    name: 'Evolution Accelerator',
    description: 'A zone of concentrated evolution energy.',
    effect: 'Digimon that spend a full round here can temporarily evolve one stage (lasts 3 rounds).',
    affectedArea: '10ft radius',
    duration: null,
    category: 'digital',
    severity: 'moderate',
  },

  // === TRAP HAZARDS ===
  {
    id: 'net-trap',
    name: 'Net Trap',
    description: 'A hidden net that springs up to ensnare victims.',
    effect: 'First creature to enter becomes restrained. Body check (TN 12) to escape.',
    affectedArea: '5ft square',
    duration: 1,
    category: 'trap',
    severity: 'minor',
  },
  {
    id: 'poison-dart',
    name: 'Poison Dart Trap',
    description: 'Concealed launchers that fire poisoned darts.',
    effect: 'When triggered, all in area take 1 damage and are poisoned (1 damage/round for 3 rounds).',
    affectedArea: '10ft cone',
    duration: 1,
    category: 'trap',
    severity: 'moderate',
  },
  {
    id: 'explosive-rune',
    name: 'Explosive Rune',
    description: 'A magical symbol that explodes when approached.',
    effect: 'First creature within 5ft triggers explosion: 3 damage to all within 10ft.',
    affectedArea: '10ft radius on trigger',
    duration: 1,
    category: 'trap',
    severity: 'severe',
  },
  {
    id: 'alarm',
    name: 'Alarm Trap',
    description: 'A concealed sensor that alerts enemies.',
    effect: 'When triggered, all enemies in encounter are alerted. Surprise is lost.',
    affectedArea: '5ft square',
    duration: 1,
    category: 'trap',
    severity: 'minor',
  },

  // === OTHER HAZARDS ===
  {
    id: 'darkness',
    name: 'Magical Darkness',
    description: 'An area of impenetrable darkness.',
    effect: 'All attacks in or through this area have -3 accuracy. Only creatures with special senses can see.',
    affectedArea: '20ft radius',
    duration: 4,
    category: 'other',
    severity: 'moderate',
  },
  {
    id: 'anti-gravity',
    name: 'Anti-Gravity Zone',
    description: 'An area where gravity is reversed or negated.',
    effect: 'Non-flying creatures float. Melee attacks have -2 accuracy. Can move vertically.',
    affectedArea: '30ft cube',
    duration: 3,
    category: 'other',
    severity: 'moderate',
  },
  {
    id: 'healing-spring',
    name: 'Healing Spring',
    description: 'A spring of restorative water.',
    effect: 'Creature that spends simple action here heals 1 wound. Once per creature per encounter.',
    affectedArea: '5ft radius',
    duration: null,
    category: 'other',
    severity: 'minor',
  },
  {
    id: 'berserk-aura',
    name: 'Berserk Aura',
    description: 'An energy field that induces rage.',
    effect: 'Creatures in aura have +2 damage but -2 dodge. Must attack nearest target.',
    affectedArea: '15ft radius',
    duration: null,
    category: 'other',
    severity: 'moderate',
  },
]

// Get hazards by category
export function getHazardsByCategory(category: HazardTemplate['category']): HazardTemplate[] {
  return HAZARD_DATABASE.filter((h) => h.category === category)
}

// Get hazards by severity
export function getHazardsBySeverity(severity: HazardTemplate['severity']): HazardTemplate[] {
  return HAZARD_DATABASE.filter((h) => h.severity === severity)
}

// Search hazards
export function searchHazards(query: string): HazardTemplate[] {
  const lower = query.toLowerCase()
  return HAZARD_DATABASE.filter(
    (h) =>
      h.name.toLowerCase().includes(lower) ||
      h.description.toLowerCase().includes(lower) ||
      h.effect.toLowerCase().includes(lower)
  )
}
