const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

const PetItem = require('../models/PetItem');
const CosmeticItem = require('../models/CosmeticItem');
const CritterSpecies = require('../models/CritterSpecies');
const { petPrices, cosmeticPrices } = require('../config/shopPrices');

mongoose.connect(process.env.MONGO_URI);

const adjectives = [
  'Fluffy', 'Brave', 'Cuddly', 'Tiny', 'Sneaky', 'Bouncy', 'Lazy',
  'Zappy', 'Wiggly', 'Snuggly', 'Frosty', 'Zany', 'Jumpy'
];

const nouns = [
  'Whiskers', 'Paws', 'Snout', 'Tail', 'Furball', 'Wiggle', 'Snore',
  'Blink', 'Sniff', 'Mittens', 'Zoomie', 'Boop', 'Bark'
];

function generateUniqueSpeciesNames(count) {
  const names = new Set();
  while (names.size < count) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    names.add(`${adj}${noun}`);
  }
  return [...names];
}

const foods = [
  { _id: 'basic-chow', name: 'Basic Chow', type: 'food', price: 50 },
  { _id: 'fish-snack', name: 'Fish Snack', type: 'food', price: 120 },
  { _id: 'deluxe-dish', name: 'Deluxe Dish', type: 'food', price: 300 },
  { _id: 'berry-blast', name: 'Berry Blast', type: 'food', price: 180 },
  { _id: 'sweet-roll', name: 'Sweet Roll', type: 'food', price: 250 },
  { _id: 'veggie-platter', name: 'Veggie Platter', type: 'food', price: 200 },
];

const toys = [
  { _id: 'squeaky-toy', name: 'Squeaky Toy', type: 'toy', price: 70 },
  { _id: 'yarn-ball', name: 'Yarn Ball', type: 'toy', price: 150 },
  { _id: 'laser-pointer', name: 'Laser Pointer', type: 'toy', price: 250 },
  { _id: 'chew-rope', name: 'Chew Rope', type: 'toy', price: 100 },
  { _id: 'glow-ball', name: 'Glow Ball', type: 'toy', price: 220 },
];

const cosmetics = [
  {
    _id: 'wizard-hat', name: 'Wizard Hat', slot: 'hat',
    rarity: 'Rare', unlockMethod: 'shop', availableTo: [], price: cosmeticPrices['Rare']
  },
  {
    _id: 'pearl-necklace', name: 'Pearl Necklace', slot: 'accessory',
    rarity: 'Uncommon', unlockMethod: 'shop', availableTo: [], price: cosmeticPrices['Uncommon']
  },
  {
    _id: 'fin-tail', name: 'Fin Tail', slot: 'tail',
    rarity: 'Epic', unlockMethod: 'shop', availableTo: [], price: cosmeticPrices['Epic']
  }
];

const shardBundles = [
  { _id: 'shard-bundle-hourly', name: 'x10 Shards (Hourly)', type: 'shard', price: 1000, currency: 'petCoins' },
  { _id: 'shard-bundle-daily',  name: 'x20 Shards (Daily)',  type: 'shard', price: 1800, currency: 'petCoins' },
  { _id: 'shard-bundle-weekly', name: 'x50 Shards (Weekly)', type: 'shard', price: 4000, currency: 'petCoins' }
];

const rarities = ['Common', 'Uncommon', 'Rare', 'Legendary', 'Mythical'];

const speciesNames = generateUniqueSpeciesNames(rarities.length * 5);

const pets = rarities.flatMap((rarity, i) =>
  Array.from({ length: 5 }, (_, j) => {
    const species = speciesNames[i * 5 + j];
    return {
      species,
      name: species,
      baseRarity: rarity,
      description: `A ${rarity.toLowerCase()} critter.`,
      foodPreferences: ['basic-chow'],
      playPreferences: ['squeaky-toy'],
      cosmeticsAvailable: [],
      evolutions: [],
      passiveTraitsByLevel: new Map()
    };
  })
);

async function seedShopData() {
  try {
    await Promise.all([
      PetItem.deleteMany({}),
      CosmeticItem.deleteMany({}),
      CritterSpecies.deleteMany({})
    ]);

    await Promise.all([
      PetItem.insertMany([...foods, ...toys, ...shardBundles]),
      CosmeticItem.insertMany(cosmetics),
      CritterSpecies.insertMany(pets)
    ]);

    console.log('✅ Shop data seeded.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    mongoose.disconnect();
  }
}

seedShopData();
