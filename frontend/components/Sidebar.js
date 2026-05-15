import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { HiHome, HiUserGroup, HiOfficeBuilding, HiCash, HiDocumentReport, HiUserCircle, HiCog, HiLogout } from 'react-icons/hi';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: HiHome, roles: ['admin', 'manager', 'agent'] },
  { href: '/leads', label: 'Leads', icon: HiUserGroup, roles: ['admin', 'manager', 'agent'] },
  { href: '/properties', label: 'Properties', icon: HiOfficeBuilding, roles: ['admin', 'manager', 'agent'] },
  { href: '/deals', label: 'Deals', icon: HiCash, roles: ['admin', 'manager', 'agent'] },
  { href: '/payments', label: 'Payments', icon: HiCash, roles: ['admin', 'manager', 'agent'] },
  { href: '/documents', label: 'Documents', icon: HiDocumentReport, roles: ['admin', 'manager', 'agent'] },
  { href: '/users', label: 'Users', icon: HiUserCircle, roles: ['admin'] },
];

export default function Sidebar({ open, onClose }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RC</span>
            </div>
            <span className="font-semibold text-gray-800">RealEstate CRM</span>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {navItems
            .filter((item) => item.roles.includes(user?.role))
            .map((item) => {
              const isActive = router.pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={onClose}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <HiLogout className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
