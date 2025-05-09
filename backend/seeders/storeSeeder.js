require('dotenv').config();
const mongoose   = require('mongoose');
const StoreItem  = require('../models/StoreItem');

const items = [
  { name:'Lucky Clover', type:'power-up', emoji:'🍀',
    effectType:'slots‑luck',     effectValue:15,  price:2500,
    consumable:true, stock:50,  image:'clover.png',
    description:'+15 % win chance in Slots (one spin)' },
  { name:'Safety Helmet', type:'power-up', emoji:'⛑️',
    effectType:'extra‑safe‑click', effectValue:1, price:3000,
    consumable:true, stock:50,  image:'helmet.png',
    description:'Start Mines with one extra safe‑click' },
  { name:'Mine Sweeper',  type:'power-up', emoji:'🧹',
    effectType:'mine‑reduction',  effectValue:3, price:4000,
    consumable:true, stock:30,  image:'sweeper.png',
    description:'Remove 3 mines before the game begins' },
  { name:'VIP Multiplier',type:'badge', emoji:'💎',
    effectType:'reward‑multiplier', effectValue:1.1, price:5500,
    consumable:false, stock:10,  image:'vip.png',
    description:'10 % bonus on every coin payout (permanent)' },
];

(async () => {
  // NEVER WIPE OR DELETE STORE ITEMS
  await mongoose.connect(process.env.MONGO_URI);
  await StoreItem.insertMany(items);
  console.log('Seeded store!');
  process.exit();
})();
