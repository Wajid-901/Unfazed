import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Users, Search, Plus, ArrowUpRight, AlertCircle, Link2, Check, RefreshCw, Copy } from 'lucide-react';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  // Add client form state
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', tags: 'Active', notes: '' });

  // Invite link display after creation
  const [inviteLink, setInviteLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [resendingFor, setResendingFor] = useState(null);

  const fetchClients = async () => {
    try {
      let query = `/clients?search=${encodeURIComponent(search)}`;
      if (selectedTag) query += `&tag=${encodeURIComponent(selectedTag)}`;
      const { data } = await api.get(query);
      if (data.success) setClients(data.clients);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchClients, 250);
    return () => clearTimeout(timer);
  }, [search, selectedTag]);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...formData, tags: formData.tags.split(',').map((t) => t.trim()) };
      const { data } = await api.post('/clients', payload);
      setFormData({ name: '', email: '', phone: '', tags: 'Active', notes: '' });
      setInviteLink(data.inviteLink || '');
      fetchClients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add client. Check tier limit.');
    }
  };

  const handleCopyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link || inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      prompt('Copy this invite link and share it with your client:', link || inviteLink);
    }
  };

  const handleResendInvite = async (clientId) => {
    setResendingFor(clientId);
    try {
      const { data } = await api.post(`/clients/${clientId}/resend-invite`);
      if (data.inviteLink) handleCopyLink(data.inviteLink);
    } catch (err) {
      alert('Failed to regenerate invite link.');
    } finally {
      setResendingFor(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setInviteLink('');
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clients Directory (CRM)</h2>
          <p className="text-xs text-slate-500">Manage your therapy practice's clients, intake files, and session history.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Add New Client
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by client name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#E8E4DC] rounded-lg focus:ring-2 focus:ring-brand-400 outline-none bg-[#FAF8F4]"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <span className="text-xs text-slate-400">Tag:</span>
          {['', 'Active', 'Lead', 'Anxiety', 'Couples'].map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                selectedTag === tag ? 'bg-brand-500 text-white font-medium' : 'bg-[#F2EFE9] text-[#6B6860] hover:bg-[#E8E4DC]'
              }`}
            >
              {tag || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading clients...</div>
        ) : clients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Client Name</th>
                  <th className="py-3 px-6">Contact</th>
                  <th className="py-3 px-6">Tags</th>
                  <th className="py-3 px-6">Portal Access</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {clients.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      <Link to={`/dashboard/clients/${c._id}`} className="hover:text-brand-500 flex items-center gap-2 group">
                        <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <span>{c.name}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#E8E4DC] group-hover:text-brand-500 transition-colors" />
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <div>{c.email}</div>
                      <div className="text-[11px] text-slate-400">{c.phone || 'No phone'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {c.tags?.map((t, idx) => <Badge key={idx} variant="primary" size="sm">{t}</Badge>)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {c.consentSignedAt ? (
                        <Badge variant="success" size="sm">Active</Badge>
                      ) : (
                        <button
                          onClick={() => handleResendInvite(c._id)}
                          disabled={resendingFor === c._id}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors disabled:opacity-60"
                        >
                          {resendingFor === c._id
                            ? <><RefreshCw className="w-3 h-3 animate-spin" /> Generating…</>
                            : <><Link2 className="w-3 h-3" /> Copy Invite Link</>
                          }
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/dashboard/clients/${c._id}`}
                        className="px-2.5 py-1 rounded bg-[#F2EFE9] hover:bg-brand-50 text-[#6B6860] hover:text-brand-600 font-medium transition-colors"
                      >
                        View Timeline
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No clients found</p>
            <p className="text-xs text-slate-400 mt-1">Add your first client to start recording history.</p>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={inviteLink ? '🎉 Client Added Successfully' : 'Add Client to Practice'}>
        {/* Show invite link after successful creation */}
        {inviteLink ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-brand-50 border border-brand-200">
              <p className="text-xs font-semibold text-brand-700 mb-1">Share this invite link with your client</p>
              <p className="text-[11px] text-brand-600 mb-3">
                Your client clicks this link to set their own password and access their portal. The link expires in <strong>24 hours</strong>.
              </p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={inviteLink}
                  className="flex-1 text-xs bg-white border border-brand-200 rounded-lg px-2 py-1.5 font-mono text-[#1C1C1A] select-all"
                  onFocus={(e) => e.target.select()}
                />
                <button
                  type="button"
                  onClick={() => handleCopyLink()}
                  className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                    linkCopied
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : 'bg-accent-500 text-white hover:bg-accent-600'
                  }`}
                >
                  {linkCopied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 text-center">You can also resend the invite later from the Clients table.</p>
            <Button onClick={closeModal} className="w-full" variant="secondary">Done</Button>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Verma"
                  className="w-full text-sm border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none bg-[#FAF8F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahul@example.com"
                  className="w-full text-sm border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none bg-[#FAF8F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full text-sm border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none bg-[#FAF8F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Active, Stress, Telehealth"
                  className="w-full text-sm border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none bg-[#FAF8F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Presenting Concern</label>
                <textarea
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Brief summary of client's main concerns..."
                  className="w-full text-sm border border-[#E8E4DC] rounded-lg p-2 focus:ring-2 focus:ring-brand-400 outline-none bg-[#FAF8F4]"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                🔒 A secure invite link will be generated. Share it with your client so they can set their own password privately.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                <Button type="submit" variant="primary">Add Client & Get Invite Link</Button>
              </div>
            </form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ClientsPage;
