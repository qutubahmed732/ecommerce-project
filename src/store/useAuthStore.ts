import { create } from 'zustand';
import { UserRole } from '@/types';
import { logoutUser } from '@/lib/authAction'; // 👈 Isay import karein

interface AuthState {
  user: any | null;
  role: UserRole | null;
  loading: boolean;
  setAuth: (user: any, role: UserRole | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>; // 👈 Isay async kar dein
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  loading: true,

  setAuth: (user, role) => set({
    user,
    role,
    loading: false
  }),

  // 🔥 Fix: Firebase signOut call karein
  logout: async () => {
    try {
      await logoutUser(); // 1. Firebase se session khatam karein
      set({ user: null, role: null, loading: false }); // 2. Zustand clear karein
      window.location.href = "/"; // 3. Clean state ke liye refresh karein
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },

  setLoading: (loading) => set({ loading })
}));