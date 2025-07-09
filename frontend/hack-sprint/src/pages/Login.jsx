import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
// import { googleAuth } from '../backendApis/api';
// import { useGoogleLogin } from '@react-oauth/google';
// import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === "" || password === "") {
      setError("Please fill in both fields.");
    } else {
      setError("");
      console.log("Successfully logging in with: ", { email });
      navigate("/");
    }
  };

  // const responseGoogle = async (authResult) => {
  //   try {
  //     if (authResult['code']) {
  //       const result = await googleAuth(authResult['code']);
  //       const { name, email } = result.data.user;
  //       const token = result.data.token;
  //       localStorage.setItem("userToken", token);
  //       localStorage.setItem("userEmail", email);
  //     }
  //   } catch (error) {
  //     console.error('Error while Google login', error);
  //   }
  // };

  // const googleLogin = useGoogleLogin({
  //   onSuccess: responseGoogle,
  //   onError: responseGoogle,
  //   flow: 'auth-code',
  // });

  // const githubAuthLogin = () => {
  //   window.location.assign(
  //     "https://github.com/login/oauth/authorize?client_id=" + import.meta.env.VITE_GITHUB_CLIENT_ID
  //   );
  // };

  return (
<div className="min-h-screen bg-gradient-to-br from-[#0A2F1D] to-[#1E6F3B] flex items-center justify-center">
<div className="bg-[#0F172A] p-6 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center gap-1 border border-[#19B03F]">        <div className="text-[#FFFCDE] text-3xl font-semibold">
          <h3>Login</h3>
        </div>
        <div className="text-sm text-[#FFFFFF]">
          <h6>Welcome back!</h6>
        </div>

        <form onSubmit={handleSubmit} className="w-full my-5">
          <div className="relative my-3">
            <img
              src="/Mail.png"
              alt="email"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#7B8BAB66] rounded-[2rem] w-full text-white placeholder-white px-10 py-2"
              placeholder="Email"
            />
          </div>

          <div className="relative my-3">
            <img
              src="/Lock.png"
              alt="password"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#7B8BAB66] rounded-[2rem] w-full text-white placeholder-white px-10 py-2"
              placeholder="Password"
            />
          </div>

          {error && (
            <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="flex justify-end mb-2">
            <Link to="#" className="text-xs text-blue-200 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            onClick={() => navigate("/")}
            type="submit"
            className="w-full bg-[#058DA2] text-white py-2 rounded-3xl hover:bg-[#04798b] transition"
          >
            Login
          </button>
        </form>

        <div className="flex items-center my-4 w-full">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="mx-2 text-gray-300">OR</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        <button
          // onClick={googleLogin}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-3xl bg-white hover:bg-gray-200 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Login with Google
        </button>

        <button
          // onClick={githubAuthLogin}
          className="w-full mt-2 flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-3xl bg-white hover:bg-gray-200 transition"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
            alt="Github"
            className="w-5 h-5"
          />
          Login with Github
        </button>

        <div className="text-white text-sm flex gap-2 py-3 justify-start items-start w-full">
          <p>Don't have an account?</p>
          <Link
            to="/signUp"
            className="underline hover:text-indigo-300 transition duration-200"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
