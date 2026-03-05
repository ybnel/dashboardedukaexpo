import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useStore = create(
    persist(
        (set) => ({
            // Auth state
            salesRep: null, // Siapa yang login
            login: (username) => set({ salesRep: username }),
            logout: () => set({ salesRep: null }),

            // Leads state
            leads: [],
            addLead: (leadData) => {
                // Generate simple ID like L-1234
                const newId = `L-${Math.floor(1000 + Math.random() * 9000)}`;
                const newLead = { ...leadData, id: newId, timestamp: new Date().toISOString() };

                set((state) => ({
                    leads: [newLead, ...state.leads]
                }));
                return newId; // return id so UI can show success message
            },

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
