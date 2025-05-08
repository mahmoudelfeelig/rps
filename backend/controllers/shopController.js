// yeah i know the naming is stupid but shop is for pet-related items and store is for user-related items!! im sorry.

const PetItem = require('../models/PetItem');
const UserInventory = require('../models/UserInventory');

exports.getPetItems = async (req, res) => {
  const items = await PetItem.find();
  res.json(items);
};

exports.buyPetItem = async (req, res) => {
  const userId = req.user._id;
  const { itemId, qty = 1 } = req.body;

  const item = await PetItem.findById(itemId);
  if (!item) return res.sendStatus(404);

  const inv = await UserInventory.findOne({ userId });
  if (inv.resources.coins < item.price * qty) {
    return res.status(400).json({ error: 'Not enough coins.' });
  }

  // Deduct coins
  inv.resources.coins -= item.price * qty;

  // Add to food OR toys
  if (item.type === 'food') {
    const prev = inv.resources.food.get(itemId) || 0;
    inv.resources.food.set(itemId, prev + qty);
  } else if (item.type === 'toy') {
    const prev = inv.resources.toys.get(itemId) || 0;
    inv.resources.toys.set(itemId, prev + qty);
  }

  await inv.save();

  // return full updated pet‐related inventory
  res.json({
    coins: inv.resources.coins,
    food:  Object.fromEntries(inv.resources.food),
    toys:  Object.fromEntries(inv.resources.toys)
  });
};
