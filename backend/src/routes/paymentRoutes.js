const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const {
    createSessionOrder,
    verifyPayment,
    handleWebhook,
    getTherapistPayments,
    getInvoiceDetails,
    getClientPayments
} = require('../controllers/paymentController');

// Rate limiter for payment attempts (SACD Section 18: 10 req/min)
const paymentLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Too many payment requests, please try again in a minute.'
    }
});

// Public booking order creation & client payment verification
router.post('/create-order', paymentLimiter, createSessionOrder);
router.post('/verify', paymentLimiter, verifyPayment);
router.post('/webhook', handleWebhook);

// Therapist payment transactions history
router.get('/history', authenticate, authorize('THERAPIST'), getTherapistPayments);

// Client payment history
router.get('/mine', authenticate, authorize('CLIENT'), getClientPayments);

// Invoice lookup
router.get('/invoice/:id', authenticate, getInvoiceDetails);

module.exports = router;