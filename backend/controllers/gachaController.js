const Critter           = require('../models/Critter');
const CritterSpecies    = require('../models/CritterSpecies');
const User              = require('../models/User');
const UserInventory     = require('../models/UserInventory');
const POOLS             = require('../config/gachaPools');
const generatePetName   = require('../utils/generatePetName');   // ← NEW

const RARITY_ORDER = ['Common','Uncommon','Rare','Legendary','Mythical'];

/* pick key by weight */
function weightedPick(weights) {
  const total = Object.values(weights).reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (const [k, w] of Object.entries(weights)) {
    if (r < w) return k;
    r -= w;
  }
  return Object.keys(weights)[0];
}

exports.getPools = async (req, res) => {
  try {
    const inv  = await UserInventory.findOne({ userId: req.user._id });
    const pity = inv?.gachaPity || new Map();

    const obj = {};
    for (const [k, cfg] of Object.entries(POOLS)) {
      obj[k] = { ...cfg, pityCount: pity.get(k) || 0 };
    }
    res.json(obj);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load pools.' });
  }
};

exports.spin = async (req, res) => {
  try {
    const { pool, count = 1 } = req.body;
    const cfg = POOLS[pool];
    if (!cfg) return res.status(400).json({ error: 'Invalid pool.' });

    /* ── 1. charge ───────────────────────── */
    const user = await User.findById(req.user._id);
    const totalCost = cfg.cost * count;
    if (user.balance < totalCost) {
      return res.status(400).json({ error: 'Insufficient balance.' });
    }
    user.balance -= totalCost;
    await user.save();

    /* ── 2. inventory + pity ─────────────── */
    const inv = await UserInventory.findOneAndUpdate(
      { userId: user._id }, {}, { new: true, upsert: true }
    );
    let pity = inv.gachaPity.get(pool) || 0;

    const poolRarities  = Object.keys(cfg.odds);
    const guaranteedTop = RARITY_ORDER.filter(r => poolRarities.includes(r)).reverse()[0];

    const results = [];

    for (let i = 0; i < count; i++) {
      pity++;

      /* rarity w/ pity */
      let rarity = weightedPick(cfg.odds);
      if (pity >= 100) {
        rarity = guaranteedTop;
        pity   = 0;
      } else if (rarity === guaranteedTop) {
        pity = 0;
      }

      /* random species of that rarity */
      const choices = await CritterSpecies.find({ baseRarity: rarity }, 'species');
      if (!choices.length) return res.status(500).json({ error: `No species for ${rarity}` });
      const species = choices[Math.floor(Math.random() * choices.length)].species;

      /* generate a unique variant name */
      let variant;
      do { variant = generatePetName(); }
      while (await Critter.exists({ ownerId: user._id, variant }));

      /* pick banner‑specific trait rolls (optional) */
      const traitDefs = cfg.traitPools?.[rarity] || {};
      const traits    = {};
      for (const [traitName, weights] of Object.entries(traitDefs)) {
        traits[traitName] = weightedPick(weights);
      }

      /* adopt or give shards */
      const owned = await Critter.exists({ ownerId: user._id, species });
      if (!owned) {
        const c = await Critter.create({
          ownerId: user._id,
          species,
          variant,
          rarity,
          traits
        });
        results.push({ type:'new', species, variant, rarity, traits, critterId: c._id });
      } else {
        const shardMap = { Common:5, Uncommon:10, Rare:25, Legendary:50, Mythical:100 };
        const shards   = shardMap[rarity] || 10;
        inv.shards = (inv.shards || 0) + shards;
        results.push({ type:'shard', species, variant, rarity, traits, shards });
      }
    }

    /* ── 3. save & reply ─────────────────── */
    inv.gachaPity.set(pool, pity);
    await inv.save();

    res.json({
      pool,
      count,
      results,
      newBalance:  user.balance,
      totalShards: inv.shards,
      pityCount:   pity
    });
  } catch (e) {
    console.error('Gacha spin error:', e);
    res.status(500).json({ error: 'Spin failed.' });
  }
};
