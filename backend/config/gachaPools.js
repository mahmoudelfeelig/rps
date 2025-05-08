/**
 * Each pool has:
 *  - cost: how many coins per pull
 *  - odds: weight distribution across rarities (must sum to 1)
 */
module.exports = {
    budget: {
      cost: 500,
      odds:  { Common:   0.95, Uncommon: 0.04, Rare:      0.01 }
    },
    common: {
      cost: 1_000,
      odds:  { Common:   0.80, Uncommon: 0.15, Rare:      0.05 }
    },
    standard: {
      cost: 10_000,
      odds:  { Common:   0.50, Uncommon: 0.30, Rare:      0.15, Legendary: 0.05 }
    },
    rare: {
      cost: 50_000,
      odds:  { Uncommon: 0.60, Rare:      0.30, Legendary: 0.10 }
    },
    epic: {
      cost: 100_000,
      odds:  { Rare:      0.50, Legendary: 0.40, Mythical:  0.10 }
    },
    legendary: {
      cost: 750_000,
      odds:  { Legendary: 0.60, Mythical:  0.40 }
    },
    premium: {
      cost: 1_000_000,
      odds:  { Legendary: 0.50, Mythical:  0.50 }
    }
  };