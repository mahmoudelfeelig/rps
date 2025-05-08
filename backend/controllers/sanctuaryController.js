const Critter = require('../models/Critter');
const UserInventory = require('../models/UserInventory');
const CritterSpecies = require('../models/CritterSpecies');
const traitEffects = require('../utils/traitEffects');

const COOLDOWN_MS = 15 * 60 * 1000;
// Passive resource claim (e.g. every 15 minutes or daily)
exports.claimPassiveResources = async (req, res) => {
  try {
    const inv = await UserInventory.findOneAndUpdate(
      { userId: req.user._id },
      {},
      { upsert: true, new: true }
    );

    const now = Date.now();
    if (inv.lastPassiveClaim && now - inv.lastPassiveClaim < COOLDOWN_MS) {
      return res.status(400).json({
        error:     'Too soon to claim again',
        nextClaim: inv.lastPassiveClaim.getTime() + COOLDOWN_MS
      });
    }

    const critters = await Critter.find({ ownerId: req.user._id });
    let coinGain = 0, foodGain = {}, toyGain = {};

    for (const c of critters) {
      let base = { coins: 1, food: {}, toys: {} };

      const owned = c.traits && typeof c.traits === 'object'
        ? Object.keys(c.traits)
        : [];

      // generators
      for (const t of owned) {
        const eff = traitEffects[t];
        if (eff?.generate) {
          const r = eff.generate();
          base.coins += r.coins || 0;
          if (r.food) {
            for (const [k, v] of Object.entries(r.food)) {
              base.food[k] = (base.food[k] || 0) + v;
            }
          }
          if (r.toys) {
            for (const [k, v] of Object.entries(r.toys)) {
              base.toys[k] = (base.toys[k] || 0) + v;
            }
          }
        }
      }

      // modifiers
      for (const t of owned) {
        const eff = traitEffects[t];
        if (eff?.modifyGeneration) {
          base = eff.modifyGeneration(base);
        }
      }

      // scale by level & affection
      base.coins *= 1 + c.level * 0.02;
      base.coins *= 1 + c.affection * 0.005;

      coinGain += Math.floor(base.coins);
      Object.entries(base.food).forEach(([k, v]) => {
        foodGain[k] = (foodGain[k] || 0) + v;
      });
      Object.entries(base.toys).forEach(([k, v]) => {
        toyGain[k] = (toyGain[k] || 0) + v;
      });
    }

    const incOps = {
      'resources.coins': coinGain,
      ...Object.fromEntries(Object.entries(foodGain).map(([k, v]) => [`resources.food.${k}`, v])),
      ...Object.fromEntries(Object.entries(toyGain).map(([k, v]) => [`resources.toys.${k}`, v]))
    };

    const updated = await UserInventory.findOneAndUpdate(
      { userId: req.user._id },
      {
        $inc: incOps,
        $set: { lastPassiveClaim: new Date(now) }
      },
      { new: true }
    );

    res.json({
      message:    'Resources claimed!',
      coinsAdded: coinGain,
      foodAdded:  foodGain,
      toysAdded:  toyGain,
      newInventory: updated.resources,
      nextClaim:  now + COOLDOWN_MS
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to claim resources.' });
  }
};


// Mini-game completion reward logic
exports.handleMiniGameResult = async (req, res) => {
  try {
    const { critterId, actualScore, game } = req.body;
    if (typeof actualScore !== 'number' || !Number.isFinite(actualScore)) {
      return res.status(400).json({ error: 'Invalid or missing score.' });
    }

    // 1) Load & authorize critter
    const critter = await Critter.findById(critterId);
    if (!critter || !critter.ownerId.equals(req.user._id)) {
      return res.sendStatus(404);
    }

    // 2) Apply trait‐based doubling
    let finalScore = actualScore;
    for (const t of critter.traits) {
      if (traitEffects[t]?.doubleMiniGame) {
        finalScore = traitEffects[t].doubleMiniGame(finalScore);
      }
    }

    // 3) Compute EXP & affection
    let expGain       = Math.min(finalScore, 100);
    let affectionGain = Math.floor(expGain / 2);
    for (const t of critter.traits) {
      if (traitEffects[t]?.modifyMiniGameExp) {
        expGain = traitEffects[t].modifyMiniGameExp(expGain);
      }
      if (traitEffects[t]?.modifyAffection) {
        affectionGain = traitEffects[t].modifyAffection(affectionGain);
      }
    }

    // 4) Update critter stats
    critter.experience += expGain;
    critter.affection  += affectionGain;

    // 5) Level-up logic
    const species = await CritterSpecies.findOne({ species: critter.species });
    const nextLvl = Math.floor(Math.sqrt(critter.experience / 50)) + 1;
    if (nextLvl > critter.level) {
      critter.level = nextLvl;
      const newTrait = species.passiveTraitsByLevel.get(String(nextLvl));
      if (newTrait && !critter.traits.includes(newTrait)) {
        critter.traits.push(newTrait);
      }
    }

    await critter.save();

    // 6) If coin-catcher, award coins
    let coinsGained = 0, newCoinBalance;
    if (game === 'coin-catcher' && finalScore > 0) {
      coinsGained = finalScore;
      const inv = await UserInventory.findOneAndUpdate(
        { userId: req.user._id },
        { $inc: { 'resources.coins': coinsGained } },
        { new: true, upsert: true }
      );
      newCoinBalance = inv.resources.coins;
    }

    // 7) Respond
    const payload = {
      message:         'Mini-game rewards applied.',
      newLevel:        critter.level,
      newAffection:    critter.affection,
      expGained:       expGain,
      affectionGained: affectionGain
    };
    if (game === 'coin-catcher') {
      payload.coinsGained   = coinsGained;
      payload.newCoinBalance = newCoinBalance;
    }

    res.json(payload);

  } catch (err) {
    console.error('Error handling mini-game:', err);
    res.status(500).json({ error: 'Failed to apply mini-game rewards.' });
  }
};
