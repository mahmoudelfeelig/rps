const sharedTraits = {
  Common: {
    color: { slate: 35, amber: 25, moss: 20, cocoa: 20 },
    mood: { calm: 45, playful: 35, sleepy: 20 }
  },
  Uncommon: {
    color: { teal: 35, violet: 25, coral: 25, gold: 15 },
    pattern: { stripes: 30, spots: 30, mask: 20, gradient: 20 }
  },
  Rare: {
    aura: { spark: 30, mist: 25, glow: 25, frost: 20 },
    material: { crystal: 35, velvet: 30, obsidian: 20, pearl: 15 }
  },
  Legendary: {
    aura: { solar: 30, lunar: 25, storm: 25, ember: 20 },
    power: { flight: 30, blink: 25, echo: 25, guard: 20 }
  },
  Mythical: {
    aura: { cosmic: 30, divine: 25, void: 25, prismatic: 20 },
    power: { teleport: 30, heal: 25, eternity: 25, oracle: 20 }
  }
};

function traitsFor(...rarities) {
  return Object.fromEntries(rarities.map(rarity => [rarity, sharedTraits[rarity]]));
}

module.exports = {
  starter: {
    title: 'Starter Cache',
    cost: 250,
    odds: { Common: 0.92, Uncommon: 0.075, Rare: 0.005 },
    traitPools: traitsFor('Common', 'Uncommon', 'Rare')
  },
  budget: {
    title: 'Budget Banner',
    cost: 500,
    odds: { Common: 0.88, Uncommon: 0.10, Rare: 0.02 },
    traitPools: traitsFor('Common', 'Uncommon', 'Rare')
  },
  common: {
    title: 'Common Banner',
    cost: 1000,
    odds: { Common: 0.74, Uncommon: 0.20, Rare: 0.055, Legendary: 0.005 },
    traitPools: traitsFor('Common', 'Uncommon', 'Rare', 'Legendary')
  },
  daily: {
    title: 'Daily Spark',
    cost: 2500,
    odds: { Common: 0.60, Uncommon: 0.28, Rare: 0.105, Legendary: 0.015 },
    traitPools: traitsFor('Common', 'Uncommon', 'Rare', 'Legendary')
  },
  standard: {
    title: 'Standard Banner',
    cost: 10000,
    odds: { Common: 0.46, Uncommon: 0.32, Rare: 0.17, Legendary: 0.045, Mythical: 0.005 },
    traitPools: traitsFor('Common', 'Uncommon', 'Rare', 'Legendary', 'Mythical')
  },
  elemental: {
    title: 'Elemental Crate',
    cost: 18000,
    odds: { Uncommon: 0.48, Rare: 0.34, Legendary: 0.16, Mythical: 0.02 },
    traitPools: traitsFor('Uncommon', 'Rare', 'Legendary', 'Mythical')
  },
  rare: {
    title: 'Rare Banner',
    cost: 50000,
    odds: { Uncommon: 0.45, Rare: 0.38, Legendary: 0.15, Mythical: 0.02 },
    traitPools: traitsFor('Uncommon', 'Rare', 'Legendary', 'Mythical')
  },
  epic: {
    title: 'Epic Vault',
    cost: 100000,
    odds: { Rare: 0.52, Legendary: 0.38, Mythical: 0.10 },
    traitPools: traitsFor('Rare', 'Legendary', 'Mythical')
  },
  legendary: {
    title: 'Legendary Prism',
    cost: 750000,
    odds: { Legendary: 0.66, Mythical: 0.34 },
    traitPools: traitsFor('Legendary', 'Mythical')
  },
  mythic: {
    title: 'Mythic Eclipse',
    cost: 1250000,
    odds: { Legendary: 0.40, Mythical: 0.60 },
    traitPools: traitsFor('Legendary', 'Mythical')
  },
  premium: {
    title: 'Premium Crown',
    cost: 1750000,
    odds: { Legendary: 0.28, Mythical: 0.72 },
    traitPools: traitsFor('Legendary', 'Mythical')
  }
};
