const Achievement = require("../models/Achievement");
const checkAndAwardBadges = require("../utils/checkAndAwardBadges");
const checkAndAwardAchievements = require("../utils/checkAndAwardAchievements");
const Task = require("../models/Task");
const User = require("../models/User");
const Bet = require('../models/Bet');
const Log = require("../models/Log");
const rewardMultiplier = require('../utils/rewardMultiplier');

exports.createTask = async (req, res) => {
  try {
    const { title, description, reward, type, goalType, goalAmount } = req.body;

    if (!title || !description || !reward || !type || !goalType || !goalAmount) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const task = new Task({
      title,
      description,
      reward,
      type,
      goalType,
      goalAmount,
      assignedTo: [],
    });

    await task.save();

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (err) {
    console.error('Create Task Error:', err);
    res.status(500).json({ message: 'Error creating task' });
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
  const userId = req.user._id;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Check if user already completed this task
    if (task.completedBy.includes(userId)) {
      return res.status(400).json({ error: 'Task already completed' });
    }

    let progress = 0;

    switch (task.goalType) {
      case 'betsPlaced':
        progress = user.betsPlaced || 0;
        break;
      case 'betsWon':
        progress = user.betsWon || 0;
        break;
      case 'storePurchases':
        progress = user.storePurchases || 0 ;
        break;
      case 'logins':
        progress = user.loginCount || 0;
        break;
      default:
        return res.status(400).json({ error: 'Invalid goal type' });
    }

    if (progress < task.goalAmount) {
      return res.status(400).json({ error: `Progress not sufficient: ${progress}/${task.goalAmount}` });
    }

    // Reward the user
    const user = await User.findById(userId);
    user.balance += Math.round(task.reward * rewardMultiplier(user));
    await user.save();

    await checkAndAwardBadges(user._id);
    await checkAndAwardAchievements(user._id);
        
    await Log.create({
      action: 'complete',
      targetType: 'Task',
      targetId: task._id,
      user: user._id,
      details: `Task completed by ${user.username}`,
    });

    await Task.findByIdAndDelete(taskId);

    res.json({ message: 'Task completed and removed.', reward: task.reward });
  } catch (err) {
    console.error('Error completing task:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
