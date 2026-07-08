import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { orderAPI } from '../../api/order.api'
import { FiArrowLeft, FiPackage, FiTruck, FiCheck, FiClock } from 'react-icons/fi'

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
  }, [id])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const data = await orderAPI.getById(id)
      setOrder(data)
    } catch (error) {
      console.error('Error loading order:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: FiClock,
      CONFIRMED: FiCheck,
      SHIPPED: FiTruck,
      DELIVERED: FiPackage,
    }
    const Icon = icons[status] || FiClock
    return <Icon className="w-6 h-6" />
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Commande non trouvée</h2>
        <Link to="/orders" className="text-blue-600 hover:text-blue-700">
          Retour aux commandes
        </Link>
      </div>
    )
  }

  const steps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED']
  const currentStepIndex = steps.indexOf(order.status)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/orders" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <FiArrowLeft className="w-5 h-5 mr-2" />
        Retour aux commandes
      </Link>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Commande #{order.orderNumber || order.id}
            </h1>
            <p className="text-gray-500 mt-1">
              Commandée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(order.totalAmount || 0)}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex-1 flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index <= currentStepIndex ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < currentStepIndex ? (
                    <FiCheck className="w-5 h-5" />
                  ) : (
                    getStatusIcon(step)
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span>En attente</span>
            <span>Confirmée</span>
            <span>Expédiée</span>
            <span>Livrée</span>
          </div>
        </div>

        {/* Items */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Articles commandés</h2>
          <div className="space-y-4">
            {(order.items || []).map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <img
                  src={item.product?.imageUrl || 'https://via.placeholder.com/80'}
                  alt={item.product?.name || 'Produit'}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.product?.name || `Produit ${index + 1}`}</h3>
                  <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                </div>
                <p className="font-medium">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format((item.price || item.unitPrice || 0) * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shipping Info */}
      {order.shippingAddress && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Adresse de livraison</h2>
          <div className="text-gray-600">
            <p className="font-medium text-gray-900">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>
      )}
    </div>
  )
}