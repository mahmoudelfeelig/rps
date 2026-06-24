const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsDir = process.env.UPLOAD_STORAGE_DIR
  ? path.resolve(process.env.UPLOAD_STORAGE_DIR)
  : path.join(__dirname, '..', 'uploads');

fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.bin';
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, safeName);
  },
});

const allowedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]);

function imageFileFilter(_req, file, cb) {
  if (!allowedImageTypes.has(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG, WebP, and GIF uploads are allowed'));
  }
  return cb(null, true);
}

function publicUploadUrl(file) {
  return `/uploads/${path.basename(file.filename || file.path || '')}`;
}

module.exports = {
  imageFileFilter,
  publicUploadUrl,
  storage,
  uploadsDir,
};
