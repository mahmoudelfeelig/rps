// scripts/seedCritterSpecies.js
require('dotenv').config();
const mongoose        = require('mongoose');
const CritterSpecies  = require('../models/CritterSpecies');
const traitEffects    = require('../utils/traitEffects');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // 1. wipe old data
  await CritterSpecies.deleteMany({});

  // 2. define rarity counts
  const counts = {
    Mythical:   5,
    Legendary: 10,
    Rare:      25,
    Uncommon:  30,
    Common:    30
  };

  // 3. prepare a shuffled rarity list of length 100
  const rarities = Object.entries(counts)
    .flatMap(([r, c]) => Array(c).fill(r))
    .sort(() => Math.random() - 0.5);

  // 4. tiered trait pools
  const mythicalTraits   = ['luminous','energetic','acrobat','mystic','splashy','sprinter'];
  const legendaryTraits  = ['resourceful','hoarder','shinycoat','precise','cunning','glutton'];
  const rareTraits       = ['forager','naptime','cheerful','snuggly','bold','patient'];
  const uncommonTraits   = ['forager','naptime','cheerful','resourceful','glutton'];
  const commonTraits     = ['forager','naptime','cheerful','snuggly'];

  // 5. expanded foods & toys
  const foods = [
    'berries','fish','leaf','seed','fruit','honey','plankton','embers',
    'nuts','meat','kelp','algae','mushrooms','flowers','grass','root',
    'wheat','corn','beans','peas','rice','oats','apples','carrots'
  ];
  const toys = [
    'ball','stick','ribbon','feather','mirror','water-ball','squeaky-ball',
    'bouncing-pad','plushie','puzzle-toy','rolling-wheel','rope','frisbee',
    'laser-pointer','bell','drum','xylophone','tunnel','slide','trampoline'
  ];

  // helper: pick N distinct at random
  function pick(arr, n) {
    const copy = [...arr];
    const out = [];
    for (let i = 0; i < n && copy.length; i++) {
      const j = Math.floor(Math.random() * copy.length);
      out.push(copy.splice(j,1)[0]);
    }
    return out;
  }

  // 6. generate 100 species
  const speciesData = rarities.map((baseRarity, i) => {
    const idx  = i + 1;
    const name = `Critter${idx}`;

    // select passive traits by rarity
    let pool;
    switch (baseRarity) {
      case 'Mythical':  pool = mythicalTraits;  break;
      case 'Legendary': pool = legendaryTraits; break;
      case 'Rare':      pool = rareTraits;      break;
      case 'Uncommon':  pool = uncommonTraits;  break;
      default:          pool = commonTraits;    break;
    }
    const [t3, t7] = pick(pool, 2);

    return {
      species: name,
      description: `Auto-generated ${name}, a ${baseRarity} species.`,
      baseRarity,
      foodPreferences:   pick(foods, 3),
      playPreferences:   pick(toys, 3),
      cosmeticsAvailable: pick(toys, 2).map(t => `${t}-${idx}`),
      evolutions:        [`${name}Evolved`],
      passiveTraitsByLevel: { 3: t3, 7: t7 }
    };
  });

  // 7. insert and finish
  await CritterSpecies.insertMany(speciesData);
  console.log(`✅ Seeded ${speciesData.length} CritterSpecies`);
  process.exit(0);
})();
