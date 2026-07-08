import { useState, useEffect } from 'react'
import { FiUsers, FiPackage, FiShoppingCart, FiDollarSign, FiTrendingUp } from 'react-icons/fi'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    // Simuler le chargement des statistiques
    const loadStats = async () => {
      // Ici vous feriez un appel API
      setStats({
        totalProducts: 150,
        totalOrders: 45,
        totalUsers: 230,
        totalRevenue: 12580,
      })
    }
    loadStats()
  }, [])

  const cards = [
    {
      title: 'Produits',
      value: stats.totalProducts,
      icon: FiPackage,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Commandes',
      value: stats.totalOrders,
      icon: FiShoppingCart,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Utilisateurs',
      value: stats.totalUsers,
      icon: FiUsers,
      color: 'bg-purple-500',
      change: '+25%',
    },
    {
      title: 'Revenus',
      value: `${new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(stats.totalRevenue)}`,
      icon: FiDollarSign,
      color: 'bg-yellow-500',
      change: '+18%',
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Bienvenue dans l'administration</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <FiTrendingUp />
          Voir les rapports
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} p-3 rounded-lg text-white`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="text-green-500 text-sm font-medium">{card.change}</span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Dernières commandes</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">Commande #ORD-{2024000 + item}</p>
                  <p className="text-xs text-gray-500">Client {item}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{(Math.random() * 100 + 20).toFixed(2)} €</p>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    Complétée
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Produits populaires</h2>
          <div className="space-y-4">
            {['Produit A', 'Produit B', 'Produit C', 'Produit D', 'Produit E'].map((product, index) => (
              <div key={index} className="flex items-center gap-3 py-2 border-b last:border-0">
                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{product}</p>
                  <p className="text-xs text-gray-500">Ventes: {Math.floor(Math.random() * 50 + 10)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}