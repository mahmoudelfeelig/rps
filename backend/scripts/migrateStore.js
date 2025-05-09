/**
 * One‑time migration:
 *  1) back‑fill missing fields on StoreItem docs
 *  2) ensure all users have activeEffects array
 */
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose  = require('mongoose');
const StoreItem = require('../models/StoreItem');
const User      = require('../models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const bulk = StoreItem.collection.initializeUnorderedBulkOp();
  const items = await StoreItem.find();

  items.forEach(doc => {
    const update = {};

    // 1. Fill in missing 'consumable'
    if (doc.consumable === undefined)
      update.consumable = doc.type !== 'badge';

    // 2. Fill in missing 'effectType'
    if (!doc.effectType) {
      if (doc.type === 'badge')         update.effectType = 'reward‑multiplier';
      else if (doc.type === 'cosmetic') update.effectType = 'cosmetic';
      else if (/safe|helmet/i.test(doc.name)) update.effectType = 'extra‑safe‑click';
      else if (/mine/i.test(doc.name))        update.effectType = 'mine‑reduction';
      else if (/luck|clover/i.test(doc.name)) update.effectType = 'slots‑luck';
    }

    // 3. Fill in missing 'effectValue'
    if (!doc.effectValue) {
      update.effectValue =
        update.effectType === 'reward‑multiplier' ? 1.1 :
        update.effectType === 'cosmetic'          ? 1   :
        1;
    }

    if (Object.keys(update).length)
      bulk.find({ _id: doc._id }).updateOne({ $set: update });
  });

  if (bulk.length) {
    const res = await bulk.execute();
    console.log(`Migrated ${res.nModified} StoreItem docs`);
  } else {
    console.log('No StoreItem updates needed.');
  }

  // 4. Ensure every user has an activeEffects array
  const upd = await User.updateMany(
    { activeEffects: { $exists: false } },
    { $set: { activeEffects: [] } }
  );
  console.log(`Patched ${upd.modifiedCount} user docs with activeEffects: []`);

  process.exit();
})();