import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { Sun, Moon, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Tableau de bord' },
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
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              WebPaysh
            </div>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4">
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
