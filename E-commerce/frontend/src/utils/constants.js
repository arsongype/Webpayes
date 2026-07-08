export const APP_NAME = 'ShopEase'
export const APP_VERSION = '1.0.0'

export const ORDER_STATUS = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  PROCESSING: 'En préparation',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
  REFUNDED: 'Remboursée',
}

export const PAYMENT_STATUS = {
  PENDING: 'En attente',
  PAID: 'Payé',
  FAILED: 'Échoué',
  REFUNDED: 'Remboursé',
}

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Plus récents' },
  { value: 'oldest', label: 'Plus anciens' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'name_asc', label: 'Nom A-Z' },
  { value: 'name_desc', label: 'Nom Z-A' },
  { value: 'rating', label: 'Meilleures notes' },
]

export const ITEMS_PER_PAGE = 20

export const MAX_CART_ITEMS = 99

export const SHIPPING_COST = 0
export const FREE_SHIPPING_THRESHOLD = 50
export const TAX_RATE = 0.2