const Critter = require('../models/Critter');
const UserInventory = require('../models/UserInventory');
const CritterSpecies = require('../models/CritterSpecies');
const traitEffects = require('../utils/traitEffects');

// Passive resource claim (e.g. every 15 minutes or daily)
exports.claimPassiveResources = async (req, res) => {
  try {
    const critters = await Critter.find({ ownerId: req.user._id });

    let coinGain = 0;
    let foodGain = {};

    for (const c of critters) {
      let resources = { coins: 0, food: {} };

      // Generate base resources
      for (const trait of c.traits) {
        if (traitEffects[trait]?.generate) {
          const result = traitEffects[trait].generate();
          if (result.coins) resources.coins += result.coins;
          if (result.food) {
            for (const [item, amount] of Object.entries(result.food)) {
              resources.food[item] = (resources.food[item] || 0) + amount;
            }
          }
        }
      }

      // Apply modifiers
      for (const trait of c.traits) {
        if (traitEffects[trait]?.modifyGeneration) {
          resources = traitEffects[trait].modifyGeneration(resources);
        }
      }

      // Aggregate into totals
      coinGain += resources.coins;
      for (const [item, amount] of Object.entries(resources.food)) {
        foodGain[item] = (foodGain[item] || 0) + amount;
      }
    }

    const inventory = await UserInventory.findOneAndUpdate(
      { userId: req.user._id },
      {
        $inc: {
          'resources.coins': coinGain,
          ...Object.fromEntries(Object.entries(foodGain).map(([key, val]) => [`resources.food.${key}`, val]))
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Resources claimed!',
      coinsAdded: coinGain,
      foodAdded: foodGain,
      newInventory: inventory.resources
    });
  } catch (err) {
    console.error('Error claiming resources:', err);
    res.status(500).json({ error: 'Failed to claim resources.' });
  }
};

// Mini-game completion reward logic
exports.handleMiniGameResult = async (req, res) => {
  try {
    // 1️⃣ Match the front-end: read actualScore, not score
    const { critterId, actualScore } = req.body;

    // 2️⃣ Guard against missing/invalid payload
    if (typeof actualScore !== 'number' || !Number.isFinite(actualScore)) {
      return res.status(400).json({ error: 'Invalid or missing score.' });
    }

    const critter = await Critter.findById(critterId);
    if (!critter || !critter.ownerId.equals(req.user._id)) {
      return res.sendStatus(404);
    }

    // Apply any doubling traits
    let finalScore = actualScore;
    for (const trait of critter.traits) {
      if (traitEffects[trait]?.doubleMiniGame) {
        finalScore = traitEffects[trait].doubleMiniGame(finalScore);
      }
    }

    // Compute EXP and affection gains
    let expGain       = Math.min(finalScore, 100);
    let affectionGain = Math.floor(expGain / 2);

    // Apply any trait modifiers
    for (const trait of critter.traits) {
      if (traitEffects[trait]?.modifyMiniGameExp) {
        expGain = traitEffects[trait].modifyMiniGameExp(expGain);
      }
      if (traitEffects[trait]?.modifyAffection) {
        affectionGain = traitEffects[trait].modifyAffection(affectionGain);
      }
    }

    // Update the critter
    critter.experience += expGain;
    critter.affection  += affectionGain;

    // Level-up logic
    const species  = await CritterSpecies.findOne({ species: critter.species });
    const nextLvl  = Math.floor(Math.sqrt(critter.experience / 50)) + 1;
    if (nextLvl > critter.level) {
      critter.level = nextLvl;
      const newTrait = species.passiveTraitsByLevel.get(String(nextLvl));
      if (newTrait && !critter.traits.includes(newTrait)) {
        critter.traits.push(newTrait);
      }
    }

    await critter.save();

    res.json({
      message: 'Mini-game rewards applied.',
      newLevel:          critter.level,
      newAffection:      critter.affection,
      expGained:         expGain,
      affectionGained:   affectionGain
    });
  } catch (err) {
    console.error('Error handling mini-game:', err);
    res.status(500).json({ error: 'Failed to apply mini-game rewards.' });
  }
};
