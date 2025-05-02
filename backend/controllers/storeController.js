const StoreItem = require("../models/StoreItem");
const User = require("../models/User");
const checkAndAwardBadges = require('../utils/checkAndAwardBadges');
const checkAndAwardAchievements = require('../utils/checkAndAwardAchievement');
const Log = require("../models/Log");
const mongoose = require("mongoose");


exports.getUserStoreInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean()
    .populate('inventory')
    .populate('purchaseHistory.item');
;

    if (!user) return res.status(404).json({ message: "User not found" });

    const balance = user.balance || 0;
    const inventory = user.inventory || [];
    const purchaseHistory = user.purchaseHistory || [];

    res.status(200).json({
      balance,
      inventory,
      purchaseHistory,
    });
  } catch (err) {
    console.error("Error fetching user store info:", err);
    res.status(500).json({ message: "Server error fetching store info" });
  }
};

// Create a store item (admin only)
exports.createStoreItem = async (req, res) => {
  try {
    const { name, type, effect, price, stock,image } = req.body;
    console.log("Received data:", req.body);

    const newItem = new StoreItem({ name, type, effect, price, stock, image });
    await newItem.save();

    await Log.create({
      action: "create",
      targetType: "StoreItem",
      targetId: newItem._id,
      admin: req.user._id,
      details: `Created store item ${newItem.name}`,
    });

    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(500).json({ message: "Server error creating item" });
  }
};

// Get all store items (public)
exports.getStoreItems = async (req, res) => {
  try {
    // Only include items that have stock greater than 0
    const items = await StoreItem.find({ stock: { $gt: 0 } });
    res.status(200).json(items);
  } catch (err) {
    console.error("Error fetching store items:", err);
    res.status(500).json({ message: "Server error fetching items" });
  }
};

// Purchase item (user)
exports.purchaseItem = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const user = await User.findById(req.user.id).session(session);
    const item = await StoreItem.findById(req.body.itemId).session(session);

    if (!user) throw new Error('User not found');
    if (!item) throw new Error('Item not found');
    if (item.stock < 1) throw new Error('Out of stock');
    if (user.balance < item.price) throw new Error('Insufficient funds');

    // Perform updates
    user.balance -= item.price;
    user.inventory.push(item._id);
    user.purchaseHistory.push({ item: item._id });
    user.storePurchases += 1;
    item.stock -= 1;

    await user.save({ session });
    await item.save({ session });
    await session.commitTransaction();

    // Get populated data
    const populatedUser = await User.findById(user._id)
      .populate('inventory')
      .populate('purchaseHistory.item');

    res.json({
      balance: populatedUser.balance,
      inventory: populatedUser.inventory,
      purchaseHistory: populatedUser.purchaseHistory,
    });

  } catch (err) {
    console.error('Purchase error:', err);
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    
    // Throw error to be caught by error middleware
    err.status = 400;
    throw err;
  }
};



