const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CritterSpecies = require('../models/CritterSpecies');

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const speciesData = [
  {
    species: 'Fluffaroo',
    description: 'Cloud-dwelling bouncer.',
    baseRarity: 'Common',
    foodPreferences: ['herbs', 'cloudberries'],
    playPreferences: ['bouncing ball', 'feather toy'],
    cosmeticsAvailable: ['wizard-hat', 'saddle'],
    evolutions: ['Skyroo'],
    passiveTraitsByLevel: {
      3: 'forager',
      5: 'cheerful',
      7: 'resourceful'
    }
  },
  {
    species: 'Foxdini',
    description: 'Clever little illusionist.',
    baseRarity: 'Uncommon',
    foodPreferences: ['meat', 'berries'],
    playPreferences: ['mirror', 'cards'],
    cosmeticsAvailable: ['cloak', 'bandana'],
    evolutions: ['Vulpinox'],
    passiveTraitsByLevel: {
      4: 'resourceful',
      6: 'hoarder'
    }
  },
  {
    species: 'Meowmaid',
    description: 'Cat with a mermaid tail.',
    baseRarity: 'Rare',
    foodPreferences: ['fish', 'kelp'],
    playPreferences: ['waterball', 'singing shell'],
    cosmeticsAvailable: ['pearl-necklace', 'fin-hat'],
    evolutions: ['Sirena'],
    passiveTraitsByLevel: {
      3: 'splashy',
      6: 'charm-boost',
      8: 'gold-finder'
    }
  },
  {
    species: 'Chonkabear',
    description: 'Loves naps and snacks.',
    baseRarity: 'Common',
    foodPreferences: ['honey', 'fruit'],
    playPreferences: ['teddy bear', 'blanket'],
    cosmeticsAvailable: ['sleep-mask', 'cozy-cape'],
    evolutions: ['Yawnosaur'],
    passiveTraitsByLevel: {
      3: 'naptime',
      5: 'snack-finder',
      7: 'resourceful'
    }
  },
  {
    species: 'Bubblo',
    description: 'A floating jelly critter.',
    baseRarity: 'Uncommon',
    foodPreferences: ['plankton', 'minerals'],
    playPreferences: ['bubble chase', 'bounce pad'],
    cosmeticsAvailable: ['glow-orb', 'transparent-hat'],
    evolutions: ['Floatox'],
    passiveTraitsByLevel: {
      2: 'snuggly',
      4: 'splashy',
      6: 'resourceful'
    }
  },
  {
    species: 'Scorcheep',
    description: 'A fire-sheep hybrid with a warm heart.',
    baseRarity: 'Rare',
    foodPreferences: ['embers', 'charcoal biscuits'],
    playPreferences: ['fireball chase', 'coal stacking'],
    cosmeticsAvailable: ['flame-collar', 'ember-horn'],
    evolutions: ['Inferma'],
    passiveTraitsByLevel: {
      3: 'forager',
      5: 'gold-finder',
      7: 'boost-heat'
    }
  }
];


async function seedSpecies() {
  await CritterSpecies.deleteMany({});
  await CritterSpecies.insertMany(speciesData);
  console.log('✅ Seeded critter species.');
  process.exit();
}

seedSpecies();
