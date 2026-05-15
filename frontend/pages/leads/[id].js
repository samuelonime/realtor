import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

const stageLabels = {
  new_lead: 'New Lead', contacted: 'Contacted', interested: 'Interested',
  inspection_scheduled: 'Inspection Scheduled', negotiation: 'Negotiation',
  closed_won: 'Closed Won', closed_lost: 'Closed Lost',
};

export default function LeadDetail() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.getLead(id),
      user?.role !== 'agent' ? api.getAgents() : Promise.resolve([]),
    ]).then(([leadData, agentsData]) => {
      setLead(leadData);
      setAgents(agentsData);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleStageChange = async (stage) => {
    try {
      await api.updateLead(id, { ...lead, stage });
      setLead({ ...lead, stage });
      toast.success('Stage updated');
    } catch (err) { toast.error(err.message); }
  };

  const handleAssign = async (assigned_to) => {
    try {
      await api.updateLead(id, { ...lead, assigned_to: assigned_to || null });
      setLead({ ...lead, assigned_to });
      toast.success('Lead reassigned');
    } catch (err) { toast.error(err.message); }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    try {
      await api.addLeadNote(id, { content: note });
      const updated = await api.getLead(id);
      setLead(updated);
      setNote('');
      toast.success('Note added');
    } catch (err) { toast.error(err.message); }
  };

  if (loading) {
    return <Layout><div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div></Layout>;
  }
  if (!lead) return <Layout><p className="text-center text-gray-500 py-20">Lead not found</p></Layout>;

  return (
    <Layout>
      <div className="mb-6">
        <Link href="/leads" className="text-sm text-primary-600 hover:text-primary-700 mb-2 inline-block">&larr; Back to Leads</Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{lead.full_name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{lead.phone}</span></div>
              <div><span className="text-gray-500">Email:</span> <span className="font-medium">{lead.email || '-'}</span></div>
              <div><span className="text-gray-500">Source:</span> <span className="font-medium">{lead.LeadSource?.name || '-'}</span></div>
              <div><span className="text-gray-500">Created:</span> <span className="font-medium">{new Date(lead.created_at).toLocaleDateString()}</span></div>
            </div>
          </div>

          {/* Stage Selector */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold mb-4">Pipeline Stage</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stageLabels).map(([key, label]) => (
                <button key={key} onClick={() => handleStageChange(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    lead.stage === key ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold mb-4">Notes & History</h2>
            <div className="flex gap-2 mb-4">
              <input value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note..." className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              <button onClick={handleAddNote}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Add</button>
            </div>
            <div className="space-y-3">
              {lead.LeadNotes?.map((n) => (
                <div key={n.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{n.User?.full_name}</span>
                    <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600">{n.content}</p>
                </div>
              ))}
              {(!lead.LeadNotes || lead.LeadNotes.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">No notes yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold mb-4">Assignment</h2>
            {user?.role !== 'agent' ? (
              <select value={lead.assigned_to || ''} onChange={(e) => handleAssign(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">Unassigned</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
              </select>
            ) : (
              <p className="text-sm text-gray-600">{lead.assignee?.full_name || 'Unassigned'}</p>
            )}
          </div>

          {lead.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-lg font-semibold mb-2">Lead Notes</h2>
              <p className="text-sm text-gray-600">{lead.notes}</p>
            </div>
          )}

          {/* Linked Deal */}
          {lead.Deals?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-lg font-semibold mb-3">Linked Deals</h2>
              {lead.Deals.map((deal) => (
                <Link key={deal.id} href={`/deals`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <p className="text-sm font-medium text-primary-600">Deal #{deal.id}</p>
                  <p className="text-xs text-gray-500">₦{parseFloat(deal.deal_value).toLocaleString()}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
