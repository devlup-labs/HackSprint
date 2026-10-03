import React from "react";
import { blockedByOtherSession } from "../../utils/sessionGuard.js";
import { useGoogleLogin, useGoogleOneTapLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AdminAuthAPI } from "../../api/admin-auth.api.js";
import { useAuth } from "../../hooks/useAuth.js";

export default function AdminGoogleLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const responseGoogle = async (authResult) => {
    try {
      if (authResult["code"]) {
        const result = await AdminAuthAPI.googleLogin(authResult["code"]);

        const { token, admin } = result.data;

        localStorage.setItem("adminToken", token);
        login(admin, "admin");

        navigate("/admin");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Something went wrong";

      toast.error(errorMessage);
    }
  };

  // Same one-tap / auto sign-in as the student page; skipped while a student
  // session is open, since that has to be logged out first.
  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      try {
        const result = await AdminAuthAPI.googleOneTap(credentialResponse.credential);
        const { token, admin } = result.data;

        localStorage.setItem("adminToken", token);
        login(admin, "admin");
        navigate("/admin");
      } catch (err) {
        toast.error(err.response?.data?.message || "Google sign-in failed");
      }
    },
    onError: () => {},
    auto_select: true,
    cancel_on_tap_outside: false,
    use_fedcm_for_prompt: true,
    disabled: isAuthenticated || !!localStorage.getItem("token"),
  });

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <button
      onClick={() => { if (!blockedByOtherSession("admin")) googleLogin(); }}
      className="text-lg text-center text-amber-700 dark:text-yellow-400 cursor-pointer w-full py-1.5 mt-3 mb-3 rounded-full bg-amber-500/10 dark:bg-yellow-400/10 border-2 border-amber-600 dark:border-yellow-400 hover:bg-amber-500/20 dark:hover:bg-yellow-400/20 transition-all"
    >
      <i className="fa-brands fa-google"></i> &nbsp; Login with Google
    </button>
  );
}