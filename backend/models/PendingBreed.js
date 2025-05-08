const mongoose = require('mongoose');
const { Schema } = mongoose;

const PendingBreedSchema = new Schema({
  userId:   { type: Schema.Types.ObjectId, ref:'User', required:true },
  parents:  [{ type: Schema.Types.ObjectId, ref:'Critter' }],
  child:    {
    species:    String,
    variant:    String,
    generation: Number,
    rarity:     String,
    traits:     Schema.Types.Mixed
  },
  hatchAt:  { type: Date, required:true },
  hatched:  { type: Boolean, default:false }
}, { timestamps:true });

module.exports = mongoose.model('PendingBreed', PendingBreedSchema);
