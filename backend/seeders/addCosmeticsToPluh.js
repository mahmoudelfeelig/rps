const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const UserInventory = require('../models/UserInventory');

dotenv.config();

async function run() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("Missing MONGO_URI in .env");

    await mongoose.connect(uri);
    const user = await User.findOne({ username: 'pluh' });

    if (!user) {
      console.error("❌ User 'pluh' not found");
      process.exit(1);
    }

    const cosmeticIds = [
      'wizard-hat',
      'saddle',
      'cloak',
      'bandana',
      'pearl-necklace',
      'fin-hat',
      'sleep-mask',
      'cozy-cape'
    ];

    await UserInventory.updateOne(
      { userId: user._id },
      { $addToSet: { cosmetics: { $each: cosmeticIds } } },
      { upsert: true }
    );

    console.log(`✅ Cosmetics added to ${user.username}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeder failed:", err.message);
    process.exit(1);
  }
}

run();
