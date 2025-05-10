require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose  = require('mongoose');
const StoreItem = require('../models/StoreItem');

/* — the same catalogue — */
const items = [
  /* Slots‑Luck */
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

  /* Extra‑Safe Click */
  { name:'Safety Helmet', emoji:'⛑️', type:'power-up', effect:'+1 extra safe click',
    effectType:'extra-safe-click', effectValue:1, price:10000, consumable:true, stock:3,
     description:'Wear this to survive one extra click in Minefield.' },

  // { name:'Guardian Shield', emoji:'🛡️', type:'power-up', effect:'+2 extra safe clicks',
  //   effectType:'extra-safe-click', effectValue:2, price:7000, consumable:true, stock:2,
  //    description:'A protective shield granting two extra safe clicks.' },

  // { name:'Eagle Eye Goggles', emoji:'🦅', type:'power-up', effect:'+3 extra safe clicks',
  //   effectType:'extra-safe-click', effectValue:3, price:15000, consumable:true, stock:1,
  //    description:'See through danger for three guaranteed safe clicks.' },

  // { name:'Divine Protection', emoji:'🕊️', type:'power-up', effect:'+5 extra safe clicks',
  //   effectType:'extra-safe-click', effectValue:5, price:25000, consumable:true, stock:0,
  //    description:'A heavenly blessing: five extra safe clicks.' },

  /* Mine‑Reduction */
  { name:'Mine Sweeper', emoji:'🧹', type:'power-up', effect:'–3 mines at start',
    effectType:'mine-reduction', effectValue:3, price:10000, consumable:true, stock:3,
     description:'Clear three mines before you even begin.' },

  // { name:'Ground Scan', emoji:'📡', type:'power-up', effect:'–5 mines at start',
  //   effectType:'mine-reduction', effectValue:5, price:20000, consumable:true, stock:2,
  //    description:'Scan and remove five mines from the field.' },

  // { name:'Mine Nullifier', emoji:'💥', type:'power-up', effect:'–7 mines at start',
  //   effectType:'mine-reduction', effectValue:7, price:50000, consumable:true, stock:1,
  //    description:'Nullify seven mines instantly.' },

  // { name:'Terraformer', emoji:'🌱', type:'power-up', effect:'–10 mines at start',
  //   effectType:'mine-reduction', effectValue:10, price:100000, consumable:true, stock:0,
  //    description:'Re‑shape the ground to remove ten mines.' },

  /* Reward‑Multiplier Badges */
  { name:'VIP Multiplier', emoji:'💎', type:'badge', effect:'+10% on all payouts',
    effectType:'reward-multiplier', effectValue:1.1, price:5500, consumable:false, stock:5,
     description:'Permanent 10% bonus on every coin reward.' },

  { name:'Silver Bonus', emoji:'🥈', type:'badge', effect:'+20% on all payouts',
    effectType:'reward-multiplier', effectValue:1.2, price:12000, consumable:false, stock:3,
     description:'Permanent 20% bonus on every coin reward.' },

  { name:'Golden Bonus', emoji:'🥇', type:'badge', effect:'+30% on all payouts',
    effectType:'reward-multiplier', effectValue:1.3, price:20000, consumable:false, stock:2,
     description:'Permanent 30% bonus on every coin reward.' },

  { name:'Platinum Booster', emoji:'🏆', type:'badge', effect:'+50% on all payouts',
    effectType:'reward-multiplier', effectValue:1.5, price:50000, consumable:false, stock:1,
     description:'Permanent 50% bonus on every coin reward.' }
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  for (const item of items) {
    await StoreItem.findOneAndUpdate(
      { name: item.name },   // query
      item,                  // data to set
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`Upserted ${items.length} items ✅`);
  process.exit();
})();
