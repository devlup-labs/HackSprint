import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

function ForgotPassword() {
  const { backendUrl } = useContext(AppContent);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/account/send-reset-link`, {
        email,
      });

      if (data.success) {
        toast.success("Reset link has been sent to your email", {
          className: "text-sm max-w-xs",
        });
        navigate("/account/reset-password");
      } else {
        toast.error(data.message, { className: "text-sm max-w-xs" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong", {
        className: "text-sm max-w-xs",
      });
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-900 min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center text-white shadow-[0_0_25px_#5fff60] p-10 rounded-xl w-full sm:w-116"
      >
        <h2 className="text-4xl font-medium text-center text-green-500 mb-3">
          Forgot Password
        </h2>
        <p className="text-lg text-green-300 text-center mb-6">
          Enter your email to get a password reset link.
        </p>

        <div className="text-lg text-green-400 flex items-center gap-3 px-5 py-2.5 w-full rounded-full bg-[#333A5C] mb-4">
          <i className="fa-solid fa-envelope"></i>
          <input
            className="bg-transparent outline-none w-full"
            type="email"
            placeholder="Email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button className="text-xl cursor-pointer w-full py-2 mt-6 mb-3 rounded-full bg-green-500">
          Send Reset Link
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
