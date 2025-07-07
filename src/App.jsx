import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import HideRoute from './components/HideRoute';
import Loader from './components/Loader';
import Quest from './pages/Quest';
import About from './pages/About';
import Login from './pages/Login';
import NotFoundPage from './pages/NotFound';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Dashboard from './pages/dashboard';

function App() {
  const GoogleAuthWrapper = () => {
    return (
      <GoogleOAuthProvider clientId={`${import.meta.env.VITE_GOOGLE_CLIENT_ID}`}>
        <Login></Login>
      </GoogleOAuthProvider>
    )
  };

  return (
    <>
      <Router>
        <HideRoute>
          <Navbar />
        </HideRoute>
        <Routes>
          <Route path="/" element={<Home />} caseSensitive />
          <Route path="/quest" element={<Quest />} caseSensitive />
          <Route path="/about" element={<About />} caseSensitive />
          <Route path="/login" element={<GoogleAuthWrapper />} caseSensitive />
          <Route path="/dashboard" element={<Dashboard />} caseSensitive />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <HideRoute>
          <Footer />
        </HideRoute>
      </Router>
    </>
  );
}

export default App;
