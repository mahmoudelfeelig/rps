const Achievement = require("../models/Achievement");
const User = require("../models/User");
const rewardMultiplier = require('../utils/rewardMultiplier');
const progressStats = require('../utils/progressStats');

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
  const userId        = req.user._id;
  const { achievementId } = req.body;

  const [ user, ach ] = await Promise.all([
    User.findById(userId),
    Achievement.findById(achievementId)
  ]);
  if (!user || !ach)
    return res.status(404).json({ message:'Not found' });

  if (user.achievements.includes(ach._id)) {
    return res.status(400).json({ message:'Already claimed' });
  }

  const stats = progressStats(user);
  const progress = stats[ach.criteria];
  if (progress == null) {
    return res.status(400).json({ message:'Invalid criteria' });
  }

  if (progress < ach.threshold) {
    return res
      .status(400)
      .json({ message:`Not enough progress: ${progress}/${ach.threshold}` });
  }

  const payout = Math.round(ach.reward * rewardMultiplier(user));
  const claimed = await Achievement.findOneAndUpdate(
    { _id: ach._id, claimedBy: { $ne: user._id } },
    { $addToSet: { claimedBy: user._id } },
    { new: true }
  );
  if (!claimed) {
    return res.status(400).json({ message:'Already claimed' });
  }

  await User.updateOne(
    { _id: user._id },
    {
      $inc: { balance: payout },
      $addToSet: { achievements: ach._id }
    }
  );

  res.json({ message:'Achievement claimed!', reward: payout });
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
