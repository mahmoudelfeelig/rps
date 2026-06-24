require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose       = require('mongoose');
const PetItem        = require('../models/PetItem');
const CosmeticItem   = require('../models/CosmeticItem');
const CritterSpecies = require('../models/CritterSpecies');
const { petPrices, cosmeticPrices } = require('../config/shopPrices');

async function seedShop() {
  await mongoose.connect(process.env.MONGO_URI);

  const foodIds = [
    'berries','fish','leaf','seed','fruit','honey','plankton','embers','nuts','meat',
    'kelp','algae','mushrooms','flowers','grass','root','wheat','corn','beans','peas',
    'rice','oats','apples','carrots','nectar','sap','spice','yogurt','cheese','stew',
    'moon-melon','crystal-pear','pepper-bark','silver-kelp','sun-dumpling','cloud-milk',
    'cocoa-bean','mint-leaf','pumpkin-bite','berry-tart','salted-fig','glow-grain',
    'river-roe','ember-cracker','honeycomb','frost-apple','lotus-root','cinder-plum'
  ];
  const foods = foodIds.map(id => ({
    _id:   id,
    name:  id.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
    type:  'food',
    price: petPrices.food,
    currency: 'petCoins'
  }));

  const toyIds = [
    'ball','stick','ribbon','feather','mirror','water-ball','squeaky-ball','bouncing-pad','plushie',
    'puzzle-toy','rolling-wheel','rope','frisbee','laser-pointer','bell','drum','xylophone',
    'tunnel','slide','trampoline','soccer-ball','dart-board','lego-set','yo-yo','jenga','marbles',
    'balance-beam','bubble-wand','tiny-skateboard','maze-box','training-hoop','snack-puzzle',
    'hideout-cube','moon-ball','wind-chime','glow-disc','climbing-rope','sprinkle-pad',
    'mini-keyboard','cardboard-castle','soft-hammock','water-sprayer','treat-launcher','shell-rattle'
  ];
  const toys = toyIds.map(id => ({
    _id:   id,
    name:  id.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
    type:  'toy',
    price: petPrices.toy,
    currency: 'petCoins'
  }));

  
  const shardBundles = [
    { _id:'shard10', name:'x10 Shards', type:'shard', currency:'petCoins', price:1000 },
    { _id:'shard20', name:'x20 Shards', type:'shard', currency:'petCoins', price:1800 },
    { _id:'shard50', name:'x50 Shards', type:'shard', currency:'petCoins', price:4000 },
    { _id:'shard100', name:'x100 Shards', type:'shard', currency:'petCoins', price:7600 },
    { _id:'shard250', name:'x250 Shards', type:'shard', currency:'petCoins', price:17500 }
  ];

  
  const speciesDocs = await CritterSpecies.find({}, { cosmeticsAvailable:1 }).lean();
  const cosmeticIds = [...new Set(speciesDocs.flatMap(s => s.cosmeticsAvailable))];

  const slotFromId = id => {
    if (id.includes('hat'))  return 'hat';
    if (id.includes('tail')) return 'tail';
    if (id.includes('cape') || id.includes('cloak') || id.includes('saddle')) return 'body';
    return 'accessory';
  };
  const rarityFromId = id => {
    if (id.match(/crown|prime|Ω/i)) return 'Epic';
    if (id.match(/hat|tail|cloak|cape/)) return 'Rare';
    return 'Common';
  };

  const cosmetics = cosmeticIds.map(cid => {
    const rarity = rarityFromId(cid);
    return {
      _id:  cid,
      name: cid.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
      slot: slotFromId(cid),
      rarity,
      unlockMethod: 'shop',
      availableTo: [],
      price: cosmeticPrices[rarity]
    };
  });

  const petItemOps = [...foods, ...toys, ...shardBundles].map(item => ({
    updateOne: {
      filter: { _id: item._id },
      update: { $set: item },
      upsert: true
    }
  }));

  const cosmeticOps = cosmetics.map(item => ({
    updateOne: {
      filter: { _id: item._id },
      update: { $set: item },
      upsert: true
    }
  }));

  if (petItemOps.length) await PetItem.bulkWrite(petItemOps);
  if (cosmeticOps.length) await CosmeticItem.bulkWrite(cosmeticOps);

  console.log(`Seeded ${foods.length} foods, ${toys.length} toys, `
    + `${shardBundles.length} shard bundles & ${cosmetics.length} cosmetics.`);
  await mongoose.disconnect();
}

if (require.main === module) {
  seedShop()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedShop;
