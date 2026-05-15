import { useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { HiUser, HiLockClosed } from 'react-icons/hi';

export default function Profile() {
  const { user } = useAuth();
  const [tab, setTab] = useState('info');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match.');
    if (pwForm.newPassword.length < 8) return toast.error('New password must be at least 8 characters.');
    setSaving(true);
    try {
      await api.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const roleColors = {
    admin: 'bg-red-100 text-red-700',
    manager: 'bg-amber-100 text-amber-700',
    agent: 'bg-blue-100 text-blue-700',
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your account settings</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className={`mt-1 inline-block text-xs font-medium px-2 py-0.5 rounded capitalize ${roleColors[user?.role] || ''}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
          {[{ id: 'info', label: 'Account Info', icon: HiUser }, { id: 'password', label: 'Change Password', icon: HiLockClosed }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            {[
              { label: 'Full Name', value: user?.name },
              { label: 'Email', value: user?.email },
              { label: 'Phone', value: user?.phone || 'Not set' },
              { label: 'Role', value: user?.role, capitalize: true },
            ].map(field => (
              <div key={field.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{field.label}</span>
                <span className={`text-sm font-medium text-gray-900 ${field.capitalize ? 'capitalize' : ''}`}>{field.value}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'password' && (
          <form onSubmit={handlePasswordChange} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            {[
              { key: 'currentPassword', label: 'Current Password' },
              { key: 'newPassword', label: 'New Password' },
              { key: 'confirm', label: 'Confirm New Password' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <input
                  type="password"
                  value={pwForm[field.key]}
                  onChange={e => setPwForm(p => ({ ...p, [field.key]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                  minLength={field.key !== 'currentPassword' ? 8 : 1}
                />
              </div>
            ))}
            <button type="submit" disabled={saving}
              className="w-full py-2 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
