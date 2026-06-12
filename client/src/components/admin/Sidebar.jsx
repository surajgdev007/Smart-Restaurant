import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/admin', icon: '📊', label: 'Dashboard', exact: true },
  { path: '/admin/orders', icon: '🧾', label: 'Orders' },
  { path: '/admin/menu', icon: '🍽️', label: 'Menu Items' },
  { path: '/admin/categories', icon: '🗂️', label: 'Categories' },
  { path: '/admin/tables', icon: '🪑', label: 'Tables & QR' },
  { path: '/admin/reports', icon: '📈', label: 'Reports' },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const isActive = (item) =>
    item.exact ? pathname === item.path : pathname.startsWith(item.path);

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-dark-900 border-r border-dark-700 z-40 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-xl">
            🍽️
          </div>
          <div>
            <p className="font-display font-bold text-white text-sm">Smart Restaurant</p>
            <p className="text-dark-400 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
              isActive(item)
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                : 'text-dark-300 hover:text-white hover:bg-dark-800'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
            {isActive(item) && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />
            )}
          </Link>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div className="p-4 border-t border-dark-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-3 bg-dark-800 rounded-xl">
          <div className="w-8 h-8 bg-brand-500/20 rounded-full flex items-center justify-center text-brand-400 font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-dark-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 text-sm font-medium"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
