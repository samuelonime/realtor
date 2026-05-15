import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { api } from '../lib/api';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { HiUserGroup, HiCash, HiOfficeBuilding, HiTrendingUp, HiDocumentText, HiExclamation } from 'react-icons/hi';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  const stageColors = {
    new_lead: '#3B82F6', contacted: '#8B5CF6', interested: '#F59E0B',
    inspection_scheduled: '#10B981', negotiation: '#EF4444', closed_won: '#059669', closed_lost: '#6B7280',
  };

  const pipelineChart = {
    labels: ['New', 'Contacted', 'Interested', 'Inspection', 'Negotiation', 'Won', 'Lost'],
    datasets: [{
      data: [
        data?.leads?.by_stage?.new_lead || 0,
        data?.leads?.by_stage?.contacted || 0,
        data?.leads?.by_stage?.interested || 0,
        data?.leads?.by_stage?.inspection_scheduled || 0,
        data?.leads?.by_stage?.negotiation || 0,
        data?.leads?.by_stage?.closed_won || 0,
        data?.leads?.by_stage?.closed_lost || 0,
      ],
      backgroundColor: Object.values(stageColors),
    }],
  };

  const dealStageChart = {
    labels: ['Inspection', 'Offer Made', 'Payment Ongoing', 'Closed'],
    datasets: [{
      label: 'Deals by Stage',
      data: [
        data?.deals?.by_stage?.inspection || 0,
        data?.deals?.by_stage?.offer_made || 0,
        data?.deals?.by_stage?.payment_ongoing || 0,
        data?.deals?.by_stage?.closed || 0,
      ],
      backgroundColor: ['#8B5CF6', '#F59E0B', '#3B82F6', '#059669'],
    }],
  };

  const StatCard = ({ icon: Icon, label, value, sub, color }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
    </div>
  );

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={HiUserGroup} label="Total Leads" value={data?.leads?.total || 0}
          sub={`${data?.leads?.by_stage?.closed_won || 0} won`} color="bg-blue-500" />
        <StatCard icon={HiCash} label="Active Deals" value={data?.deals?.active || 0}
          sub={`₦${(data?.deals?.active_value || 0).toLocaleString()}`} color="bg-purple-500" />
        <StatCard icon={HiTrendingUp} label="Closed Deals" value={data?.deals?.closed || 0}
          sub={`₦${(data?.deals?.closed_value || 0).toLocaleString()}`} color="bg-emerald-500" />
        <StatCard icon={HiOfficeBuilding} label="Properties" value={data?.properties?.total || 0}
          sub={`${data?.properties?.by_status?.available || 0} available`} color="bg-amber-500" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Pipeline</h2>
          <div className="flex justify-center">
            <div className="w-64">
              <Doughnut data={pipelineChart} options={{ cutout: '65%', plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Deal Stages</h2>
          <Bar data={dealStageChart} options={{ responsive: true, plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
        </div>
      </div>

      {/* Agent Performance */}
      {data?.agent_performance?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Agent</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Leads</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Deals</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Closed</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.agent_performance.map((agent) => (
                  <tr key={agent.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{agent.name}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{agent.leads}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{agent.total_deals}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{agent.closed_deals}</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">₦{agent.closed_value.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Payments */}
      {data?.pending_payments?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <HiExclamation className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">Pending Payments</h2>
          </div>
          <div className="space-y-3">
            {data.pending_payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{payment.customer_name}</p>
                  <p className="text-sm text-gray-500">{payment.Deal?.Lead?.full_name || 'N/A'}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  payment.status === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {payment.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
