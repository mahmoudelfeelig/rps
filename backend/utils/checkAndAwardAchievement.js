const Achievement = require("../models/Achievement");

async function checkAndAwardAchievements(userId, criteriaKey, progressCount) {
  try {
    const matchingAchievements = await Achievement.find({ criteria: criteriaKey });

    for (let achievement of matchingAchievements) {
      if (!achievement.earnedBy.includes(userId) && progressCount >= 5) {
        achievement.earnedBy.push(userId);
        await achievement.save();
        console.log(`🏅 User ${userId} earned achievement: ${achievement.title}`);
      }
    }
  } catch (err) {
    console.error("Error auto-awarding achievements:", err);
  }
}

module.exports = checkAndAwardAchievements;
