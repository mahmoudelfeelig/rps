const Achievement = require('../models/Achievement');
const User = require('../models/User');
const progressStats = require('./progressStats');
const rewardMultiplier = require('./rewardMultiplier');

const checkAndAwardAchievements = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const userStats = progressStats(user);

  const achievements = await Achievement.find();

  for (const ach of achievements) {
    const alreadyClaimed = ach.claimedBy.some(id => String(id) === String(userId));
    if (
      userStats[ach.criteria] >= ach.threshold &&
      !alreadyClaimed
    ) {
      ach.claimedBy.push(userId);
      await ach.save();

      if (!user.achievements.some(id => String(id) === String(ach._id))) {
        user.achievements.push(ach._id);
      }
      user.balance += Math.round(ach.reward * rewardMultiplier(user));
    }
  }

  await user.save();
};

module.exports = checkAndAwardAchievements;
