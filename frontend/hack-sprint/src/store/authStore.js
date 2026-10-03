import { create } from "zustand";
import { AuthAPI } from "../api/auth.api.js";
import { AdminAuthAPI } from "../api/admin-auth.api.js";

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  loading: true,
  isAuthenticated: false,

  login: (user, role = "student") =>
    set({
      user,
      role,
      isAuthenticated: true,
      loading: false,
    }),

  logout: () =>
    set({
      user: null,
      role: null,
      isAuthenticated: false,
      loading: false,
    }),

  // Revokes the session server-side (clears the refresh-token hash + cookie),
  // then clears local state. Prefer this over calling `logout()` directly.
  logoutAndClear: async (isAdmin = false) => {
    try {
      await (isAdmin ? AdminAuthAPI.logout() : AuthAPI.logout());
    } catch {
      // best-effort — still clear local state even if the network call fails
    }

    localStorage.removeItem(isAdmin ? "adminToken" : "token");

    // Without this, Google's auto sign-in would put the person straight back
    // in the next time they open the login page after logging out.
    try {
      window.google?.accounts?.id?.disableAutoSelect();
    } catch {
      // Google script not loaded on this page; nothing to disable.
    }

    set({
      user: null,
      role: null,
      isAuthenticated: false,
      loading: false,
    });
  },

  finishLoading: () =>
    set({
      loading: false,
    }),
}));
