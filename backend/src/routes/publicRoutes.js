const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  getPublicProfile,
  getPublicSlots,
  publicBookSession
} = require('../controllers/publicController');

// Rate limiter for public bookings (SACD Section 18: 30 req/min)
const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Booking request rate limit reached. Please wait a minute and retry.'
  }
});

router.get('/therapist/:slug', getPublicProfile);
router.get('/therapist/:slug/slots', getPublicSlots);
router.post('/therapist/:slug/book', bookingLimiter, publicBookSession);

module.exports = router;
