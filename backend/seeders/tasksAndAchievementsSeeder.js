require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose    = require('mongoose');
const Task        = require('../models/Task');
const Achievement = require('../models/Achievement');

const now = Date.now();
const ONE_DAY  = 24*3600*1000;
const ONE_WEEK = 7*ONE_DAY;

const tasks = [
  // — Daily (7) —
  {
    title:      'Place 5 Bets',
    description:'Stake coins in 5 different bets.',
    emoji:      '🎲',
    reward:     100,
    type:       'daily',
    goalType:   'betsPlaced',
    goalAmount: 5,
    expiresAt:  new Date(now + ONE_DAY)
  },
  {
    title:      'Win 1 Bet',
    description:'Correctly predict the outcome of 1 bet.',
    emoji:      '🎯',
    reward:     150,
    type:       'daily',
    goalType:   'betsWon',
    goalAmount: 1,
    expiresAt:  new Date(now + ONE_DAY)
  },
  {
    title:      'Make 1 Store Purchase',
    description:'Buy at least one item from the store.',
    emoji:      '🛍️',
    reward:     80,
    type:       'daily',
    goalType:   'storePurchases',
    goalAmount: 1,
    expiresAt:  new Date(now + ONE_DAY)
  },
  {
    title:      'Log In Today',
    description:'Simply log in to your account today.',
    emoji:      '👋',
    reward:     50,
    type:       'daily',
    goalType:   'logins',
    goalAmount: 1,
    expiresAt:  new Date(now + ONE_DAY)
  },
  {
    title:      'Win 1 Casino Round',
    description:'Walk away a winner in Casino once.',
    emoji:      '🎰',
    reward:     120,
    type:       'daily',
    goalType:   'casinoWins',
    goalAmount: 1,
    expiresAt:  new Date(now + ONE_DAY)
  },
  {
    title:      'Solve 1 Puzzle',
    description:'Crack any Puzzle Rush puzzle once.',
    emoji:      '🧩',
    reward:     100,
    type:       'daily',
    goalType:   'puzzleWins',
    goalAmount: 1,
    expiresAt:  new Date(now + ONE_DAY)
  },
  {
    title:      'Click Frenzy 20 Times',
    description:'Earn coins by clicking 20 times in Frenzy.',
    emoji:      '🐭',
    reward:     75,
    type:       'daily',
    goalType:   'clickFrenzyClicks',
    goalAmount: 20,
    expiresAt:  new Date(now + ONE_DAY)
  },

  // — Weekly (7) —
  {
    title:      'Place 50 Bets',
    description:'Stake coins in 50 different bets over the week.',
    emoji:      '💼',
    reward:     1000,
    type:       'weekly',
    goalType:   'betsPlaced',
    goalAmount: 50,
    expiresAt:  new Date(now + ONE_WEEK)
  },
  {
    title:      'Win 10 Bets',
    description:'Correctly predict the outcome of 10 bets.',
    emoji:      '🥈',
    reward:     1200,
    type:       'weekly',
    goalType:   'betsWon',
    goalAmount: 10,
    expiresAt:  new Date(now + ONE_WEEK)
  },
  {
    title:      'Make 5 Store Purchases',
    description:'Buy five items from the store.',
    emoji:      '🛒',
    reward:     600,
    type:       'weekly',
    goalType:   'storePurchases',
    goalAmount: 5,
    expiresAt:  new Date(now + ONE_WEEK)
  },
  {
    title:      'Log In 7 Days',
    description:'Log in on seven different days.',
    emoji:      '📅',
    reward:     700,
    type:       'weekly',
    goalType:   'logins',
    goalAmount: 7,
    expiresAt:  new Date(now + ONE_WEEK)
  },
  {
    title:      'Win 3 Minefield Rounds',
    description:'Survive & cash out safely 3 times in Minefield.',
    emoji:      '🚶',
    reward:     900,
    type:       'weekly',
    goalType:   'minefieldWins',
    goalAmount: 3,
    expiresAt:  new Date(now + ONE_WEEK)
  },
  {
    title:      'Win 3 RPS Matches',
    description:'Defeat three opponents in Rock-Paper-Scissors.',
    emoji:      '✊',
    reward:     800,
    type:       'weekly',
    goalType:   'rpsWins',
    goalAmount: 3,
    expiresAt:  new Date(now + ONE_WEEK)
  },
  {
    title:      'Own 5 Items',
    description:'Have at least five distinct items in your inventory.',
    emoji:      '📦',
    reward:     500,
    type:       'weekly',
    goalType:   'itemsOwned',
    goalAmount: 5,
    expiresAt:  new Date(now + ONE_WEEK)
  },

  // — Bonus / One-Off (6) —
  {
    title:      'Place 100 Bets',
    description:'Stake coins in 100 different bets total.',
    emoji:      '🌟',
    reward:     3000,
    type:       'bonus',
    goalType:   'betsPlaced',
    goalAmount: 100
  },
  {
    title:      'Win 20 Bets',
    description:'Correctly predict the outcome of 20 bets.',
    emoji:      '🏆',
    reward:     3500,
    type:       'bonus',
    goalType:   'betsWon',
    goalAmount: 20
  },
  {
    title:      'Make 10 Purchases',
    description:'Buy ten items from the store.',
    emoji:      '💳',
    reward:     2000,
    type:       'bonus',
    goalType:   'storePurchases',
    goalAmount: 10
  },
  {
    title:      'Log In 30 Days',
    description:'Log in on 30 different days.',
    emoji:      '🔒',
    reward:     2500,
    type:       'bonus',
    goalType:   'logins',
    goalAmount: 30
  },
  {
    title:      'Complete 20 Tasks',
    description:'Finish twenty tasks over all time.',
    emoji:      '✅',
    reward:     2200,
    type:       'bonus',
    goalType:   'tasksCompleted',
    goalAmount: 20
  },
  {
    title:      'Solve 50 Puzzles',
    description:'Crack fifty Puzzle Rush puzzles.',
    emoji:      '🧠',
    reward:     1800,
    type:       'bonus',
    goalType:   'puzzleWins',
    goalAmount: 50
  }
];

const achievements = [
  // — betsPlaced (3) —
  { title:'Bronze Bettor',      description:'Place 10 bets.',      icon:'🎲',  criteria:'betsPlaced', threshold:10,  reward:500 },
  { title:'Silver Bettor',      description:'Place 50 bets.',      icon:'🎰',  criteria:'betsPlaced', threshold:50,  reward:1200 },
  { title:'Gold Bettor',        description:'Place 100 bets.',     icon:'💎',  criteria:'betsPlaced', threshold:100, reward:2500 },

  // — betsWon (3) —
  { title:'Beginner Winner',    description:'Win 5 bets.',         icon:'🥉',  criteria:'betsWon',    threshold:5,   reward:800 },
  { title:'Skilled Winner',     description:'Win 20 bets.',        icon:'🥈',  criteria:'betsWon',    threshold:20,  reward:2000 },
  { title:'Master Winner',      description:'Win 50 bets.',        icon:'🥇',  criteria:'betsWon',    threshold:50,  reward:5000 },

  // — storePurchases (2) —
  { title:'Shop Novice',        description:'Buy 3 items.',        icon:'🛍️', criteria:'storePurchases',threshold:3,  reward:300 },
  { title:'Shopaholic',         description:'Buy 10 items.',       icon:'💼', criteria:'storePurchases',threshold:10, reward:1500 },

  // — logins (2) —
  { title:'Welcome Back',       description:'Log in 5 days.',      icon:'👋',  criteria:'logins',     threshold:5,  reward:200 },
  { title:'Loyal User',         description:'Log in 30 days.',     icon:'🔒',  criteria:'logins',     threshold:30, reward:1200 },

  // — tasksCompleted (2) —
  { title:'Task Novice',        description:'Complete 5 tasks.',   icon:'✅',  criteria:'tasksCompleted',threshold:5, reward:500 },
  { title:'Task Master',        description:'Complete 20 tasks.',  icon:'🏆',  criteria:'tasksCompleted',threshold:20,reward:2500 },

  // — minefieldWins (2) —
  { title:'Safe Stepper',       description:'Win 3 Minefield.',    icon:'🚶',  criteria:'minefieldWins', threshold:3, reward:700 },
  { title:'Field Champion',     description:'Win 10 Minefield.',   icon:'🏅',  criteria:'minefieldWins', threshold:10,reward:2000 },

  // — puzzleWins (2) —
  { title:'Puzzle Solver I',    description:'Solve 5 puzzles.',    icon:'🧩',  criteria:'puzzleWins',    threshold:5,  reward:600 },
  { title:'Puzzle Solver II',   description:'Solve 20 puzzles.',   icon:'🧠',  criteria:'puzzleWins',    threshold:20, reward:1800 },

  // — rpsWins (2) —
  { title:'Rock Novice',        description:'Win 3 RPS matches.',   icon:'✊',  criteria:'rpsWins',       threshold:3,  reward:400 },
  { title:'Paper Master',       description:'Win 10 RPS matches.',  icon:'📄',  criteria:'rpsWins',       threshold:10, reward:1200 }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  console.log('📝 Seeding Tasks…');
  for (let t of tasks) {
    await Task.findOneAndUpdate(
      { title: t.title },
      { $set: t },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  console.log('🏅 Seeding Achievements…');
  for (let a of achievements) {
    await Achievement.findOneAndUpdate(
      { title: a.title },
      { $set: a },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  console.log('✅ Seed complete.');
  process.exit(0);
}

seed().catch(err=>{
  console.error(err);
  process.exit(1);
});
