import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Send, History, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const NavbarMobile = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
    { icon: Wallet, label: 'Portefeuille', path: '/wallet' },
    { icon: Send, label: 'Transfert', path: '/transfer' },
    { icon: History, label: 'Transactions', path: '/transactions' },
    { icon: Settings, label: 'Profil', path: '/profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="lg:hidden">
      {/* Backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-around">
          {menuItems.slice(0, 4).map((item) => {
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
                <Icon size={24} />
                <span className="text-xs mt-1 font-medium">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}

          {/* Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors ${
              menuOpen
                ? 'text-cyan-600 dark:text-cyan-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
            <span className="text-xs mt-1 font-medium">Plus</span>
          </button>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-px border-t border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                isActive('/profile')
                  ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Settings size={20} />
              <span className="font-medium">Profil</span>
            </Link>
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
