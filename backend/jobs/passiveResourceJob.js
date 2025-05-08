// passiveResourceJob.js
const cron           = require('node-cron');
const Critter        = require('../models/Critter');
const UserInventory  = require('../models/UserInventory');
const traitEffects   = require('../utils/traitEffects');

async function generateResources() {
  const critters   = await Critter.find({});
  const resourceMap = {};

  for (const c of critters) {
    const userId = c.ownerId.toString();
    resourceMap[userId] ||= { coins: 0, food: {} };

    // start fresh for this critter
    let resources = { coins: 0, food: {} };

    // 1) generators
    for (const traitName of Object.keys(c.traits || {})) {
      const effect = traitEffects[traitName];
      if (effect?.generate) {
        const result = effect.generate();
        if (result.coins) resources.coins += result.coins;
        if (result.food) {
          for (const [item, amt] of Object.entries(result.food)) {
            resources.food[item] = (resources.food[item] || 0) + amt;
          }
        }
      }
    }

    // 2) modifiers
    for (const traitName of Object.keys(c.traits || {})) {
      const effect = traitEffects[traitName];
      if (effect?.modifyGeneration) {
        resources = effect.modifyGeneration(resources);
      }
    }

    // 3) aggregate per user
    resourceMap[userId].coins += resources.coins;
    for (const [item, amt] of Object.entries(resources.food)) {
      resourceMap[userId].food[item] = (resourceMap[userId].food[item] || 0) + amt;
    }
  }

  // 4) write back
  for (const [userId, { coins, food }] of Object.entries(resourceMap)) {
    const inc = { 'resources.coins': coins };
    for (const [item, amt] of Object.entries(food)) {
      inc[`resources.food.${item}`] = amt;
    }
    await UserInventory.findOneAndUpdate({ userId }, { $inc: inc }, { upsert: true });
  }

  console.log(`[${new Date().toISOString()}] ✅ Passive resources distributed.`);
}

cron.schedule('*/15 * * * *', generateResources);
module.exports = generateResources;
