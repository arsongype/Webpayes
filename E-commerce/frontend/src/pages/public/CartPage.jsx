import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingBag } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'

const CartPage = () => {
  const { items, totalItems, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart()
  const { isAuthenticated } = useAuth()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
          <p className="text-gray-600 mb-8">Découvrez nos produits et ajoutez-les à votre panier</p>
          <Link to="/shop">
            <Button variant="primary" size="lg">
              Continuer le shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Panier ({totalItems} articles)
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Vider le panier
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-white rounded-2xl shadow-sm p-6"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                      <img
                        src={item.imageUrl || '/placeholder.png'}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.productId}`}
                        className="text-lg font-medium text-gray-900 hover:text-primary-600 line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      
                      <p className="text-sm text-gray-500 mt-1">
                        Prix unitaire: {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(item.price)}
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                          >
                            <FiMinus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.maxQuantity}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                          >
                            <FiPlus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Subtotal & Remove */}
                        <div className="flex items-center gap-6">
                          <span className="text-lg font-bold text-gray-900">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                            }).format(item.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Continue Shopping */}
            <Link
              to="/shop"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium mt-4"
            >
              <FiArrowLeft className="mr-2" />
              Continuer le shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-display font-bold text-gray-900 mb-6">
                Résumé de la commande
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(totalPrice)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span className="text-green-600">Gratuite</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(totalPrice)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">TVA incluse</p>
                </div>

                {/* Promo Code */}
                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code promo
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Entrez votre code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <Button variant="outline" size="sm">
                      Appliquer
                    </Button>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link to={isAuthenticated ? '/checkout' : '/login'}>
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="mt-4"
                  >
                    Procéder au paiement
                  </Button>
                </Link>

                {/* Payment Methods */}
                <div className="pt-4">
                  <p className="text-xs text-gray-500 text-center mb-2">
                    Paiement sécurisé
                  </p>
                  <div className="flex justify-center gap-2">
                    <div className="px-3 py-1.5 bg-gray-100 rounded text-xs font-medium">Visa</div>
                    <div className="px-3 py-1.5 bg-gray-100 rounded text-xs font-medium">Mastercard</div>
                    <div className="px-3 py-1.5 bg-gray-100 rounded text-xs font-medium">PayPal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage