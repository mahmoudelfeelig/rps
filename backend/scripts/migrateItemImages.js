require('dotenv').config({ path: __dirname + '/../.env' });
const fs        = require('fs');
const path      = require('path');
const mongoose  = require('mongoose');
const StoreItem = require('../models/StoreItem');
const { cloudinary } = require('../utils/cloudinary');

async function migrate() {
  // 1) connect to your DB
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // 2) find all items with a local‐path image
  const items = await StoreItem.find({
    image: { $exists: true, $not: /^https?:\/\// }
  });
  console.log(`Found ${items.length} store items to migrate`);

  for (let item of items) {
    const filename = path.basename(item.image);
    // choose folder by type
    const folder = item.type === 'cosmetic' ? 'rps' : 'items';
    // point at your front-end public folder
    const localFile = path.join(
      __dirname, '..', '..', 'frontend', 'public', 'assets',
      folder, filename
    );

    if (!fs.existsSync(localFile)) {
      console.warn(`⚠ file missing: ${localFile} – skipping item ${item._id}`);
      continue;
    }

    try {
      const res = await cloudinary.uploader.upload(localFile, {
        folder: `myApp/${folder}`,
        use_filename: true,
        unique_filename: false,
      });
      item.image = res.secure_url;
      await item.save();
      console.log(`✅ [${item._id}] → ${res.secure_url}`);
    } catch (err) {
      console.error(`❌ [${item._id}] upload failed:`, err.message);
    }
  }

  await mongoose.disconnect();
  console.log('✅ StoreItem image migration complete');
}

migrate().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
