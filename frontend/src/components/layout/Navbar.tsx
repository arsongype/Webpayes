import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/useNotification';
import { Sun, Moon, Menu, X, Shield, Bell, CheckCheck } from 'lucide-react';
import { ADMIN } from '../../constants/roles.constants';

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout, user } = useAuth();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;
  const isAdmin = isAuthenticated && user?.roles?.includes(ADMIN);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { path: '/dashboard', label: 'Tableau de bord' },
    ...(isAdmin ? [{ path: '/admin/dashboard', label: 'Admin' }] : []),
    { path: '/wallet', label: 'Portefeuille' },
    { path: '/transactions', label: 'Transactions' },
    { path: '/transfer', label: 'Transfert' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/90 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-linear-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              WebPaysh
            </div>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Admin badge */}
            {isAdmin && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                <Shield size={14} /> Admin
              </span>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setNotifOpen((v) => !v); markAllRead(); }}
                  className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-200 p-3 dark:border-white/10">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
                      <button
                        onClick={markAllRead}
                        className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-300"
                      >
                        <CheckCheck size={14} /> Tout marquer lu
                      </button>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-white/10">
                      {notifications.length === 0 && (
                        <p className="p-4 text-sm text-slate-400 dark:text-slate-500">Aucune notification</p>
                      )}
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 text-sm ${n.read ? 'opacity-70' : 'bg-slate-50 dark:bg-slate-800/50'}`}
                        >
                          <p className="font-medium text-slate-900 dark:text-white">{n.subject}</p>
                          <p className="text-slate-500 dark:text-slate-300 line-clamp-2">{n.body}</p>
                          {n.createdAt && (
                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User (avatar + name) */}
            {isAuthenticated && (
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profil"
                    className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/20 font-semibold text-cyan-700 dark:text-cyan-200">
                    {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200">
                  {user?.firstName} {user?.lastName}
                </span>
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-yellow-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-yellow-300 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Mobile Menu Toggle (below lg) */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation (below lg) */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 pb-4">
            <div className="pt-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    isActive(link.path)
                      ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-medium'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-slate-200 mt-4 pt-4 dark:border-slate-800">
                <p className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
                  {user?.firstName} {user?.lastName}
                </p>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="block w-full mx-auto px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Administration
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full mx-auto px-4 py-2 text-left rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
