import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Store, Settings, LogOut, Shield, Users, FileText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const menuItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
  { icon: CreditCard, label: 'Paiement', path: '/payment' },
  { icon: Store, label: 'Portail Marchand', path: '/merchant/portal' },
  { icon: Settings, label: 'Profil', path: '/profile' },
];

const adminMenuItems = [
  { icon: Shield, label: 'Admin Dashboard', path: '/admin/dashboard' },
  { icon: FileText, label: 'Demandes KYC', path: '/admin/affiliation-requests' },
  { icon: Users, label: 'Marchands', path: '/admin/merchants' },
  { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
];

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN');

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="group fixed left-0 top-16 bottom-0 z-40 hidden lg:block w-16 hover:w-64 transition-all duration-300 ease-in-out">
      <nav className="flex flex-col gap-2 p-3 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-lg h-full overflow-hidden">
        {isAdmin ? adminMenuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors relative ${
                active
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-amber-600'
              }`}
            >
              <Icon className="w-5 h-5 min-w-5" />
              <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {item.label}
              </span>
            </Link>
          );
        }) : menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors relative ${
                active
                  ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 hover:text-cyan-600'
              }`}
            >
              <Icon className="w-5 h-5 min-w-5" />
              <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {item.label}
              </span>
            </Link>
          );
        })}

        <div className="mt-auto">
          <button
            onClick={logout}
            className="flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut className="w-5 h-5 min-w-5" />
            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Déconnexion
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
