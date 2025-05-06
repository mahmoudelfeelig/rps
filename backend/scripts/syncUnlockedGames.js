const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const GameProgress = require('../models/GameProgress');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find({ 'games.unlocked.0': { $exists: true } });

  for (const user of users) {
    const unlocked = user.games.unlocked;
    const progress = await GameProgress.findOneAndUpdate(
      { user: user._id },
      { $set: { unlockedGames: unlocked } },
      { upsert: true, new: true }
    );
    console.log(`Synced for ${user.username}:`, progress.unlockedGames);
  }

  console.log("✅ Migration complete");
  mongoose.disconnect();
});
