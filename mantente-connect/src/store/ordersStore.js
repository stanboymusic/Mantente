import { create } from 'zustand'

export const useOrdersStore = create((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,
  syncStatus: 'idle',

  setOrders: (orders) => set({ orders }),
  setIsLoading: (value) => set({ isLoading: value }),
  setError: (error) => set({ error }),
  setSyncStatus: (status) => set({ syncStatus: status }),

  addOrder: (order) => {
    set((state) => ({
      orders: [...state.orders, { ...order, id: Date.now(), synced: false, createdAt: new Date() }],
    }))
  },

  updateOrder: (id, updates) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, ...updates, synced: false } : o
      ),
    }))
  },

  deleteOrder: (id) => {
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    }))
  },

  getOrderById: (id) => {
    return get().orders.find((o) => o.id === id)
  },

  getOrdersByCustomer: (customerId) => {
    return get().orders.filter((o) => o.customerId === customerId)
  },

  getUnsyncedOrders: () => {
    return get().orders.filter((o) => !o.synced)
  },
}))