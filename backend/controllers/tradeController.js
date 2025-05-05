const Trade = require('../models/Trade');
const User = require('../models/User');
const mongoose = require('mongoose');


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
    const { id } = req.params;
    const { toItems, action } = req.body;

    const trade = await Trade.findById(id);
    if (!trade) return res.status(404).json({ message: 'Trade not found' });

    if (trade.status !== 'pending') return res.status(400).json({ message: 'Trade is not pending' });
    if (trade.toUser.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized to respond' });

    if (action === 'accept') {
      const toUser = await User.findById(req.user.id);
      const invalidToItems = toItems.filter(id => !toUser.inventory.includes(id));
      if (invalidToItems.length > 0) {
        return res.status(400).json({ message: 'Invalid items in response' });
      }

      trade.toItems = toItems;
      trade.status = 'responded';
      await trade.save();

      return res.status(200).json({ message: 'Trade response saved', trade });
    } else if (action === 'deny') {
      trade.status = 'denied';
      await trade.save();
      return res.status(200).json({ message: 'Trade denied', trade });
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }
  } catch (err) {
    console.error('Respond to trade error:', err);
    res.status(500).json({ message: 'Failed to respond to trade' });
  }
};


exports.finalizeTrade = async (req, res) => {
  try {
    const { id } = req.params;
    const trade = await Trade.findById(id).populate('fromUser').populate('toUser');

    if (!trade) return res.status(404).json({ message: 'Trade not found' });
    if (trade.status !== 'responded') return res.status(400).json({ message: 'Trade not ready for finalization' });
    if (trade.fromUser._id.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized to finalize' });

    // Transfer items
    await User.updateOne(
      { _id: trade.fromUser._id },
      { $pull: { inventory: { $in: trade.fromItems } } }
    );
    await User.updateOne(
      { _id: trade.fromUser._id },
      { $push: { inventory: { $each: trade.toItems } } }
    );
    

    await User.updateOne(
      { _id: trade.toUser._id },
      { $pull: { inventory: { $in: trade.toItems } } }
    );

    await User.updateOne(
      { _id: trade.toUser._id },
      { $push: { inventory: { $each: trade.fromItems } } }
    );

    trade.status = 'accepted';
    await trade.save();

    res.status(200).json({ message: 'Trade finalized', trade });
  } catch (err) {
    console.error('Trade finalization failed', err);
    res.status(500).json({ message: 'Failed to finalize trade' });
  }
};

