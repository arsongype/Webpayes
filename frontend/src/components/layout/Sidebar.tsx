import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LayoutDashboard, Wallet, Send, History, Settings, LogOut, Zap, Shield, Users, QrCode, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ADMIN } from '../../constants/roles.constants';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
    { icon: Shield, label: 'Admin', path: '/admin/dashboard', roles: [ADMIN] },
    { icon: Users, label: 'Utilisateurs', path: '/admin/users', roles: [ADMIN] },
    { icon: Wallet, label: 'Portefeuille', path: '/wallet' },
    { icon: Send, label: 'Transfert', path: '/transfer' },
    { icon: QrCode, label: 'QR Code', path: '/qr' },
    { icon: History, label: 'Transactions', path: '/transactions' },
    { icon: Zap, label: 'Assistant IA', path: '/assistant' },
    { icon: AlertTriangle, label: 'Alertes fraude', path: '/fraud-alerts' },
    { icon: Settings, label: 'Profil', path: '/profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`hidden lg:flex flex-col fixed left-0 top-16 bottom-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Toggle */}
      <div className="flex justify-end p-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 space-y-2 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const show = !item.roles || item.roles.some((role) => user?.roles?.includes(role));

          if (!show) return null;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border-l-4 border-cyan-500 dark:border-cyan-400'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={20} className={`flex-shrink-0 ${item.path === '/admin/dashboard' ? 'text-amber-500 dark:text-amber-400' : ''}`} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-4">
        <button
          onClick={logout}
          className="flex items-center gap-4 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors justify-center lg:justify-start"
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
