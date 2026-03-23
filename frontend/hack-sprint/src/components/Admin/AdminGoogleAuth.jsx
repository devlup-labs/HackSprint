import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { adminGoogleAuth } from "../../backendApis/api";

export default function AdminGoogleLogin() {
  const navigate = useNavigate();

  const responseGoogle = async (authResult) => {
    try {
      if (authResult["code"]) {
        const result = await adminGoogleAuth(authResult["code"]);

        const { token, admin } = result.data;

        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminEmail", admin.email);

        navigate("/admin");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Something went wrong";

      toast.error(errorMessage, { className: "text-sm max-w-xs" });
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <button
      onClick={googleLogin}
      className="text-lg text-center text-yellow-400 cursor-pointer w-full py-1.5 mt-3 mb-3 rounded-full bg-yellow-400/10 border-2 border-yellow-400 hover:bg-yellow-400/20 transition-all"
    >
      <i className="fa-brands fa-google"></i> &nbsp; Login with Google
    </button>
  );
}