import React, { useState, useEffect } from "react";
import "./App.css";
import "./index.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import GithubAuthHandler from "./components/GithubAuthHandler.jsx";
import { Download } from "lucide-react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import HideRoute from "./components/HideRoute";
import HideRouteFooter from "./components/HideRouteFooter";
import Loader from "./components/Loader";
import Quest from "./pages/Student/Quest";
import Admin from "./pages/Admin/Admin.jsx";
import Login from "./pages/Student/Login.jsx";
import Questions from "./pages/Questions.jsx";
import NotFoundPage from "./pages/NotFound";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Dashboard from "./pages/Student/Dashboard.jsx";
import Signup from "./pages/Student/Signup.jsx";
import Verification from "./components/Verification.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import RouteHandler from "./components/RouteHandler.jsx";
import AllHackathons from "./pages/Student/AllHackathons.jsx";
import { ToastContainer } from "react-toastify";
import HackathonDetails from "./pages/Hackathon.jsx";
import { RegistrationForm } from "./hackathon/RegistrationForm.jsx";
import Leaderboard from "./pages/Student/LeaderBoard.jsx";
import TeamDetails from "./pages/TeamDetails.jsx";
import VerifyEmail from "./components/verifyEmail.jsx";
import ForgotPassword from "./components/forgotPassword.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Studenthome from "./pages/Student/Studenthome.jsx";
import Adminhome from "./pages/Admin/Adminhome.jsx";
import AdminLogin from "./pages/Admin/AdminLogin.jsx";
import AdminSignup from "./pages/Admin/AdminSignup.jsx";
import AdminProfile from "./pages/Admin/AdminProfile.jsx";
import HackathonUsersPage from "./admin/userlist.jsx";
import UserSubmissionDetailPage from "./admin/usersubmission.jsx";
import ParticipantPoliciesPage from "./pages/Participation.jsx";
import OrganizerPlaybookPage from "./pages/Organiser.jsx";
import LegalSupportPage from "./pages/TermsCond.jsx";
import CreateHackathonPage from "./pages/Admin/CreateHackathonPage.jsx";
import AdminNavbar from "./components/Admin/AdminNavbar.jsx";
import HideAdminRoutes from "./components/Admin/HideAdminRoutes.jsx";
import Chatbot from "./components/Chatbot.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authWait, setAuthWait] = useState(false);

  const AuthenticateRoute = ({
    element,
    admin = false,
    authWait,
    isAuthenticated,
  }) => {
    if (!authWait) return null;

    if (admin) {
      const isAdminLoggedIn = !!localStorage.getItem("adminToken");
      return isAdminLoggedIn ? element : <Navigate to="/adminlogin" />;
    }

    return isAuthenticated ? element : <Navigate to="/account/login" />;
  };

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
  }, []);

  const handleInstallClick = async () => {
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") setShowInstall(false);
    setDeferredPrompt(null);
  };

  return (
    <>
      {showInstall && (
        <button
          onClick={handleInstallClick}
          className="
          fixed bottom-20 cursor-pointer md:bottom-22 right-5 md:right-7 z-[9999]
      p-3
      bg-[#0b0f0b]
      text-[#5fff60]
      border border-[#5fff60]/30
      rounded-full

      hover:bg-[#5fff60]/10
      hover:border-[#5fff60]
      hover:shadow-[0_0_12px_rgba(95,255,96,0.4)]
      active:scale-95
      transition-all duration-200
        "
        >
          <Download size={25} />
        </button>
      )}
      <Router>
        <RouteHandler
          setIsAuthenticated={setIsAuthenticated}
          setAuthWait={setAuthWait}
        />
        <ScrollToTop />
        <Loader />
        <HideRoute>
          <Navbar />
        </HideRoute>
        <HideAdminRoutes>
          <AdminNavbar />
        </HideAdminRoutes>
        <ToastContainer position="top-right" autoClose={1200}/>
        <Chatbot />
        <Routes>
          <Route path="/" element={<Home />} caseSensitive />
          <Route path="/studenthome" element={<Studenthome />} caseSensitive />
          <Route path="/adminhome" element={<Adminhome />} caseSensitive />
          <Route path="/adminlogin" element={<AdminLogin />} caseSensitive />
          <Route path="/admin/signup" element={<AdminSignup />} caseSensitive />
          <Route path="/quest" element={<Quest />} caseSensitive />
          <Route path="/hackathons" element={<AllHackathons />} caseSensitive />
          <Route path="/hacksprintTeraBaap" element={<Admin />} caseSensitive />
          <Route
            path="/admin"
            element={
              <AuthenticateRoute
                element={<AdminProfile />}
                admin={true}
                authWait={authWait}
                isAuthenticated={isAuthenticated}
              />
            }
            caseSensitive
          />
          <Route
            path="/questions"
            element={
              <AuthenticateRoute
                element={<Questions />}
                authWait={authWait}
                isAuthenticated={isAuthenticated}
              />
            }
            caseSensitive
          />
          <Route
            path="/account/login"
            element={<Login />}
            caseSensitive
          ></Route>
          <Route
            path="/github-auth-handler"
            element={<GithubAuthHandler />}
            caseSensitive
          ></Route>
          <Route
            path="/account/signup"
            element={<Signup />}
            caseSensitive
          ></Route>
          <Route
            path="/account/reset-password"
            element={
              <AuthenticateRoute
                element={<ResetPassword />}
                authWait={authWait}
                isAuthenticated={isAuthenticated}
              />
            }
            caseSensitive
          ></Route>

          <Route path="/hackathon/:id" element={<HackathonDetails />} />
          <Route
            path="/hackathon/RegistrationForm/:id"
            element={
              <AuthenticateRoute
                element={<RegistrationForm />}
                authWait={authWait}
                isAuthenticated={isAuthenticated}
              />
            }
          />

          <Route
            path="/hackathon/:hackathonId/team/:teamId"
            element={
              <AuthenticateRoute
                element={<TeamDetails />}
                authWait={authWait}
                isAuthenticated={isAuthenticated}
              />
            }
          />

          <Route
            path="/dashboard"
            element={
              <AuthenticateRoute
                element={<Dashboard />}
                authWait={authWait}
                isAuthenticated={isAuthenticated}
              />
            }
          />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route
            path="/account/forgot-password"
            element={<ForgotPassword />}
            caseSensitive
          ></Route>
          <Route path="/leaderboard" element={<Leaderboard />} />

          <Route
            path="/hackathon/:slug/submission/:id"
            element={
              <AuthenticateRoute
                element={<UserSubmissionDetailPage />}
                authWait={authWait}
                isAuthenticated={isAuthenticated}
              />
            }
          />
          <Route
            path="/participation-policies"
            element={<ParticipantPoliciesPage />}
            caseSensitive
          />
          <Route
            path="/createHackathon"
            element={
              <AuthenticateRoute
                element={<CreateHackathonPage />}
                admin={true}
                authWait={authWait}
                isAuthenticated={isAuthenticated}
              />
            }
            caseSensitive
          />
          <Route
            path="/admin/:slug/usersubmissions"
            element={
              <AuthenticateRoute
                element={<HackathonUsersPage />}
                admin={true}
                authWait={authWait}
                isAuthenticated={isAuthenticated}
              />
            }
          />

          <Route
            path="/organizer-ruleBook"
            element={<OrganizerPlaybookPage />}
            caseSensitive
          />
          <Route
            path="/organizer-ruleBook"
            element={<OrganizerPlaybookPage />}
            caseSensitive
          />
          <Route
            path="/terms-and-condition"
            element={<LegalSupportPage />}
            caseSensitive
          />
        </Routes>

        <HideRouteFooter>
          <Footer />
        </HideRouteFooter>
      </Router>
    </>
  );
}

export default App;
