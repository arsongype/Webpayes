import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Store, Settings, LogOut, Menu, X, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const NavbarMobile = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.roles?.includes('ADMIN');

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
    { icon: CreditCard, label: 'Paiement', path: '/payment' },
    { icon: Store, label: 'Portail Marchand', path: '/merchant/portal' },
  
  ];

  const moreItems = [
    { icon: Settings, label: 'Profil', path: '/profile' },
  ];

  const adminItems = [
    { icon: Shield, label: 'Admin Dashboard', path: '/admin/dashboard' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="lg:hidden">
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

           <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
         <div className="flex items-center justify-around">
           {menuItems.map((item) => {
             const Icon = item.icon;
             return (
               <Link
                 key={item.path}
                 to={item.path}
                 className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors ${
                   isActive(item.path)
                     ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-t-2 border-cyan-500 dark:border-cyan-400'
                     : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                 }`}
               >
                 <div className="rounded-xl bg-slate-100/50 p-1.5 dark:bg-slate-800/50">
                   <Icon size={22} />
                 </div>
                 <span className="text-xs mt-1 font-medium">{item.label}</span>
               </Link>
             );
           })}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors ${
              menuOpen
                ? 'text-cyan-600 dark:text-cyan-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <div className="rounded-xl bg-slate-100/50 p-1.5 dark:bg-slate-800/50">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </div>
            <span className="text-xs mt-1 font-medium">Plus</span>
          </button>
        </div>

          {menuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-px border-t border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[70vh] overflow-y-auto">
              {(isAdmin ? adminItems : moreItems).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                      isActive(item.path)
                        ? (isAdmin
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          : 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300')
                        : isAdmin
                          ? 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
              >
                <LogOut size={20} />
                <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        )}
      </nav>
    </div>
  );
};

export default NavbarMobile;
