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
  const critter = await Critter.findById(req.params.id);
  if (!critter || !critter.ownerId.equals(req.user._id)) return res.sendStatus(404);

  const now = Date.now();
  if (critter.lastFedAt && now - critter.lastFedAt < 3600000)
    return res.status(400).json({ error: 'Too soon to feed again' });

  const species = await CritterSpecies.findOne({ species: critter.species });
  const affectionGain = species.foodPreferences.includes(req.body.food) ? 15 : 5;

  // Apply trait modifications
  critter.traits.forEach(trait => {
    if (traitEffects[trait]?.modifyAffection) {
    affectionGain = traitEffects[trait].modifyAffection(affectionGain);
    }
  });

  critter.affection += affectionGain;
  critter.experience += 10;
  critter.lastFedAt = now;

  // Level up logic
  const nextLevel = Math.floor(Math.sqrt(critter.experience / 50)) + 1;
  if (nextLevel > critter.level) {
    critter.level = nextLevel;

    const newTrait = species.passiveTraitsByLevel.get(String(nextLevel));
    if (newTrait && !critter.traits.includes(newTrait)) {
      critter.traits.push(newTrait);
    }
  }

  await critter.save();
  res.json(critter);
};

exports.playWithCritter = async (req, res) => {
  const critter = await Critter.findById(req.params.id);
  if (!critter || !critter.ownerId.equals(req.user._id)) return res.sendStatus(404);

  const now = Date.now();
  if (critter.lastPlayedAt && now - critter.lastPlayedAt < 3600000)
    return res.status(400).json({ error: 'Too soon to play again' });

  const species = await CritterSpecies.findOne({ species: critter.species });
  const toy = req.body.toy || 'default';
  let affectionGain = species.playPreferences.includes(toy) ? 15 : 5;

  for (const trait of critter.traits) {
    if (traitEffects[trait]?.modifyAffection) {
      affectionGain = traitEffects[trait].modifyAffection(affectionGain);
    }
    if (traitEffects[trait]?.modifyPlayBonus) {
      affectionGain = traitEffects[trait].modifyPlayBonus(affectionGain);
    }
  }

  critter.affection += affectionGain;
  critter.experience += 10;
  critter.lastPlayedAt = now;

  const nextLevel = Math.floor(Math.sqrt(critter.experience / 50)) + 1;
  if (nextLevel > critter.level) {
    critter.level = nextLevel;
    const newTrait = species.passiveTraitsByLevel.get(String(nextLevel));
    if (newTrait && !critter.traits.includes(newTrait)) {
      critter.traits.push(newTrait);
    }
  }

  await critter.save();
  res.json(critter);
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
  