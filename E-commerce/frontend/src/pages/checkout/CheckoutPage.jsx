import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { orderAPI } from '../../api/order.api'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'France',
    }
  })

  const onSubmit = async (data) => {
    if (items.length === 0) {
      toast.error('Votre panier est vide')
      return
    }

    setIsLoading(true)
    try {
      const orderData = {
        shippingAddress: data,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          imageUrl: item.imageUrl,
        })),
        totalAmount: totalPrice,
      }
      
      const order = await orderAPI.create(orderData)
      clearCart()
      toast.success('Commande confirmée avec succès !')
      navigate(`/orders/${order.id}`)
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Erreur lors de la création de la commande. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
        <p className="text-gray-600 mb-6">Ajoutez des produits avant de commander</p>
        <Link to="/shop">
          <Button>Continuer le shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finaliser la commande</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Adresse de livraison</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Prénom"
                {...register('firstName', { required: 'Le prénom est requis' })}
                error={errors.firstName?.message}
              />
              <Input
                label="Nom"
                {...register('lastName', { required: 'Le nom est requis' })}
                error={errors.lastName?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Email"
                type="email"
                {...register('email', { 
                  required: 'L\'email est requis',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email invalide'
                  }
                })}
                error={errors.email?.message}
              />
              <Input
                label="Téléphone"
                type="tel"
                {...register('phone', { required: 'Le téléphone est requis' })}
                error={errors.phone?.message}
              />
            </div>

            <div className="mb-4">
              <Input
                label="Adresse"
                {...register('address', { required: 'L\'adresse est requise' })}
                error={errors.address?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Ville"
                {...register('city', { required: 'La ville est requise' })}
                error={errors.city?.message}
              />
              <Input
                label="Code postal"
                {...register('postalCode', { required: 'Le code postal est requis' })}
                error={errors.postalCode?.message}
              />
              <Input
                label="Pays"
                {...register('country', { required: 'Le pays est requis' })}
                error={errors.country?.message}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Mode de paiement</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" defaultChecked className="text-blue-600" />
                <div>
                  <p className="font-medium">Carte bancaire</p>
                  <p className="text-sm text-gray-500">Paiement sécurisé par carte</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" className="text-blue-600" />
                <div>
                  <p className="font-medium">PayPal</p>
                  <p className="text-sm text-gray-500">Paiement via votre compte PayPal</p>
                </div>
              </label>
            </div>
          </div>

          <Button type="submit" loading={isLoading} size="lg" className="w-full">
            Confirmer la commande ({new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            }).format(totalPrice)})
          </Button>
        </form>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Récapitulatif</h2>
            
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <img
                    src={item.imageUrl || 'https://via.placeholder.com/60'}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Qté: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total</span>
                <span>{new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Livraison</span>
                <span className="text-green-600">Gratuite</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">TVA (20%)</span>
                <span>{new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(totalPrice * 0.2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-blue-600">{new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}