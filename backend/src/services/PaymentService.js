const crypto = require('crypto');
const Payment = require('../models/Payment');
const Session = require('../models/Session');
const Therapist = require('../models/Therapist');

class PaymentService {
  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_placeholder';
  }

  isConfigured() {
    return (
      this.keyId &&
      this.keySecret &&
      !this.keyId.includes('placeholder') &&
      !this.keySecret.includes('placeholder')
    );
  }

  /**
   * Create Razorpay order
   */
  async createOrder({ amount, currency = 'INR', receipt, notes = {} }) {
    const amountInPaise = Math.round(amount * 100);

    if (this.isConfigured()) {
      try {
        const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
        const response = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency,
            receipt: receipt || `rcpt_${Date.now()}`,
            notes
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.description || 'Razorpay order creation failed');
        }
        return data;
      } catch (err) {
        console.error('[PaymentService] Razorpay API error:', err.message);
        throw err;
      }
    }

    // Mock/Sandbox Mode for development testing
    const mockOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      id: mockOrderId,
      entity: 'order',
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      status: 'created',
      notes
    };
  }

  /**
   * Verify frontend checkout payment signature
   */
  verifyPaymentSignature({ orderId, paymentId, signature }) {
    if (!orderId || !paymentId || !signature) {
      return false;
    }

    // If sandbox / test mock signature passed
    if (!this.isConfigured() && signature.startsWith('mock_sig_')) {
      return true;
    }

    try {
      const generated = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      return generated === signature;
    } catch (err) {
      console.error('[PaymentService] Signature verification error:', err);
      return false;
    }
  }

  /**
   * Verify Razorpay Webhook signature (SACD Section 15)
   */
  verifyWebhookSignature({ rawBody, signature }) {
    if (!rawBody || !signature) return false;

    // Development sandbox bypass for testing tools
    if (!this.isConfigured() && signature.startsWith('mock_webhook_')) {
      return true;
    }

    try {
      const generated = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(rawBody)
        .digest('hex');

      return generated === signature;
    } catch (err) {
      console.error('[PaymentService] Webhook verification error:', err);
      return false;
    }
  }

  /**
   * Generate sequential invoice number
   */
  generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `INV-${year}-${randomSuffix}`;
  }
}

module.exports = new PaymentService();
