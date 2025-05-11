const Task       = require("../models/Task");
const User       = require("../models/User");
const Log        = require("../models/Log");
const checkAndAwardBadges       = require("../utils/checkAndAwardBadges");
const checkAndAwardAchievements = require("../utils/checkAndAwardAchievements");
const rewardMultiplier             = require("../utils/rewardMultiplier");

exports.createTask = async (req, res) => {
  try {
    const { title, description, reward, type, goalType, goalAmount } = req.body;
    if (!title || !description || !reward || !type || !goalType || !goalAmount) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const task = new Task({ title, description, reward, type, goalType, goalAmount });
    await task.save();
    res.status(201).json({ message: "Task created successfully", task });
  } catch (err) {
    console.error("Create Task Error:", err);
    res.status(500).json({ message: "Error creating task" });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json({ tasks });
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

exports.completeTask = async (req, res) => {
  const { taskId } = req.body;
  const userId     = req.user._id;

  try {
    // 1) find the task
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // 2) load user and compute their current progress
    const user = await User.findById(userId);
    let progress = 0;
    switch (task.goalType) {
      case "betsPlaced":        progress = user.betsPlaced;         break;
      case "betsWon":           progress = user.betsWon;            break;
      case "storePurchases":    progress = user.storePurchases;     break;
      case "logins":            progress = user.loginCount;         break;
      case "tasksCompleted":    progress = user.tasksCompleted;     break;
      case "minefieldPlays":    progress = user.minefieldPlays;     break;
      case "minefieldWins":     progress = user.minefieldWins;      break;
      case "puzzleSolves":      progress = user.puzzleSolves;       break;
      case "clickFrenzyClicks": progress = user.clickFrenzyClicks;  break;
      case "casinoPlays":       progress = user.casinoPlays;        break;
      case "casinoWins":        progress = user.casinoWins;         break;
      case "rpsPlays":          progress = user.rpsPlays;           break;
      case "rpsWins":           progress = user.rpsWins;            break;
      case "slotsPlays":        progress = user.slotsPlays;         break;
      case "slotsWins":         progress = user.slotsWins;          break;
      case "itemsOwned":        progress = user.itemsOwned;         break;
      case "gamblingWon":       progress = user.gamblingWon;        break;
      case "gamblingLost":      progress = user.gamblingLost;       break;
      default:
        return res.status(400).json({ error: "Invalid goal type" });
    }

    // 3) ensure they've met the requirement
    if (progress < task.goalAmount) {
      return res
        .status(400)
        .json({ error: `Progress not sufficient: ${progress}/${task.goalAmount}` });
    }

    // 4) reward the user
    const payout = Math.round(task.reward * rewardMultiplier(user));
    user.balance += payout;
    user.tasksCompleted += 1;
    await user.save();

    // 5) award any badges/achievements
    await checkAndAwardBadges(userId);
    await checkAndAwardAchievements(userId);

    // 6) delete the task so it’s gone for everyone
    await Task.findByIdAndDelete(taskId);

    res.json({ message: "Task completed and removed.", reward: payout });
  } catch (err) {
    console.error("Complete Task Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
