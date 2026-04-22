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

            // Group Assignment State (Local)
            assignments: {}, // { leadId: { groupName, assignedAt } }
            assignGroup: (leadId, groupName) => set((state) => ({
                assignments: {
                    ...state.assignments,
                    [leadId]: { groupName, assignedAt: new Date().toISOString() }
                }
            })),

            // Lead Preferences (Local Fallback for missing Supabase columns)
            preferences: {}, // { leadId: classDetails }
            savePreference: (leadId, classDetails) => set((state) => ({
                preferences: { ...state.preferences, [leadId]: classDetails }
            })),
        }),
        {
            name: 'expo-dashboard-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
        }
    )
)
