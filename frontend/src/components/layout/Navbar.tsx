import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/useNotification';
import { Sun, Moon, Menu, X, Bell, CheckCheck, Search } from 'lucide-react';
import newLogo from '../../assets/new-logo-isalosys-610x278.png';
import { formatDateTime } from '../../utils/dateFormat';

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.roles?.includes('ADMIN');
  const [adminSearch, setAdminSearch] = useState('');

  const handleAdminSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks: { path: string; label: string }[] = [];
  const adminNavLinks: { path: string; label: string }[] = [];
  const activeNavLinks = isAdmin ? adminNavLinks : navLinks;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/80 dark:shadow-none">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? '/payment' : '/'} className="flex items-center gap-2">
            <img src={newLogo} alt="WebPaysh" className="h-8 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
           <div className="hidden md:flex items-center gap-1">
            {activeNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-cyan-500/20 text-cyan-700 border border-cyan-500/30 dark:text-cyan-300 dark:border-cyan-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setNotifOpen((v) => !v); if (!notifOpen) markAllRead(); }}
                  className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300"
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
                  <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900 dark:shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-200 p-3 dark:border-white/10">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
                      <button
                        onClick={markAllRead}
                        className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
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
                          className={`p-3 text-sm ${n.read ? 'opacity-70' : 'bg-slate-50 dark:bg-white/5'}`}
                        >
                          <p className="font-medium text-slate-900 dark:text-white">{n.subject}</p>
                          <p className="text-slate-500 line-clamp-2 dark:text-slate-400">{n.body}</p>
                          {n.createdAt && (
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {formatDateTime(n.createdAt)}
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
                className="flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profil"
                    className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-white/10"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/20 font-semibold text-cyan-700 dark:text-cyan-300">
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
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Mobile Menu Toggle (below md) */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation (below md) */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="md:hidden border-t border-slate-200 pb-4 dark:border-white/10">
            <div className="pt-4 space-y-2">
              {isAdmin && (
                <form onSubmit={handleAdminSearch} className="px-4 mb-3">
                  <div className="flex">
                    <input
                      type="text"
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      placeholder="Rechercher marchand..."
                      className="flex-1 rounded-l-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      className="rounded-r-xl bg-cyan-500 px-3 py-2 text-white hover:bg-cyan-600 transition-colors"
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </form>
              )}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    isActive(link.path)
                      ? 'bg-cyan-500/20 text-cyan-700 font-medium dark:text-cyan-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
