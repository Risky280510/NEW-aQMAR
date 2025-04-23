import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../models/User";

interface AuthState {
  user: User | null; // Store user data if logged in, null otherwise
  isAuthenticated: boolean; // Login status marker
  isLoading: boolean; // For initial loading status (eg: check session)
  // Actions (functions to change state):
  login: (userData: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => void; // Function to check authentication status
}

const useAuthStore = create<AuthState>(
  persist(
    (set) => ({
      // Initial State Values:
      user: null,
      isAuthenticated: false,
      isLoading: false, // Set false at the beginning, we don't have any automatic session checks

      // Actions Definition:
      login: (userData) =>
        set({ user: userData, isAuthenticated: true, isLoading: false }),

      logout: () => set({ user: null, isAuthenticated: false }),

      setLoading: (loading) => set({ isLoading: loading }),

      // Check if user is authenticated based on stored data
      checkAuth: () => {
        // This function will be called to verify authentication status
        // The persist middleware will automatically restore the state from localStorage
        // so we just need to ensure the loading state is updated
        set((state) => ({
          ...state,
          isLoading: false,
        }));
      },
    }),
    {
      name: "auth-storage", // name of the item in the storage
      getStorage: () => localStorage, // use localStorage for persistence
    },
  ),
);

export default useAuthStore;
