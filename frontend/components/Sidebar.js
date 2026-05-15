import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import {
  HiHome, HiUserGroup, HiOfficeBuilding, HiCash, HiDocumentReport,
  HiUserCircle, HiLogout, HiChartBar, HiBell,
} from 'react-icons/hi';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: HiHome, roles: ['admin', 'manager', 'agent'] },
  { href: '/leads', label: 'Leads', icon: HiUserGroup, roles: ['admin', 'manager', 'agent'] },
  { href: '/properties', label: 'Properties', icon: HiOfficeBuilding, roles: ['admin', 'manager', 'agent'] },
  { href: '/deals', label: 'Deals', icon: HiCash, roles: ['admin', 'manager', 'agent'] },
  { href: '/payments', label: 'Payments', icon: HiCash, roles: ['admin', 'manager', 'agent'] },
  { href: '/documents', label: 'Documents', icon: HiDocumentReport, roles: ['admin', 'manager', 'agent'] },
  { href: '/reports', label: 'Reports', icon: HiChartBar, roles: ['admin', 'manager'] },
  { href: '/users', label: 'Users', icon: HiUserCircle, roles: ['admin'] },
];

export default function Sidebar({ open, onClose }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const roleColor = {
    admin: 'bg-red-100 text-red-700',
    manager: 'bg-amber-100 text-amber-700',
    agent: 'bg-blue-100 text-blue-700',
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}

      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto flex flex-col ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-700 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">RC</span>
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">RealEstate CRM</p>
              <p className="text-xs text-gray-400">Management System</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {navItems
            .filter(item => item.roles.includes(user?.role))
            .map(item => {
              const isActive = router.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={onClose}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
        </nav>

        {/* User + Logout */}
        <div className="flex-shrink-0 p-4 border-t border-gray-700">
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg hover:bg-gray-800 transition-colors" onClick={onClose}>
            <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${roleColor[user?.role] || 'bg-gray-100 text-gray-600'}`}>
                {user?.role}
              </span>
            </div>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
          >
            <HiLogout className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
