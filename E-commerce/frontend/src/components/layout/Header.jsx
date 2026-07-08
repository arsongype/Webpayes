import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch, FiMoon, FiSun } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useTheme } from '../../context/ThemeContext'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const headerRef = useRef(null)
  const { user, isAuthenticated, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  
  useEffect(() => {
    const setHeaderHeight = () => {
      const h = headerRef.current?.offsetHeight || 64
      document.documentElement.style.setProperty('--header-h', `${h}px`)
    }

    setHeaderHeight()
    window.addEventListener('resize', setHeaderHeight)
    return () => window.removeEventListener('resize', setHeaderHeight)
  }, [isMobileMenuOpen])
  const { theme, toggle } = useTheme()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery('')
      setIsMobileMenuOpen(false)
    }
  }

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/shop', label: 'Boutique' },
    { to: '/about', label: 'À propos' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            <span className="text-primary-600">Shop</span>
            <span className="text-gray-900 dark:text-gray-100">Ease</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2.5 text-gray-600 dark:text-gray-200 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Rechercher"
            >
              <FiSearch className="w-5 h-5" />
            </button>

            <button
              onClick={toggle}
              className="p-2.5 text-gray-600 dark:text-gray-200 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Basculer thème"
            >
              {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            <Link
              to="/cart"
              className="relative p-2.5 text-gray-600 dark:text-gray-200 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Panier"
            >
              <FiShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs min-w-[1.25rem] h-5 px-1 rounded-full flex items-center justify-center font-semibold">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative group hidden sm:block">
                <button className="flex items-center gap-2 p-2.5 text-gray-600 dark:text-gray-200 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <FiUser className="w-5 h-5" />
                  <span className="text-sm font-medium max-w-[100px] truncate">
                    {user?.firstName}
                  </span>
                </button>
                <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link
                    to="/profile"
                    className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-800 hover:text-primary-600"
                  >
                    Mon profil
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-800 hover:text-primary-600"
                  >
                    Mes commandes
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                    >
                      Administration
                    </Link>
                  )}
                  <hr className="my-2 border-gray-100 dark:border-gray-700" />
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
              >
                Connexion
              </Link>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="py-4 border-t border-gray-100">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </form>
          </div>
        )}

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2.5 px-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/cart"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2.5 px-3 text-gray-700 hover:bg-primary-50 rounded-lg"
            >
              Panier {totalItems > 0 && `(${totalItems})`}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 px-3 text-gray-700 hover:bg-primary-50 rounded-lg">
                  Profil
                </Link>
                <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 px-3 text-gray-700 hover:bg-primary-50 rounded-lg">
                  Commandes
                </Link>
                <button onClick={() => { logout(); setIsMobileMenuOpen(false) }} className="block w-full text-left py-2.5 px-3 text-red-600 hover:bg-red-50 rounded-lg">
                  Déconnexion
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 px-3 text-primary-600 font-medium">
                Connexion
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
