const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  clientLogin,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail
} = require('../controllers/authController');
const {
  registerValidator,
  loginValidator
} = require('../validators/authValidators');
const authenticate = require('../middleware/auth');

// Rate limiter for authentication attempts (SACD Section 18: 5 req/min)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again in a minute.'
  }
});

router.post('/register', authLimiter, registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);
router.post('/client/login', authLimiter, loginValidator, clientLogin);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

// Password Reset & Verification (SaaS Pre-Launch Checklist)
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);
router.get('/verify-email/:token', verifyEmail);

module.exports = router;

