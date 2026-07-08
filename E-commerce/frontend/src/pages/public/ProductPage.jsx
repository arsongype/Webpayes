import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiHeart, FiShare2, FiMinus, FiPlus, FiStar, FiShoppingCart, FiTruck, FiShield, FiRotateCcw } from 'react-icons/fi'
import { productAPI } from '../../api/product.api'
import { useCart } from '../../context/CartContext'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [relatedProducts, setRelatedProducts] = useState([])
  
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await productAPI.getById(id)
        setProduct(data)
        
        // Essayer de charger les produits reliés
        try {
          const related = await productAPI.getRelated(id)
          setRelatedProducts(Array.isArray(related) ? related : related.content || [])
        } catch (err) {
          console.log('Pas de produits reliés disponibles')
        }
      } catch (error) {
        console.error('Error loading product:', error)
        toast.error('Produit non trouvé')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && product && newQuantity <= (product.stockQuantity || 99)) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity)
      setQuantity(1)
    }
  }

  // Star Rating Component intégré
  const StarRating = ({ rating = 0, count = 0 }) => {
    return (
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <FiStar
              key={star}
              className={`w-4 h-4 ${
                star <= Math.round(rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        {count > 0 && (
          <span className="text-sm text-gray-500">({count} avis)</span>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h2>
          <Link to="/shop" className="text-blue-600 hover:text-blue-700">
            Retour à la boutique
          </Link>
        </div>
      </div>
    )
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const images = product.images || [product.imageUrl || 'https://via.placeholder.com/600']

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-blue-600">Accueil</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-blue-600">Boutique</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link to={`/shop?category=${product.category.id}`} className="hover:text-blue-600">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Main Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Images Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden">
              <img
                src={images[selectedImage] || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {discount > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-lg">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-4">
                <StarRating rating={product.rating} count={product.reviewCount} />
                <span className="text-sm text-gray-500">SKU: {product.sku}</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-500 line-through">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Description courte */}
            <p className="text-gray-600 leading-relaxed">
              {product.description?.substring(0, 200)}...
            </p>

            {/* Stock Status */}
            {product.stockQuantity !== undefined && (
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  product.stockQuantity > 10 ? 'bg-green-500' :
                  product.stockQuantity > 0 ? 'bg-orange-500' : 'bg-red-500'
                }`} />
                <span className="text-sm font-medium">
                  {product.stockQuantity > 10 
                    ? 'En stock' 
                    : product.stockQuantity > 0 
                      ? `Plus que ${product.stockQuantity} en stock` 
                      : 'Rupture de stock'}
                </span>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <FiMinus className="w-5 h-5" />
                  </button>
                  <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={product.stockQuantity !== undefined && quantity >= product.stockQuantity}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <FiPlus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className="flex-1"
                size="lg"
              >
                <FiShoppingCart className="mr-2" />
                {product.stockQuantity === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <FiHeart className={isWishlisted ? 'fill-current text-red-500' : ''} />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <FiTruck className="w-6 h-6 mx-auto text-gray-600 mb-2" />
                <p className="text-xs text-gray-600">Livraison gratuite</p>
              </div>
              <div className="text-center">
                <FiShield className="w-6 h-6 mx-auto text-gray-600 mb-2" />
                <p className="text-xs text-gray-600">Paiement sécurisé</p>
              </div>
              <div className="text-center">
                <FiRotateCcw className="w-6 h-6 mx-auto text-gray-600 mb-2" />
                <p className="text-xs text-gray-600">Retours gratuits</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mb-16">
          <div className="border-b">
            <div className="flex gap-8">
              {['description', 'details', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-medium transition-colors relative ${
                    activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'description' && 'Description'}
                  {tab === 'details' && 'Détails'}
                  {tab === 'reviews' && 'Avis'}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description || 'Aucune description disponible.'}
                </p>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">SKU</span>
                    <span className="font-medium">{product.sku}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Catégorie</span>
                    <span className="font-medium">{product.category?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Stock</span>
                    <span className={`font-medium ${(product.stockQuantity || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(product.stockQuantity || 0) > 0 ? `${product.stockQuantity} unités` : 'Rupture de stock'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Avis clients</h3>
                <StarRating rating={product.rating || 0} count={product.reviewCount || 0} />
                <p className="text-gray-500 mt-4">
                  {product.reviewCount > 0 
                    ? `${product.reviewCount} avis disponibles` 
                    : 'Aucun avis pour le moment'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Produits similaires</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group">
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <img
                      src={product.imageUrl || 'https://via.placeholder.com/300'}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 truncate">
                        {product.name}
                      </h3>
                      <p className="mt-2 text-lg font-bold text-blue-600">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(product.price)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}