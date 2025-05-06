const Trade = require('../models/Trade');
const User = require('../models/User');
const mongoose = require('mongoose');


exports.getTrades = async (req, res) => {
  try {
    const outgoing = await Trade.find({ fromUser: req.user.id })
      .populate('fromUser', 'username')
      .populate('toUser', 'username')

    const incoming = await Trade.find({ toUser: req.user.id })
      .populate('fromUser', 'username')
      .populate('toUser', 'username')

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

    if (!Array.isArray(fromItems) || !fromItems.every(i => i.itemId && i.quantity)) {
      return res.status(400).json({ message: 'Invalid item format. Expected { itemId, quantity } objects.' });
    }

    const toUser = await User.findOne({ username: toUsername });
    if (!toUser) return res.status(400).json({ message: 'Recipient user not found' });

    const fromUser = await User.findById(req.user.id).populate('inventory.item');
    const inventoryMap = new Map();

    for (const { item, quantity } of fromUser.inventory) {
      inventoryMap.set(item._id.toString(), (inventoryMap.get(item._id.toString()) || 0) + quantity);
    }

    const formattedItems = fromItems.map(({ itemId, quantity }) => ({ item: itemId, quantity }));

    // Validate ownership
    for (const { item, quantity } of formattedItems) {
      if ((inventoryMap.get(item) || 0) < quantity) {
        return res.status(400).json({ message: 'You do not own enough of one or more items.' });
      }
    }

    // Check for locked quantities
    const activeTrades = await Trade.find({ status: { $in: ['pending', 'responded'] } });
    const lockedCounts = new Map();
    for (const trade of activeTrades) {
      for (const { item, quantity } of [...trade.fromItems, ...trade.toItems]) {
        const key = item.toString();
        lockedCounts.set(key, (lockedCounts.get(key) || 0) + quantity);
      }
    }

    for (const { item, quantity } of formattedItems) {
      const total = inventoryMap.get(item) || 0;
      const locked = lockedCounts.get(item) || 0;
      if (locked + quantity > total) {
        return res.status(400).json({ message: 'Some items are already used in an active trade' });
      }
    }

    // Embed snapshot data
    const enrichedFromItems = formattedItems.map(({ item, quantity }) => {
      const match = fromUser.inventory.find(i => i.item._id.toString() === item);
      return {
        item,
        quantity,
        name: match?.item.name,
        image: match?.item.image,
        emoji: match?.item.emoji,
        price: match?.item.price
      };
    });

    const trade = await Trade.create({
      fromUser: req.user.id,
      toUser: toUser._id,
      fromItems: enrichedFromItems,
      toItems: [],
      status: 'pending'
    });

    res.status(201).json({ trade });
  } catch (err) {
    console.error('Trade request failed', err);
    res.status(500).json({ message: 'Trade request failed' });
  }
};

// RESPOND to trade
exports.respondToTrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { toItems, action } = req.body;
    const trade = await Trade.findById(id);

    if (!trade || trade.toUser.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized or trade not found' });
    }

    if (trade.status !== 'pending') {
      return res.status(400).json({ message: 'Trade is not pending' });
    }

    if (action === 'accept') {
      if (!Array.isArray(toItems) || !toItems.every(i => i.itemId && i.quantity)) {
        return res.status(400).json({ message: 'Invalid item format. Expected { itemId, quantity } objects.' });
      }

      const user = await User.findById(req.user.id).populate('inventory.item');
      const inventoryMap = new Map();
      for (const { item, quantity } of user.inventory) {
        inventoryMap.set(item._id.toString(), (inventoryMap.get(item._id.toString()) || 0) + quantity);
      }

      for (const { itemId, quantity } of toItems) {
        if ((inventoryMap.get(itemId) || 0) < quantity) {
          return res.status(400).json({ message: 'Insufficient quantity of one or more items' });
        }
      }

      const activeTrades = await Trade.find({ _id: { $ne: id }, status: { $in: ['pending', 'responded'] } });
      const lockedCounts = new Map();
      for (const t of activeTrades) {
        for (const e of [...t.fromItems, ...t.toItems]) {
          const key = e.item.toString();
          lockedCounts.set(key, (lockedCounts.get(key) || 0) + e.quantity);
        }
      }

      for (const { itemId, quantity } of toItems) {
        const available = inventoryMap.get(itemId) || 0;
        const locked = lockedCounts.get(itemId) || 0;
        if (locked + quantity > available) {
          return res.status(400).json({ message: 'Some response items are already used in another trade' });
        }
      }

      const enriched = toItems.map(({ itemId, quantity }) => {
        const match = user.inventory.find(i => i.item._id.toString() === itemId);
        return {
          item: itemId,
          quantity,
          name: match?.item.name,
          image: match?.item.image,
          emoji: match?.item.emoji,
          price: match?.item.price
        };
      });

      trade.toItems = enriched;
      trade.status = 'responded';
      await trade.save();

      return res.status(200).json({ trade });
    }

    if (action === 'deny') {
      trade.status = 'rejected';
      await trade.save();
      return res.status(200).json({ trade });
    }

    return res.status(400).json({ message: 'Invalid action' });
  } catch (err) {
    console.error('Trade response failed', err);
    res.status(500).json({ message: 'Trade response failed' });
  }
};

// FINALIZE trade
exports.finalizeTrade = async (req, res) => {
  try {
    const { id } = req.params;
    const trade = await Trade.findById(id);
    if (!trade || trade.status !== 'responded') {
      return res.status(400).json({ message: 'Trade not ready for finalization' });
    }

    if (![trade.fromUser.toString(), trade.toUser.toString()].includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to finalize' });
    }

    const fromUser = await User.findById(trade.fromUser);
    const toUser = await User.findById(trade.toUser);

    const removeItems = (user, items) => {
      for (const { item, quantity } of items) {
        const inv = user.inventory.find(i => i.item.toString() === item.toString());
        if (!inv || inv.quantity < quantity) throw new Error('Insufficient item quantity');
        inv.quantity -= quantity;
      }
      user.inventory = user.inventory.filter(i => i.quantity > 0);
    };

    const addItems = (user, items) => {
      for (const { item, quantity } of items) {
        const existing = user.inventory.find(i => i.item.toString() === item.toString());
        if (existing) existing.quantity += quantity;
        else user.inventory.push({ item, quantity });
      }
    };

    removeItems(fromUser, trade.fromItems);
    removeItems(toUser, trade.toItems);
    addItems(fromUser, trade.toItems);
    addItems(toUser, trade.fromItems);

    trade.status = 'accepted';
    await fromUser.save();
    await toUser.save();
    await trade.save();

    res.status(200).json({ trade });
  } catch (err) {
    console.error('Finalize error:', err);
    res.status(500).json({ message: 'Failed to finalize trade' });
  }
};

// CANCEL trade
exports.cancelTrade = async (req, res) => {
  try {
    const { id } = req.params;
    const trade = await Trade.findById(id);

    if (!trade) return res.status(404).json({ message: 'Trade not found' });

    if (![trade.fromUser.toString(), trade.toUser.toString()].includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to cancel' });
    }

    if (['accepted', 'denied', 'canceled'].includes(trade.status)) {
      return res.status(400).json({ message: 'Trade already finalized' });
    }

    trade.status = 'canceled';
    await trade.save();

    res.status(200).json({ message: 'Trade canceled', trade });
  } catch (err) {
    console.error('Cancel trade failed', err);
    res.status(500).json({ message: 'Failed to cancel trade' });
  }
};
