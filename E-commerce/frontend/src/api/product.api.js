import axiosInstance from './axios.config'
import { productService } from '../services/productService'

async function withFallback(apiCall, fallback) {
  try {
    return await apiCall()
  } catch {
    return fallback()
  }
}

export const productAPI = {
  getAll: (params = {}) =>
    withFallback(
      () => axiosInstance.get('/products', { params }),
      () => productService.getAll(params)
    ),

  getById: (id) =>
    withFallback(
      () => axiosInstance.get(`/products/${id}`),
      () => productService.getById(id)
    ),

  getBySlug: (slug) =>
    withFallback(
      () => axiosInstance.get(`/products/slug/${slug}`),
      () => {
        const all = productService.getAll({ size: 100 })
        return all.content.find((p) => p.slug === slug)
      }
    ),

  getFeatured: () =>
    withFallback(
      () => axiosInstance.get('/products/featured'),
      () => productService.getFeatured()
    ),

  getNewArrivals: () =>
    withFallback(
      () => axiosInstance.get('/products/new-arrivals'),
      () => productService.getNewArrivals()
    ),

  getRelated: (productId) =>
    withFallback(
      () => axiosInstance.get(`/products/${productId}/related`),
      () => {
        const product = productService.getById(productId)
        return productService
          .getAll({ category: product.category?.id, size: 4 })
          .content.filter((p) => p.id !== product.id)
      }
    ),

  search: (query) =>
    withFallback(
      () => axiosInstance.get('/products/search', { params: { q: query } }),
      () => productService.getAll({ search: query }).content
    ),

  getCategories: () =>
    withFallback(
      () => axiosInstance.get('/categories'),
      () => productService.getCategories()
    ),

  create: (productData) => axiosInstance.post('/products', productData),
  update: (id, productData) => axiosInstance.put(`/products/${id}`, productData),
  delete: (id) => axiosInstance.delete(`/products/${id}`),
  uploadImage: (id, formData) =>
    axiosInstance.post(`/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  addReview: (productId, reviewData) =>
    axiosInstance.post(`/products/${productId}/reviews`, reviewData),
  getReviews: (productId, params = {}) =>
    axiosInstance.get(`/products/${productId}/reviews`, { params }),
}
