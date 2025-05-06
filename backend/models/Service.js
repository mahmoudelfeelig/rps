const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  purchasedAt: Date,
  finalized: { type: Boolean, default: false },
  buyerAccepted: { type: Boolean, default: false },
  completedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);
