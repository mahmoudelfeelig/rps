const Critter = require('../models/Critter');
const UserInventory = require('../models/UserInventory');
const traitEffects = require('../utils/traitEffects');

exports.unlockTrait = async (req, res) => {
  const userId    = req.user._id;
  const { critterId, trait } = req.body;
  const cost      = 50; // example fixed cost, or map per trait

  const inv = await UserInventory.findOne({ userId });
  if (!inv || inv.shards < cost) {
    return res.status(400).json({ error: 'Not enough shards.' });
  }

  const critter = await Critter.findById(critterId);
  if (!critter || !critter.ownerId.equals(userId)) {
    return res.sendStatus(404);
  }

  if (critter.traits.includes(trait)) {
    return res.status(400).json({ error: 'Trait already unlocked.' });
  }

  // Deduct shards & add trait
  inv.shards -= cost;
  critter.traits.push(trait);

  await Promise.all([inv.save(), critter.save()]);

  res.json({
    message: `Unlocked trait ${trait}`,
    newShards: inv.shards,
    traits:    critter.traits
  });
};
