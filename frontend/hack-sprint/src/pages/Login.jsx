import React from "react";
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleLogin from "../components/GoogleLogin.jsx";

function Login() {
  const navigate = useNavigate();

  const { backendUrl, setIsLoggedIn } = useContext(AppContent);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    try {
      e.preventDefault();

      //   axios.defaults.withCredentials = true;


      const { data } = await axios.post(
        `${backendUrl}/api/account/login`,
        {
          email,
          password,
        },
      );

      if (data.success) {
        toast.success(data.message, { className: "text-sm max-w-xs" });
        setIsLoggedIn(true);
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.email);
        navigate("/");
      } else {
        toast.error(data.message, { className: "text-sm max-w-xs" });
      }
    } catch (err) {
      toast.error(err.message, { className: "text-sm max-w-xs" });
    }
  };

  const GoogleAuthWrapper = () => {
    return (
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <GoogleLogin />
      </GoogleOAuthProvider>
    );
  };

  return (
    <div className="flex items-center justify-center bg-gray-900 min-h-screen">
      <div className="text-white shadow-[0_0_25px_#5fff60] p-6 sm:p-10 rounded-xl w-full max-w-md mx-4 sm:mx-0">
        <h2 className="text-3xl font-medium text-center text-green-500 mb-3 sm:text-4xl">Login</h2>
        <p className="text-lg text-green-300 text-center mb-6">Login to your account!</p>
        <form onSubmit={handleLogin}>
          <div className="text-lg text-green-400 mb-6 flex items-center gap-3 px-5 py-2.5 w-full rounded-full bg-[#333A5C]">
            <i className="fa-solid fa-envelope"></i>
            <input
              className="bg-transparent outline-none w-full"
              type="email"
              placeholder="Email Id"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="text-lg text-green-400 mb-2 flex items-center gap-3 px-5 py-2.5 w-full rounded-full bg-[#333A5C]">
            <i className="fa-solid fa-lock"></i>
            <input
              className="bg-transparent outline-none w-full"
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <a className="text-sm px-4 text-green-500 cursor-pointer" href="/account/forgot-password">
            Forgot password?
          </a>

          <button className="text-xl cursor-pointer w-full py-2 mt-6 mb-3 rounded-full bg-green-500">
            Login
          </button>

          <p className="text-md text-green-300 px-4 mb-3">
            Dont have an account? &nbsp;{" "}
            <Link to="/account/signup" className="text-green-500 cursor-pointer underline">Signup</Link>
          </p>

          <div className="flex items-center justify-center my-4 mx-5">
            <hr className="border-t border-green-300 flex-grow" />
            <span className="px-4 text-green-500 text-lg">or</span>
            <hr className="border-t border-green-300 flex-grow" />
          </div>
        </form>

        <GoogleAuthWrapper />
      </div>
    </div>
  );
}

export default Login;