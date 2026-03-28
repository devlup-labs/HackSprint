import React, { useRef, useState } from "react";
import { useContext } from "react";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { API } from "../backendApis/api";

function Verification({ length = 6 }) {
  // axios.defaults.withCredentials = true;

  const navigate = useNavigate();

  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputsRef = useRef([]);

  const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContent);

  const handleChange = (element, index) => {
    const value = element.value.replace(/[^0-9]/g, ""); // allow only numbers
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next input
    if (index < length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);

      // Move focus back
      if (index > 0) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");

    pasteArray.forEach((char, index) => {
      if (inputsRef.current[index]) {
        inputsRef.current[index].value = char;
      }
    });
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const otpValue = otp.join("");

      const verifyToken = localStorage.getItem("verifyToken");

      const { data } = await API.post(
        `${backendUrl}/api/account/verify-email`,
        { verificationToken: otpValue },
        {
          headers: {
            Authorization: `Bearer ${verifyToken}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message, {
          className: "text-sm max-w-xs",
        });
        setIsLoggedIn(true);
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.email);
        // getUserData();

        navigate("/");
      } else {
        toast.error(data.message, {
          className: "text-sm max-w-xs",
        });
      }

      //   onSubmit(otpValue);
    } catch (err) {
      toast.error(err.message, {
        className: "text-sm max-w-xs",
      });
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-900 min-h-screen">
      <div className="text-white p-10 shadow-[0_0_25px_#5fff60] rounded-xl w-full sm:w-136">
        <h2 className="text-4xl font-medium text-center text-green-500 mb-3">
          Email Verify OTP
        </h2>
        <p className="text-sm text-green-300 text-center mb-6">
          Enter the 6-digit code sent to your email id.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <div className="flex gap-3 mb-4" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="w-12 h-12 text-center text-green-400 text-xl border-2 border-green-300 bg-[#333A5C] rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={digit}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputsRef.current[index] = el)}
                required
              />
            ))}
          </div>
          <button
            type="submit"
            // className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700"
            className="text-xl text-white cursor-pointer w-70 py-2 my-6 rounded-full bg-green-500"
          >
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
}

export default Verification;