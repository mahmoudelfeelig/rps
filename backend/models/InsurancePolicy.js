const mongoose = require('mongoose');

const insurancePolicySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['casino', 'market', 'minefield'], required: true },
  coverageRate: { type: Number, default: 0.35, min: 0, max: 1 },
  maxCoverage: { type: Number, default: 5000, min: 0 },
  premium: { type: Number, required: true, min: 1 },
  expiresAt: { type: Date, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

insurancePolicySchema.index({ user: 1, active: 1, expiresAt: 1 });
insurancePolicySchema.index({ active: 1, expiresAt: 1 });

module.exports = mongoose.model('InsurancePolicy', insurancePolicySchema);
