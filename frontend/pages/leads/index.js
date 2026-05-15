import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const stageLabels = {
  new_lead: 'New Lead', contacted: 'Contacted', interested: 'Interested',
  inspection_scheduled: 'Inspection Scheduled', negotiation: 'Negotiation',
  closed_won: 'Closed Won', closed_lost: 'Closed Lost',
};

const stageColors = {
  new_lead: 'bg-blue-100 text-blue-700', contacted: 'bg-purple-100 text-purple-700',
  interested: 'bg-amber-100 text-amber-700', inspection_scheduled: 'bg-emerald-100 text-emerald-700',
  negotiation: 'bg-red-100 text-red-700', closed_won: 'bg-green-100 text-green-700',
  closed_lost: 'bg-gray-100 text-gray-700',
};

export default function Leads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', source_id: '', notes: '' });
  const [sources, setSources] = useState([]);

  const fetchLeads = () => {
    const params = {};
    if (filter) params.stage = filter;
    if (search) params.search = search;
    api.getLeads(params).then((res) => {
      setLeads(res.leads);
      setStats(res.stats);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeads(); }, [filter, search]);
  useEffect(() => { api.getSources().then(setSources).catch(() => {}); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createLead(form);
      toast.success('Lead created');
      setShowNew(false);
      setForm({ full_name: '', phone: '', email: '', source_id: '', notes: '' });
      fetchLeads();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-1">{stats.total || 0} total leads</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
          + New Lead
        </button>
      </div>

      {/* Pipeline Stats */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {Object.entries(stageLabels).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(filter === key ? '' : key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === key ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}>
            {label} ({stats?.stages?.[key] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input type="text" placeholder="Search leads by name, phone, or email..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Source</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Stage</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Assigned To</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Created</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link href={`/leads/${lead.id}`} className="font-medium text-primary-600 hover:text-primary-700">
                      {lead.full_name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{lead.phone}</td>
                  <td className="py-3 px-4 text-gray-600">{lead.LeadSource?.name || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${stageColors[lead.stage]}`}>
                      {stageLabels[lead.stage]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{lead.assignee?.full_name || 'Unassigned'}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{new Date(lead.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/leads/${lead.id}`}
                      className="text-primary-600 hover:text-primary-700 text-xs font-medium">View</Link>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr><td colSpan="7" className="py-12 text-center text-gray-400">No leads found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Lead Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">New Lead</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input required value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input required value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select value={form.source_id} onChange={(e) => setForm({...form, source_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="">Select source</option>
                    {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea rows={3} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowNew(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Create Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
