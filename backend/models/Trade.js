const mongoose = require('mongoose');

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
  fromItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreItem',
    required: true
  }],
  toItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreItem'
  }],
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
