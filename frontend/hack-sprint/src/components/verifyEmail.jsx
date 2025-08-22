import { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContent } from "../context/AppContext";
import axios from "axios";

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);
  const [status, setStatus] = useState("checking"); // checking, success, failed

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (!token) {
      setStatus("failed");
      toast.error("❌ Verification failed. Invalid or expired link.");
      return;
    }

    axios
      .get(`${backendUrl}/api/account/verify-email?token=${token}`)
      .then((res) => {
        setStatus("success");
        toast.success("✅ Account verified successfully!");
        setTimeout(() => navigate("/account/login"), 2000);
      })
      .catch((err) => {
        setStatus("failed");
        toast.error("❌ Verification failed. Invalid or expired link.");
      });
  }, [location, navigate, backendUrl]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {status === "checking" && (
        <h1 className="text-xl font-semibold text-gray-600">
          Verifying your account...
        </h1>
      )}
      {status === "success" && (
        <h1 className="text-2xl font-bold text-green-600">
          ✅ Account Verified Successfully! Redirecting...
        </h1>
      )}
      {status === "failed" && (
        <h1 className="text-2xl font-bold text-red-600">
          ❌ Verification Failed
        </h1>
      )}
    </div>
  );
}
