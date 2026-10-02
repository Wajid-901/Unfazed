import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Badge from '../../components/common/Badge';
import { CreditCard, Receipt, ExternalLink } from 'lucide-react';

const paymentStatusVariant = (status) => {
  if (status === 'captured') return 'success';
  if (status === 'created') return 'warning';
  if (status === 'failed') return 'danger';
  if (status === 'refunded') return 'neutral';
  return 'neutral';
};

const formatCurrency = (paise) => {
  if (paise == null) return '—';
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const ClientPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await api.get('/payments/mine');
        if (data.success) {
          // Sort newest first by session date or createdAt
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

    fetchPayments();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider block mb-1">
          Payments
        </span>
        <h1 className="text-2xl font-bold text-slate-900">Payment History</h1>
        <p className="text-xs text-slate-500 mt-1">
          All invoices and payment records for your sessions
        </p>
      </div>

      {/* Payments List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading payment history...</div>
      ) : payments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">No payment records found</p>
          <p className="text-xs text-slate-400 mt-1">
            Payments made for your sessions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment._id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left: Invoice & session info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Receipt className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>
                      {payment.invoiceNumber || 'Pending'}
                    </span>
                  </div>
                  {payment.sessionId?.date && (
                    <p className="text-xs text-slate-500 pl-0.5">
                      Session date:{' '}
                      <span className="font-semibold text-slate-700">
                        {payment.sessionId.date}
                      </span>
                    </p>
                  )}
                  <p className="text-xs text-slate-500 pl-0.5">
                    Amount:{' '}
                    <span className="font-bold text-slate-800 text-sm">
                      {formatCurrency(payment.amount)}
                    </span>
                  </p>
                </div>

                {/* Right: Status & action */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={paymentStatusVariant(payment.status)}>
                    {payment.status}
                  </Badge>
                  {payment.status === 'captured' && (
                    <a
                      href={`/client/invoice/${payment._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold border border-teal-600 text-teal-600 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      View Invoice
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientPaymentsPage;
