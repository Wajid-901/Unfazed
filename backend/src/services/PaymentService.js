const crypto = require('crypto');

class PaymentService {
  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  }

  isConfigured() {
    return /^rzp_(test|live)_[A-Za-z0-9]+$/.test(this.keyId) &&
      Boolean(this.keySecret && this.webhookSecret) &&
      !/placeholder/i.test(`${this.keyId}${this.keySecret}${this.webhookSecret}`);
  }

  isMockMode() {
    return process.env.NODE_ENV !== 'production' && !this.isConfigured();
  }

  assertAvailable() {
    if (this.isConfigured() || this.isMockMode()) return;

    const error = new Error('Razorpay is not configured. Check the key ID, key secret, and webhook secret.');
    error.statusCode = 503;
    throw error;
  }

  async createOrder({ amount, currency = 'INR', receipt, notes = {} }) {
    this.assertAvailable();

    if (!Number.isFinite(amount) || amount <= 0) {
      const error = new Error('Payment amount must be a positive number.');
      error.statusCode = 400;
      throw error;
    }

    const amountInPaise = Math.round(amount * 100);
    if (amountInPaise < 1) {
      const error = new Error('Payment amount is below the minimum payable amount.');
      error.statusCode = 400;
      throw error;
    }

    if (this.isConfigured()) {
      const auth = Buffer.from(
        `${this.keyId}:${this.keySecret}`
      ).toString('base64');

      const response = await fetch(
        'https://api.razorpay.com/v1/orders',
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000),
          body: JSON.stringify({
            amount: amountInPaise,
            currency,
            receipt: receipt || `rcpt_${Date.now()}`,
            notes
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.description ||
            'Razorpay order creation failed'
        );
      }

      return data;
    }

    return {
      id: `order_test_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)}`,
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

  // Verify HMAC-SHA256 signature from Razorpay checkout
  verifyPaymentSignature({ orderId, paymentId, signature }) {
    if (!orderId || !paymentId || !signature) return false;

    if (this.isMockMode() && signature.startsWith('mock_sig_'))
      return true;
    if (!this.isConfigured()) return false;

    try {
      const generated = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (!/^[a-f\d]{64}$/i.test(signature)) return false;
      return crypto.timingSafeEqual(
        Buffer.from(generated, 'hex'),
        Buffer.from(signature, 'hex')
      );
    } catch {
      return false;
    }
  }

  verifyWebhookSignature({ rawBody, signature }) {
    if (!rawBody || !signature) return false;

    if (this.isMockMode() && signature.startsWith('mock_webhook_'))
      return true;
    if (!this.isConfigured()) return false;

    try {
      const generated = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (!/^[a-f\d]{64}$/i.test(signature)) return false;
      return crypto.timingSafeEqual(
        Buffer.from(generated, 'hex'),
        Buffer.from(signature, 'hex')
      );
    } catch {
      return false;
    }
  }

  // Generate unique invoice number for the current year
  generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(
      100000 + Math.random() * 900000
    );
    return `INV-${year}-${randomSuffix}`;
  }
}

module.exports = new PaymentService();