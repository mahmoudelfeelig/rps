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

  { name:'Loaded Token', emoji:'🪙', type:'power-up', effect:'+35% win chance in Slots',
    effectType:'slots-luck', effectValue:35, price:8500, consumable:true, stock:1,
     description:'A high-risk charm for players chasing a stronger slots edge.' },

  
  { name:'Safety Helmet', emoji:'⛑️', type:'power-up', effect:'+1 extra safe click',
    effectType:'extra-safe-click', effectValue:1, price:10000, consumable:true, stock:1,
     description:'Wear this to survive one extra click in Minefield.' },

  { name:'Scout Drone', emoji:'🛰️', type:'power-up', effect:'+2 extra safe clicks',
    effectType:'extra-safe-click', effectValue:2, price:22000, consumable:true, stock:1,
     description:'Scans ahead and gives Minefield players more room to maneuver.' },




  
  { name:'Mine Sweeper', emoji:'🧹', type:'power-up', effect:'–3 mines at start',
    effectType:'mine-reduction', effectValue:3, price:10000, consumable:true, stock:2,
     description:'Clear three mines before you even begin.' },

  { name:'Signal Jammer', emoji:'📡', type:'power-up', effect:'–5 mines at start',
    effectType:'mine-reduction', effectValue:5, price:26000, consumable:true, stock:1,
     description:'Disrupts a larger mine cluster before a Minefield round starts.' },




  
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
     description:'Permanent 50% bonus on every coin reward.' },

  { name:'Vault Contract', emoji:'📜', type:'badge', effect:'+75% on one payout',
    effectType:'reward-multiplier', effectValue:1.75, price:75000, consumable:true, stock:1,
     description:'A premium payout multiplier for a major claim or win.' },

  { name:'Market Catalyst', emoji:'📈', type:'badge', effect:'+100% on one payout',
    effectType:'reward-multiplier', effectValue:2, price:125000, consumable:true, stock:1,
     description:'Doubles one eligible coin reward when timing matters.' },

  { name:'Pocket Clover', emoji:'🍀', type:'power-up', effect:'+8% win chance in Slots',
    effectType:'slots-luck', effectValue:8, price:1200, consumable:true, stock:14,
     description:'A small slots edge for low-stakes runs.' },

  { name:'Table Token', emoji:'🪙', type:'power-up', effect:'+12% win chance in Slots',
    effectType:'slots-luck', effectValue:12, price:2100, consumable:true, stock:8,
     description:'A practical token for steady slots sessions.' },

  { name:'Blue Chip', emoji:'🔷', type:'power-up', effect:'+18% win chance in Slots',
    effectType:'slots-luck', effectValue:18, price:4200, consumable:true, stock:4,
     description:'A stronger slots modifier with limited hourly supply.' },

  { name:'House Marker', emoji:'🎟️', type:'power-up', effect:'+30% win chance in Slots',
    effectType:'slots-luck', effectValue:30, price:6800, consumable:true, stock:2,
     description:'A premium slots marker for bigger attempts.' },

  { name:'Tripwire Kit', emoji:'🧰', type:'power-up', effect:'+1 extra safe click',
    effectType:'extra-safe-click', effectValue:1, price:7600, consumable:true, stock:3,
     description:'Adds one mistake buffer to a Minefield round.' },

  { name:'Pathfinder Map', emoji:'🗺️', type:'power-up', effect:'+2 extra safe clicks',
    effectType:'extra-safe-click', effectValue:2, price:18500, consumable:true, stock:2,
     description:'Marks safer Minefield routes before pressure builds.' },

  { name:'Survey Beacon', emoji:'📍', type:'power-up', effect:'+3 extra safe clicks',
    effectType:'extra-safe-click', effectValue:3, price:36000, consumable:true, stock:1,
     description:'A high-tier Minefield safety tool for aggressive cashouts.' },

  { name:'Wire Cutter', emoji:'✂️', type:'power-up', effect:'-2 mines at start',
    effectType:'mine-reduction', effectValue:2, price:7200, consumable:true, stock:4,
     description:'Removes two mines before the board opens.' },

  { name:'Grid Scanner', emoji:'📟', type:'power-up', effect:'-4 mines at start',
    effectType:'mine-reduction', effectValue:4, price:18000, consumable:true, stock:2,
     description:'Clears a wider Minefield cluster before the first click.' },

  { name:'Clearance Permit', emoji:'🪪', type:'power-up', effect:'-7 mines at start',
    effectType:'mine-reduction', effectValue:7, price:44000, consumable:true, stock:1,
     description:'A rare permit that heavily reduces Minefield danger.' },

  { name:'Bronze Contract', emoji:'📄', type:'badge', effect:'+5% on all payouts',
    effectType:'reward-multiplier', effectValue:1.05, price:2800, consumable:true, stock:6,
     description:'A starter payout multiplier for early progression.' },

  { name:'Copper Contract', emoji:'📄', type:'badge', effect:'+15% on all payouts',
    effectType:'reward-multiplier', effectValue:1.15, price:9000, consumable:true, stock:3,
     description:'A mid-tier payout boost for regular play.' },

  { name:'Black Card', emoji:'💳', type:'badge', effect:'+40% on all payouts',
    effectType:'reward-multiplier', effectValue:1.4, price:34000, consumable:true, stock:1,
     description:'A rare multiplier for players pushing larger rewards.' },

  { name:'Founder Pass', emoji:'🎫', type:'badge', effect:'+60% on one payout',
    effectType:'reward-multiplier', effectValue:1.6, price:62000, consumable:true, stock:1,
     description:'A scarce pass for a major reward claim.' },

  { name:'Chrome Visor', emoji:'🕶️', type:'cosmetic', effect:'Cosmetic profile item',
    effectType:'cosmetic', effectValue:0, price:1500, consumable:false, stock:10,
     description:'A clean profile cosmetic with a low-key arcade look.' },

  { name:'Signal Jacket', emoji:'🧥', type:'cosmetic', effect:'Cosmetic profile item',
    effectType:'cosmetic', effectValue:0, price:3200, consumable:false, stock:6,
     description:'A profile cosmetic for players who want a sharper loadout.' },

  { name:'Neon Crown', emoji:'👑', type:'cosmetic', effect:'Cosmetic profile item',
    effectType:'cosmetic', effectValue:0, price:12000, consumable:false, stock:2,
     description:'A limited cosmetic for high-visibility profiles.' }
];

async function runStoreSeeder() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  let upsertedCount = 0;
  for (const item of items) {
    const existing = await StoreItem.findOne({ name: item.name });

    if (!existing) {
      await StoreItem.create({ ...item, maxStock: item.stock });
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
            maxStock:    item.stock,
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
