import axiosInstance from './axios.config'

export const cartAPI = {
  getCart: async () => {
    const response = await axiosInstance.get('/cart')
    return response
  },

  addItem: async (productId, quantity = 1) => {
    const response = await axiosInstance.post('/cart/items', {
      productId,
      quantity
    })
    return response
  },

  updateItem: async (itemId, quantity) => {
    const response = await axiosInstance.put(`/cart/items/${itemId}`, {
      quantity
    })
    return response
  },

  removeItem: async (itemId) => {
    const response = await axiosInstance.delete(`/cart/items/${itemId}`)
    return response
  },

  clearCart: async () => {
    const response = await axiosInstance.delete('/cart')
    return response
  },

  applyCoupon: async (couponCode) => {
    const response = await axiosInstance.post('/cart/coupon', {
      code: couponCode
    })
    return response
  }
}