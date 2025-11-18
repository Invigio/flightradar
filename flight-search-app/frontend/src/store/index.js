/**
 * Zustand Store - globalny stan aplikacji
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);

export const useFlightStore = create((set) => ({
  flights: [],
  isLoading: false,
  error: null,
  searchParams: null,
  metrics: null,

  setFlights: (flights) => set({ flights, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setSearchParams: (searchParams) => set({ searchParams }),
  setMetrics: (metrics) => set({ metrics }),

  clearFlights: () => set({ flights: [], error: null, searchParams: null, metrics: null })
}));
