require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User     = require('../models/User');

(async function(){
  await mongoose.connect(process.env.MONGO_URI);

  await User.updateMany(
    {},
    { $pull: { inventory: { item: null } } }
  );

  console.log('✅ Removed null‐item inventory entries from all users');
  process.exit(0);
})();