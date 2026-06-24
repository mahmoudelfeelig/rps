const mongoose = require('mongoose');

const insurancePolicySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['casino', 'market', 'minefield'], required: true },
  coverageRate: { type: Number, default: 0.35 },
  maxCoverage: { type: Number, default: 5000 },
  premium: { type: Number, required: true, min: 1 },
  expiresAt: { type: Date, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('InsurancePolicy', insurancePolicySchema);
