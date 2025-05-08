// 20 well-named traits with distinct effects
module.exports = {
  // Passive coin generators
  forager: {
    generate: () => ({ coins: 3 })
  },
  naptime: {
    generate: () => ({ coins: 2 })
  },
  luminous: {
    generate: () => ({ coins: 5 })
  },

  // Boost overall generation
  resourceful: {
    modifyGeneration: res => ({
      coins: Math.floor(res.coins * 1.5),
      food:  res.food
    })
  },
  hoarder: {
    modifyGeneration: res => ({
      coins: res.coins + 5,
      food:  res.food
    })
  },
  shinycoat: {
    modifyGeneration: res => ({
      coins: Math.floor(res.coins * 1.2),
      food:  res.food
    })
  },
  glutton: {
    modifyGeneration: res => {
      // +1 of each food type
      const food = {};
      for (const [k,v] of Object.entries(res.food)) {
        food[k] = v + 1;
      }
      return { coins: res.coins, food };
    }
  },

  // Affection modifiers
  cheerful: {
    modifyAffection: aff => aff + 2
  },
  snuggly: {
    modifyAffection: aff => aff + 3
  },
  patient: {
    modifyAffection: aff => aff + 5
  },
  bold: {
    modifyAffection: aff => aff + 4
  },

  // Mini-game EXP modifiers
  cunning: {
    modifyMiniGameExp: exp => Math.floor(exp * 1.1)
  },
  mystic: {
    modifyMiniGameExp: exp => Math.floor(exp * 1.15)
  },
  acrobat: {
    modifyMiniGameExp: exp => Math.floor(exp * 1.2)
  },
  energetic: {
    modifyMiniGameExp: exp => Math.floor(exp * 1.3)
  },
  precise: {
    modifyMiniGameExp: exp => Math.floor(exp * 1.25)
  },

  // Mini-game score doublers
  splashy: {
    doubleMiniGame: s => s * 2
  },
  sprinter: {
    doubleMiniGame: s => s * 2
  },
  quickthinker: {
    doubleMiniGame: s => Math.floor(s * 1.3)
  },
  stalwart: {
    doubleMiniGame: s => s + 1
  }
};
