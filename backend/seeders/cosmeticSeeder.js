const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CosmeticItem = require('../models/CosmeticItem');

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const cosmetics = [
  {
    _id: 'wizard-hat',
    name: 'Wizard Hat',
    slot: 'hat',
    rarity: 'Uncommon',
    unlockMethod: 'affection',
    availableTo: ['Fluffaroo']
  },
  {
    _id: 'saddle',
    name: 'Bouncy Saddle',
    slot: 'body',
    rarity: 'Common',
    unlockMethod: 'affection',
    availableTo: ['Fluffaroo']
  },
  {
    _id: 'cloak',
    name: 'Fox Cloak',
    slot: 'body',
    rarity: 'Rare',
    unlockMethod: 'event',
    availableTo: ['Foxdini']
  },
  {
    _id: 'bandana',
    name: 'Trickster Bandana',
    slot: 'accessory',
    rarity: 'Uncommon',
    unlockMethod: 'affection',
    availableTo: ['Foxdini']
  },
  {
    _id: 'pearl-necklace',
    name: 'Pearl Necklace',
    slot: 'accessory',
    rarity: 'Rare',
    unlockMethod: 'affection',
    availableTo: ['Meowmaid']
  },
  {
    _id: 'fin-hat',
    name: 'Ocean Crown',
    slot: 'hat',
    rarity: 'Epic',
    unlockMethod: 'event',
    availableTo: ['Meowmaid']
  },
  {
    _id: 'sleep-mask',
    name: 'Sleep Mask',
    slot: 'hat',
    rarity: 'Common',
    unlockMethod: 'affection',
    availableTo: ['Chonkabear']
  },
  {
    _id: 'cozy-cape',
    name: 'Cozy Cape',
    slot: 'body',
    rarity: 'Uncommon',
    unlockMethod: 'affection',
    availableTo: ['Chonkabear']
  }
];

async function seedCosmetics() {
  await CosmeticItem.deleteMany({});
  await CosmeticItem.insertMany(cosmetics);
  console.log('✅ Seeded cosmetics.');
  process.exit();
}

seedCosmetics();
