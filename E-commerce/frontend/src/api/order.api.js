import axiosInstance from './axios.config'
import { orderService } from '../services/orderService'

function getUserId() {
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    return userData.id
  } catch {
    return null
  }
}

async function withFallback(apiCall, fallback) {
  try {
    return await apiCall()
  } catch {
    return fallback()
  }
}

export const orderAPI = {
  create: (orderData) =>
    withFallback(
      () => axiosInstance.post('/orders', orderData),
      () => {
        const userId = getUserId()
        if (!userId) throw new Error('Non authentifié')
        return orderService.create(
          {
            ...orderData,
            items: orderData.items.map((item) => ({
              ...item,
              name: item.name,
              imageUrl: item.imageUrl,
            })),
          },
          userId
        )
      }
    ),

  createOrder: (orderData) => orderAPI.create(orderData),

  getOrders: (params = {}) =>
    withFallback(
      () => axiosInstance.get('/orders', { params }),
      () => {
        const userId = getUserId()
        return orderService.getByUser(userId)
      }
    ),

  getAll: (params = {}) => orderAPI.getOrders(params),

  getOrderById: (id) =>
    withFallback(
      () => axiosInstance.get(`/orders/${id}`),
      () => orderService.getById(id)
    ),

  getById: (id) => orderAPI.getOrderById(id),

  getOrderByNumber: (orderNumber) =>
    withFallback(
      () => axiosInstance.get(`/orders/number/${orderNumber}`),
      () => {
        const orders = JSON.parse(localStorage.getItem('shopease_orders') || '[]')
        return orders.find((o) => o.orderNumber === orderNumber)
      }
    ),

  cancelOrder: (id) => axiosInstance.put(`/orders/${id}/cancel`),
  getAllOrders: (params = {}) => axiosInstance.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) =>
    axiosInstance.put(`/admin/orders/${id}/status`, { status }),
}
