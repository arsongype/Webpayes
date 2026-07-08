import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart, FiShoppingCart, FiStar, FiEye } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import Button from '../ui/Button'

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const { addToCart } = useCart()

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        )}
        
        <Link to={`/product/${product.id}`}>
          <img
            src={product.imageUrl || 'https://via.placeholder.com/400'}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </Link>

        {/* Badges - Version simple sans composant Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="px-2.5 py-0.5 bg-blue-500 text-white text-xs font-medium rounded-full">
              Nouveau
            </span>
          )}
          {discount > 0 && (
            <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
              -{discount}%
            </span>
          )}
          {product.stockQuantity != null && product.stockQuantity <= 5 && product.stockQuantity > 0 && (
            <span className="px-2.5 py-0.5 bg-orange-500 text-white text-xs font-medium rounded-full">
              Presque épuisé
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className={`absolute right-3 top-3 flex flex-col gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}>
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`p-2 rounded-full shadow-lg transition-colors ${
              isWishlisted 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <FiHeart className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
          
          <Link
            to={`/product/${product.id}`}
            className="p-2 bg-white rounded-full shadow-lg text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FiEye className="w-4 h-4" />
          </Link>
        </div>

        {/* Out of Stock Overlay */}
        {product.stockQuantity === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white px-4 py-2 rounded-lg font-medium text-gray-900">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <Link to={`/shop?category=${product.category.id}`}>
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
              {product.category.name}
            </span>
          </Link>
        )}
        
        {/* Name */}
        <Link to={`/product/${product.id}`}>
          <h3 className="mt-1 text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating && (
          <div className="mt-1 flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            }).format(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <div className="mt-3">
          <Button
            variant={product.stockQuantity === 0 ? 'secondary' : 'primary'}
            size="sm"
            className="w-full"
            disabled={product.stockQuantity === 0}
            onClick={() => addToCart(product)}
          >
            <FiShoppingCart className="mr-2 h-4 w-4" />
            {product.stockQuantity === 0 ? 'Indisponible' : 'Ajouter au panier'}
          </Button>
        </div>
      </div>
    </div>
  )
}