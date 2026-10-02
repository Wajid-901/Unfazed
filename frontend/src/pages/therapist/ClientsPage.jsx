import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Users, Search, Plus, Phone, Mail, ArrowUpRight, AlertCircle } from 'lucide-react';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  // Add client form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    tags: 'Active',
    notes: ''
  });

  const fetchClients = async () => {
    try {
      let query = `/clients?search=${encodeURIComponent(search)}`;
      if (selectedTag) query += `&tag=${encodeURIComponent(selectedTag)}`;
      const { data } = await api.get(query);
      if (data.success) {
        setClients(data.clients);
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedTag]);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim())
      };
      await api.post('/clients', payload);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', tags: 'Active', notes: '' });
      fetchClients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add client. Check tier limit.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clients Directory (CRM)</h2>
          <p className="text-xs text-slate-500">
            Manage your therapy practice's clients, intake files, and session history.
          </p>
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
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400">Tag:</span>
          {['', 'Active', 'Lead', 'Anxiety', 'Couples'].map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                selectedTag === tag
                  ? 'bg-primary-600 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                  <th className="py-3 px-6">Intake Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {clients.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      <Link
                        to={`/dashboard/clients/${c._id}`}
                        className="hover:text-primary-600 flex items-center gap-2 group"
                      >
                        <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center">
                          {c.name.charAt(0)}
                        </div>
                        <span>{c.name}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary-600 transition-colors" />
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <div>{c.email}</div>
                      <div className="text-[11px] text-slate-400">{c.phone || 'No phone'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {c.tags?.map((t, idx) => (
                          <Badge key={idx} variant="primary" size="sm">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {c.consentSignedAt ? (
                        <Badge variant="success" size="sm">Consent Signed</Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">Pending Intake</Badge>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/dashboard/clients/${c._id}`}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-primary-50 text-slate-700 hover:text-primary-700 font-medium transition-colors"
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Client to Practice">
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
              className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
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
              className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 9876543210"
              className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Active, Stress, Telehealth"
              className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Presenting Concern</label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Brief summary of client's main concerns..."
              className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Client
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientsPage;
