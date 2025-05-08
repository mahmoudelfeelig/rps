const Critter           = require('../models/Critter');
const CritterSpecies    = require('../models/CritterSpecies');
const User              = require('../models/User');
const UserInventory     = require('../models/UserInventory');
const POOLS             = require('../config/gachaPools');

/** Rarity order for “top tier” detection */
const RARITY_ORDER = ['Common','Uncommon','Rare','Legendary','Mythical'];

/** Pick one key from a weights‐map at random */
function weightedPick(weights) {
  const entries = Object.entries(weights);
  const total   = entries.reduce((sum,[,w])=> sum + w, 0);
  let r = Math.random() * total;
  for (const [key,w] of entries) {
    if (r < w) return key;
    r -= w;
  }
  return entries[entries.length-1][0];
}

exports.getPools = async (req, res) => {
  try {
    const userId = req.user._id;
    const inv    = await UserInventory.findOne({ userId });
    const pity   = inv?.gachaPity || new Map();

    const output = {};
    for (const [key, cfg] of Object.entries(POOLS)) {
      output[key] = { ...cfg, pityCount: pity.get(key) || 0 };
    }
    res.json(output);
  } catch (err) {
    console.error('Failed to get gacha pools:', err);
    res.status(500).json({ error: 'Failed to load pools.' });
  }
};

exports.spin = async (req, res) => {
  try {
    const userId        = req.user._id;
    const { pool, count = 1 } = req.body;
    const config        = POOLS[pool];
    if (!config) return res.status(400).json({ error: 'Invalid pool.' });

    // 1) charge user
    const user = await User.findById(userId);
    const totalCost = config.cost * count;
    if (user.balance < totalCost) {
      return res.status(400).json({ error: 'Insufficient balance.' });
    }
    user.balance -= totalCost;
    await user.save();

    // 2) load or create inventory & pity
    const inv  = await UserInventory.findOneAndUpdate(
      { userId },
      {}, { new: true, upsert: true }
    );
    let pity = inv.gachaPity.get(pool) || 0;

    const results = [];
    const poolRarities = Object.keys(config.odds);
    const guaranteedTier = RARITY_ORDER
      .filter(r => poolRarities.includes(r))
      .reverse()[0];

    for (let i = 0; i < count; i++) {
      pity++;

      // — pick rarity with pity
      let rarity;
      if (pity >= 100) {
        rarity = guaranteedTier;
        pity = 0;
      } else {
        rarity = weightedPick(config.odds);
        if (rarity === guaranteedTier) pity = 0;
      }

      // — fetch a species of that rarity
      const choices = await CritterSpecies.find({ baseRarity: rarity });
      if (!choices.length) {
        return res.status(500).json({ error: `No species for ${rarity}` });
      }
      const picked = choices[Math.floor(Math.random() * choices.length)].species;

      // — sample traits for this pool & rarity
      const traitDefs = config.traitPools?.[rarity] || {};
      const traits    = {};
      for (const [name, weights] of Object.entries(traitDefs)) {
        traits[name] = weightedPick(weights);
      }

      // — adopt new or award shards, but always include rarity+traits
      const already = await Critter.exists({ ownerId: userId, species: picked });
      if (!already) {
        const c = await Critter.create({
          ownerId: userId,
          species: picked,
          rarity,
          traits
        });
        results.push({
          type:      'new',
          species:   picked,
          critterId: c._id,
          rarity,
          traits
        });
      } else {
        const shardMap    = { Common:5, Uncommon:10, Rare:25, Legendary:50, Mythical:100 };
        const shardsAward = shardMap[rarity] || 10;
        inv.shards = (inv.shards || 0) + shardsAward;
        results.push({
          type:    'shard',
          species: picked,
          shards:  shardsAward,
          rarity,
          traits
        });
      }
    }

    // 3) save updated pity & inventory
    inv.gachaPity.set(pool, pity);
    await inv.save();

    // 4) respond
    res.json({
      pool,
      count,
      results,
      newBalance:  user.balance,
      totalShards: inv.shards,
      pityCount:   pity
    });
  } catch (err) {
    console.error('Gacha spin error:', err);
    res.status(500).json({ error: 'Spin failed.' });
  }
};
