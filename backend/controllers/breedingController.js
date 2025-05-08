const Critter       = require('../models/Critter');
const PendingBreed  = require('../models/PendingBreed');
const UserInventory = require('../models/UserInventory');
const User          = require('../models/User');

const RARITY_ORDER  = ['Common','Uncommon','Rare','Legendary','Mythical'];

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
  if(parentA===parentB)
    return res.status(400).json({ error:'Must pick two different parents.' });

  // load parents
  const [a,b] = await Promise.all([
    Critter.findOne({_id:parentA,ownerId:userId}),
    Critter.findOne({_id:parentB,ownerId:userId})
  ]);
  if(!a||!b) return res.status(404).json({ error:'Parent not found.' });

  const now = Date.now();

  // enforce existing breed‐in‐progress
  for(const p of [a,b]){
    if(p.breeding?.hatchAt && now < p.breeding.hatchAt){
      return res.status(400).json({ error:`${p.variant||p.species} is already breeding.` });
    }
    // enforce post‐hatch 1d cooldown
    if(p.lastHatchedAt && now - new Date(p.lastHatchedAt) < POST_HATCH_CD){
      return res.status(400).json({ 
        error:`${p.variant||p.species} needs more rest.` 
      });
    }
  }

  // charge fee
  const inv  = await UserInventory.findOne({ userId });
  const user = await User.findById(userId);
  const goldCost = PET_COST * GOLD_FACTOR;
  if(paymentMethod==='gold'){
    if(user.balance < goldCost) 
      return res.status(400).json({ error:'Not enough gold.' });
    user.balance -= goldCost;
    await user.save();
  } else {
    if(!inv || inv.resources.coins < PET_COST)
      return res.status(400).json({ error:'Not enough pet coins.' });
    inv.resources.coins -= PET_COST;
    await inv.save();
  }

  // child rarity = lower parent rarity
  const idxA = RARITY_ORDER.indexOf(a.rarity);
  const idxB = RARITY_ORDER.indexOf(b.rarity);
  const childRarity = RARITY_ORDER[Math.min(idxA,idxB)];

  // species pick
  const species = (childRarity===a.rarity && childRarity===b.rarity)
    ? (Math.random()<0.5 ? a.species : b.species)
    : (idxA<idxB ? a.species : b.species);

  // mixed traits
  const mixedKeys = Array.from(new Set([
    ...pickHalf(Object.keys(a.traits||{})),
    ...pickHalf(Object.keys(b.traits||{}))
  ]));
  const childTraits = Object.fromEntries(mixedKeys.map(t=>[t,true]));

  // generation & variant
  const generation = Math.max(a.generation, b.generation) + 1;
  const variant    = makeChildName(a.variant||a.species, b.variant||b.species, generation);

  // compute hatchAt = now + max(parent durations)
  const durA = BREED_DURATIONS[a.rarity] || BREED_DURATIONS.Common;
  const durB = BREED_DURATIONS[b.rarity] || BREED_DURATIONS.Common;
  const hatchAt = new Date(now + Math.max(durA, durB));

  //  create egg
  const egg = await PendingBreed.create({
    userId,
    parents:    [a._id, b._id],
    child:      { species, variant, generation, rarity:childRarity, traits:childTraits },
    hatchAt
  });

  // mark parents as breeding
  a.breeding = { start: new Date(now), hatchAt };
  b.breeding = { start: new Date(now), hatchAt };
  await Promise.all([a.save(), b.save()]);

  res.status(201).json({
    message: 'Breeding started!',
    egg,
    newBalance: paymentMethod==='gold' ? user.balance : undefined,
    newPetCoins: paymentMethod==='pet' ? inv.resources.coins : undefined
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
