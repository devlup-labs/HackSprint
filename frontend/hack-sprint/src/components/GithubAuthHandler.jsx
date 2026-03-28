import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { AppContent } from "../context/AppContext";
import { API } from "../backendApis/api";

export default function GithubAuthHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn } = useContext(AppContent);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
      if (!code) {
        navigate("/account/login");
      return;
    }
    // Exchange code for token
    API
      .get(`${backendUrl}/api/account/auth/callback/github?code=${code}`)
      .then((res) => {
        const { token, email, name } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("email", email);
        setIsLoggedIn(true);
        navigate("/");
      })
      .catch(() => {
          navigate("/account/login");
      });
  }, [location, backendUrl, setIsLoggedIn, navigate]);

  return <div>Logging in with GitHub...</div>;
}
