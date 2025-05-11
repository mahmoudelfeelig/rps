/**
 * One-time migration:
 *  1) back-fill missing StoreItem fields
 *  2) remove activeEffects from all users (we no longer use it)
 *  3) prune invalid inventory entries
 */
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose  = require('mongoose');
const StoreItem = require('../models/StoreItem');
const User      = require('../models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // ─── 1) Back-fill StoreItem defaults ─────────────────────────────────────
  const bulk = StoreItem.collection.initializeUnorderedBulkOp();
  const items = await StoreItem.find({ active: true });

  items.forEach(doc => {
    const update = {};

    // a) consumable default
    if (doc.consumable === undefined) {
      update.consumable = doc.type !== 'badge';
    }

    // b) effectType default
    if (!doc.effectType) {
      if (doc.type === 'badge')         update.effectType = 'reward-multiplier';
      else if (doc.type === 'cosmetic') update.effectType = 'cosmetic';
      else if (/safe|helmet/i.test(doc.name))  update.effectType = 'extra-safe-click';
      else if (/mine/i.test(doc.name))         update.effectType = 'mine-reduction';
      else if (/luck|clover/i.test(doc.name))  update.effectType = 'slots-luck';
    }

    // c) effectValue default
    if (doc.effectValue === undefined || doc.effectValue === null) {
      switch (update.effectType || doc.effectType) {
        case 'reward-multiplier': update.effectValue = 1.1; break;
        case 'cosmetic':          update.effectValue = 1;   break;
        default:                  update.effectValue = 1;   break;
      }
    }

    if (Object.keys(update).length > 0) {
      bulk.find({ _id: doc._id }).updateOne({ $set: update });
    }
  });

  if (bulk.length) {
    const result = await bulk.execute();
    console.log(`✔️ Migrated ${result.nModified} StoreItem docs`);
  } else {
    console.log('✔️ No StoreItem updates needed');
  }


  // ─── 2) Remove activeEffects from users ─────────────────────────────────
  const rem = await User.updateMany(
    { activeEffects: { $exists: true } },
    { $unset: { activeEffects: "" } }
  );
  console.log(`✔️ Removed activeEffects from ${rem.modifiedCount} User docs`);


  // ─── 3) Prune invalid inventory entries ────────────────────────────────
  // pull out all valid StoreItem _ids
  const validIds = items.map(d => d._id.toString());
  let usersTouched = 0;

  // load users in batches to avoid huge memory spike
  const cursor = User.find().cursor();
  for await (const user of cursor) {
    const origLen = user.inventory.length;
    user.inventory = user.inventory.filter(e => 
      e.item && validIds.includes(e.item.toString())
    );
    if (user.inventory.length !== origLen) {
      await user.save();
      usersTouched++;
    }
  }

  console.log(`✔️ Pruned inventory for ${usersTouched} User docs`);

  process.exit(0);
})();