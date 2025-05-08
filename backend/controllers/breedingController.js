const Critter       = require('../models/Critter');
const PendingBreed  = require('../models/PendingBreed');
const UserInventory = require('../models/UserInventory');
const User          = require('../models/User');

const RARITY_ORDER  = ['Common','Uncommon','Rare','Legendary','Mythical'];
const CritterSpecies= require('../models/CritterSpecies');

// dynamic durations by rarity
const BREED_DURATIONS = {
  Common:    6 * 60*60*1000,   // 6h
  Uncommon: 12 * 60*60*1000,   // 12h
  Rare:     24 * 60*60*1000,   // 24h
  Legendary:48 * 60*60*1000,   // 48h
  Mythical: 96 * 60*60*1000    // 96h
};

const POST_HATCH_CD = 24 * 60*60*1000; // 24h

const PET_COST    = 500;
const GOLD_FACTOR = 10;

// pick half of an array at random
function pickHalf(arr=[]) {
  const n = Math.ceil(arr.length/2), out = [], tmp=[...arr];
  while(out.length < n && tmp.length){
    out.push(tmp.splice(Math.floor(Math.random()*tmp.length),1)[0]);
  }
  return out;
}

// combine parent names + generation
function makeChildName(a,b,gen){
  const hA = Math.ceil(a.length/2),
        hB = Math.floor(b.length/2);
  return `${a.slice(0,hA)}${b.slice(hB)}-G${gen}`;
}

// 1) POST /critters/breed
exports.breedCritters = async (req, res) => {
  const userId = req.user._id;
  const { parentA, parentB, paymentMethod='pet' } = req.body;
  if(parentA===parentB) return res.status(400).json({ error:'Must pick two different parents.' });

  // 1) load parents
  const [a,b] = await Promise.all([
    Critter.findOne({_id:parentA,ownerId:userId}),
    Critter.findOne({_id:parentB,ownerId:userId})
  ]);
  if(!a||!b) return res.status(404).json({ error:'Parent not found.' });

  const now = Date.now();
  // 2) enforce in-progress & post-hatch cooldowns
  for(const p of [a,b]) {
    if(p.breeding?.hatchAt && now < p.breeding.hatchAt) {
      return res.status(400).json({ error:`${p.variant||p.species} is already breeding.` });
    }
    if(p.lastHatchedAt && now - new Date(p.lastHatchedAt) < POST_HATCH_CD) {
      return res.status(400).json({ error:`${p.variant||p.species} needs more rest.` });
    }
  }

  // 3) charge fee
  const inv  = await UserInventory.findOne({ userId });
  const user = await User.findById(userId);
  const goldCost = PET_COST * GOLD_FACTOR;
  if(paymentMethod==='gold'){
    if(user.balance < goldCost) return res.status(400).json({ error:'Not enough gold.' });
    user.balance -= goldCost;
    await user.save();
  } else {
    if(!inv || inv.resources.coins < PET_COST)
      return res.status(400).json({ error:'Not enough pet coins.' });
    inv.resources.coins -= PET_COST;
    await inv.save();
  }

  // 4) determine child rarity = lower parent rarity
  const idxA = RARITY_ORDER.indexOf(a.rarity);
  const idxB = RARITY_ORDER.indexOf(b.rarity);
  const childRarity = RARITY_ORDER[Math.min(idxA, idxB)];

  // 5) pick a **different** species from CritterSpecies of that rarity
  const speciesDocs = await CritterSpecies.find({ baseRarity: childRarity }).lean();
  const pool = speciesDocs
    .map(d => d.species)
    .filter(name => name !== a.species && name !== b.species);
  let childSpecies;
  if(pool.length) {
    childSpecies = pool[Math.floor(Math.random() * pool.length)];
  } else {
    // fallback: allow any if exclusions exhausted
    childSpecies = speciesDocs[Math.floor(Math.random() * speciesDocs.length)].species;
  }

  // 6) mix traits 50/50
  const ta = Object.keys(a.traits||{});
  const tb = Object.keys(b.traits||{});
  const mixed = Array.from(new Set([...pickHalf(ta), ...pickHalf(tb)]));
  const childTraits = Object.fromEntries(mixed.map(t=>[t,true]));

  // 7) compute generation & variant name
  const generation = Math.max(a.generation, b.generation) + 1;
  const variant    = makeChildName(a.variant||a.species, b.variant||b.species, generation);

  // 8) compute hatch time = now + max(parent duration)
  const durA = BREED_DURATIONS[a.rarity] || BREED_DURATIONS.Common;
  const durB = BREED_DURATIONS[b.rarity] || BREED_DURATIONS.Common;
  const hatchAt = new Date(now + Math.max(durA, durB));

  // 9) create pending egg
  const egg = await PendingBreed.create({
    userId,
    parents: [a._id, b._id],
    child:   { species: childSpecies, variant, generation, rarity:childRarity, traits:childTraits },
    hatchAt
  });

  // 10) mark parents as breeding
  a.breeding = { start: new Date(now), hatchAt };
  b.breeding = { start: new Date(now), hatchAt };
  await Promise.all([a.save(), b.save()]);

  res.status(201).json({
    message:    'Breeding started!',
    egg,
    newBalance:  paymentMethod==='gold' ? user.balance : undefined,
    newPetCoins: paymentMethod==='pet'  ? inv.resources.coins : undefined
  });
};


// 2) GET /eggs
exports.listEggs = async (req, res) => {
  const eggs = await PendingBreed.find({
    userId: req.user._id,
    hatched: false
  }).sort('hatchAt');
  res.json(eggs);
};

// 3) POST /eggs/:id/hatch
exports.hatchEgg = async (req, res) => {
  const egg = await PendingBreed.findOne({
    _id: req.params.id,
    userId: req.user._id,
    hatched: false
  });
  if(!egg) return res.status(404).json({ error:'Egg not found.' });

  const now = Date.now();
  if(now < egg.hatchAt.getTime()){
    return res.status(400).json({ error:'Not ready to hatch.' });
  }

  // create the real critter
  const child = await Critter.create({
    ownerId: egg.userId,
    species: egg.child.species,
    variant: egg.child.variant,
    rarity:  egg.child.rarity,
    traits:  egg.child.traits,
    parents: egg.parents,
    generation: egg.child.generation
  });

  // clear breeding & set lastHatchedAt on parents
  await Critter.updateMany(
    { _id: { $in: egg.parents } },
    {
      $unset: { breeding: "" },
      $set:   { lastHatchedAt: new Date(now) }
    }
  );

  // mark egg hatched
  egg.hatched = true;
  await egg.save();

  res.json({ message:'Hatched!', child });
};
