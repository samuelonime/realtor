import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  verified: 'bg-green-100 text-green-700',
  flagged: 'bg-red-100 text-red-700',
};

const docTypeLabels = {
  certificate_of_occupancy: 'C of O',
  survey_plan: 'Survey Plan',
  deed_of_assignment: 'Deed of Assignment',
  other: 'Other',
};

export default function Documents() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({ property_id: '', document_type: 'certificate_of_occupancy', title: '', file_url: '', notes: '' });

  const fetchDocs = () => {
    api.getDocuments().then((res) => {
      setDocs(res.documents);
      setStats(res.stats);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocs(); }, []);

  const openNew = async () => {
    setShowNew(true);
    try {
      const res = await api.getProperties();
      setProperties(res.properties || []);
    } catch (err) {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createDocument(form);
      toast.success('Document uploaded');
      setShowNew(false);
      setForm({ property_id: '', document_type: 'certificate_of_occupancy', title: '', file_url: '', notes: '' });
      fetchDocs();
    } catch (err) { toast.error(err.message); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.updateDocument(id, { status });
      toast.success(`Document ${status}`);
      fetchDocs();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 text-sm mt-1">{stats.total || 0} documents</p>
        </div>
        <button onClick={openNew}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">+ Upload Document</button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Verified</p>
          <p className="text-2xl font-bold text-green-600">{stats.verified || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Flagged</p>
          <p className="text-2xl font-bold text-red-600">{stats.flagged || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Title</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Property</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Uploaded By</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{doc.title}</td>
                  <td className="py-3 px-4 text-gray-600">{docTypeLabels[doc.document_type]}</td>
                  <td className="py-3 px-4 text-gray-600 max-w-[150px] truncate">{doc.Property?.title || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[doc.status]}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{doc.uploader?.full_name || '-'}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{new Date(doc.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-1 justify-end">
                      {user?.role !== 'agent' && doc.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatusUpdate(doc.id, 'verified')}
                            className="text-xs text-green-600 hover:text-green-700 bg-green-50 px-2 py-1 rounded">Verify</button>
                          <button onClick={() => handleStatusUpdate(doc.id, 'flagged')}
                            className="text-xs text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded">Flag</button>
                        </>
                      )}
                      {doc.status === 'verified' && <span className="text-xs text-green-600">Done</span>}
                    </div>
                  </td>
                </tr>
              ))}
              {docs.length === 0 && (
                <tr><td colSpan="7" className="py-12 text-center text-gray-400">No documents uploaded</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property *</label>
                <select required value={form.property_id} onChange={(e) => setForm({...form, property_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="">Select property</option>
                  {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
                <select required value={form.document_type} onChange={(e) => setForm({...form, document_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="certificate_of_occupancy">Certificate of Occupancy (C of O)</option>
                  <option value="survey_plan">Survey Plan</option>
                  <option value="deed_of_assignment">Deed of Assignment</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File URL *</label>
                <input required value={form.file_url} onChange={(e) => setForm({...form, file_url: e.target.value})}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                <p className="text-xs text-gray-400 mt-1">Paste a link to the document (Google Drive, Dropbox, etc.)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowNew(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
