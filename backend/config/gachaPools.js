/**
 * Each pool has:
 *  - cost: how many coins per pull
 *  - odds: weight distribution across rarities (must sum to 1)
 *  - traitPools: for each rarity, a map of trait→weights
 */
module.exports = {
  budget: {
    cost: 500,
    odds:  { Common: 0.95, Uncommon: 0.04, Rare: 0.01 },
    traitPools: {
      Common:   { color: { gray: 50, brown: 50 } },
      Uncommon: { color: { teal: 70, purple: 30 } },
      Rare:     { aura:  { sparkles: 60, glow: 40 } }
    }
  },

  common: {
    cost: 1_000,
    odds:  { Common: 0.80, Uncommon: 0.15, Rare: 0.05 },
    traitPools: {
      Common:   { size:    { small: 70, medium: 30 } },
      Uncommon: { pattern: { stripes: 50, spots: 50 } },
      Rare:     { aura:    { spark: 50, mist: 50 } }
    }
  },

  standard: {
    cost: 10_000,
    odds:  { Common: 0.50, Uncommon: 0.30, Rare: 0.15, Legendary: 0.05 },
    traitPools: {
      Common:    { color:    { red: 50, blue: 50 }, pattern: { spots: 70, stripes: 30 } },
      Uncommon:  { aura:     { smoke: 50, mist: 50 } },
      Rare:      { size:     { small: 70, large: 30 }, material: { stone: 80, crystal: 20 } },
      Legendary: { aura:     { fire: 40, ice: 60 }, power:    { flight: 50, invisibility: 50 } }
    }
  },

  rare: {
    cost: 50_000,
    odds:  { Uncommon: 0.60, Rare: 0.30, Legendary: 0.10 },
    traitPools: {
      Uncommon:  { speed:    { slow: 50, fast: 50 } },
      Rare:      { strength: { light: 50, heavy: 50 } },
      Legendary: { aura:     { lightning: 50, shadow: 50 } }
    }
  },

  epic: {
    cost: 100_000,
    odds:  { Rare: 0.50, Legendary: 0.40, Mythical: 0.10 },
    traitPools: {
      Rare:      { size:   { small: 60, medium: 40 } },
      Legendary: { aura:   { fire: 50, ice: 50 } },
      Mythical:  { power:  { teleport: 50, heal: 50 } }
    }
  },

  legendary: {
    cost: 750_000,
    odds:  { Legendary: 0.60, Mythical: 0.40 },
    traitPools: {
      Legendary: { crown: { gold: 70, silver: 30 } },
      Mythical:  { aura:  { cosmic: 50, divine: 50 } }
    }
  },

  premium: {
    cost: 1_000_000,
    odds:  { Legendary: 0.50, Mythical: 0.50 },
    traitPools: {
      Legendary: { aura: { royal: 50, ancient: 50 } },
      Mythical:  { power: { eternity: 50, omnipotence: 50 } }
    }
  }
};