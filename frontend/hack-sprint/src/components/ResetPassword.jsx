import React, { useState, useContext } from "react";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../backendApis/api";
import { useNavigate, useLocation } from "react-router-dom";

function ResetPassword() {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();
  const location = useLocation();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // get token from query param
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match", { className: "text-sm max-w-xs" });
      return;
    }

    try {
      const { data } = await API.post(`${backendUrl}/api/account/reset-password`, {
        token,
        newPassword,
      });

      if (data.success) {
        toast.success(data.message, { className: "text-sm max-w-xs" });
        navigate("/account/login");
      } else {
        toast.error(data.message, { className: "text-sm max-w-xs" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong", {
        className: "text-sm max-w-xs",
      });
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-500 text-xl">
        ❌ Invalid or expired reset link
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-gray-900 min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center text-white shadow-[0_0_25px_#5fff60] p-10 rounded-xl w-full sm:w-116"
      >
        <h2 className="text-4xl font-medium text-center text-green-500 mb-3">
          Reset Password
        </h2>
        <p className="text-lg text-green-300 text-center mb-6">
          Enter your new password below.
        </p>

        <div className="text-lg text-green-400 flex items-center gap-3 px-5 py-2.5 w-full rounded-full bg-[#333A5C] mb-4">
          <i className="fa-solid fa-lock"></i>
          <input
            className="bg-transparent outline-none w-full"
            type="password"
            placeholder="New password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="text-lg text-green-400 flex items-center gap-3 px-5 py-2.5 w-full rounded-full bg-[#333A5C] mb-4">
          <i className="fa-solid fa-lock"></i>
          <input
            className="bg-transparent outline-none w-full"
            type="password"
            placeholder="Confirm password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button className="text-xl cursor-pointer w-full py-2 mt-6 mb-3 rounded-full bg-green-500">
          Update Password
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
