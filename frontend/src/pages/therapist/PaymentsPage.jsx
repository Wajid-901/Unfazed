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
        <h2 className="text-xl font-bold text-[#1C1C1A] tracking-tight">Payments &amp; Invoicing</h2>
        <p className="text-xs text-[#6B6860]">
          Track transaction histories, verify Razorpay settlements, and generate official client invoices.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8E4DC] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#6B6860] font-semibold">
            <span>Total Collected Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#1C1C1A]">
            ₹{summary.totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">100% Direct Settlement to Bank</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E4DC] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#6B6860] font-semibold">
            <span>Successful Transactions</span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#1C1C1A]">{summary.capturedCount}</div>
          <span className="text-[11px] text-[#6B6860]">Captured through Razorpay gateway</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E4DC] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#6B6860] font-semibold">
            <span>Total Booking Orders</span>
            <div className="w-8 h-8 rounded-lg bg-[#E8E4DC] text-[#6B6860] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#1C1C1A]">{summary.totalTransactions}</div>
          <span className="text-[11px] text-[#6B6860]">Orders created via digital clinic</span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E8E4DC] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by client name, email, invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 border border-[#E8E4DC] rounded-lg outline-none focus:ring-2 focus:ring-brand-400 bg-[#FAF8F4]"
          />
          <Search className="w-3.5 h-3.5 text-[#6B6860] absolute left-2.5 top-2.5" />
        </div>
        <div className="text-xs text-[#6B6860] font-medium self-end sm:self-center">
          Showing {filteredPayments.length} of {payments.length} payments
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#6B6860]">Loading payment records...</div>
        ) : filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F4] border-b border-[#E8E4DC] text-[#6B6860] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Session</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Invoice</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DC] text-[#1C1C1A]">
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-[#FAF8F4] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#6B6860] whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1C1C1A]">{p.clientId?.name || 'Guest Client'}</div>
                      <div className="text-[11px] text-[#6B6860]">{p.clientId?.email || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {p.sessionId ? (
                        <div>
                          <span className="font-medium text-[#1C1C1A]">{p.sessionId.date}</span>
                          <span className="text-[#6B6860] block text-[11px]">at {p.sessionId.startTime}</span>
                        </div>
                      ) : (
                        <span className="text-[#6B6860]">General Practice</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1C1C1A]">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={p.status === 'captured' ? 'success' : p.status === 'created' ? 'warning' : 'danger'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#6B6860]">
                      {p.invoiceNumber || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.status === 'captured' ? (
                        <button
                          type="button"
                          onClick={() => handleViewInvoice(p._id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" /> View Receipt
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#6B6860] italic">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-[#6B6860] space-y-2">
            <CreditCard className="w-8 h-8 mx-auto text-[#C8C4BC]" />
            <p className="font-medium text-[#1C1C1A]">No payment transactions found</p>
            <p className="text-[11px] text-[#6B6860]">
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
          <div className="space-y-6 text-xs text-[#1C1C1A] p-2 print:p-0">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-[#E8E4DC] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#1C1C1A]">
                  {selectedInvoice.therapist?.name}
                </h3>
                <p className="text-[#6B6860] font-semibold">{selectedInvoice.therapist?.title}</p>
                <p className="text-[11px] text-[#6B6860] mt-1 max-w-xs">
                  {selectedInvoice.therapist?.clinicAddress}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200">
                  PAID IN FULL
                </span>
                <p className="font-mono text-[#6B6860] mt-1 text-[11px]">
                  {selectedInvoice.invoiceNumber}
                </p>
                <p className="text-[11px] text-[#6B6860]">
                  Date: {new Date(selectedInvoice.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Billed To */}
            <div className="grid grid-cols-2 gap-4 bg-[#FAF8F4] p-4 rounded-xl border border-[#E8E4DC]">
              <div>
                <span className="font-bold text-[10px] text-[#6B6860] uppercase tracking-wider block mb-1">
                  Billed To
                </span>
                <p className="font-bold text-[#1C1C1A]">{selectedInvoice.client?.name}</p>
                <p className="text-[#6B6860]">{selectedInvoice.client?.email}</p>
                {selectedInvoice.client?.phone && (
                  <p className="text-[#6B6860]">{selectedInvoice.client?.phone}</p>
                )}
              </div>
              <div>
                <span className="font-bold text-[10px] text-[#6B6860] uppercase tracking-wider block mb-1">
                  Payment Details
                </span>
                <p className="text-[#1C1C1A]">Gateway: <strong>{selectedInvoice.gateway}</strong></p>
                <p className="font-mono text-[11px] text-[#6B6860] truncate">
                  Ref: {selectedInvoice.transactionId}
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-[#E8E4DC] rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#FAF8F4] text-[10px] font-bold text-[#6B6860] uppercase border-b border-[#E8E4DC]">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-center">Duration</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DC]">
                  <tr>
                    <td className="p-3 font-medium text-[#1C1C1A]">
                      Psychological Therapy &amp; Consultation Session
                      {selectedInvoice.session && (
                        <span className="block text-[11px] text-[#6B6860]">
                          Date: {selectedInvoice.session.date} at {selectedInvoice.session.startTime}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center text-[#6B6860]">
                      {selectedInvoice.session?.duration || 50} mins
                    </td>
                    <td className="p-3 text-right font-bold text-[#1C1C1A]">
                      ₹{selectedInvoice.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-[#FAF8F4] font-bold border-t border-[#E8E4DC]">
                  <tr>
                    <td colSpan={2} className="p-3 text-right text-[#6B6860]">Total Paid:</td>
                    <td className="p-3 text-right text-emerald-700 text-sm">
                      ₹{selectedInvoice.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="text-[11px] text-[#6B6860] text-center pt-2">
              This is a computer-generated receipt issued through Unfazed Practice Management SaaS.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E4DC]">
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
