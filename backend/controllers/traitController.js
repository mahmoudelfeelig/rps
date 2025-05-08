const Critter        = require('../models/Critter');
const UserInventory  = require('../models/UserInventory');

exports.unlockTrait = async (req, res) => {
  const userId    = req.user._id;
  const { critterId, trait } = req.body;
  const cost      = 50; // or per‐trait map

  const inv = await UserInventory.findOne({ userId });
  if (!inv || inv.shards < cost) {
    return res.status(400).json({ error: 'Not enough shards.' });
  }

  const critter = await Critter.findById(critterId);
  if (!critter || !critter.ownerId.equals(userId)) {
    return res.sendStatus(404);
  }

  // check map rather than array
  if (critter.traits && critter.traits[trait]) {
    return res.status(400).json({ error: 'Trait already unlocked.' });
  }

  // Deduct shards & add trait
  inv.shards -= cost;
  critter.traits = { ...(critter.traits||{}), [trait]: true };

  await Promise.all([inv.save(), critter.save()]);

  // return the updated trait‐map
  res.json({
    message:   `Unlocked trait ${trait}`,
    newShards: inv.shards,
    traits:    critter.traits
  });
};

