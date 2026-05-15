import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const stageColors = {
  inspection: 'bg-purple-100 text-purple-700',
  offer_made: 'bg-amber-100 text-amber-700',
  payment_ongoing: 'bg-blue-100 text-blue-700',
  closed: 'bg-green-100 text-green-700',
};

const stageLabels = {
  inspection: 'Inspection', offer_made: 'Offer Made',
  payment_ongoing: 'Payment Ongoing', closed: 'Closed',
};

export default function Deals() {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({ lead_id: '', property_id: '', agent_id: '', deal_value: '', notes: '' });

  const fetchDeals = () => {
    const params = {};
    if (filter) params.stage = filter;
    api.getDeals(params).then((res) => {
      setDeals(res.deals);
      setStats(res.stats);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchDeals(); }, [filter]);

  const openNew = async () => {
    setShowNew(true);
    try {
      const [leadsRes, propsRes, agentsRes] = await Promise.all([
        api.getLeads({ stage: 'negotiation' }),
        api.getProperties({ status: 'available' }),
        user?.role !== 'agent' ? api.getAgents() : Promise.resolve([]),
      ]);
      setLeads(leadsRes.leads || []);
      setProperties(propsRes.properties || []);
      setAgents(agentsRes);
    } catch (err) {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createDeal({
        ...form,
        deal_value: parseFloat(form.deal_value),
        agent_id: form.agent_id || user?.id,
      });
      toast.success('Deal created');
      setShowNew(false);
      setForm({ lead_id: '', property_id: '', agent_id: '', deal_value: '', notes: '' });
      fetchDeals();
    } catch (err) { toast.error(err.message); }
  };

  const handleStageUpdate = async (id, stage) => {
    try {
      await api.updateDeal(id, { stage });
      toast.success('Deal stage updated');
      fetchDeals();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-500 text-sm mt-1">{stats.total || 0} deals | ₦{(stats.total_value || 0).toLocaleString()} total value</p>
        </div>
        <button onClick={openNew}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">+ New Deal</button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {Object.entries(stageLabels).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(filter === key ? '' : key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${
              filter === key ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-gray-200 text-gray-600'
            }`}>
            {label} ({stats?.[key] || 0})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Property</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Agent</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Value</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Stage</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr key={deal.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{deal.Lead?.full_name || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">{deal.Property?.title || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-600">{deal.agent?.full_name || 'N/A'}</td>
                  <td className="py-3 px-4 text-right font-medium">₦{parseFloat(deal.deal_value).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <select value={deal.stage} onChange={(e) => handleStageUpdate(deal.id, e.target.value)}
                      className={`px-2 py-0.5 rounded text-xs font-medium border-0 ${stageColors[deal.stage]}`}>
                      {Object.entries(stageLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{new Date(deal.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/deals/${deal.id}`} className="text-xs text-primary-600 hover:text-primary-700">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {deals.length === 0 && (
                <tr><td colSpan="7" className="py-12 text-center text-gray-400">No deals found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">New Deal</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead *</label>
                <select required value={form.lead_id} onChange={(e) => setForm({...form, lead_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="">Select lead</option>
                  {leads.map((l) => <option key={l.id} value={l.id}>{l.full_name} - {l.phone}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                <select value={form.property_id} onChange={(e) => setForm({...form, property_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="">Select property</option>
                  {properties.map((p) => <option key={p.id} value={p.id}>{p.title} - ₦{parseFloat(p.price).toLocaleString()}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deal Value *</label>
                  <input required type="number" value={form.deal_value} onChange={(e) => setForm({...form, deal_value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                {user?.role !== 'agent' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
                    <select value={form.agent_id} onChange={(e) => setForm({...form, agent_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                      <option value="">Self</option>
                      {agents.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={3} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowNew(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Create Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
