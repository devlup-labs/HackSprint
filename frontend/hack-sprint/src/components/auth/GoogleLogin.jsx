import React from "react";
import { blockedByOtherSession } from "../../utils/sessionGuard.js";
import { useGoogleLogin, useGoogleOneTapLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthAPI } from "../../api/auth.api.js";
import { useAuth } from "../../hooks/useAuth.js";

export default function GoogleLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const responseGoogle = async (authResult) => {
    try {
      if (authResult["code"]) {
        const result = await AuthAPI.googleLogin(authResult["code"]);
        const { token, email, name } = result.data;

        localStorage.setItem("token", token);
        login({ email, name }, "student");

        navigate("/");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Something went wrong";

      toast.error(errorMessage);
    }
  };

  // Returning visitors see Google's small one-tap prompt (or are signed in
  // straight away if they've allowed it), with no popup window. The button
  // below stays as the fallback for anyone who dismisses it. Skipped while an
  // organiser session is open, since that has to be logged out first.
  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      try {
        const result = await AuthAPI.googleOneTap(credentialResponse.credential);
        const { token, email, name } = result.data;

        localStorage.setItem("token", token);
        login({ email, name }, "student");
        navigate("/");
      } catch (err) {
        toast.error(err.response?.data?.message || "Google sign-in failed");
      }
    },
    onError: () => {},
    auto_select: true,
    cancel_on_tap_outside: false,
    use_fedcm_for_prompt: true,
    disabled: isAuthenticated || !!localStorage.getItem("adminToken"),
  });

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <div>
      <button
        onClick={() => { if (!blockedByOtherSession("student")) googleLogin(); }}
        className="text-lg text-center text-[#0f766e] dark:text-[#00FFC3] cursor-pointer w-full py-1.5 mt-3 mb-3 rounded-full bg-[#0f766e12] dark:bg-[#00FFC311] border-2 border-[#0f766e] dark:border-[#00FFC3] hover:border-[#0e7490] dark:hover:border-[#00cfff] hover:bg-[#0e749021] dark:hover:bg-[#00cfff21] hover:text-[#0e7490] dark:hover:text-[#00cfff] transition-transform duration-300 hover:scale-105"
      >
        <i className="fa-brands fa-google"></i> &nbsp; Login with Google
      </button>
    </div>
  );
}
