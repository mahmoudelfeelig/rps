const Achievement = require("../models/Achievement");
const User = require("../models/User");

exports.getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find();
    res.json(achievements);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.completeAchievement = async (userId, achievementTitle) => {
    const user = await User.findById(userId);
    const achievement = await Achievement.findOne({ title: achievementTitle });
    if (!user || !achievement) return;
  
    const alreadyCompleted = user.achievements.includes(achievement._id);
    if (!alreadyCompleted) {
      user.achievements.push(achievement._id);
      user.money += achievement.reward;
      await user.save();
    }
  };
  

exports.createAchievement = async (req, res) => {
  try {
    const achievement = new Achievement(req.body);
    await achievement.save();
    res.status(201).json(achievement);
  } catch (error) {
    console.warn("Error creating achievement:", error);
    res.status(500).json({ message: "Server error" });
  }
};
