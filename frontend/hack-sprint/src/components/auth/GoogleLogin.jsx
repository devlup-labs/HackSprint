import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthAPI } from "../../api/auth.api.js";
import { useAuth } from "../../hooks/useAuth.js";

export default function GoogleLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

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

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <div>
      <button
        onClick={googleLogin}
        className="text-lg text-center text-[#00FFC3] cursor-pointer w-full py-1.5 mt-3 mb-3 rounded-full bg-[#00FFC311] border-2 border-[#00FFC3] hover:border-[#00cfff] hover:bg-[#00cfff21] hover:text-[#00cfff] transition-transform duration-300 hover:scale-105"
      >
        <i className="fa-brands fa-google"></i> &nbsp; Login with Google
      </button>
    </div>
  );
}
