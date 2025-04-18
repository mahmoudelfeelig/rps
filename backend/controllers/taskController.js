const Achievement = require("../models/Achievement");
const checkAndAwardAchievements = require("../utils/checkAndAwardAchievement");
const Task = require("../models/Task");
const User = require("../models/User");

exports.createTask = async (req, res) => {
    try {
      const { title, description, reward } = req.body;
  
      if (!title || !description || !reward) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      const task = new Task({
        title,
        description,
        reward,
        assignedTo: [] // starts empty
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
  try {
    const { taskId } = req.body;
    const userId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.completedBy.includes(userId)) {
      return res.status(400).json({ message: "Task already completed" });
    }

    task.completedBy.push(userId);
    await task.save();

    // Count how many tasks this user has completed
    const completedCount = await Task.countDocuments({ completedBy: userId });

    // Award achievements
    await checkAndAwardAchievements(userId, "complete_5_tasks", completedCount);

    res.status(200).json({ message: "Task completed" });
  } catch (err) {
    console.error("Error completing task:", err);
    res.status(500).json({ message: "Server error" });
  }
};