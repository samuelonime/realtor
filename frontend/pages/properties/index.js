import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

const statusColors = {
  available: 'bg-green-100 text-green-700',
  reserved: 'bg-amber-100 text-amber-700',
  sold: 'bg-red-100 text-red-700',
};

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: '', price: '', location: '', description: '', property_type: '', bedrooms: '', bathrooms: '', status: 'available' });

  const fetchProps = () => {
    const params = {};
    if (filter) params.status = filter;
    api.getProperties(params).then((res) => {
      setProperties(res.properties);
      setStats(res.stats);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProps(); }, [filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createProperty({ ...form, price: parseFloat(form.price), bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null, bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null });
      toast.success('Property created');
      setShowNew(false);
      setForm({ title: '', price: '', location: '', description: '', property_type: '', bedrooms: '', bathrooms: '', status: 'available' });
      fetchProps();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this property?')) return;
    try {
      await api.deleteProperty(id);
      toast.success('Property deleted');
      fetchProps();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-500 text-sm mt-1">{stats.total || 0} properties</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">+ New Property</button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {['available', 'reserved', 'sold'].map((s) => (
          <button key={s} onClick={() => setFilter(filter === s ? '' : s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border capitalize ${
              filter === s ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-gray-200 text-gray-600'
            }`}>
            {s} ({stats?.[s] || 0})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="h-40 bg-gray-100 flex items-center justify-center">
              {p.PropertyImages?.[0] ? (
                <img src={p.PropertyImages[0].image_url} alt={p.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-sm">No image</span>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[p.status]}`}>{p.status}</span>
              </div>
              <p className="text-lg font-bold text-primary-600 mb-1">₦{parseFloat(p.price).toLocaleString()}</p>
              <p className="text-sm text-gray-500 mb-3">{p.location}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Agent: {p.propertyAgent?.full_name || 'N/A'}</span>
                <div className="flex gap-2">
                  <Link href={`/properties/${p.id}`} className="text-xs text-primary-600 hover:text-primary-700">Edit</Link>
                  <button onClick={() => handleDelete(p.id)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {properties.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 text-gray-400">No properties found</div>
        )}
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">New Property</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input required type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.property_type} onChange={(e) => setForm({...form, property_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="">Select</option>
                    <option value="land">Land</option>
                    <option value="duplex">Duplex</option>
                    <option value="apartment">Apartment</option>
                    <option value="bungalow">Bungalow</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input required value={form.location} onChange={(e) => setForm({...form, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <input type="number" value={form.bedrooms} onChange={(e) => setForm({...form, bedrooms: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                  <input type="number" value={form.bathrooms} onChange={(e) => setForm({...form, bathrooms: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowNew(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
