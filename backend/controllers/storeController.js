const StoreItem = require("../models/StoreItem");
const User = require("../models/User");
const checkAndAwardBadges = require('../utils/checkAndAwardBadges');
const checkAndAwardAchievements = require('../utils/checkAndAwardAchievements');
const Log = require("../models/Log");
const mongoose = require("mongoose");


exports.getUserStoreInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean()
    .populate({
      path: 'inventory',
      populate: {
        path: 'item',
        model: 'StoreItem',
        select: 'name emoji image description price'
      }
    })
    .populate({
      path: 'purchaseHistory.item',
      select: 'name emoji image description price'
    })
    .lean();;

    if (!user) return res.status(404).json({ message: "User not found" });

    const balance = user.balance || 0;
    const inventory = (user.inventory||[]).map(({ item, quantity }) => ({ item, quantity }));
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
  let session = await mongoose.startSession();
  try {
    session.startTransaction();

    const user = await User.findById(req.user.id).session(session);
    const item = await StoreItem.findById(req.body.itemId).session(session);
    
    if (!item)             throw Object.assign(new Error("Item not found"), { status: 404 });
    if (item.stock < 1)    throw Object.assign(new Error("Out of stock"),  { status: 400 });
    if (user.balance < item.price) throw Object.assign(new Error("Insufficient funds"), { status: 400 });

    // Deduct and record:
    user.balance        -= item.price;
    item.stock          -= 1;

    const entry = user.inventory.find(e => e.item.equals(item._id));
    if (entry) entry.quantity += 1;
    else       user.inventory.push({ item: item._id, quantity: 1 });

    user.purchaseHistory.push({ item: item._id });
    user.storePurchases += 1;

    await user.save({ session });
    await item.save({ session });

    await checkAndAwardBadges(user._id, "storePurchases", user.storePurchases, session);
    await checkAndAwardAchievements(user._id, "storePurchases", user.storePurchases, session);
    await session.commitTransaction();
    session.endSession();

    // Return the fresh user‐store snapshot:
    const populated = await User.findById(user._id)
      .populate({
        path: 'inventory',
        populate: { path: 'item', model: 'StoreItem',
                    select: 'name emoji image description price' }
      })
      .populate({ path: 'purchaseHistory.item',
                  select: 'name emoji image description price' });

    return res.json({
      balance: populated.balance,
      inventory: populated.inventory.map(({ item, quantity }) => ({ item, quantity })),
      purchaseHistory: populated.purchaseHistory
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("Purchase error:", err);
    // *Always* return JSON:
    return res
      .status(err.status || 400)
      .json({ message: err.message || "Purchase failed" });
  }
};
