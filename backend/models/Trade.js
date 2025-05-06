const mongoose = require('mongoose');

const ItemSnapshotSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  name:    { type: String, required: true },
  image:   { type: String },
  emoji:   { type: String },
  price:   { type: Number, required: true }
}, { _id: true });

const tradeSchema = new mongoose.Schema({
  fromUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  toUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  fromItems: [ItemSnapshotSchema],
  toItems: [ItemSnapshotSchema],
  status: { 
    type: String, 
    enum: ['pending', 'responded', 'accepted', 'rejected', 'canceled'],
    default: 'pending'
  },
  expiresAt: { 
    type: Date, 
    default: () => Date.now() + 24*60*60*1000 
  }
}, { timestamps: true });

module.exports = mongoose.model('Trade', tradeSchema);
