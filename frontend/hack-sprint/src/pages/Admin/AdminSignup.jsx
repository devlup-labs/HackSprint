import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { API } from "../../backendApis/api";
import AdminGoogleLogin from "../../components/Admin/AdminGoogleAuth";

function AdminSignup() {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post(
        `${backendUrl}/api/admin/signup`,
        { adminName, email, password }
      );

      toast.success(data.message || "Admin registered successfully!", {
        className: "text-sm max-w-xs",
      });

      navigate("/adminlogin");
    } catch (err) {
      toast.error(err.response?.data?.error || err.message, {
        className: "text-sm max-w-xs",
      });
    }
  };

  const GoogleAuthWrapper = () => {
    return (
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AdminGoogleLogin /> 
      </GoogleOAuthProvider>
    );
  };

  return (
    <div className="flex items-center justify-center bg-gray-900 min-h-screen">
      <div className="text-white shadow-[0_0_25px_#5fff60] p-6 sm:p-10 rounded-xl w-full max-w-md mx-4">

        {/* Title */}
        <h2 className="text-3xl font-medium text-center text-green-500 mb-3 sm:text-4xl">
          Admin Signup
        </h2>

        <p className="text-lg text-green-300 text-center mb-6">
          Create a new administrator account.
        </p>

        <GoogleAuthWrapper />

        {/* Divider */}
        <div className="flex items-center justify-center my-4">
          <hr className="border-t border-green-500/20 flex-grow" />
          <span className="px-3 text-green-400 text-sm">or</span>
          <hr className="border-t border-green-500/20 flex-grow" />
        </div>

        {/* FORM */}
        <form onSubmit={handleSignup}>
          <div className="text-lg text-green-400 mb-6 flex items-center gap-3 px-5 py-2.5 w-full rounded-full bg-[#333A5C]">
            <i className="fa-solid fa-user"></i>
            <input
              className="bg-transparent outline-none w-full"
              type="text"
              placeholder="Full Name"
              required
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />
          </div>

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

          <button className="text-xl cursor-pointer w-full py-2 mt-6 mb-3 rounded-full bg-green-500 hover:bg-green-600 transition">
            Signup
          </button>

          <p className="text-md text-green-300 px-4 mt-3 text-center">
            Already have an admin account? &nbsp;
            <Link
              to="/adminlogin"
              className="text-green-500 underline hover:text-green-400"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default AdminSignup;