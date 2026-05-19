import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  vendorId: any
  id: string
  title: string
  price: number
  imageUrl: string
  quantity: number
  stock: number
}

interface CartState {
  cart: CartItem[]
  addToCart: (product: CartItem) => void
  removeFromCart: (id: string) => void
  decreaseQuantity: (id: string) => void
  clearCart: () => void
  totalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (product) => set((state) => {
        const existingItem = state.cart.find((item) => item.id === product.id)

        if (existingItem) {
          return {
            cart: state.cart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: product.quantity + 1 }
                : item
            ),
          }
        }
        return { cart: [...state.cart, { ...product }] }
      }),

      decreaseQuantity: (id) => set((state) => ({
        cart: state.cart.map((item) =>
          item.id === id && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ),
      })),

      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter((item) => item.id !== id)
      })),

      clearCart: () => set({ cart: [] }),

      totalPrice: () => {
        const state = get();
        return state.cart.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    { name: 'shopping-cart' }
  )
)