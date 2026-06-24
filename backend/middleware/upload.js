const multer = require('multer');
const { imageFileFilter, storage } = require('../utils/uploadStorage');

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;
