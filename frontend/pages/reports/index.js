import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../lib/api';
import { HiTrendingUp, HiUserGroup, HiCash, HiOfficeBuilding } from 'react-icons/hi';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

const fmt = (n) => '₦' + (n || 0).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function Reports() {
  const [revenue, setRevenue] = useState([]);
  const [funnel, setFunnel] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [propPerf, setPropPerf] = useState([]);
  const [months, setMonths] = useState(12);
  const [tab, setTab] = useState('revenue');

  useEffect(() => {
    api.getMonthlyRevenue(months).then(setRevenue).catch(() => {});
    api.getLeadFunnel().then(setFunnel).catch(() => {});
    api.getAgentLeaderboard().then(setLeaderboard).catch(() => {});
    api.getPropertyPerformance().then(setPropPerf).catch(() => {});
  }, [months]);

  const revenueChart = {
    labels: revenue.map(r => r.month),
    datasets: [{
      label: 'Revenue (₦)',
      data: revenue.map(r => r.total),
      backgroundColor: 'rgba(37,99,235,0.15)',
      borderColor: '#2563EB',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#2563EB',
    }],
  };

  const funnelLabels = {
    new_lead: 'New Lead', contacted: 'Contacted', interested: 'Interested',
    inspection_scheduled: 'Inspection', negotiation: 'Negotiation',
    closed_won: 'Won', closed_lost: 'Lost',
  };

  const funnelChart = {
    labels: funnel.map(f => funnelLabels[f.stage] || f.stage),
    datasets: [{
      label: 'Leads',
      data: funnel.map(f => f.count),
      backgroundColor: [
        '#3B82F6','#8B5CF6','#F59E0B','#10B981','#EF4444','#059669','#6B7280',
      ],
    }],
  };

  const tabs = [
    { id: 'revenue', label: 'Revenue', icon: HiCash },
    { id: 'funnel', label: 'Lead Funnel', icon: HiUserGroup },
    { id: 'leaderboard', label: 'Agent Rankings', icon: HiTrendingUp },
    { id: 'properties', label: 'Properties', icon: HiOfficeBuilding },
  ];

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Business performance insights</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-full overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Revenue Tab */}
      {tab === 'revenue' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Period:</label>
            {[3, 6, 12].map(m => (
              <button key={m} onClick={() => setMonths(m)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  months === m ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {m}M
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Monthly Revenue</h2>
            {revenue.length > 0 ? (
              <Line data={revenueChart} options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    ticks: { callback: (v) => '₦' + (v / 1000).toFixed(0) + 'K' },
                    grid: { color: '#f3f4f6' },
                  },
                  x: { grid: { display: false } },
                },
              }} />
            ) : (
              <p className="text-gray-400 text-sm text-center py-12">No payment data yet.</p>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">{fmt(revenue.reduce((s, r) => s + r.total, 0))}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Avg / Month</p>
              <p className="text-xl font-bold text-gray-900">{fmt(revenue.length ? revenue.reduce((s, r) => s + r.total, 0) / revenue.length : 0)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Best Month</p>
              <p className="text-xl font-bold text-gray-900">{fmt(Math.max(...revenue.map(r => r.total), 0))}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Months Recorded</p>
              <p className="text-xl font-bold text-gray-900">{revenue.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lead Funnel Tab */}
      {tab === 'funnel' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Lead Pipeline Distribution</h2>
            {funnel.length > 0 ? (
              <Doughnut data={funnelChart} options={{ plugins: { legend: { position: 'bottom' } } }} />
            ) : (
              <p className="text-gray-400 text-sm text-center py-12">No leads yet.</p>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Stage Breakdown</h2>
            <div className="space-y-3">
              {funnel.map((f, i) => {
                const total = funnel.reduce((s, x) => s + x.count, 0);
                const pct = total ? Math.round((f.count / total) * 100) : 0;
                const colors = ['bg-blue-500','bg-purple-500','bg-amber-500','bg-emerald-500','bg-red-500','bg-green-600','bg-gray-400'];
                return (
                  <div key={f.stage}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{funnelLabels[f.stage] || f.stage}</span>
                      <span className="text-gray-500">{f.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[i]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Agent Leaderboard Tab */}
      {tab === 'leaderboard' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Agent Performance Rankings</h2>
          </div>
          {leaderboard.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-12">No agent data yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {leaderboard.map((agent, i) => (
                <div key={agent.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-500'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 font-semibold text-sm">{agent.name?.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
                    <p className="text-xs text-gray-500">{agent.leads} leads · {agent.deals} deals</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{fmt(agent.closed_value)}</p>
                    <p className="text-xs text-gray-400">closed value</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Property Performance Tab */}
      {tab === 'properties' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Property Performance</h2>
            <span className="text-sm text-gray-500">{propPerf.length} properties</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 font-medium text-gray-500">Property</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Type</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-right">Listed Price</th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-right">Deals</th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {propPerf.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 truncate max-w-48">{p.title}</p>
                      <p className="text-xs text-gray-500">{p.location}</p>
                    </td>
                    <td className="px-6 py-4 capitalize text-gray-600">{p.property_type?.replace(/_/g, ' ') || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.status === 'available' ? 'bg-green-100 text-green-700' :
                        p.status === 'reserved' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>{p.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{fmt(p.price)}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{p.deals_count} ({p.closed_deals} closed)</td>
                    <td className="px-6 py-4 text-right font-semibold text-primary-700">{fmt(p.total_revenue)}</td>
                  </tr>
                ))}
                {propPerf.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">No property data yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
