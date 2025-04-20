const User = require('../models/User');

const badgeList = [
  { name: 'Newbie', condition: user => user.loginCount > 0, desc: 'Welcome aboard!' },
  { name: 'High Roller', condition: user => user.balance > 2000, desc: 'Maintain a high balance.' },
  { name: 'Lucky Streak', condition: user => user.betsWon >= 5, desc: 'Win 5+ bets in a row.' },
  { name: 'Shopaholic', condition: user => user.storePurchases >= 3, desc: 'Purchased 3+ items from the store.' },
  { name: 'Taskmaster', condition: user => user.tasksCompleted >= 5, desc: 'Completed 5+ tasks.' },
];

const checkAndAwardBadges = async (userId) => {
  const user = await User.findById(userId);
  console.log('User stats:', {
    loginCount: user.loginCount,
    balance: user.balance,
    betsWon: user.betsWon,
    storePurchases: user.storePurchases,
    tasksCompleted: user.tasksCompleted,
  });
  if (!user) return;

  for (const badge of badgeList) {
    const alreadyHas = user.badges.some(b => b.name === badge.name);
    if (!alreadyHas && badge.condition(user)) {
      user.badges.push({ name: badge.name, description: badge.desc });
    }
  }

  await user.save();
};

module.exports = checkAndAwardBadges;
