import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { CheckCircle, Printer, ArrowLeft, AlertCircle, HeartHandshake } from 'lucide-react';

const ClientInvoicePage = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const { data } = await api.get(`/payments/invoice/${id}`);
        if (data.success) {
          setInvoice(data.invoice);
        } else {
          setError(data.message || 'Invoice not found.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load invoice. It may not exist or you may not have access.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xs text-[#9C9890]">
        Loading invoice...
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-[#1C1C1A]">Invoice Not Found</h2>
        <p className="text-xs text-[#6B6860]">{error}</p>
        <Link to="/client/payments" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-500 hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Payments
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 print:py-2 print:max-w-full">
      {/* Back + Print controls — hidden on print */}
      <div className="flex items-center justify-between print:hidden">
        <Link to="/client/payments" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6860] hover:text-[#1C1C1A]">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Payments
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" /> Print / Save PDF
        </button>
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm p-8 print:shadow-none print:border-none print:rounded-none space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E8E4DC] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-lg">
              U
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#1C1C1A] tracking-tight">Unfazed</h1>
              <p className="text-[11px] text-[#6B6860]">Practice Management Platform</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200">
              PAID IN FULL
            </span>
            <p className="font-mono text-xs text-[#6B6860] mt-1.5">{invoice.invoiceNumber}</p>
            <p className="text-[11px] text-[#9C9890]">
              {new Date(invoice.date || invoice.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Therapist info */}
        {invoice.therapist && (
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-[#9C9890] uppercase tracking-wider">Service Provider</p>
            <p className="font-bold text-sm text-[#1C1C1A]">{invoice.therapist.name}</p>
            {invoice.therapist.title && <p className="text-xs text-[#6B6860]">{invoice.therapist.title}</p>}
            {invoice.therapist.clinicAddress && <p className="text-xs text-[#6B6860]">{invoice.therapist.clinicAddress}</p>}
          </div>
        )}

        {/* Billed to / Payment info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF8F4] p-4 rounded-xl border border-[#E8E4DC]">
          {invoice.client && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-[#9C9890] uppercase tracking-wider">Billed To</p>
              <p className="font-bold text-sm text-[#1C1C1A]">{invoice.client.name}</p>
              <p className="text-xs text-[#6B6860]">{invoice.client.email}</p>
              {invoice.client.phone && <p className="text-xs text-[#6B6860]">{invoice.client.phone}</p>}
            </div>
          )}
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-[#9C9890] uppercase tracking-wider">Payment Details</p>
            <p className="text-xs text-[#1C1C1A]">Gateway: <span className="font-semibold">{invoice.gateway || 'Razorpay'}</span></p>
            {invoice.transactionId && (
              <p className="font-mono text-[11px] text-[#6B6860] break-all">Ref: {invoice.transactionId}</p>
            )}
          </div>
        </div>

        {/* Line items */}
        <div className="border border-[#E8E4DC] rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#F2EFE9] text-[10px] font-bold text-[#6B6860] uppercase border-b border-[#E8E4DC]">
              <tr>
                <th className="p-3">Description</th>
                <th className="p-3 text-center">Duration</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#E8E4DC]">
                <td className="p-3">
                  <p className="font-medium text-xs text-[#1C1C1A]">Psychological Therapy & Consultation Session</p>
                  {invoice.session && (
                    <p className="text-[11px] text-[#9C9890] mt-0.5">
                      {invoice.session.date}{invoice.session.startTime ? ` at ${invoice.session.startTime}` : ''}
                    </p>
                  )}
                </td>
                <td className="p-3 text-center text-xs text-[#6B6860]">
                  {invoice.session?.duration || 50} mins
                </td>
                <td className="p-3 text-right font-bold text-sm text-[#1C1C1A]">
                  ₹{Number(invoice.amount || 0).toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-[#FAF8F4] border-t border-[#E8E4DC]">
              <tr>
                <td colSpan={2} className="p-3 text-right text-xs font-bold text-[#6B6860]">Total Paid:</td>
                <td className="p-3 text-right font-extrabold text-emerald-700">
                  ₹{Number(invoice.amount || 0).toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Success mark */}
        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-800">Payment Successfully Processed</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              This receipt confirms your consultation fee has been received in full.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-[#9C9890] text-center border-t border-[#E8E4DC] pt-4">
          This is a computer-generated receipt issued through Unfazed Practice Management SaaS. No physical signature required.
        </p>
      </div>
    </div>
  );
};

export default ClientInvoicePage;
