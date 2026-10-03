import { Routes, Route } from "react-router-dom";
import React from "react";
import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

import MainLayout from "../layouts/MainLayouts";
import StudentLayout from "../layouts/StudentLayout";
import AdminLayout from "../layouts/AdminLayout";

import Home from "../pages/Home";

import Login from "../pages/Student/Login.jsx";
import NotFoundPage from "../pages/NotFound";
import Dashboard from "../pages/Student/Dashboard.jsx";
import Signup from "../pages/Student/Signup.jsx";
import ResetPassword from "../pages/Student/ResetPassword.jsx";
import AllHackathons from "../pages/Student/AllHackathons.jsx";
import PeoplePage from "../pages/People.jsx";
import HackathonDetails from "../pages/Hackathon.jsx";
import { OnSpotBracketPage } from "../hackathon/OnSpotBracketPage.jsx";
import { RegistrationForm } from "../hackathon/RegistrationForm.jsx";
import TeamDetails from "../pages/TeamDetails.jsx";
import ForgotPassword from "../pages/Student/forgotPassword.jsx";

import Studenthome from "../pages/Student/Studenthome.jsx";

import Adminhome from "../pages/Admin/Adminhome.jsx";
import AdminLogin from "../pages/Admin/AdminLogin.jsx";
import AdminSignup from "../pages/Admin/AdminSignup.jsx";
import AdminProfile from "../pages/Admin/AdminProfile.jsx";

import HackathonUsersPage from "../pages/Admin/UserList.jsx";
import AdminSubmissionDetail from "../pages/Admin/AdminSubmissionDetail.jsx";

import ParticipantPoliciesPage from "../pages/Participation.jsx";
import OrganizerPlaybookPage from "../pages/Organiser.jsx";
import TermsPage from "../pages/Terms.jsx";
import ContactPage from "../pages/Contact.jsx";
import FeedbackPage from "../pages/Feedback.jsx";
import CreateHackathonPage from "../pages/Admin/CreateHackathonPage.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/hackathons" element={<AllHackathons />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/hackathon/:slug" element={<HackathonDetails />} />
        <Route path="/hackathon/:slug/bracket" element={<OnSpotBracketPage />} />
        <Route
          path="/participation-policies"
          element={<ParticipantPoliciesPage />}
        />
        <Route path="/organizer-ruleBook" element={<OrganizerPlaybookPage />} />
        <Route path="/terms-and-condition" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/adminhome" element={<Adminhome />} />
      </Route>

      <Route element={<GuestRoute />}>
        <Route path="/account/login" element={<Login />} />
        <Route path="/account/signup" element={<Signup />} />
      </Route>

      <Route path="/account/forgot-password" element={<ForgotPassword />} />
      <Route path="/account/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<StudentLayout />}>
          <Route path="/studenthome" element={<Studenthome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/hackathon/RegistrationForm/:slug"
            element={<RegistrationForm />}
          />
          <Route
            path="/hackathon/:slug/team/:teamId"
            element={<TeamDetails />}
          />
        </Route>
      </Route>

      <Route path="/adminlogin" element={<AdminLogin />} />
      <Route path="/admin/signup" element={<AdminSignup />} />

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminProfile />} />
          <Route path="/createHackathon" element={<CreateHackathonPage />} />

          <Route
            path="/admin/:slug/usersubmissions"
            element={<HackathonUsersPage />}
          />
          <Route
            path="/admin/hackathon/:hackathonId/submission/:entityType/:entityId"
            element={<AdminSubmissionDetail />}
          />
        </Route>
      </Route>

      {/* ================= 404 ================= */}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
