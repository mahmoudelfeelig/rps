const Achievement = require("../models/Achievement");
const User = require("../models/User");
const Log = require("../models/Log");

exports.getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find();
    res.json(achievements);
  } catch (err) {
    console.error("Error fetching achievements:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.completeAchievement = async (req, res) => {
  const userId = req.user._id;
  const { achievementId } = req.body;

  try {
    const user = await User.findById(userId);
    const achievement = await Achievement.findById(achievementId);
    if (!user || !achievement) {
      return res.status(404).json({ message: "User or achievement not found" });
    }

    const alreadyCompleted = (user.achievements || []).includes(achievement._id);
    if (!alreadyCompleted) {
      let progress = 0;

      switch (achievement.criteria) {
        case 'tasksCompleted':
          progress = user.tasksCompleted || 0;
          break;
        case 'betsPlaced':
          progress = user.betsPlaced || 0;
          break;
        case 'betsWon':
          progress = user.betsWon || 0;
          break;
        case 'storePurchases':
          progress = user.storePurchases || 0;
          break;
        case 'logins':
          progress = user.loginCount || 0;
          break;
        default:
          return res.status(400).json({ error: 'Invalid Criteria' });
      }
      
  
      if (progress < achievement.threshold) {
        return res.status(400).json({ error: `Progress not sufficient: ${progress}/${achievement.threshold}` });
      }


      user.achievements.push(achievement._id);
      achievement.claimedBy.push(user._id);
      await achievement.save();
      
      // Parse and add reward
      user.balance += achievement.reward;
      await user.save();


      await Log.create({
        action: "update",
        targetType: "User",
        targetId: user._id,
        admin: req.user._id,
        details: `Achievement ${achievement.name} completed. Reward: ${achievement.reward}`,
      });
      
    }

    
    res.status(200).json({ message: "Achievement completed" });
  } catch (err) {
    console.error("Error completing achievement:", err);
    res.status(500).json({ message: "Server error" });
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
