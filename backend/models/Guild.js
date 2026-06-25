const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  tag: { type: String, required: true, unique: true, uppercase: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  treasury: { type: Number, default: 0, min: 0 },
  level: { type: Number, default: 1, min: 1 },
  xp: { type: Number, default: 0, min: 0 },
  seasonScore: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

guildSchema.index({ seasonScore: -1 });
guildSchema.index({ owner: 1 });

module.exports = mongoose.model('Guild', guildSchema);
