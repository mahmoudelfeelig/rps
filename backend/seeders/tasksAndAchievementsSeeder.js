require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose    = require('mongoose');
const Task        = require('../models/Task');
const Achievement = require('../models/Achievement');

const now = Date.now();
const ONE_DAY  = 24*3600*1000;
const ONE_WEEK = 7*ONE_DAY;

const tasks = [
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
    goalType:   'puzzleSolves',
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
  {
    title:      'Make 2 Market Trades',
    description:'Buy or sell two market positions.',
    emoji:      '📈',
    reward:     130,
    type:       'daily',
    goalType:   'marketTrades',
    goalAmount: 2,
    expiresAt:  new Date(now + ONE_DAY)
  },
  {
    title:      'Hold 2 Positions',
    description:'Own two active market positions.',
    emoji:      '📊',
    reward:     120,
    type:       'daily',
    goalType:   'portfolioPositions',
    goalAmount: 2,
    expiresAt:  new Date(now + ONE_DAY)
  },

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
  {
    title:      'Make 15 Market Trades',
    description:'Trade actively across the market.',
    emoji:      '📉',
    reward:     900,
    type:       'weekly',
    goalType:   'marketTrades',
    goalAmount: 15,
    expiresAt:  new Date(now + ONE_WEEK)
  },
  {
    title:      'Claim Dividend Income',
    description:'Claim at least 500 coins from dividends.',
    emoji:      '💵',
    reward:     750,
    type:       'weekly',
    goalType:   'dividendsClaimed',
    goalAmount: 500,
    expiresAt:  new Date(now + ONE_WEEK)
  },

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
    goalType:   'puzzleSolves',
    goalAmount: 50
  },
  {
    title:      'Build a Portfolio',
    description:'Hold ten market asset units.',
    emoji:      '🏦',
    reward:     2000,
    type:       'bonus',
    goalType:   'portfolioQuantity',
    goalAmount: 10
  },
  {
    title:      'Reach Prestige',
    description:'Reset once and start with a stronger multiplier.',
    emoji:      '⬆️',
    reward:     5000,
    type:       'bonus',
    goalType:   'prestigeLevel',
    goalAmount: 1
  }
];

const achievements = [
  { title:'Bronze Bettor',      description:'Place 10 bets.',      icon:'🎲',  criteria:'betsPlaced', threshold:10,  reward:500 },
  { title:'Silver Bettor',      description:'Place 50 bets.',      icon:'🎰',  criteria:'betsPlaced', threshold:50,  reward:1200 },
  { title:'Gold Bettor',        description:'Place 100 bets.',     icon:'💎',  criteria:'betsPlaced', threshold:100, reward:2500 },

  { title:'Beginner Winner',    description:'Win 5 bets.',         icon:'🥉',  criteria:'betsWon',    threshold:5,   reward:800 },
  { title:'Skilled Winner',     description:'Win 20 bets.',        icon:'🥈',  criteria:'betsWon',    threshold:20,  reward:2000 },
  { title:'Master Winner',      description:'Win 50 bets.',        icon:'🥇',  criteria:'betsWon',    threshold:50,  reward:5000 },

  { title:'Shop Novice',        description:'Buy 3 items.',        icon:'🛍️', criteria:'storePurchases',threshold:3,  reward:300 },
  { title:'Shopaholic',         description:'Buy 10 items.',       icon:'💼', criteria:'storePurchases',threshold:10, reward:1500 },

  { title:'Welcome Back',       description:'Log in 5 days.',      icon:'👋',  criteria:'logins',     threshold:5,  reward:200 },
  { title:'Loyal User',         description:'Log in 30 days.',     icon:'🔒',  criteria:'logins',     threshold:30, reward:1200 },

  { title:'Task Novice',        description:'Complete 5 tasks.',   icon:'✅',  criteria:'tasksCompleted',threshold:5, reward:500 },
  { title:'Task Master',        description:'Complete 20 tasks.',  icon:'🏆',  criteria:'tasksCompleted',threshold:20,reward:2500 },

  { title:'Safe Stepper',       description:'Win 3 Minefield.',    icon:'🚶',  criteria:'minefieldWins', threshold:3, reward:700 },
  { title:'Field Champion',     description:'Win 10 Minefield.',   icon:'🏅',  criteria:'minefieldWins', threshold:10,reward:2000 },

  { title:'Puzzle Solver I',    description:'Solve 5 puzzles.',    icon:'🧩',  criteria:'puzzleSolves',    threshold:5,  reward:600 },
  { title:'Puzzle Solver II',   description:'Solve 20 puzzles.',   icon:'🧠',  criteria:'puzzleSolves',    threshold:20, reward:1800 },

  { title:'Rock Novice',        description:'Win 3 RPS matches.',   icon:'✊',  criteria:'rpsWins',       threshold:3,  reward:400 },
  { title:'Paper Master',       description:'Win 10 RPS matches.',  icon:'📄',  criteria:'rpsWins',       threshold:10, reward:1200 },
  { title:'Arcade Regular',     description:'Play 25 casino rounds.', icon:'♦️', criteria:'casinoPlays', threshold:25, reward:1000 },
  { title:'Casino Closer',      description:'Win 15 casino rounds.', icon:'♠️', criteria:'casinoWins', threshold:15, reward:2200 },
  { title:'Slot Runner',        description:'Win 10 slot rounds.', icon:'🎰', criteria:'slotsWins', threshold:10, reward:1800 },
  { title:'Frenzy Starter',     description:'Catch 100 frenzy targets.', icon:'⚡', criteria:'clickFrenzyClicks', threshold:100, reward:900 },
  { title:'Frenzy Veteran',     description:'Catch 500 frenzy targets.', icon:'⚡', criteria:'clickFrenzyClicks', threshold:500, reward:3500 },
  { title:'Minefield Specialist', description:'Play 50 Minefield rounds.', icon:'◼️', criteria:'minefieldPlays', threshold:50, reward:1800 },
  { title:'Inventory Builder',  description:'Own 10 store items.', icon:'📦', criteria:'itemsOwned', threshold:10, reward:1600 },

  { title:'RPS Regular',        description:'Play 25 RPS matches.', icon:'✊', criteria:'rpsPlays', threshold:25, reward:900 },
  { title:'RPS Specialist',     description:'Win 25 RPS matches.', icon:'✂️', criteria:'rpsWins', threshold:25, reward:2500 },
  { title:'RPS Champion',       description:'Win 75 RPS matches.', icon:'🏆', criteria:'rpsWins', threshold:75, reward:7500 },

  { title:'Casino Floor',       description:'Play 75 casino rounds.', icon:'♦️', criteria:'casinoPlays', threshold:75, reward:2400 },
  { title:'Casino Heat',        description:'Win 40 casino rounds.', icon:'♣️', criteria:'casinoWins', threshold:40, reward:5200 },
  { title:'Slot Volume',        description:'Play 100 slot rounds.', icon:'🎰', criteria:'slotsPlays', threshold:100, reward:2800 },
  { title:'Slot Closer',        description:'Win 30 slot rounds.', icon:'🎰', criteria:'slotsWins', threshold:30, reward:6000 },

  { title:'Frenzy Operator',    description:'Catch 1 500 frenzy targets.', icon:'⚡', criteria:'clickFrenzyClicks', threshold:1500, reward:9000 },
  { title:'Minefield Veteran',  description:'Win 25 Minefield rounds.', icon:'◼️', criteria:'minefieldWins', threshold:25, reward:6000 },
  { title:'Puzzle Runner',      description:'Solve 75 puzzles.', icon:'🧩', criteria:'puzzleSolves', threshold:75, reward:5500 },
  { title:'Puzzle Architect',   description:'Solve 150 puzzles.', icon:'🧠', criteria:'puzzleSolves', threshold:150, reward:12000 },

  { title:'First Position',     description:'Hold one market position.', icon:'📈', criteria:'portfolioPositions', threshold:1, reward:500 },
  { title:'Diversified Desk',   description:'Hold five market positions.', icon:'📊', criteria:'portfolioPositions', threshold:5, reward:2600 },
  { title:'Market Regular',     description:'Make 25 market trades.', icon:'📉', criteria:'marketTrades', threshold:25, reward:3000 },
  { title:'Market Maker',       description:'Make 100 market trades.', icon:'🏦', criteria:'marketTrades', threshold:100, reward:12000 },
  { title:'Position Builder',   description:'Hold 25 total market units.', icon:'📋', criteria:'portfolioQuantity', threshold:25, reward:4500 },
  { title:'Dividend Start',     description:'Claim 1 000 dividend coins.', icon:'💵', criteria:'dividendsClaimed', threshold:1000, reward:2500 },
  { title:'Dividend Engine',    description:'Claim 10 000 dividend coins.', icon:'💵', criteria:'dividendsClaimed', threshold:10000, reward:15000 },

  { title:'Profit Track',       description:'Win 25 000 gambling coins.', icon:'💰', criteria:'gamblingWon', threshold:25000, reward:4500 },
  { title:'Profit Engine',      description:'Win 100 000 gambling coins.', icon:'💰', criteria:'gamblingWon', threshold:100000, reward:18000 },
  { title:'Risk Taker',         description:'Lose 25 000 gambling coins.', icon:'⚠️', criteria:'gamblingLost', threshold:25000, reward:2000 },

  { title:'Collector II',       description:'Own 25 store items.', icon:'📦', criteria:'itemsOwned', threshold:25, reward:5000 },
  { title:'Collector III',      description:'Own 60 store items.', icon:'📦', criteria:'itemsOwned', threshold:60, reward:14000 },

  { title:'Prestige I',         description:'Reach prestige level 1.', icon:'⬆️', criteria:'prestigeLevel', threshold:1, reward:10000 },
  { title:'Prestige III',       description:'Reach prestige level 3.', icon:'⬆️', criteria:'prestigeLevel', threshold:3, reward:40000 },
  { title:'Million Coin Mark',  description:'Reach a 1 000 000 coin balance.', icon:'💎', criteria:'balance', threshold:1000000, reward:50000 }
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
