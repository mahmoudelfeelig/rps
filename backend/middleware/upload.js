const multer = require('multer');
const { storage } = require('../utils/uploadStorage');

const upload = multer({ storage });

module.exports = upload;
