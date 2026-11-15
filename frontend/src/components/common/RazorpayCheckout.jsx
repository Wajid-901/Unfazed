import React, { useState } from 'react';
import api from '../../api/axios';
import { CreditCard, Loader2 } from 'lucide-react';
import RazorpayTestGuide from './RazorpayTestGuide';

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
  const [testOrder, setTestOrder] = useState(null);

  const openCheckout = async (orderData) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      throw new Error('Failed to load Razorpay SDK. Check your internet connection.');
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount * 100,
      currency: orderData.currency || currency,
      name: 'Unfazed Practice',
      description: 'Therapy Consultation Fee',
      order_id: orderData.orderId,
      modal: {
        ondismiss: () => setLoading(false)
      },
      prefill: {
        name: clientName || ''
      },
      theme: {
        color: '#4A5240'
      },
      handler: async (response) => {
        try {
          const { data: verifyRes } = await api.post('/payments/verify', {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            paymentRecordId: orderData.paymentRecordId
          });

          if (verifyRes?.success) {
            onSuccess?.(verifyRes.payment);
          } else {
            throw new Error(verifyRes?.message || 'Payment verification failed.');
          }
        } catch (err) {
          onError?.(err.response?.data?.message || err.message || 'Verification failed.');
        } finally {
          setLoading(false);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      onError?.(response.error?.description || response.error?.reason || 'Payment failed.');
      setLoading(false);
    });
    rzp.open();
  };

  const handlePayment = async () => {
    let checkoutPending = false;
    setLoading(true);

    try {
      const { data: orderData } = await api.post('/payments/create-order', { sessionId });

      if (!orderData?.success) {
        throw new Error(orderData?.message || 'Failed to initiate order.');
      }

      const isPlaceholder =
        !orderData.keyId ||
        (!orderData.keyId.startsWith('rzp_test_') &&
          !orderData.keyId.startsWith('rzp_live_'));

      if (orderData.keyId?.startsWith('rzp_test_')) {
        setTestOrder(orderData);
        return;
      }

      if (!isPlaceholder) {
        await openCheckout(orderData);
        checkoutPending = true;
      } else {
        const { data: verifyRes } = await api.post('/payments/verify', {
          orderId: orderData.orderId,
          paymentId: `pay_mock_${Date.now()}`,
          signature: `mock_sig_${Date.now()}`,
          paymentRecordId: orderData.paymentRecordId
        });

        if (verifyRes?.success) {
          onSuccess?.(verifyRes.payment);
        } else {
          throw new Error(
            verifyRes?.message || 'Mock payment verification failed.'
          );
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Payment initiation failed.';

      onError?.(msg);
    } finally {
      if (!checkoutPending) setLoading(false);
    }
  };

  const continueTestPayment = async () => {
    if (!testOrder) return;

    const orderData = testOrder;
    setTestOrder(null);
    setLoading(true);
    try {
      await openCheckout(orderData);
    } catch (err) {
      onError?.(err.message || 'Failed to open Razorpay checkout.');
      setLoading(false);
    }
  };

  return (
    <>
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
      {testOrder && (
        <RazorpayTestGuide
          onCancel={() => setTestOrder(null)}
          onContinue={continueTestPayment}
        />
      )}
    </>
  );
};

export default RazorpayCheckout;