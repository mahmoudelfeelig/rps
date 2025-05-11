require('dotenv').config({ path: __dirname + '/../.env' });
const fs       = require('fs');
const path     = require('path');
const mongoose = require('mongoose');
const User     = require('../models/User');
const { cloudinary } = require('../utils/cloudinary');

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);

  // Find users whose profileImage still points at /uploads/…
  const users = await User.find({ profileImage: /^\/uploads\// });
  console.log(`Found ${users.length} users to migrate`);

  for (const user of users) {
    // extract the filename from "/uploads/1746905496844.jpg"
    const filename = path.basename(user.profileImage);

    // adjust this to point at your real uploads folder on disk:
    const localFile = path.join(__dirname, '..', 'uploads', filename);

    if (!fs.existsSync(localFile)) {
      console.error(`⚠️  user._id=${user._id}: file not found at ${localFile}`);
      continue;
    }

    try {
      const uploadRes = await cloudinary.uploader.upload(localFile, {
        folder: 'rpsite_uploads',
        public_id: filename.replace(path.extname(filename), ''), // optional: keep original name
      });

      user.profileImage = uploadRes.secure_url;
      await user.save();

      console.log(`✅ user._id=${user._id} → ${uploadRes.secure_url}`);
    } catch (err) {
      console.error(`❌ user._id=${user._id}:`, err.message);
    }
  }

  await mongoose.disconnect();
  console.log('Migration complete');
}

migrate().catch(err => {
  console.error('Migration script error:', err);
  process.exit(1);
});
