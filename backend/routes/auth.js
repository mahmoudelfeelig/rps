const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  resendVerification,
  requestPasswordReset,
  resetPassword,
} = require('../controllers/authController');
const rateLimit = require('../middleware/rateLimit');

const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, keyPrefix: 'auth' });
const emailLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, keyPrefix: 'email-verification' });

router.post('/register', authLimit, register);
router.post('/login', authLimit, login);
router.post('/verify-email', authLimit, verifyEmail);
router.post('/resend-verification', emailLimit, resendVerification);
router.post('/forgot-password', emailLimit, requestPasswordReset);
router.post('/reset-password', authLimit, resetPassword);

module.exports = router;
