require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose       = require('mongoose');
const CritterSpecies = require('../models/CritterSpecies');
const generatePetName = require('../utils/generatePetName');

(async () => {
  // 1) Connect & wipe
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true
  });
  await CritterSpecies.deleteMany({});

  // 2) Rarity counts & shuffle
  const counts = { Mythical: 5, Legendary: 10, Rare: 25, Uncommon: 30, Common: 30 };
  const rarities = Object.entries(counts)
    .flatMap(([r, c]) => Array(c).fill(r))
    .sort(() => Math.random() - 0.5);

  // 3) Trait pools by tier
  const mythicalTraits   = ['luminous','energetic','acrobat','mystic','splashy','sprinter'];
  const legendaryTraits  = ['resourceful','hoarder','shinycoat','precise','cunning','glutton'];
  const rareTraits       = ['forager','naptime','cheerful','snuggly','bold','patient'];
  const uncommonTraits   = ['forager','naptime','cheerful','resourceful','glutton'];
  const commonTraits     = ['forager','naptime','cheerful','snuggly'];

  // 4) Foods & toys pools
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

  // 5) Helper to pick N distinct at random
  function pick(arr, n) {
    const copy = [...arr];
    const out  = [];
    for (let i = 0; i < n && copy.length; i++) {
      const j = Math.floor(Math.random() * copy.length);
      out.push(copy.splice(j, 1)[0]);
    }
    return out;
  }

  // 6) Build each species doc
  const speciesData = rarities.map(baseRarity => {
    const name = generatePetName();

    // choose the right trait pool
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
      species:             name,
      description:         `Auto-generated ${name}, a ${baseRarity} species.`,
      baseRarity,
      foodPreferences:     pick(foods, 3),
      playPreferences:     pick(toys, 3),
      cosmeticsAvailable:  pick(toys, 2).map(t => `${t}-${name}`),
      evolutions:          [],    // leave blank or fill later
      passiveTraitsByLevel:{ 3: t3, 7: t7 }
    };
  });

  // 7) Insert & finish
  await CritterSpecies.insertMany(speciesData);
  console.log(`✅ Seeded ${speciesData.length} CritterSpecies`);
  await mongoose.disconnect();
  process.exit(0);
})();
