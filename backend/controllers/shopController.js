
const User             = require('../models/User');
const UserInventory    = require('../models/UserInventory');
const PetItem          = require('../models/PetItem');
const CosmeticItem     = require('../models/CosmeticItem');
const CritterSpecies   = require('../models/CritterSpecies');
const { petPrices, cosmeticPrices } = require('../config/shopPrices');
const generatePetName = require('../utils/generatePetName');
const { positiveInt } = require('../utils/inputValidation');

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
  const { itemId } = req.body;
  const qty = positiveInt(req.body.qty ?? 1, { min: 1, max: 99 });
  if (!qty) return res.status(400).json({ error: 'Quantity must be between 1 and 99.' });

  const item = await PetItem.findById(itemId);
  if (!item) return res.sendStatus(404);

  const inv = await UserInventory.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { new: true, upsert: true }
  );

  const total = item.price * qty;
  if (!Number.isFinite(total) || total <= 0) {
    return res.status(400).json({ error: 'Invalid item price.' });
  }

  if (item.currency === 'coins') {
    const debit = await User.updateOne(
      { _id: userId, balance: { $gte: total } },
      { $inc: { balance: -total } }
    );
    if (debit.modifiedCount !== 1) return res.status(400).json({ error: 'Not enough regular coins.' });
  } else {
    const debit = await UserInventory.updateOne(
      { userId, 'resources.coins': { $gte: total } },
      { $inc: { 'resources.coins': -total } }
    );
    if (debit.modifiedCount !== 1) return res.status(400).json({ error: 'Not enough pet coins.' });
    inv.resources.coins -= total;
  }

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
  const user = await User.findById(userId).lean();

  res.json({
    coins: user?.balance || 0,
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
  if (!item) return res.status(404).json({ error: 'Cosmetic not found.' });

  const inv = await UserInventory.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { new: true, upsert: true }
  );

  const price = item.price ?? cosmeticPrices[item.rarity] ?? 1000;
  if (!Number.isFinite(price) || price <= 0) return res.status(400).json({ error: 'Invalid cosmetic price.' });
  if (inv.cosmetics.includes(itemId)) {
    return res.status(400).json({ error: 'Cosmetic already owned.' });
  }

  const debit = await User.updateOne(
    { _id: userId, balance: { $gte: price } },
    { $inc: { balance: -price } }
  );
  if (debit.modifiedCount !== 1) return res.status(400).json({ error: 'Not enough coins.' });

  if (!inv.cosmetics.includes(itemId)) {
    inv.cosmetics.push(itemId);
  }
  await inv.save();

  const user = await User.findById(userId).lean();
  res.json({ coins: user?.balance || 0, cosmetics: inv.cosmetics });
};

exports.buyPet = async (req, res) => {
  const userId = req.user._id;
  const { species } = req.body;

  const speciesData = await CritterSpecies.findOne({ species });
  if (!speciesData) return res.status(404).json({ error: 'Invalid species' });

  const price = petPrices[speciesData.baseRarity] ?? 1000;
  if (!Number.isFinite(price) || price <= 0) return res.status(400).json({ error: 'Invalid pet price.' });
  const debit = await User.updateOne(
    { _id: userId, balance: { $gte: price } },
    { $inc: { balance: -price } }
  );
  if (debit.modifiedCount !== 1) return res.status(400).json({ error: 'Not enough coins.' });

  const Critter = require('../models/Critter');
  const newName = generatePetName();

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

  const user = await User.findById(userId).lean();
  res.json({ message: 'Pet adopted!', balance: user?.balance || 0, critter });
};
