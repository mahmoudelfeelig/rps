require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose       = require('mongoose');
const CritterSpecies = require('../models/CritterSpecies');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await CritterSpecies.deleteMany({});
  console.log('🗑️  Cleared CritterSpecies');

  /* ─── 1. Constants & pools ─────────────────────────────── */
  const RARITIES = ['Common','Uncommon','Rare','Legendary','Mythical'];
  const COUNTS   = { Mythical:10, Legendary:20, Rare:50, Uncommon:60, Common:60 };

  /** full trait pools (no placeholders!) **/
  const TRAITS = {
    Mythical: [
      'luminous','energetic','acrobat','mystic','splashy','sprinter',
      'celestial','timewarp','shadowmeld','prismatic','voidwalker','phoenix-flame'
    ],
    Legendary: [
      'resourceful','hoarder','shinycoat','precise','cunning','glutton',
      'titanic','geothermal','aerokinesis','quantum-leap','stormborn','sunforged'
    ],
    Rare: [
      'forager','naptime','cheerful','snuggly','bold','patient',
      'sparkling','furtive','glacial','mystic-echo','keen-sense','swift'
    ],
    Uncommon: [
      'forager','naptime','cheerful','resourceful','glutton',
      'steady','braveheart','windwhisper','sunbeam','moonlight'
    ],
    Common: [
      'forager','naptime','cheerful','snuggly',
      'bouncy','playful','curious','sleepy'
    ]
  };

  const FOODS = [
    'berries','fish','leaf','seed','fruit','honey','plankton','embers','nuts','meat',
    'kelp','algae','mushrooms','flowers','grass','root','wheat','corn','beans','peas',
    'rice','oats','apples','carrots','nectar','sap','spice','yogurt','cheese','stew'
  ];
  const TOYS = [
    'ball','stick','ribbon','feather','mirror','water-ball','squeaky-ball','bouncing-pad','plushie',
    'puzzle-toy','rolling-wheel','rope','frisbee','laser-pointer','bell','drum','xylophone',
    'tunnel','slide','trampoline','soccer-ball','dart-board','lego-set','yo-yo','jenga','marbles'
  ];
  const RARE_ITEMS = ['dragonfruit','star-nectar','meteor-shard','relic-orb','phoenix-feather'];

  /* ─── 2. Helpers ────────────────────────────────────────── */
  const pick = (arr, n = 1) => {
    if (n === 1) {
      // just one value → return the value, not an array
      return arr[Math.floor(Math.random() * arr.length)];
    }
    // unique sample of length n
    const out = new Set();
    while (out.size < n) {
      out.add(arr[Math.floor(Math.random() * arr.length)]);
    }
    return [...out];
  };

  /** pick three traits from the pool → map {3:…,7:…,10:…} */
const makePassive = pool => {
  const [a, b, c] = pick(pool, 3);
  return { 3: a, 7: b, 10: c };
};

  const bump = r => RARITIES[Math.min(RARITIES.indexOf(r) + 1, RARITIES.length - 1)];

  /* ─── 3. Build species docs ────────────────────────────── */
  let seq = 1;
  const docs = [];

  for (const [rarity, qty] of Object.entries(COUNTS)) {
    for (let i = 0; i < qty; i++) {
      const baseName = `Spec-${String(seq++).padStart(4, '0')}`;
      const base = {
        species: baseName,
        description: `Standardised ${rarity} species.`,
        baseRarity: rarity,
        foodPreferences: pick(FOODS, 4),
        playPreferences: pick(TOYS, 4),
        cosmeticsAvailable: pick(TOYS, 3).map(t => `${t}-${baseName}`),
        passiveTraitsByLevel: makePassive(TRAITS[rarity]),
        evolution: {}
      };

      /* build 0‑3 evolutions */
      let parent = base;
      let currentRarity = rarity;
      const suffix = ['-X', '-Prime', '-Ω'];

      for (let stage = 0; stage < 3; stage++) {
        if (Math.random() > 0.5) break; // 50% chance to stop

        const childName = `${baseName}${suffix[stage]}`;
        currentRarity = bump(currentRarity);

        const child = {
          species: childName,
          description: `Evolution stage ${stage + 1} of ${baseName}.`,
          baseRarity: currentRarity,
          foodPreferences: pick(FOODS, 4),
          playPreferences: pick(TOYS, 4),
          cosmeticsAvailable: pick(TOYS, 3).map(t => `${t}-${childName}`),
          passiveTraitsByLevel: makePassive(TRAITS[currentRarity]),
          evolution: {}
        };

        parent.evolution = {
          nextSpecies: childName,
          levelReq: 20 + stage * 10, // 20, 30, 40
          itemReq: stage === 2 ? pick(RARE_ITEMS) : pick([...FOODS, ...TOYS])
        };

        docs.push(parent);
        parent = child;
      }
      docs.push(parent); // last node
    }
  }

  /* ─── 4. Insert & done ─────────────────────────────────── */
  await CritterSpecies.insertMany(docs);
  console.log(`✅ Seeded ${docs.length} species`);
  await mongoose.disconnect();
})();
