import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import {
  CreditCard,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Printer,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalTransactions: 0, capturedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await api.get('/payments/history');
        if (data.success) {
          setPayments(data.payments || []);
          if (data.summary) setSummary(data.summary);
        }
      } catch (err) {
        console.error('Failed to load payments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleViewInvoice = async (paymentId) => {
    setLoadingInvoice(true);
    try {
      const { data } = await api.get(`/payments/invoice/${paymentId}`);
      if (data.success) {
        setSelectedInvoice(data.invoice);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load invoice');
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredPayments = payments.filter((p) => {
    const clientName = p.clientId?.name?.toLowerCase() || '';
    const clientEmail = p.clientId?.email?.toLowerCase() || '';
    const invNum = p.invoiceNumber?.toLowerCase() || '';
    const q = search.toLowerCase();
    return clientName.includes(q) || clientEmail.includes(q) || invNum.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Payments & Invoicing</h2>
        <p className="text-xs text-slate-500">
          Track transaction histories, verify Razorpay settlements, and generate official client invoices.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total Collected Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            ₹{summary.totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">100% Direct Settlement to Bank</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Successful Transactions</span>
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{summary.capturedCount}</div>
          <span className="text-[11px] text-slate-400">Captured through Razorpay gateway</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total Booking Orders</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{summary.totalTransactions}</div>
          <span className="text-[11px] text-slate-400">Orders created via digital clinic</span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by client name, email, invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
        <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
          Showing {filteredPayments.length} of {payments.length} payments
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading payment records...</div>
        ) : filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Session</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Invoice</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{p.clientId?.name || 'Guest Client'}</div>
                      <div className="text-[11px] text-slate-400">{p.clientId?.email || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {p.sessionId ? (
                        <div>
                          <span className="font-medium text-slate-800">{p.sessionId.date}</span>
                          <span className="text-slate-400 block text-[11px]">at {p.sessionId.startTime}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">General Practice</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={p.status === 'captured' ? 'success' : p.status === 'created' ? 'warning' : 'danger'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {p.invoiceNumber || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.status === 'captured' ? (
                        <button
                          type="button"
                          onClick={() => handleViewInvoice(p._id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" /> View Receipt
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <CreditCard className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-medium text-slate-600">No payment transactions found</p>
            <p className="text-[11px] text-slate-400">
              When clients book and pay through your clinic page, transactions and invoices will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Invoice Viewer Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Receipt: ${selectedInvoice.invoiceNumber}`}
          size="lg"
        >
          <div className="space-y-6 text-xs text-slate-700 p-2 print:p-0">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {selectedInvoice.therapist?.name}
                </h3>
                <p className="text-slate-500 font-semibold">{selectedInvoice.therapist?.title}</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  {selectedInvoice.therapist?.clinicAddress}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200">
                  PAID IN FULL
                </span>
                <p className="font-mono text-slate-500 mt-1 text-[11px]">
                  {selectedInvoice.invoiceNumber}
                </p>
                <p className="text-[11px] text-slate-400">
                  Date: {new Date(selectedInvoice.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Billed To */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Billed To
                </span>
                <p className="font-bold text-slate-900">{selectedInvoice.client?.name}</p>
                <p className="text-slate-500">{selectedInvoice.client?.email}</p>
                {selectedInvoice.client?.phone && (
                  <p className="text-slate-400">{selectedInvoice.client?.phone}</p>
                )}
              </div>
              <div>
                <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Payment Details
                </span>
                <p className="text-slate-700">Gateway: <strong>{selectedInvoice.gateway}</strong></p>
                <p className="font-mono text-[11px] text-slate-500 truncate">
                  Ref: {selectedInvoice.transactionId}
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100/80 text-[10px] font-bold text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-center">Duration</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-medium text-slate-800">
                      Psychological Therapy & Consultation Session
                      {selectedInvoice.session && (
                        <span className="block text-[11px] text-slate-400">
                          Date: {selectedInvoice.session.date} at {selectedInvoice.session.startTime}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center text-slate-500">
                      {selectedInvoice.session?.duration || 50} mins
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      ₹{selectedInvoice.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={2} className="p-3 text-right text-slate-600">Total Paid:</td>
                    <td className="p-3 text-right text-emerald-700 text-sm">
                      ₹{selectedInvoice.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="text-[11px] text-slate-400 text-center pt-2">
              This is a computer-generated receipt issued through Unfazed Practice Management SaaS.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>
              <Button type="button" variant="primary" onClick={handlePrint} className="flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5" /> Print / Save PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PaymentsPage;
