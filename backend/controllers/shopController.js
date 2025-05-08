// yeah i know the naming is stupid but shop is for pet-related items and store is for user-related items!! im sorry.

const User             = require('../models/User');
const UserInventory    = require('../models/UserInventory');
const PetItem          = require('../models/PetItem');
const CosmeticItem     = require('../models/CosmeticItem');
const CritterSpecies   = require('../models/CritterSpecies');
const { petPrices, cosmeticPrices } = require('../config/shopPrices');
const generatePetName = require('../utils/generatePetName');

/** 
 * Helper: defines the shard-packs available for purchase 
 * (adjust quantities & prices to taste)
 */
function generateShardPacks() {
  return [
    {
      _id:       'shard-pack-small',
      name:      'Small Shard Pack',
      type:      'shard',
      quantity:  10,
      price:     100,
      coinType:  'user'
    },
    {
      _id:       'shard-pack-medium',
      name:      'Medium Shard Pack',
      type:      'shard',
      quantity:  50,
      price:     450,
      coinType:  'user'
    },
    {
      _id:       'shard-pack-large',
      name:      'Large Shard Pack',
      type:      'shard',
      quantity:  120,
      price:     1000,
      coinType:  'user'
    }
  ];
}

exports.getPetItems = async (req, res) => {
  try {
    const [petItems, cosmetics, species] = await Promise.all([
      PetItem.find(),
      CosmeticItem.find({ unlockMethod: 'shop' }),
      CritterSpecies.find()
    ]);

    const pets = species.map(s => ({
      _id:      `pet-${s.species}`,
      name:     s.species,
      type:     'pet',
      price:    petPrices[s.baseRarity] ?? 0,
      rarity:   s.baseRarity,
      coinType: 'user'
    }));

    const shards = petItems
      .filter(i => i.type === 'shard')
      .map(i => ({ ...i.toObject(), coinType: i.currency || 'pet' }));

    const foods = petItems
      .filter(i => i.type === 'food')
      .map(i => ({ ...i.toObject(), coinType: i.currency || 'pet' }));

    const toys = petItems
      .filter(i => i.type === 'toy')
      .map(i => ({ ...i.toObject(), coinType: i.currency || 'pet' }));

    const cosmeticsWithPrices = cosmetics.map(c => ({
      ...c.toObject(),
      type:     'cosmetic',
      price:    c.price ?? cosmeticPrices[c.rarity] ?? 0,
      coinType: 'user'
    }));

    return res.json({
      pets,
      foods,
      toys,
      cosmetics: cosmeticsWithPrices,
      shards
    });
  } catch (err) {
    console.error('Failed to load pet shop items:', err);
    return res.status(500).json({ error: 'Failed to load shop items.' });
  }
};

exports.buyPetItem = async (req, res) => {
  const userId = req.user._id;
  const { itemId, qty = 1 } = req.body;

  const item = await PetItem.findById(itemId);
  if (!item) return res.sendStatus(404);

  const inv = await UserInventory.findOne({ userId });
  const user = await User.findById(userId);

  const total = item.price * qty;

  // Deduct from correct currency
  if (item.currency === 'coins') {
    if (user.balance < total) {
      return res.status(400).json({ error: 'Not enough regular coins.' });
    }
    user.balance -= total;
    await user.save();
  } else {
    if (inv.resources.coins < total) {
      return res.status(400).json({ error: 'Not enough pet coins.' });
    }
    inv.resources.coins -= total;
  }

  // Inventory add
  if (item.type === 'food') {
    const prev = inv.resources.food.get(itemId) || 0;
    inv.resources.food.set(itemId, prev + qty);
  } else if (item.type === 'toy') {
    const prev = inv.resources.toys.get(itemId) || 0;
    inv.resources.toys.set(itemId, prev + qty);
  } else if (item.type === 'shard') {
    inv.shards = (inv.shards || 0) + qty;
  }

  await inv.save();
  await PetItem.findByIdAndDelete(itemId); // Remove item from shop

  res.json({
    coins: user.balance,
    petCoins: inv.resources.coins,
    food: Object.fromEntries(inv.resources.food),
    toys: Object.fromEntries(inv.resources.toys),
    shards: inv.shards,
  });
};

exports.buyCosmetic = async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.body;
  const item = await CosmeticItem.findById(itemId);

  const inv = await UserInventory.findOne({ userId });

  const price = item.price ?? cosmeticPrices[item.rarity] ?? 1000;
  const user = await User.findById(userId);
  if (!user || user.balance < price) {
    return res.status(400).json({ error: 'Not enough coins.' });
  }
  if (inv.cosmetics.includes(itemId)) {
    return res.status(400).json({ error: 'Cosmetic already owned.' });
  }

  user.balance -= price;
  await user.save();  

  if (!inv.cosmetics.includes(itemId)) {
    inv.cosmetics.push(itemId);
  }
  await inv.save();

  await CosmeticItem.findByIdAndDelete(itemId); // Remove item from shop
  
  res.json({ coins: inv.resources.coins, cosmetics: inv.cosmetics });
};

exports.buyPet = async (req, res) => {
  const userId = req.user._id;
  const { species } = req.body;

  const speciesData = await CritterSpecies.findOne({ species });
  if (!speciesData) return res.status(404).json({ error: 'Invalid species' });

  const price = petPrices[speciesData.baseRarity] ?? 1000;
  const user = await User.findById(userId);
  if (user.balance < price) {
    return res.status(400).json({ error: 'Not enough coins.' });
  }

  user.balance -= price;
  await user.save();

  const Critter = require('../models/Critter');
  const newName = generatePetName();

  await CritterSpecies.findByIdAndDelete(speciesData._id); // Remove species from shop
  const critter = await Critter.create({
    ownerId: userId,
    species,
    variant: null,
    rarity: speciesData.baseRarity,
    affection: 0,
    experience: 0,
    level: 1,
    traits: [],
    name: newName
  });

  res.json({ message: 'Pet adopted!', balance: user.balance, critter });
};
