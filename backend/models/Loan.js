const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  principal: { type: Number, required: true, min: 1 },
  outstanding: { type: Number, required: true, min: 0 },
  interestRate: { type: Number, default: 0.12, min: 0, max: 5 },
  dueAt: { type: Date, required: true },
  status: { type: String, enum: ['active', 'repaid', 'defaulted'], default: 'active' }
}, { timestamps: true });

loanSchema.index({ user: 1, status: 1, dueAt: 1 });
loanSchema.index({ status: 1, dueAt: 1 });

module.exports = mongoose.model('Loan', loanSchema);
