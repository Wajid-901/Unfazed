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
  verifyEmail,
  setupClientPassword,
  resendVerification
} = require('../controllers/authController');
const {
  registerValidator,
  loginValidator
} = require('../validators/authValidators');
const authenticate = require('../middleware/auth');
const getAllowedOrigins = require('../config/origins');

const validateRefreshOrigin = (req, res, next) => {
  const origin = req.get('origin');
  if (origin && !getAllowedOrigins().includes(origin)) {
    return res.status(403).json({
      success: false,
      message: 'Origin is not allowed to refresh authentication.'
    });
  }
  next();
};

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
router.post('/refresh-token', validateRefreshOrigin, refreshToken);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);
// Client invite — no auth required, client uses this to set their own password
router.post('/client/setup-password', authLimiter, setupClientPassword);

module.exports = router;

