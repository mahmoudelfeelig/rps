const Achievement = require("../models/Achievement");
const User = require("../models/User");
const Log = require("../models/Log");
const rewardMultiplier = require('../utils/rewardMultiplier');

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

  let progress = 0;
  switch (ach.criteria) {
    case 'betsPlaced':        progress = user.betsPlaced;        break;
    case 'betsWon':           progress = user.betsWon;           break;
    case 'storePurchases':    progress = user.storePurchases;    break;
    case 'logins':            progress = user.loginCount;        break;
    case 'tasksCompleted':    progress = user.tasksCompleted;    break;
    case 'minefieldPlays':    progress = user.minefieldPlays;    break;
    case 'minefieldWins':     progress = user.minefieldWins;     break;
    case 'puzzleSolves':      progress = user.puzzleSolves;      break;
    case 'clickFrenzyClicks': progress = user.clickFrenzyClicks; break;
    case 'casinoPlays':       progress = user.casinoPlays;       break;
    case 'casinoWins':        progress = user.casinoWins;        break;
    case 'rpsPlays':          progress = user.rpsPlays;          break;
    case 'rpsWins':           progress = user.rpsWins;           break;
    case 'slotsPlays':        progress = user.slotsPlays;        break;
    case 'slotsWins':         progress = user.slotsWins;         break;
    case 'itemsOwned':        progress = user.itemsOwned;        break;
    case 'gamblingWon':       progress = user.gamblingWon;       break;
    case 'gamblingLost':      progress = user.gamblingLost;      break;
    default:
      return res.status(400).json({ message:'Invalid criteria' });
  }

  if (progress < ach.threshold) {
    return res
      .status(400)
      .json({ message:`Not enough progress: ${progress}/${ach.threshold}` });
  }

  user.achievements.push(ach._id);
  ach.claimedBy.push(user._id);

  const payout = Math.round(ach.reward * rewardMultiplier(user));
  user.balance += payout;

  await Promise.all([ user.save(), ach.save() ]);

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
