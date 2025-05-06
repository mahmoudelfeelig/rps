const User = require('../models/User');

const badgeList = [
  { name: 'Newbie', condition: user => user.loginCount > 0, description: 'Welcome aboard!' },
  { name: 'High Roller', condition: user => user.balance > 2000, description: 'Maintain a high balance.' },
  { name: 'Lucky Streak', condition: user => user.betsWon >= 5, description: 'Win 5+ bets in a row.' },
  { name: 'Shopaholic', condition: user => user.storePurchases >= 3, description: 'Purchased 3+ items from the store.' },
  { name: 'Overachiever', condition: user => user.tasksCompleted >= 10, description: 'Completed 10+ tasks.' },
  { name: 'Veteran',condition: user => user.loginCount >=30, description: 'Login 30+ times.' },
];

const checkAndAwardBadges = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  for (const badge of badgeList) {
    const alreadyHas = user.badges.some(b => b.name === badge.name);
    if (!alreadyHas && badge.condition(user)) {
      user.badges.push({ name: badge.name, description: badge.description });
    }
  }

  await user.save();
};

module.exports = checkAndAwardBadges;
