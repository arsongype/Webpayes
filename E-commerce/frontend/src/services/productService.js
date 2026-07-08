import { products, categories } from '../data/mockData'

function sortProducts(list, sort) {
  const sorted = [...list]
  switch (sort) {
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'name_asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    case 'name_desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name, 'fr'))
    case 'newest':
    default:
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
}

function filterProducts(params = {}) {
  const { search, category, minPrice, maxPrice } = params
  let filtered = [...products]

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q)
    )
  }

  if (category) {
    const catId = parseInt(category, 10)
    filtered = filtered.filter((p) => p.category?.id === catId)
  }

  if (minPrice) {
    filtered = filtered.filter((p) => p.price >= parseFloat(minPrice))
  }

  if (maxPrice) {
    filtered = filtered.filter((p) => p.price <= parseFloat(maxPrice))
  }

  return sortProducts(filtered, params.sort)
}

function paginate(list, page = 0, size = 20) {
  const start = page * size
  return {
    content: list.slice(start, start + size),
    totalElements: list.length,
    totalPages: Math.ceil(list.length / size) || 1,
    number: page,
    size,
  }
}

export const productService = {
  getAll(params = {}) {
    const { page = 0, size = 20 } = params
    const filtered = filterProducts(params)
    return paginate(filtered, page, size)
  },

  getById(id) {
    const product = products.find((p) => p.id === parseInt(id, 10))
    if (!product) throw new Error('Produit non trouvé')
    return product
  },

  getFeatured() {
    return products.filter((p) => p.featured)
  },

  getNewArrivals() {
    return products.filter((p) => p.isNew)
  },

  getCategories() {
    return categories
  },
}
