import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { ProfileAPI } from "../api/profile.api.js";
import { AdminAPI } from "../api/admin.api.js";

export default function AuthProvider({ children }) {
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const bootstrap = async () => {
      const adminToken = localStorage.getItem("adminToken");

      if (adminToken) {
        try {
          const res = await AdminAPI.getProfile();
          // Leftover from before one-account-at-a-time: keep the organiser.
          localStorage.removeItem("token");
          login(res.data.admin, "admin");
          return;
        } catch {
          localStorage.removeItem("adminToken");
        }
      }

      const token = localStorage.getItem("token");

      if (!token) {
        logout();
        return;
      }

      try {
        const res = await ProfileAPI.getMyProfile();
        const profile = res.data.profile;
        login(profile, profile.role || "student");
      } catch {
        localStorage.removeItem("token");
        logout();
      }
    };

    bootstrap();
  }, [login, logout]);

  return children;
}
