import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useStore = create(
    persist(
        (set) => ({
            // Auth state
            salesRep: null, // Siapa yang login
            login: (username) => set({ salesRep: username }),
            logout: () => set({ salesRep: null }),



            // Checkout State
            currentCheckout: null,
            startCheckout: (leadId, classDetails) => set({
                currentCheckout: { leadId, classDetails, status: 'pending' }
            }),
            completeCheckout: () => set({ currentCheckout: null }),
        }),
        {
            name: 'expo-dashboard-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
        }
    )
)
