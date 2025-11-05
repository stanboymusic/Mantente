import { create } from 'zustand'

export const useCustomersStore = create((set, get) => ({
  customers: [],
  isLoading: false,
  error: null,
  syncStatus: 'idle',

  setCustomers: (customers) => set({ customers }),
  setIsLoading: (value) => set({ isLoading: value }),
  setError: (error) => set({ error }),
  setSyncStatus: (status) => set({ syncStatus: status }),

  addCustomer: (customer) => {
    set((state) => ({
      customers: [...state.customers, { ...customer, id: Date.now(), synced: false }],
    }))
  },

  updateCustomer: (id, updates) => {
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === id ? { ...c, ...updates, synced: false } : c
      ),
    }))
  },

  deleteCustomer: (id) => {
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id),
    }))
  },

  getCustomerById: (id) => {
    return get().customers.find((c) => c.id === id)
  },

  getUnsyncedCustomers: () => {
    return get().customers.filter((c) => !c.synced)
  },
}))