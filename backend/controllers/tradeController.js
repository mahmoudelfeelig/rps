const Trade = require('../models/Trade');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.createTradeRequest = async (req, res) => {
  try {
    const { toUsername, fromItems } = req.body;

    // Get the recipient's user info from username
    const toUser = await User.findOne({ username: toUsername });
    if (!toUser) {
      return res.status(400).json({ message: 'Recipient user not found' });
    }

    const fromUser = await User.findById(req.user.id);
    
    // Check if user owns the items they're trying to trade
    const invalidItems = fromItems.filter(itemId => 
      !fromUser.inventory.includes(itemId)
    );
    
    if (invalidItems.length > 0) {
      return res.status(400).json({ message: 'Invalid items in trade' });
    }

    const trade = await Trade.create({
      fromUser: req.user.id,
      toUser: toUser._id,
      fromItems,
      toItems: [],
      status: 'pending', 
    });

    res.status(201).json({ trade });
  } catch (err) {
    console.error('Trade request failed', err);
    res.status(500).json({ message: 'Trade request failed' });
  }
};

exports.respondToTrade = async (req, res) => {
  try {
    const { tradeId } = req.params;
    const { toItems, action } = req.body;

    // Get the trade and validate
    const trade = await Trade.findById(tradeId);
    if (!trade) return res.status(404).json({ message: 'Trade not found' });

    if (trade.status !== 'pending') {
      return res.status(400).json({ message: 'Trade is not pending' });
    }

    // Handle trade acceptance
    if (action === 'accept') {
      const fromUser = await User.findById(trade.fromUser);
      const toUser = await User.findById(trade.toUser);

      // Validate items owned by recipient
      const invalidToItems = toItems.filter(itemId => 
        !toUser.inventory.includes(itemId)
      );

      if (invalidToItems.length > 0) {
        return res.status(400).json({ message: 'Invalid items in trade' });
      }

      // Accept trade, update users' inventory, and mark trade as complete
      trade.toItems = toItems;
      trade.status = 'accepted';
      await trade.save();

      // Update both users' inventories (adjust accordingly)
      await User.updateOne({ _id: fromUser._id }, { $pull: { inventory: { $in: trade.fromItems } } });
      await User.updateOne({ _id: toUser._id }, { $pull: { inventory: { $in: trade.toItems } } });

      // Add items to each user's inventory
      await User.updateOne({ _id: fromUser._id }, { $push: { inventory: { $each: toItems } } });
      await User.updateOne({ _id: toUser._id }, { $push: { inventory: { $each: fromItems } } });

      res.status(200).json({ message: 'Trade accepted', trade });
    } else if (action === 'deny') {
      trade.status = 'denied';
      await trade.save();
      res.status(200).json({ message: 'Trade denied', trade });
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
  } catch (err) {
    console.error('Trade response failed', err);
    res.status(500).json({ message: 'Trade response failed' });
  }
};


exports.getTrades = async (req, res) => {
  try {
    const outgoing = await Trade.find({ fromUser: req.user.id })
      .populate('fromUser', 'username')
      .populate('toUser', 'username')
      .populate('fromItems')
      .populate('toItems');

    const incoming = await Trade.find({ toUser: req.user.id })
      .populate('fromUser', 'username')
      .populate('toUser', 'username')
      .populate('fromItems')
      .populate('toItems');

    res.json({
      outgoing,
      incoming
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trades' });
  }
};