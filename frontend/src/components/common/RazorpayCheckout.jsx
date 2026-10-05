import React, { useState } from 'react';
import api from '../../api/axios';
import { CreditCard, Loader2 } from 'lucide-react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const RazorpayCheckout = ({
  sessionId,
  amount,
  currency = 'INR',
  clientName,
  onSuccess,
  onError,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create order on backend
      const { data: orderData } = await api.post('/payments/create-order', { sessionId });
      if (!orderData?.success) {
        throw new Error(orderData?.message || 'Failed to initiate order.');
      }

      const isPlaceholder = !orderData.keyId || orderData.keyId.includes('placeholder');

      // 2. If real key, open checkout
      if (!isPlaceholder) {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amount * 100,
          currency: orderData.currency || currency,
          name: 'Unfazed Practice',
          description: `Therapy Consultation Fee`,
          order_id: orderData.orderId,
          handler: async (response) => {
            try {
              const { data: verifyRes } = await api.post('/payments/verify', {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                paymentRecordId: orderData.paymentRecordId
              });
              if (verifyRes?.success) {
                if (onSuccess) onSuccess(verifyRes.payment);
              } else {
                throw new Error(verifyRes?.message || 'Payment verification failed.');
              }
            } catch (vErr) {
              if (onError) onError(vErr.response?.data?.message || vErr.message);
            }
          },
          prefill: {
            name: clientName || ''
          },
          theme: {
            color: '#4A5240'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          if (onError) onError(resp.error?.description || 'Payment was cancelled or failed.');
        });
        rzp.open();
      } else {
        // Dev fallback simulation
        const { data: verifyRes } = await api.post('/payments/verify', {
          orderId: orderData.orderId,
          paymentId: `pay_mock_${Date.now()}`,
          signature: `mock_sig_${Date.now()}`,
          paymentRecordId: orderData.paymentRecordId
        });
        if (verifyRes?.success) {
          if (onSuccess) onSuccess(verifyRes.payment);
        } else {
          throw new Error(verifyRes?.message || 'Mock payment verification failed.');
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      const msg = err.response?.data?.message || err.message || 'Payment initiation failed.';
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-3.5 h-3.5" />
          <span>Pay ₹{amount}</span>
        </>
      )}
    </button>
  );
};

export default RazorpayCheckout;
