import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiFilter, FiX, FiGrid, FiList, FiSliders } from 'react-icons/fi'
import { productAPI } from '../../api/product.api'
import ProductCard from '../../components/product/ProductCard'
import Spinner from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // grid | list
  const [categories, setCategories] = useState([])

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page')) || 0,
    size: 20,
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  })

  const sortOptions = [
    { value: 'newest', label: 'Plus récents' },
    { value: 'oldest', label: 'Plus anciens' },
    { value: 'price_asc', label: 'Prix croissant' },
    { value: 'price_desc', label: 'Prix décroissant' },
    { value: 'name_asc', label: 'Nom A-Z' },
    { value: 'name_desc', label: 'Nom Z-A' },
  ]

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productAPI.getCategories()
        setCategories(response.content || response)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await productAPI.getAll(filters)
      setProducts(response.content || response)
      setTotalPages(response.totalPages || 0)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value, page: 0 }
      syncUrlParams(next)
      return next
    })
  }

  const handlePageChange = (page) => {
    setFilters(prev => {
      const next = { ...prev, page }
      syncUrlParams(next)
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const syncUrlParams = (currentFilters) => {
    const params = new URLSearchParams()
    if (currentFilters.page) params.set('page', String(currentFilters.page))
    if (currentFilters.search) params.set('search', currentFilters.search)
    if (currentFilters.category) params.set('category', currentFilters.category)
    if (currentFilters.sort && currentFilters.sort !== 'newest') params.set('sort', currentFilters.sort)
    setSearchParams(params, { replace: true })
  }

  const clearFilters = () => {
    const reset = {
      page: 0,
      size: 20,
      search: '',
      category: '',
      sort: 'newest',
      minPrice: '',
      maxPrice: '',
    }
    setFilters(reset)
    syncUrlParams(reset)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-display font-bold text-gray-900">Boutique</h1>
          <p className="mt-2 text-gray-600">
            {products.length} produits trouvés
            {filters.category && ` dans cette catégorie`}
            {filters.search && ` pour "${filters.search}"`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Filtres</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Réinitialiser
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégories
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !filters.category ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    Toutes les catégories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleFilterChange('category', category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filters.category === category.id.toString()
                          ? 'bg-primary-50 text-primary-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min €"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max €"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filters Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(true)}
              className="inline-flex items-center px-4 py-2 bg-white border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <FiSliders className="mr-2" />
              Filtres
            </button>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort & View Controls */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-4">
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="flex justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <FiFilter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-500 mb-6">Essayez de modifier vos filtres</p>
                <button
                  onClick={clearFilters}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-2 md:grid-cols-3'
                    : 'grid-cols-1'
                }`}>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={filters.page}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Filtres</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              {/* Same filter content as desktop */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ShopPage