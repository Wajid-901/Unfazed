import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Badge from '../../components/common/Badge';
import RazorpayCheckout from '../../components/common/RazorpayCheckout';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, Receipt, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

const paymentStatusVariant = (status) => {
  if (status === 'captured') return 'success';
  if (status === 'created') return 'warning';
  if (status === 'failed') return 'danger';
  if (status === 'refunded') return 'neutral';
  return 'neutral';
};

// Payments come back as paise from Razorpay orders but our backend stores rupees directly.
// Handle both: if amount > 10000 treat as paise, else treat as rupees.
const formatAmount = (amount) => {
  if (amount == null) return '—';
  const rupees = amount > 10000 ? amount / 100 : amount;
  return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

const ClientPaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const fetchPayments = async () => {
    try {
      const { data } = await api.get('/payments/mine');
      if (data.success) {
        const sorted = (data.payments || []).sort(
          (a, b) =>
            new Date(b.sessionId?.date || b.createdAt) -
            new Date(a.sessionId?.date || a.createdAt)
        );
        setPayments(sorted);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handlePaymentSuccess = (payment) => {
    setFeedback({
      type: 'success',
      message: `Payment captured! Invoice: ${payment?.invoiceNumber || 'generated'}. Thank you.`
    });
    fetchPayments(); // Refresh list to show updated status
  };

  const handlePaymentError = (errMsg) => {
    setFeedback({
      type: 'error',
      message: errMsg || 'Payment failed or was cancelled. Please try again.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-xs p-6 sm:p-8">
        <span className="text-xs font-semibold text-accent-500 uppercase tracking-wider block mb-1">
          Payments
        </span>
        <h1 className="text-2xl font-bold text-[#1C1C1A]">Payment History</h1>
        <p className="text-xs text-[#6B6860] mt-1">
          All invoices and payment records for your sessions
        </p>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold opacity-70 hover:opacity-100 underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Payments List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#6B6860]">Loading payment history...</div>
      ) : payments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E8E4DC]">
          <CreditCard className="w-10 h-10 text-[#C8C4BC] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#1C1C1A]">No payment records found</p>
          <p className="text-xs text-[#6B6860] mt-1">
            Payments made for your sessions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => {
            const isPending = payment.status === 'created';
            const isPaid = payment.status === 'captured';
            // A payment is payable if it's in 'created' state and has an associated session
            const sessionId = payment.sessionId?._id || payment.sessionId;
            const canPay = isPending && sessionId;

            return (
              <div
                key={payment._id}
                className="bg-white rounded-xl border border-[#E8E4DC] shadow-xs p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Invoice & session info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#1C1C1A]">
                      <Receipt className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      <span>{payment.invoiceNumber || (isPending ? 'Pending Invoice' : 'N/A')}</span>
                    </div>
                    {payment.sessionId?.date && (
                      <p className="text-xs text-[#6B6860] pl-0.5">
                        Session:{' '}
                        <span className="font-semibold text-[#1C1C1A]">
                          {payment.sessionId.date}
                          {payment.sessionId.startTime ? ` at ${payment.sessionId.startTime}` : ''}
                        </span>
                      </p>
                    )}
                    <p className="text-xs text-[#6B6860] pl-0.5">
                      Amount:{' '}
                      <span className="font-bold text-[#1C1C1A] text-sm">
                        {formatAmount(payment.amount)}
                      </span>
                    </p>
                    {payment.createdAt && (
                      <p className="text-[11px] text-[#9C9890] pl-0.5">
                        {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>

                  {/* Right: Status badge + actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={paymentStatusVariant(payment.status)}>
                      {payment.status === 'captured' ? 'Paid' : payment.status === 'created' ? 'Pending' : payment.status}
                    </Badge>

                    {/* Pay Now button for pending payments */}
                    {canPay && (
                      <RazorpayCheckout
                        sessionId={sessionId}
                        amount={payment.amount > 10000 ? payment.amount / 100 : payment.amount}
                        currency="INR"
                        clientName={user?.name}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    )}

                    {/* View Invoice link for paid payments */}
                    {isPaid && (
                      <a
                        href={`/client/invoice/${payment._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold border border-brand-500 text-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        View Invoice
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientPaymentsPage;
