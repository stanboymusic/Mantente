import { create } from 'zustand'

export const useInventoryStore = create((set, get) => ({
  products: [],
  isLoading: false,
  error: null,
  syncStatus: 'idle', // idle, syncing, success, error

  setProducts: (products) => set({ products }),
  setIsLoading: (value) => set({ isLoading: value }),
  setError: (error) => set({ error }),
  setSyncStatus: (status) => set({ syncStatus: status }),

  addProduct: (product) => {
    set((state) => ({
      products: [...state.products, { ...product, id: Date.now(), synced: false }],
    }))
  },

  updateProduct: (id, updates) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updates, synced: false } : p
      ),
    }))
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }))
  },

  getProductById: (id) => {
    return get().products.find((p) => p.id === id)
  },

  getUnsyncedProducts: () => {
    return get().products.filter((p) => !p.synced)
  },
}))