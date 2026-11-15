import React from 'react';

const RazorpayTestGuide = ({ onCancel, onContinue }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="razorpay-test-guide-title"
  >
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <h2 id="razorpay-test-guide-title" className="text-lg font-bold text-[#1C1C1A]">
        Razorpay test payment
      </h2>
      <p className="mt-2 text-sm text-[#6B6860]">
        This is a simulated payment. No real money is charged.
      </p>
      <div className="mt-4 rounded-xl border border-[#E8E4DC] bg-[#FAF8F4] p-4 text-sm text-[#1C1C1A]">
        <p><strong>Card number:</strong> 4100 2800 0000 1007</p>
        <p className="mt-1"><strong>Expiry:</strong> any future date</p>
        <p className="mt-1"><strong>CVV:</strong> any value</p>
        <p className="mt-3">
          On the sample bank page, enter any 4-10 digit OTP for success. Fewer than 4 digits simulates a failed payment.
        </p>
      </div>
      <p className="mt-3 text-xs text-[#6B6860]">
        Test cards work only when Unfazed is configured with Razorpay test keys.{' '}
        <a
          href="https://razorpay.com/docs/payments/payments/test-card-details/"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-brand-600 hover:underline"
        >
          Razorpay test card instructions
        </a>
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#E8E4DC] px-4 py-2 text-sm font-semibold text-[#6B6860] hover:bg-[#FAF8F4]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600"
        >
          Continue to payment
        </button>
      </div>
    </div>
  </div>
);

export default RazorpayTestGuide;
