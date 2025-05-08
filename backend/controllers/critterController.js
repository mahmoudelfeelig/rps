const Critter = require('../models/Critter');
const CritterSpecies = require('../models/CritterSpecies');
const UserInventory = require('../models/UserInventory');
const traitEffects = require('../utils/traitEffects');

exports.getStarterCritters = async (req, res) => {
  const species = await CritterSpecies.aggregate([{ $sample: { size: 4 } }]);
  res.json(species.map(s => ({
    species: s.species,
    rarity: s.baseRarity,
    image: `/assets/critters/${s.species.toLowerCase()}.png`
  })));
};

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
  const inventory = await UserInventory.findOneAndUpdate(
    { userId: req.user.id },
    {},
    { upsert: true, new: true }
  );

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

    // 1) Consume inventory as a Map
    const inv = await UserInventory.findOneAndUpdate(
      { userId: req.user.id },
      {},
      { upsert: true, new: true }
    );
    const have = inv?.resources.food.get(foodItem) || 0;
    if (have < 1) {
      return res.status(400).json({ error: 'You have no such food item.' });
    }
    inv.resources.food.set(foodItem, have - 1);
    await inv.save();

    // 2) Load & authorize critter
    const critter = await Critter.findById(req.params.id);
    if (!critter || !critter.ownerId.equals(userId)) return res.sendStatus(404);

    // 3) Cooldown
    const now = Date.now();
    if (critter.lastFedAt && now - critter.lastFedAt < COOLDOWN_MS) {
      return res.status(400).json({ error: 'Too soon to feed again.' });
    }

    // 4) Lookup species; if not found, just use empty prefs
    const species = await CritterSpecies.findOne({ species: critter.species });
    if (!species) {
      console.warn(`No species definition for "${critter.species}", using empty prefs.`);
    }
    const prefs = species?.foodPreferences && Array.isArray(species.foodPreferences)
    ? species.foodPreferences
    : [];
    let affectionGain = prefs.includes(foodItem) ? 15 : 5;

    // 5) Trait‐based modifiers
    const ownedTraits = critter.traits && typeof critter.traits === 'object'
      ? Object.keys(critter.traits)
      : [];
    ownedTraits.forEach(t => {
      const eff = traitEffects[t];
      if (eff?.modifyAffection) {
        affectionGain = eff.modifyAffection(affectionGain);
      }
    });

    // 6) Apply gains
    critter.affection  += affectionGain;
    critter.experience  += 10;
    critter.lastFedAt   = now;

    // 7) Level‐up & passive‐trait unlock
    const nextLvl = Math.floor(Math.sqrt(critter.experience / 50)) + 1;
    if (nextLvl > critter.level) {
      critter.level = nextLvl;
      const newTrait = species.passiveTraitsByLevel[String(nextLvl)];
      if (newTrait && !ownedTraits.includes(newTrait)) {
        critter.traits = { ...(critter.traits||{}), [newTrait]: true };
      }
    }

    await critter.save();
    res.json(critter);

  } catch (err) {
    console.error('Feeding error:', err);
    res.status(500).json({ error: 'Feeding failed.' });
  }
};

exports.playWithCritter = async (req, res) => {
  try {
    const userId  = req.user._id;
    const { toyItem } = req.body;
    if (!toyItem) return res.status(400).json({ error: 'No toy item provided.' });

    // 1) Consume inventory as a Map
    const inv = await UserInventory.findOneAndUpdate(
      { userId: req.user.id },
      {},
      { upsert: true, new: true }
    );
    const have = inv?.resources.toys.get(toyItem) || 0;
    if (have < 1) {
      return res.status(400).json({ error: 'You have no such toy item.' });
    }
    inv.resources.toys.set(toyItem, have - 1);
    await inv.save();

    // 2) Load & authorize critter
    const critter = await Critter.findById(req.params.id);
    if (!critter || !critter.ownerId.equals(userId)) return res.sendStatus(404);

    // 3) Cooldown
    const now = Date.now();
    if (critter.lastPlayedAt && now - critter.lastPlayedAt < COOLDOWN_MS) {
      return res.status(400).json({ error: 'Too soon to play again.' });
    }

    // 4) Lookup species; if not found, just use empty prefs
    const species = await CritterSpecies.findOne({ species: critter.species });
    if (!species) {
      console.warn(`No species definition for "${critter.species}", using empty prefs.`);
    }
    const prefs = species?.toyPreferences && Array.isArray(species.toyPreferences)
    ? species.toyPreferences
    : [];
    let affectionGain = prefs.includes(toyItem) ? 15 : 5;

    // 5) Trait‐based modifiers
    const ownedTraits = critter.traits && typeof critter.traits === 'object'
      ? Object.keys(critter.traits)
      : [];
    ownedTraits.forEach(t => {
      const eff = traitEffects[t];
      if (eff?.modifyAffection) {
        affectionGain = eff.modifyAffection(affectionGain);
      }
      if (eff?.modifyPlayBonus) {
        affectionGain = eff.modifyPlayBonus(affectionGain);
      }
    });

    // 6) Apply gains
    critter.affection     += affectionGain;
    critter.experience     += 10;
    critter.lastPlayedAt   = now;

    // 7) Level‐up & passive‐trait unlock
    const nextLvl = Math.floor(Math.sqrt(critter.experience / 50)) + 1;
    if (nextLvl > critter.level) {
      critter.level = nextLvl;
      const newTrait = species.passiveTraitsByLevel[String(nextLvl)];
      if (newTrait && !ownedTraits.includes(newTrait)) {
        critter.traits = { ...(critter.traits||{}), [newTrait]: true };
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

  const inventory = await UserInventory.findOneAndUpdate(
    { userId: req.user.id },
    {},
    { upsert: true, new: true }
  );  
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
  const userId = req.user._id;
  // 1) load critter
  const critter = await Critter.findById(critterId);
  if (!critter || !critter.ownerId.equals(userId)) {
    return res.sendStatus(404);
  }
  if (critter.evolvedTo) {
    return res.status(400).json({ error: 'This critter has already evolved.' });
  }

  // 2) load species data
  const speciesDoc = await CritterSpecies.findOne({ species: critter.species });
  if (!speciesDoc || !speciesDoc.evolution?.nextSpecies) {
    return res.status(400).json({ error: 'No evolution available for this species.' });
  }

  // 3) determine requirements
  const { nextSpecies, levelReq = 15, itemReq } = speciesDoc.evolution;
  if (critter.level < levelReq) {
    return res.status(400).json({ error: `Must be at least level ${levelReq} to evolve.` });
  }

  // 4) consume item if required
  if (itemReq) {
    const inv = await UserInventory.findOne({ userId });
    const have = inv?.resources.food?.get(itemReq) || inv?.resources.toys?.get(itemReq) || 0;
    if (have < 1) {
      return res.status(400).json({ error: `Requires item "${itemReq}" to evolve.` });
    }
    // remove one
    if (inv.resources.food?.has(itemReq)) {
      inv.resources.food.set(itemReq, have - 1);
    } else {
      inv.resources.toys.set(itemReq, have - 1);
    }
    await inv.save();
  }

  // 5) perform evolution: change species, record evolvedTo, reset level/exp
  critter.species      = nextSpecies;
  critter.evolvedTo    = nextSpecies;
  critter.level        = 1;
  critter.experience   = 0;

  await critter.save();

  return res.json({
    message: 'Evolution successful!',
    critter
  });
};


  