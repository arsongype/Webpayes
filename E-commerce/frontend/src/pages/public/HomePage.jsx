import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiTruck, FiShield, FiRotateCcw, FiPhone } from 'react-icons/fi'
import { productAPI } from '../../api/product.api'
import ProductCard from '../../components/product/ProductCard'
import Spinner from '../../components/ui/Spinner'

const features = [
  {
    icon: FiTruck,
    title: 'Livraison Gratuite',
    description: 'À partir de 50€ d\'achat',
  },
  {
    icon: FiShield,
    title: 'Paiement Sécurisé',
    description: 'Transactions cryptées SSL',
  },
  {
    icon: FiRotateCcw,
    title: 'Retours Faciles',
    description: 'Sous 30 jours',
  },
  {
    icon: FiPhone,
    title: 'Support 24/7',
    description: 'À votre écoute',
  },
]

const categories = [
  {
    name: 'Électronique',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500',
    count: '150+ produits',
  },
  {
    name: 'Mode',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500',
    count: '230+ produits',
  },
  {
    name: 'Maison',
    image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500',
    count: '180+ produits',
  },
  {
    name: 'Sport',
    image: 'https://images.unsplash.com/photo-1461896836934-bd45ba0cf6b2?w=500',
    count: '95+ produits',
  },
]

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const [featuredRes, newArrivalsRes] = await Promise.all([
          productAPI.getFeatured(),
          productAPI.getNewArrivals(),
        ])
        setFeaturedProducts(featuredRes.content || featuredRes)
        setNewArrivals(newArrivalsRes.content || newArrivalsRes)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-6xl font-display font-bold leading-tight mb-6">
                Découvrez le Shopping
                <span className="block text-primary-200">Nouvelle Génération</span>
              </h1>
              <p className="text-lg text-primary-100 mb-8 max-w-lg">
                Des milliers de produits sélectionnés pour vous. Livraison rapide et paiement sécurisé.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Explorer la boutique
                  <FiArrowRight className="ml-2" />
                </Link>
                <Link
                  to="/shop?sort=price_desc"
                  className="inline-flex items-center px-8 py-3 border-2 border-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Voir les promos
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8 text-primary-100">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-primary-300" />
                  ))}
                </div>
                <p className="text-sm">
                  <span className="font-bold text-white">+10,000</span> clients satisfaits
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 lg:mt-0"
            >
              <div className="relative lg:ml-8">
                <div className="absolute -inset-4 bg-white/10 rounded-3xl rotate-6 hidden sm:block" />
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600"
                  alt="Person shopping with bags"
                  loading="lazy"
                  className="relative rounded-2xl shadow-2xl w-full max-w-md mx-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-gray-50 to-transparent" />
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-600 mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Catégories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Catégories Populaires
            </h2>
            <p className="text-gray-600">Explorez nos différentes catégories</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/shop?category=${index + 1}`}
              >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{category.name}</h3>
                  <p className="text-sm opacity-90">{category.count}</p>
                </div>
              </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Nouveautés */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold text-gray-900">
                Nouveautés
              </h2>
              <p className="text-gray-600 mt-2">Les derniers produits ajoutés</p>
            </div>
            <Link
              to="/shop?sort=newest"
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
            >
              Voir tout <FiArrowRight className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.isArray(newArrivals) && newArrivals.length > 0 ? (
              newArrivals.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-12">Aucun nouveau produit pour le moment.</div>
            )}
          </div>
        </div>
      </section>

      {/* Produits en vedette */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold text-gray-900">
                Produits en Vedette
              </h2>
              <p className="text-gray-600 mt-2">Notre sélection spéciale pour vous</p>
            </div>
            <Link
              to="/shop"
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
            >
              Voir tout <FiArrowRight className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.isArray(featuredProducts) && featuredProducts.length > 0 ? (
              featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-12">Aucun produit en vedette pour le moment.</div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Prêt à commencer votre shopping ?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Inscrivez-vous et obtenez 10% de réduction sur votre première commande
          </p>
          {!subscribed ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
                localStorage.setItem('newsletter_email', email)
                setSubscribed(true)
              }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <input
                type="email"
                aria-label="Email pour la newsletter"
                placeholder="Entrez votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-3 rounded-lg w-full sm:w-auto min-w-[260px]"
              />
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                aria-label="S'abonner à la newsletter"
              >
                S'abonner
                <FiArrowRight className="ml-2" />
              </button>
            </form>
          ) : (
            <div className="bg-white/10 inline-block rounded-lg px-6 py-3">
              <p className="text-white">Merci ! Vous êtes abonné·e. Vérifiez votre boîte mail.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage