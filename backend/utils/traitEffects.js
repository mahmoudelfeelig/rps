
module.exports = {
  
  forager:   { generate: () => ({ coins: 3 }) },
  naptime:   { generate: () => ({ coins: 2 }) },
  luminous:  { generate: () => ({ coins: 5 }) },
  celestial: { generate: () => ({ coins: 8, food: { random: 1 } }) },

  
  resourceful: {
    modifyGeneration: r => ({ ...r, coins: Math.floor(r.coins * 1.5) })
  },
  hoarder: {
    modifyGeneration: r => ({ ...r, coins: r.coins + 5 })
  },
  shinycoat: {
    modifyGeneration: r => ({ ...r, coins: Math.floor(r.coins * 1.2) })
  },
  glutton: {
    modifyGeneration: r => {
      const food = {};
      for (const [k,v] of Object.entries(r.food)) food[k] = v + 1;
      return { ...r, food };
    }
  },
  geothermal: {
    modifyGeneration: r => ({ ...r, coins: r.coins * 2 })
  },
  stormborn: {
    modifyGeneration: r => (Math.random() < 0.25 ? { ...r, coins: r.coins * 3 } : r)
  },

  
  cheerful: { modifyAffection: a => a + 2 },
  snuggly:  { modifyAffection: a => a + 3 },
  patient:  { modifyAffection: a => a + 5 },
  bold:     { modifyAffection: a => a + 4 },
  moonlight:{ modifyAffection: a => a * 2 },

  
  cunning:    { modifyMiniGameExp: e => Math.floor(e * 1.10) },
  mystic:     { modifyMiniGameExp: e => Math.floor(e * 1.15) },
  acrobat:    { modifyMiniGameExp: e => Math.floor(e * 1.20) },
  energetic:  { modifyMiniGameExp: e => Math.floor(e * 1.30) },
  precise:    { modifyMiniGameExp: e => Math.floor(e * 1.25) },
  quantumLeap:{ modifyMiniGameExp: e => Math.floor(e * 2.00) },

  
  splashy:      { doubleMiniGame: s => s * 2 },
  sprinter:     { doubleMiniGame: s => s * 2 },
  quickthinker: { doubleMiniGame: s => Math.floor(s * 1.3) },
  stalwart:     { doubleMiniGame: s => s + 1 },
  shadowmeld:   { doubleMiniGame: s => (Math.random()<0.10 ? s*4 : s) },

  
  prismatic:   {},
  voidwalker:  {},
  phoenixFlame:{}
};
