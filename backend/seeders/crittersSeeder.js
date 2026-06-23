require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose        = require('mongoose');
const User            = require('../models/User');
const Critter         = require('../models/Critter');
const CritterSpecies  = require('../models/CritterSpecies');
const generatePetName = require('../utils/generatePetName');

;(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true
  });

  await Critter.deleteMany({});
  console.log('🗑️  Cleared all Critter documents.');

  const users = await User.find();
  if (!users.length) {
    console.error('No users found to seed critters for.');
    process.exit(1);
  }

  const speciesList = await CritterSpecies.find();
  const byRarity = { Common:[], Uncommon:[], Rare:[], Legendary:[], Mythical:[] };
  for (const s of speciesList) {
    if (byRarity[s.baseRarity]) {
      byRarity[s.baseRarity].push(s);
    }
  }
  ['Common','Uncommon','Rare'].forEach(r => {
    if (!byRarity[r].length) {
      console.error(`No species of rarity ${r} found—run your species seeder!`);
      process.exit(1);
    }
  });

  const pickOne = arr => arr[Math.floor(Math.random()*arr.length)];

  const docs = [];
  for (const user of users) {
    for (const rarity of ['Common','Uncommon','Rare']) {
      const specDoc = pickOne(byRarity[rarity]);
      const variant = generatePetName();
      docs.push({
        ownerId:   user._id,
        species:   specDoc.species,
        variant,
        rarity:    specDoc.baseRarity,
        affection: 0,
        experience:0,
        level:     1,
        parents:   [],
        generation:1,
        lastBredAt:   null,
        breeding:     {},
        lastHatchedAt:null,
        evolvedTo:    null,
        traits:       {},  // no unlocked traits yet
        equippedCosmetics: {},
        adoptedAt:    new Date(),
        lastFedAt:    null,
        lastPlayedAt: null,
        isActive:     true
      });
    }
  }

  await Critter.insertMany(docs);
  console.log(`✅ Seeded ${docs.length} Critters (3 per user).`);

  await mongoose.disconnect();
  process.exit(0);
})();
