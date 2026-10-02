const crypto = require('crypto');

class PaymentService {
  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_placeholder';
  }

  // Returns false if still using placeholder keys
  isConfigured() {
    return (
      this.keyId &&
      this.keySecret &&
      !this.keyId.includes('placeholder') &&
      !this.keySecret.includes('placeholder')
    );
  }

  // Create a Razorpay order; falls back to mock in dev/sandbox
  async createOrder({ amount, currency = 'INR', receipt, notes = {} }) {
    const amountInPaise = Math.round(amount * 100);

    if (this.isConfigured()) {
      try {
        const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
        const response = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: amountInPaise, currency, receipt: receipt || `rcpt_${Date.now()}`, notes })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.description || 'Razorpay order creation failed');
        return data;
      } catch (err) {
        console.error('[PaymentService] Razorpay API error:', err.message);
        throw err;
      }
    }

    // Dev/sandbox mock order
    return {
      id: `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
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
    if (!this.isConfigured() && signature.startsWith('mock_sig_')) return true;

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

  // Verify webhook HMAC signature from Razorpay
  verifyWebhookSignature({ rawBody, signature }) {
    if (!rawBody || !signature) return false;
    if (!this.isConfigured() && signature.startsWith('mock_webhook_')) return true;

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

  // Generate unique invoice number for the current year
  generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `INV-${year}-${randomSuffix}`;
  }
}

module.exports = new PaymentService();
