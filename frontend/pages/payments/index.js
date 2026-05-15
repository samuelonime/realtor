import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const statusColors = {
  pending: 'bg-red-100 text-red-700',
  partial: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
};

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [deals, setDeals] = useState([]);
  const [form, setForm] = useState({ deal_id: '', customer_name: '', amount: '', payment_date: '', payment_method: 'transfer', notes: '' });

  const fetchPayments = () => {
    api.getPayments().then((res) => {
      setPayments(res.payments);
      setStats(res.stats);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, []);

  const openNew = async () => {
    setShowNew(true);
    try {
      const dealsRes = await api.getDeals();
      setDeals(dealsRes.deals || []);
    } catch (err) {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createPayment({
        ...form,
        amount: parseFloat(form.amount),
        payment_date: form.payment_date || new Date().toISOString().split('T')[0],
      });
      toast.success('Payment recorded');
      setShowNew(false);
      setForm({ deal_id: '', customer_name: '', amount: '', payment_date: '', payment_method: 'transfer', notes: '' });
      fetchPayments();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 text-sm mt-1">₦{(stats.total_collected || 0).toLocaleString()} collected</p>
        </div>
        <button onClick={openNew}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">+ Record Payment</button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Partial</p>
          <p className="text-2xl font-bold text-amber-600">{stats.partial || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-red-600">{stats.pending || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Deal</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Method</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{p.customer_name}</td>
                  <td className="py-3 px-4 text-gray-600">#{p.deal_id}</td>
                  <td className="py-3 px-4 text-right font-medium">₦{parseFloat(p.amount).toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-600 capitalize">{p.payment_method}</td>
                  <td className="py-3 px-4 text-gray-600">{new Date(p.payment_date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{p.receipt_number || '-'}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan="7" className="py-12 text-center text-gray-400">No payments recorded</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Record Payment</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal *</label>
                <select required value={form.deal_id} onChange={(e) => {
                  const deal = deals.find(d => d.id === parseInt(e.target.value));
                  setForm({...form, deal_id: e.target.value, customer_name: deal?.Lead?.full_name || '' });
                }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="">Select deal</option>
                  {deals.map((d) => <option key={d.id} value={d.id}>#{d.id} - {d.Lead?.full_name} (₦{parseFloat(d.deal_value).toLocaleString()})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <input required value={form.customer_name} onChange={(e) => setForm({...form, customer_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <input required type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                  <input type="date" value={form.payment_date} onChange={(e) => setForm({...form, payment_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                  <select value={form.payment_method} onChange={(e) => setForm({...form, payment_method: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="pos">POS</option>
                  </select>
                </div>
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
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
