const ORDERS_KEY = 'shopease_orders'

function getOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

function generateOrderNumber() {
  return `ORD-${Date.now().toString(36).toUpperCase()}`
}

export const orderService = {
  create(orderData, userId) {
    const orders = getOrders()
    const order = {
      id: orders.length + 1,
      orderNumber: generateOrderNumber(),
      userId,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      totalAmount: orderData.totalAmount,
      shippingAddress: orderData.shippingAddress,
      items: orderData.items.map((item) => ({
        ...item,
        product: {
          name: item.name,
          imageUrl: item.imageUrl,
        },
      })),
    }
    orders.unshift(order)
    saveOrders(orders)
    return order
  },

  getByUser(userId) {
    return getOrders().filter((o) => o.userId === userId)
  },

  getById(id) {
    const order = getOrders().find((o) => o.id === parseInt(id, 10))
    if (!order) throw new Error('Commande non trouvée')
    return order
  },
}
