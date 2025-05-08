const Critter = require('../models/Critter');
const UserInventory = require('../models/UserInventory');

exports.breedCritters = async (req, res) => {
  const userId = req.user._id;
  const { parentA, parentB } = req.body;
  const cost = 500; // flat breeding fee

  // Fetch inventory & parents
  const inv = await UserInventory.findOne({ userId });
  if (!inv || inv.resources.coins < cost) {
    return res.status(400).json({ error: 'Not enough coins.' });
  }

  const [a, b] = await Promise.all([
    Critter.findOne({ _id: parentA, ownerId: userId }),
    Critter.findOne({ _id: parentB, ownerId: userId })
  ]);
  if (!a || !b) return res.status(404).json({ error: 'Parent not found.' });

  // Deduct cost
  inv.resources.coins -= cost;

  // Child species = random pick of parents
  const species = Math.random() < 0.5 ? a.species : b.species;

  // Mix traits: pick up to 2 from each parent
  const pickTraits = (list) => {
    const shuffle = list.sort(()=>Math.random()-0.5);
    return shuffle.slice(0, Math.floor(shuffle.length/2));
  };
  const childTraits = Array.from(new Set([
    ...pickTraits(a.traits),
    ...pickTraits(b.traits)
  ]));

  // Create child
  const child = await Critter.create({
    ownerId: userId,
    species,
    traits: childTraits
  });

  await inv.save();
  res.status(201).json({ child, newCoins: inv.resources.coins });
};
