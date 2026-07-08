import { Routes, Route, Link, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Suspense, lazy } from 'react'
import { ThemeProvider } from './context/ThemeContext'

// Layout Components
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import LoadingScreen from './components/common/LoadingScreen'
import ErrorBoundary from './components/common/ErrorBoundary'

// Pages publiques
import HomePage from './pages/public/HomePage'
import ShopPage from './pages/public/ShopPage'
import ProductPage from './pages/public/ProductPage'
import CartPage from './pages/public/CartPage'

// Pages authentification
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Pages utilisateur
import ProfilePage from './pages/user/ProfilePage'
import OrdersPage from './pages/user/OrdersPage'
import OrderDetailPage from './pages/user/OrderDetailPage'

// Page checkout
import CheckoutPage from './pages/checkout/CheckoutPage'

// Page admin
import DashboardPage from './pages/admin/DashboardPage'
import ProductsPage from './pages/admin/ProductsPage'

// Composant pour les routes protégées
function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return children
}

// Layout principal
function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <Header />
      <main className="flex-1" style={{ paddingTop: 'var(--header-h)' }}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}

// Layout admin
function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <div className="flex">
        <aside className="w-64 bg-gray-900 text-white min-h-screen p-6">
          <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
          <nav className="space-y-2">
            <Link to="/admin" className="block py-2 px-4 rounded hover:bg-gray-800">
              Dashboard
            </Link>
            <Link to="/admin/products" className="block py-2 px-4 rounded hover:bg-gray-800">
              Produits
            </Link>
            <Link to="/admin/orders" className="block py-2 px-4 rounded hover:bg-gray-800">
              Commandes
            </Link>
            <Link to="/admin/users" className="block py-2 px-4 rounded hover:bg-gray-800">
              Utilisateurs
            </Link>
            <Link to="/" className="block py-2 px-4 rounded hover:bg-gray-800 text-blue-400">
              ← Retour au site
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-8">
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

// Page 404
function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page non trouvée</h2>
        <p className="text-gray-500 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="space-x-4">
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </Link>
          <Link
            to="/shop"
            className="inline-block border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Voir la boutique
          </Link>
        </div>
      </div>
    </div>
  )
}

// Page d'erreur
function ErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Erreur serveur</h2>
        <p className="text-gray-500 mb-8">
          Une erreur est survenue. Veuillez réessayer plus tard.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Rafraîchir la page
        </button>
      </div>
    </div>
  )
}

// Page mentions légales
function LegalPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Mentions légales</h1>
      <div className="prose max-w-none">
        <h2>1. Informations légales</h2>
        <p>ShopEase SAS - Capital social : 10 000€</p>
        <p>RCS Madagascar : 0374541581</p>
        <p>Siège social : Andranomadio Toamasina </p>

        <h2>2. Hébergement</h2>
        <p>Ce site est hébergé par :</p>
        <p><VPS></VPS></p>

        <h2>3. Propriété intellectuelle</h2>
        <p>Tous les contenus de ce site sont protégés par le droit d'auteur.</p>
      </div>
    </div>
  )
}

// Page CGV
function CGVPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Conditions Générales de Vente</h1>
      <div className="prose max-w-none">
        <h2>Article 1 : Objet</h2>
        <p>Les présentes conditions régissent les ventes par la société ShopEase.</p>

        <h2>Article 2 : Prix</h2>
        <p>Les prix sont indiqués en euros toutes taxes comprises.</p>

        <h2>Article 3 : Commandes</h2>
        <p>Toute commande vaut acceptation des prix et descriptions des produits.</p>

        <h2>Article 4 : Livraison</h2>
        <p>La livraison est effectuée dans un délai de 3 à 5 jours ouvrés.</p>

        <h2>Article 5 : Rétractation</h2>
        <p>Le client dispose d'un délai de 14 jours pour exercer son droit de rétractation.</p>
      </div>
    </div>
  )
}

// Page contact
function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Contactez-nous</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Nos coordonnées</h2>
          <div className="space-y-3 text-gray-600">
            <p>📍 123 Avenue du Commerce, 75001 Paris</p>
            <p>📞 +33 1 23 45 67 89</p>
            <p>✉️ contact@shopease.fr</p>
            <p>🕐 Lun-Ven : 9h-18h</p>
          </div>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input type="text" className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea rows="5" className="w-full px-4 py-2 border rounded-lg"></textarea>
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Envoyer
          </button>
        </form>
      </div>
    </div>
  )
}

// Page À propos
function AboutPage() {
  const team = [
    { name: 'Marie Laurent', role: 'CEO & Fondatrice' },
    { name: 'Thomas Bernard', role: 'CTO' },
    { name: 'Sophie Martin', role: 'Directrice Marketing' },
    { name: 'Lucas Petit', role: 'Responsable Produit' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">À propos de ShopEase</h1>

      <div className="max-w-3xl mx-auto mb-16">
        <p className="text-lg text-gray-600 text-center mb-8">
          ShopEase est née en 2024 avec une mission simple : rendre le shopping en ligne
          accessible, agréable et sécurisé pour tous.
        </p>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-semibold mb-2">Notre Mission</h3>
            <p className="text-gray-600 text-sm">
              Offrir la meilleure expérience de shopping en ligne
            </p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="font-semibold mb-2">Notre Vision</h3>
            <p className="text-gray-600 text-sm">
              Devenir la référence e-commerce en Europe
            </p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">❤️</div>
            <h3 className="font-semibold mb-2">Nos Valeurs</h3>
            <p className="text-gray-600 text-sm">
              Qualité, confiance et satisfaction client
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-center mb-8">Notre Équipe</h2>
      <div className="grid md:grid-cols-4 gap-6">
        {team.map((member, index) => (
          <div key={index} className="text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
              {member.name.charAt(0)}
            </div>
            <h3 className="font-semibold">{member.name}</h3>
            <p className="text-sm text-gray-500">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Composant App principal
function App() {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <ThemeProvider>
      <Routes>
        {/* Routes avec layout principal */}
        <Route element={<MainLayout />}>
          {/* Routes publiques */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />

          {/* Routes d'authentification */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Routes protégées utilisateur */}
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute><OrdersPage /></ProtectedRoute>
          } />
          <Route path="/orders/:id" element={
            <ProtectedRoute><OrderDetailPage /></ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute><CheckoutPage /></ProtectedRoute>
          } />

          {/* Pages d'information */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/cgv" element={<CGVPage />} />

          {/* Pages d'erreur */}
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Routes admin avec layout séparé */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<div>Gestion des commandes</div>} />
          <Route path="users" element={<div>Gestion des utilisateurs</div>} />
          <Route path="categories" element={<div>Gestion des catégories</div>} />
          <Route path="statistics" element={<div>Statistiques</div>} />
          <Route path="settings" element={<div>Paramètres</div>} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}

export default App