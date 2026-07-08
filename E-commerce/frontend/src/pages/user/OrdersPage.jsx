import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { orderAPI } from '../../api/order.api'
import { FiPackage, FiChevronRight } from 'react-icons/fi'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await orderAPI.getAll()
      setOrders(Array.isArray(data) ? data : data.content || [])
    } catch (err) {
      console.error('Error loading orders:', err)
      setError('Impossible de charger les commandes')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statuses = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return statuses[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      SHIPPED: 'Expédiée',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée',
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={loadOrders} className="text-blue-600 hover:text-blue-700">
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mes Commandes</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune commande
          </h3>
          <p className="text-gray-500 mb-6">
            Vous n'avez pas encore passé de commande
          </p>
          <Link 
            to="/shop"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Commencer le shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FiPackage className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Commande #{order.orderNumber || order.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  <p className="font-bold text-gray-900">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(order.totalAmount || 0)}
                  </p>
                  <FiChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}