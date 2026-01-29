// Pre-built attack database for common Digimon attacks
// GMs can select from these when creating Digimon

export interface AttackTemplate {
  id: string
  name: string
  type: 'simple' | 'complex'
  range: 'melee' | 'short' | 'medium' | 'long'
  damageModifier: number
  accuracyModifier: number
  tags: string[]
  effect: string
  stage: 'any' | 'fresh' | 'in-training' | 'rookie' | 'champion' | 'ultimate' | 'mega'
}

export const ATTACK_DATABASE: AttackTemplate[] = [
  // === FRESH STAGE ===
  {
    id: 'bubble-blow',
    name: 'Bubble Blow',
    type: 'simple',
    range: 'short',
    damageModifier: -2,
    accuracyModifier: 0,
    tags: ['Ranged'],
    effect: 'Shoots harmless bubbles at the target.',
    stage: 'fresh',
  },

  // === IN-TRAINING STAGE ===
  {
    id: 'tackle',
    name: 'Tackle',
    type: 'simple',
    range: 'melee',
    damageModifier: 0,
    accuracyModifier: 0,
    tags: ['Physical'],
    effect: 'A basic charging attack.',
    stage: 'in-training',
  },
  {
    id: 'acid-bubbles',
    name: 'Acid Bubbles',
    type: 'simple',
    range: 'short',
    damageModifier: 0,
    accuracyModifier: 0,
    tags: ['Ranged', 'Acid'],
    effect: 'Shoots acidic bubbles that sting on contact.',
    stage: 'in-training',
  },

  // === ROOKIE STAGE ===
  {
    id: 'pepper-breath',
    name: 'Pepper Breath',
    type: 'simple',
    range: 'short',
    damageModifier: 1,
    accuracyModifier: 0,
    tags: ['Fire', 'Ranged'],
    effect: 'Spits a ball of flame at the enemy.',
    stage: 'rookie',
  },
  {
    id: 'blue-blaster',
    name: 'Blue Blaster',
    type: 'simple',
    range: 'medium',
    damageModifier: 1,
    accuracyModifier: 0,
    tags: ['Ice', 'Ranged'],
    effect: 'Fires a stream of blue flames.',
    stage: 'rookie',
  },
  {
    id: 'spiral-twister',
    name: 'Spiral Twister',
    type: 'simple',
    range: 'medium',
    damageModifier: 0,
    accuracyModifier: 1,
    tags: ['Wind', 'Ranged'],
    effect: 'Creates a spiral of green flames.',
    stage: 'rookie',
  },
  {
    id: 'super-thunder-strike',
    name: 'Super Thunder Strike',
    type: 'simple',
    range: 'short',
    damageModifier: 1,
    accuracyModifier: 0,
    tags: ['Electric', 'Ranged'],
    effect: 'Releases an electric shock.',
    stage: 'rookie',
  },
  {
    id: 'poison-ivy',
    name: 'Poison Ivy',
    type: 'simple',
    range: 'melee',
    damageModifier: 0,
    accuracyModifier: 0,
    tags: ['Plant', 'Poison'],
    effect: 'Attacks with poisonous vines. Target takes 1 damage at start of next turn.',
    stage: 'rookie',
  },
  {
    id: 'boom-bubble',
    name: 'Boom Bubble',
    type: 'simple',
    range: 'short',
    damageModifier: 0,
    accuracyModifier: 1,
    tags: ['Air', 'Ranged'],
    effect: 'Fires a compressed air bubble.',
    stage: 'rookie',
  },
  {
    id: 'lightning-paw',
    name: 'Lightning Paw',
    type: 'simple',
    range: 'melee',
    damageModifier: 1,
    accuracyModifier: 1,
    tags: ['Physical', 'Quick'],
    effect: 'A lightning-fast punch.',
    stage: 'rookie',
  },
  {
    id: 'marching-fishes',
    name: 'Marching Fishes',
    type: 'complex',
    range: 'medium',
    damageModifier: 2,
    accuracyModifier: -1,
    tags: ['Water', 'Ranged', 'Area'],
    effect: 'Summons a school of fish to attack. Can hit multiple targets.',
    stage: 'rookie',
  },

  // === CHAMPION STAGE ===
  {
    id: 'nova-blast',
    name: 'Nova Blast',
    type: 'complex',
    range: 'long',
    damageModifier: 3,
    accuracyModifier: 0,
    tags: ['Fire', 'Ranged'],
    effect: 'Fires a massive fireball.',
    stage: 'champion',
  },
  {
    id: 'howling-blaster',
    name: 'Howling Blaster',
    type: 'complex',
    range: 'long',
    damageModifier: 3,
    accuracyModifier: 0,
    tags: ['Ice', 'Ranged'],
    effect: 'Unleashes a powerful ice beam.',
    stage: 'champion',
  },
  {
    id: 'electro-shocker',
    name: 'Electro Shocker',
    type: 'complex',
    range: 'medium',
    damageModifier: 3,
    accuracyModifier: 0,
    tags: ['Electric', 'Ranged'],
    effect: 'Fires a ball of electricity.',
    stage: 'champion',
  },
  {
    id: 'hand-of-fate',
    name: 'Hand of Fate',
    type: 'complex',
    range: 'long',
    damageModifier: 4,
    accuracyModifier: -1,
    tags: ['Holy', 'Ranged'],
    effect: 'Fires a beam of holy energy.',
    stage: 'champion',
  },
  {
    id: 'meteor-wing',
    name: 'Meteor Wing',
    type: 'complex',
    range: 'long',
    damageModifier: 2,
    accuracyModifier: 1,
    tags: ['Fire', 'Ranged', 'Area'],
    effect: 'Rains down fireballs from above.',
    stage: 'champion',
  },
  {
    id: 'great-horn-attack',
    name: 'Great Horn Attack',
    type: 'complex',
    range: 'melee',
    damageModifier: 4,
    accuracyModifier: 0,
    tags: ['Physical'],
    effect: 'A powerful charging horn attack.',
    stage: 'champion',
  },
  {
    id: 'harpoon-torpedo',
    name: 'Harpoon Torpedo',
    type: 'simple',
    range: 'long',
    damageModifier: 2,
    accuracyModifier: 1,
    tags: ['Water', 'Ranged'],
    effect: 'Fires torpedo-like projectiles.',
    stage: 'champion',
  },
  {
    id: 'lightning-claw',
    name: 'Lightning Claw',
    type: 'simple',
    range: 'melee',
    damageModifier: 2,
    accuracyModifier: 1,
    tags: ['Physical', 'Quick'],
    effect: 'Rapid claw strikes.',
    stage: 'champion',
  },

  // === ULTIMATE STAGE ===
  {
    id: 'giga-blaster',
    name: 'Giga Blaster',
    type: 'complex',
    range: 'long',
    damageModifier: 5,
    accuracyModifier: 0,
    tags: ['Fire', 'Ranged', 'Explosive'],
    effect: 'Fires missiles from its chest.',
    stage: 'ultimate',
  },
  {
    id: 'metal-wolf-claw',
    name: 'Metal Wolf Claw',
    type: 'complex',
    range: 'melee',
    damageModifier: 5,
    accuracyModifier: 1,
    tags: ['Physical', 'Ice'],
    effect: 'Freezing claw attack.',
    stage: 'ultimate',
  },
  {
    id: 'gate-of-destiny',
    name: 'Gate of Destiny',
    type: 'complex',
    range: 'long',
    damageModifier: 6,
    accuracyModifier: -2,
    tags: ['Holy', 'Ranged', 'Special'],
    effect: 'Opens a portal that banishes enemies. Deals massive damage.',
    stage: 'ultimate',
  },
  {
    id: 'wing-blade',
    name: 'Wing Blade',
    type: 'complex',
    range: 'long',
    damageModifier: 4,
    accuracyModifier: 1,
    tags: ['Fire', 'Ranged'],
    effect: 'Fires flaming feathers like missiles.',
    stage: 'ultimate',
  },
  {
    id: 'vulcans-hammer',
    name: "Vulcan's Hammer",
    type: 'complex',
    range: 'melee',
    damageModifier: 6,
    accuracyModifier: -1,
    tags: ['Physical', 'Fire'],
    effect: 'A devastating hammer strike.',
    stage: 'ultimate',
  },
  {
    id: 'horn-buster',
    name: 'Horn Buster',
    type: 'complex',
    range: 'melee',
    damageModifier: 5,
    accuracyModifier: 0,
    tags: ['Physical', 'Electric'],
    effect: 'Charges with electrified horn.',
    stage: 'ultimate',
  },

  // === MEGA STAGE ===
  {
    id: 'terra-force',
    name: 'Terra Force',
    type: 'complex',
    range: 'long',
    damageModifier: 8,
    accuracyModifier: -1,
    tags: ['Fire', 'Ranged', 'Ultimate'],
    effect: 'Gathers energy from the planet to create a massive fireball.',
    stage: 'mega',
  },
  {
    id: 'metal-wolf-sniper',
    name: 'Metal Wolf Sniper',
    type: 'complex',
    range: 'long',
    damageModifier: 7,
    accuracyModifier: 2,
    tags: ['Ice', 'Ranged'],
    effect: 'Fires a precision ice beam from chest.',
    stage: 'mega',
  },
  {
    id: 'strike-of-the-seven-stars',
    name: 'Strike of the Seven Stars',
    type: 'complex',
    range: 'long',
    damageModifier: 9,
    accuracyModifier: -2,
    tags: ['Holy', 'Ranged', 'Ultimate'],
    effect: 'Creates seven orbs of holy energy that strike the enemy.',
    stage: 'mega',
  },
  {
    id: 'crimson-flame',
    name: 'Crimson Flame',
    type: 'complex',
    range: 'long',
    damageModifier: 7,
    accuracyModifier: 0,
    tags: ['Fire', 'Ranged', 'Area'],
    effect: 'Releases a wave of crimson flames.',
    stage: 'mega',
  },
  {
    id: 'giga-scissor-claw',
    name: 'Giga Scissor Claw',
    type: 'complex',
    range: 'melee',
    damageModifier: 8,
    accuracyModifier: 0,
    tags: ['Physical'],
    effect: 'Crushes the enemy with massive claws.',
    stage: 'mega',
  },
  {
    id: 'positron-laser',
    name: 'Positron Laser',
    type: 'complex',
    range: 'long',
    damageModifier: 7,
    accuracyModifier: 1,
    tags: ['Energy', 'Ranged'],
    effect: 'Fires a beam of positron energy.',
    stage: 'mega',
  },
  {
    id: 'omni-sword',
    name: 'Omni Sword',
    type: 'complex',
    range: 'melee',
    damageModifier: 10,
    accuracyModifier: -1,
    tags: ['Physical', 'Holy', 'Ultimate'],
    effect: 'A divine sword strike that can cut through anything.',
    stage: 'mega',
  },

  // === ANY STAGE (Universal attacks) ===
  {
    id: 'basic-attack',
    name: 'Basic Attack',
    type: 'simple',
    range: 'melee',
    damageModifier: 0,
    accuracyModifier: 0,
    tags: ['Physical'],
    effect: 'A standard physical attack.',
    stage: 'any',
  },
  {
    id: 'defend',
    name: 'Defend',
    type: 'simple',
    range: 'melee',
    damageModifier: 0,
    accuracyModifier: 0,
    tags: ['Defensive'],
    effect: 'Take a defensive stance. +2 Dodge until next turn.',
    stage: 'any',
  },
  {
    id: 'distracting-strike',
    name: 'Distracting Strike',
    type: 'simple',
    range: 'melee',
    damageModifier: -1,
    accuracyModifier: 1,
    tags: ['Physical', 'Tactical'],
    effect: 'A quick strike that distracts the enemy. Target has -1 to next attack.',
    stage: 'any',
  },
]

// Get attacks by stage (includes 'any' stage attacks)
export function getAttacksForStage(stage: string): AttackTemplate[] {
  return ATTACK_DATABASE.filter((a) => a.stage === stage || a.stage === 'any')
}

// Get all unique tags
export function getAllTags(): string[] {
  const tags = new Set<string>()
  ATTACK_DATABASE.forEach((a) => a.tags.forEach((t) => tags.add(t)))
  return Array.from(tags).sort()
}

// Search attacks
export function searchAttacks(query: string): AttackTemplate[] {
  const lower = query.toLowerCase()
  return ATTACK_DATABASE.filter(
    (a) =>
      a.name.toLowerCase().includes(lower) ||
      a.effect.toLowerCase().includes(lower) ||
      a.tags.some((t) => t.toLowerCase().includes(lower))
  )
}
