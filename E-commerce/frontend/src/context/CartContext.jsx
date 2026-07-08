import { createContext, useContext, useState, useCallback } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const saveCart = useCallback((cartItems) => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [])

  const addToCart = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      let newItems
      if (existing) {
        newItems = prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        newItems = [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity,
            maxQuantity: product.stockQuantity || 99,
          },
        ]
      }
      saveCart(newItems)
      return newItems
    })
    toast.success(`${product.name} ajouté au panier`)
  }

  const removeFromCart = (productId) => {
    setItems((prev) => {
      const newItems = prev.filter((item) => item.productId !== productId)
      saveCart(newItems)
      return newItems
    })
    toast.success('Article retiré du panier')
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return
    setItems((prev) => {
      const newItems = prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(quantity, item.maxQuantity || 99) }
          : item
      )
      saveCart(newItems)
      return newItems
    })
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem('cart')
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
