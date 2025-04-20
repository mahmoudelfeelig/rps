const StoreItem = require("../models/StoreItem");
const User = require("../models/User");


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

    const newItem = new StoreItem({ name, type, effect, price, stock,image });
    await newItem.save();

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
  try {
    const { itemId } = req.body;
    const userId = req.user._id;

    const item = await StoreItem.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.stock <= 0) return res.status(400).json({ message: "Out of stock" });

    const user = await User.findById(userId);
    if (user.balance < item.price) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Update user and item
    user.balance -= item.price;
    item.stock -= 1;

    // Add to inventory and history
    user.inventory.push(item._id);
    user.purchaseHistory.push({ item: item._id });

    await user.save();
    await item.save();

    res.status(200).json({ message: "Purchase successful", newBalance: user.balance });
  } catch (err) {
    console.error("Error purchasing item:", err);
    res.status(500).json({ message: "Server error during purchase" });
  }
};

