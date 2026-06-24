const User = require('../models/User')

const badgeList = [
  { name:'Newbie',          description:'Welcome aboard!',           condition: u => u.loginCount < 7 },
  { name:'Veteran',         description:'Logged in 30+ times',       condition: u => u.loginCount >= 30 },
  { name:'All-Rounder',     description:'Tried every core feature',   condition: u =>
      u.betsPlaced > 0 &&
      u.tasksCompleted > 0 &&
      u.puzzleSolves > 0
  },

  { name:'High Roller',     description:'Maintain a balance >2 000',    condition: u => u.balance > 2000 },
  { name:'Balance Guardian',description:'Maintain a balance >5 000',    condition: u => u.balance >= 5000 },
  { name:'Whale',           description:'Maintain a balance >100 000',  condition: u => u.balance >= 100000 },
  { name:'Big Spender',     description:'Lost ≥10 000 coins',           condition: u => u.gamblingLost >= 10000 },

  { name:'Bet Placer',      description:'Place 100 bets',              condition: u => u.betsPlaced >= 100 },
  { name:'Bronze Bettor',   description:'Win 5 bets',                  condition: u => u.betsWon >= 5 },
  { name:'Silver Bettor',   description:'Win 20 bets',                 condition: u => u.betsWon >= 20 },
  { name:'Gold Bettor',     description:'Win 50 bets',                 condition: u => u.betsWon >= 50 },
  { name:'Parlay Pro',      description:'Placed ≥1 parlay bet',        condition: u => Array.isArray(u.parlays) && u.parlays.length >= 1 },

  { name:'Shopaholic',      description:'Purchased 3+ items',          condition: u => u.storePurchases >= 3 },
  { name:'Store Tycoon',    description:'Purchased 50+ items',         condition: u => u.storePurchases >= 50 },
  { name:'Limited Drop',    description:'Purchased 10+ store items',    condition: u => u.storePurchases >= 10 },
  { name:'Loadout Builder', description:'Own 20 total item copies',     condition: u => (u.inventory || []).reduce((sum, slot) => sum + (slot.quantity || 0), 0) >= 20 },

  { name:'Overachiever',    description:'Completed ≥10 tasks',         condition: u => u.tasksCompleted >= 10 },
  { name:'Task Guru',       description:'Completed ≥50 tasks',         condition: u => u.tasksCompleted >= 50 },

  { name:'Minefield Novice',       description:'Played 10 Minefield rounds', condition: u => u.minefieldPlays >= 10 },
  { name:'Minefield Champ',        description:'Won 10 Minefield rounds',    condition: u => u.minefieldWins >= 10 },

  { name:'Puzzle Enthusiast',      description:'Solved 20 puzzles',          condition: u => u.puzzleSolves >= 20 },
  { name:'Puzzle Master',          description:'Solved 100 puzzles',         condition: u => u.puzzleSolves >= 100 },

  { name:'Click Crafter',          description:'Made 1 000 frenzy clicks',   condition: u => u.clickFrenzyClicks >= 1000 },

  { name:'Casino Fan',             description:'Played 100 casino rounds',   condition: u => u.casinoPlays >= 100 },
  { name:'Casino King',            description:'Won 50 casino rounds',       condition: u => u.casinoWins >= 50 },

  { name:'RPS Rookie',             description:'Played 10 RPS matches',      condition: u => u.rpsPlays >= 10 },
  { name:'RPS Veteran',            description:'Won 20 RPS matches',         condition: u => u.rpsWins >= 20 },

  { name:'Slot Spinner',           description:'Played 100 slot spins',      condition: u => u.slotsPlays >= 100 },
  { name:'Slot Master',            description:'Won 30 slot spins',          condition: u => u.slotsWins >= 30 },

  { name:'Fortune Seeker',         description:'Winnings ≥5 000 coins',       condition: u => u.gamblingWon >= 5000 },
  { name:'Gambler’s Ruin',         description:'Lost ≥10 000 coins',          condition: u => u.gamblingLost >= 10000 },
  { name:'Profit Engine',          description:'Winnings ≥50 000 coins',      condition: u => u.gamblingWon >= 50000 },
  { name:'Risk Desk',              description:'Lost ≥50 000 coins',          condition: u => u.gamblingLost >= 50000 },

  { name:'First Position',         description:'Own at least one market asset', condition: u => (u.portfolio?.length || 0) >= 1 },
  { name:'Diversified',            description:'Own five market positions',   condition: u => (u.portfolio?.length || 0) >= 5 },
  { name:'Market Maker',           description:'Make 25 market trades',       condition: u => u.marketTrades >= 25 },
  { name:'Exchange Regular',       description:'Make 100 market trades',      condition: u => u.marketTrades >= 100 },
  { name:'Dividend Earner',        description:'Claim 1 000 dividend coins',  condition: u => u.dividendsClaimed >= 1000 },
  { name:'Dividend Desk',          description:'Claim 10 000 dividend coins', condition: u => u.dividendsClaimed >= 10000 },
  { name:'Prestige I',             description:'Reach prestige level 1',      condition: u => u.prestigeLevel >= 1 },
  { name:'Prestige III',           description:'Reach prestige level 3',      condition: u => u.prestigeLevel >= 3 },

  { name:'Collector',              description:'Own 10 distinct items',      condition: u => (u.inventory?.length || 0) >= 10 },
  { name:'Hoarder',                description:'Own 50 distinct items',      condition: u => (u.inventory?.length || 0) >= 50 },
]


const checkAndAwardBadges = async userId => {
  const user = await User.findById(userId)
  if (!user) return

  for (const badge of badgeList) {
    const hasIt = user.badges.some(b => b.name === badge.name)
    if (!hasIt && badge.condition(user)) {
      user.badges.push({
        name:        badge.name,
        description: badge.description,
        earnedAt:    Date.now(),
      })
    }
  }

  await user.save()
}

module.exports = checkAndAwardBadges
