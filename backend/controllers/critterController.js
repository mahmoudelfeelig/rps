const Critter = require('../models/Critter');
const CritterSpecies = require('../models/CritterSpecies');
const UserInventory = require('../models/UserInventory');
const traitEffects = require('../utils/traitEffects');

exports.adoptCritter = async (req, res) => {
  const { species, variant } = req.body;

  const newCritter = await Critter.create({
    ownerId: req.user._id,
    species,
    variant
  });

  res.status(201).json(newCritter);
};

exports.getMyCritters = async (req, res) => {
  const critters = await Critter.find({ ownerId: req.user._id });
  const inventory = await UserInventory.findOne({ userId: req.user._id });

  const cosmeticIds = inventory?.cosmetics || [];

  const enriched = critters.map(c => ({
    ...c.toObject(),
    ownerInventory: cosmeticIds
  }));

  res.json(enriched);
};


exports.feedCritter = async (req, res) => {
  try {
    const userId   = req.user._id;
    const { foodItem } = req.body;
    if (!foodItem) return res.status(400).json({ error: 'No food item provided.' });

    // 1) Consume inventory
    const inv = await UserInventory.findOne({ userId });
    const have = inv?.resources.food.get(foodItem) || 0;
    if (have < 1) return res.status(400).json({ error: 'You have no such food.' });
    inv.resources.food.set(foodItem, have - 1);
    await inv.save();

    // 2) Load & authorize critter
    const critter = await Critter.findById(req.params.id);
    if (!critter || !critter.ownerId.equals(userId)) return res.sendStatus(404);

    // 3) Cooldown
    const now = Date.now();
    if (critter.lastFedAt && now - critter.lastFedAt < 15 * 60 * 1000) {
      return res.status(400).json({ error: 'Too soon to feed again.' });
    }

    // 4) Compute affection & EXP
    const species = await CritterSpecies.findOne({ species: critter.species });
    let affectionGain = species.foodPreferences.includes(foodItem) ? 15 : 5;
    for (const t of critter.traits) {
      if (traitEffects[t]?.modifyAffection) {
        affectionGain = traitEffects[t].modifyAffection(affectionGain);
      }
    }
    critter.affection += affectionGain;
    critter.experience += 10;
    critter.lastFedAt = now;

    // 5) Level-up
    const nextLvl = Math.floor(Math.sqrt(critter.experience / 50)) + 1;
    if (nextLvl > critter.level) {
      critter.level = nextLvl;
      const newTrait = species.passiveTraitsByLevel.get(String(nextLvl));
      if (newTrait && !critter.traits.includes(newTrait)) {
        critter.traits.push(newTrait);
      }
    }

    await critter.save();
    res.json(critter);

  } catch (err) {
    console.error('Feeding error:', err);
    res.status(500).json({ error: 'Feeding failed.' });
  }
};

// Play with Critter – now consumes one unit of chosen toyItem
exports.playWithCritter = async (req, res) => {
  try {
    const userId   = req.user._id;
    const { toyItem } = req.body;
    if (!toyItem) return res.status(400).json({ error: 'No toy item provided.' });

    // 1) Consume inventory
    const inv = await UserInventory.findOne({ userId });
    const have = inv?.resources.toys.get(toyItem) || 0;
    if (have < 1) return res.status(400).json({ error: 'You have no such toy.' });
    inv.resources.toys.set(toyItem, have - 1);
    await inv.save();

    // 2) Load & authorize critter
    const critter = await Critter.findById(req.params.id);
    if (!critter || !critter.ownerId.equals(userId)) return res.sendStatus(404);

    // 3) Cooldown
    const now = Date.now();
    if (critter.lastPlayedAt && now - critter.lastPlayedAt < 15 * 60 * 1000) {
      return res.status(400).json({ error: 'Too soon to play again.' });
    }

    // 4) Compute affection & EXP
    const species = await CritterSpecies.findOne({ species: critter.species });
    let affectionGain = species.playPreferences.includes(toyItem) ? 15 : 5;
    for (const t of critter.traits) {
      if (traitEffects[t]?.modifyAffection) {
        affectionGain = traitEffects[t].modifyAffection(affectionGain);
      }
      if (traitEffects[t]?.modifyPlayBonus) {
        affectionGain = traitEffects[t].modifyPlayBonus(affectionGain);
      }
    }
    critter.affection += affectionGain;
    critter.experience += 10;
    critter.lastPlayedAt = now;

    // 5) Level-up
    const nextLvl = Math.floor(Math.sqrt(critter.experience / 50)) + 1;
    if (nextLvl > critter.level) {
      critter.level = nextLvl;
      const newTrait = species.passiveTraitsByLevel.get(String(nextLvl));
      if (newTrait && !critter.traits.includes(newTrait)) {
        critter.traits.push(newTrait);
      }
    }

    await critter.save();
    res.json(critter);

  } catch (err) {
    console.error('Play error:', err);
    res.status(500).json({ error: 'Playing failed.' });
  }
};

exports.equipCosmetic = async (req, res) => {
  const { critterId, slot, itemId } = req.body;

  const inventory = await UserInventory.findOne({ userId: req.user._id });
  if (!inventory || !inventory.cosmetics.includes(itemId)) {
    return res.status(403).json({ error: "You don't own this cosmetic." });
  }

  const critter = await Critter.findById(critterId);
  if (!critter || !critter.ownerId.equals(req.user._id)) return res.sendStatus(404);

  critter.equippedCosmetics[slot] = itemId;
  await critter.save();
  res.json(critter);
};

exports.evolveCritter = async (req, res) => {
    const { critterId } = req.body;
    const critter = await Critter.findById(critterId);
    if (!critter || !critter.ownerId.equals(req.user._id)) return res.sendStatus(404);
    if (critter.evolvedTo) return res.status(400).json({ error: 'Already evolved.' });
  
    const species = await CritterSpecies.findOne({ species: critter.species });
    const requiredLevel = 7; // or dynamic if desired
  
    if (!species.evolutions?.length)
      return res.status(400).json({ error: 'No evolutions available.' });
  
    if (critter.level < requiredLevel)
      return res.status(400).json({ error: `Must be level ${requiredLevel} to evolve.` });
  
    const newSpecies = species.evolutions[0];
    critter.species = newSpecies;
    critter.evolvedTo = newSpecies;
    await critter.save();
  
    res.json({ message: 'Evolution complete!', critter });
  };
  