require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const StoreItem = require('../models/StoreItem');
const User = require('../models/User');

const items = [
  
  { name:'Fortune Cookie', emoji:'🥠', type:'power-up', effect:'+10% win chance in Slots',
    effectType:'slots-luck', effectValue:10, price:1800, consumable:true, stock:10,
    description:'A sweet treat that brings you gentle luck for one spin.' },

  { name:'Lucky Clover', emoji:'🍀', type:'power-up', effect:'+15% win chance in Slots',
    effectType:'slots-luck', effectValue:15, price:2500, consumable:true, stock:5,
     description:'Boost your slots luck for the next spin.' },

  { name:'Ladybug Charm', emoji:'🐞', type:'power-up', effect:'+20% win chance in Slots',
    effectType:'slots-luck', effectValue:20, price:3500, consumable:true, stock:2,
     description:'Carry this lucky insect to improve your odds.' },

  { name:'Rainbow Dice', emoji:'🎲', type:'power-up', effect:'+25% win chance in Slots',
    effectType:'slots-luck', effectValue:25, price:5000, consumable:true, stock:1,
     description:'Colorful dice that tilt fortune in your favor.' },

  
  { name:'Safety Helmet', emoji:'⛑️', type:'power-up', effect:'+1 extra safe click',
    effectType:'extra-safe-click', effectValue:1, price:10000, consumable:true, stock:1,
     description:'Wear this to survive one extra click in Minefield.' },




  
  { name:'Mine Sweeper', emoji:'🧹', type:'power-up', effect:'–3 mines at start',
    effectType:'mine-reduction', effectValue:3, price:10000, consumable:true, stock:2,
     description:'Clear three mines before you even begin.' },




  
  { name:'VIP Multiplier', emoji:'💎', type:'badge', effect:'+10% on all payouts',
    effectType:'reward-multiplier', effectValue:1.1, price:5500, consumable:true, stock:3,
     description:'Permanent 10% bonus on every coin reward.' },

  { name:'Silver Bonus', emoji:'🥈', type:'badge', effect:'+20% on all payouts',
    effectType:'reward-multiplier', effectValue:1.2, price:12000, consumable:true, stock:2,
     description:'Permanent 20% bonus on every coin reward.' },

  { name:'Golden Bonus', emoji:'🥇', type:'badge', effect:'+30% on all payouts',
    effectType:'reward-multiplier', effectValue:1.3, price:20000, consumable:true, stock:1,
     description:'Permanent 30% bonus on every coin reward.' },

  { name:'Platinum Booster', emoji:'🏆', type:'badge', effect:'+50% on all payouts',
    effectType:'reward-multiplier', effectValue:1.5, price:50000, consumable:true, stock:1,
     description:'Permanent 50% bonus on every coin reward.' }
];

async function runStoreSeeder() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  let upsertedCount = 0;
  for (const item of items) {
    const existing = await StoreItem.findOne({ name: item.name });

    if (!existing) {
      await StoreItem.create(item);
      upsertedCount++;
    } else {
      await StoreItem.updateOne(
        { _id: existing._id },
        {
          $set: {
            emoji:       item.emoji,
            type:        item.type,
            effect:      item.effect,
            effectType:  item.effectType,
            effectValue: item.effectValue,
            price:       item.price,
            consumable:  item.consumable,
            description: item.description,
            active:      true
          }
        }
      );
    }
  }

  await StoreItem.updateMany({}, { $set: { active: true } });

  const validIds = await StoreItem.distinct('_id');
  await User.updateMany(
    {},
    { $pull: { inventory: { item: { $nin: validIds } } } }
  );

  console.log(`✅ Store seeder complete:
  • ${upsertedCount} new items created
  • All store items marked active
  • Orphaned inventory slots removed from users`);
}

if (require.main === module) {
  runStoreSeeder()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = runStoreSeeder;
