const Achievement = require('../models/Achievement');
const User = require('../models/User');

const checkAndAwardAchievements = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  // Get progress types
  const userStats = {
    betsPlaced: user.betsPlaced || 0,
    betsWon: user.betsWon || 0,
    storePurchases: user.storePurchases || 0,
    logins: user.loginCount || 0
  };

  const achievements = await Achievement.find();

  for (const ach of achievements) {
    if (
      userStats[ach.criteria] >= ach.threshold &&
      !ach.claimedBy.includes(userId)
    ) {
      // Auto-award
      ach.claimedBy.push(userId);
      await ach.save();

      user.achievements.push(ach._id);
      user.money += ach.reward;
    }
  }

  await user.save();
};

module.exports = checkAndAwardAchievements;
