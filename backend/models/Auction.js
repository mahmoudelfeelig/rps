const mongoose = require('mongoose');

const auctionBidSchema = new mongoose.Schema({
  bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 1 },
  placedAt: { type: Date, default: Date.now }
}, { _id: false });

const auctionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  kind: { type: String, enum: ['store-item', 'card', 'boost', 'cosmetic'], default: 'boost' },
  refId: { type: mongoose.Schema.Types.ObjectId },
  cardKey: String,
  description: { type: String, default: '' },
  startingBid: { type: Number, required: true, min: 1 },
  currentBid: { type: Number, default: 0, min: 0 },
  highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  bids: [auctionBidSchema],
  sinkTaxRate: { type: Number, default: 0.05, min: 0, max: 0.5 },
  endsAt: { type: Date, required: true },
  settled: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
}, { timestamps: true });

auctionSchema.index({ active: 1, endsAt: 1 });
auctionSchema.index({ highestBidder: 1, createdAt: -1 });

module.exports = mongoose.model('Auction', auctionSchema);
