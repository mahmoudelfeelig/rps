const cron = require('node-cron');
const Critter = require('../models/Critter');
const UserInventory = require('../models/UserInventory');
const traitEffects = require('../utils/traitEffects');

async function generateResources() {
  const critters = await Critter.find({});

  const resourceMap = {};

  for (const c of critters) {
    const userId = c.ownerId.toString();
    if (!resourceMap[userId]) {
      resourceMap[userId] = { coins: 0, food: {} };
    }

    let resources = { coins: 0, food: {} };

    // First apply generators (e.g. forager, gardener)
    for (const trait of c.traits) {
      if (traitEffects[trait]?.generate) {
        const result = traitEffects[trait].generate();
        for (const key in result) {
          if (key === 'coins') {
            resources.coins += result[key];
          } else if (key === 'food') {
            for (const [item, amount] of Object.entries(result.food)) {
              resources.food[item] = (resources.food[item] || 0) + amount;
            }
          }
        }
      }
    }

    // Then apply modifiers (e.g. resourceful)
    for (const trait of c.traits) {
      if (traitEffects[trait]?.modifyGeneration) {
        resources = traitEffects[trait].modifyGeneration(resources);
      }
    }

    // Aggregate to user
    resourceMap[userId].coins += resources.coins;
    for (const [item, amount] of Object.entries(resources.food)) {
      resourceMap[userId].food[item] = (resourceMap[userId].food[item] || 0) + amount;
    }
  }

  // Apply to DB
  for (const [userId, { coins, food }] of Object.entries(resourceMap)) {
    const update = {
      $inc: {
        'resources.coins': coins,
        ...Object.fromEntries(Object.entries(food).map(([k, v]) => [`resources.food.${k}`, v]))
      }
    };

    await UserInventory.findOneAndUpdate({ userId }, update, { upsert: true });
  }

  console.log(`[${new Date().toISOString()}] ✅ Passive resources distributed.`);
}

cron.schedule('*/15 * * * *', generateResources); // every 15 minutes

module.exports = generateResources;
