import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import HideRoute from './components/HideRoute'
import Loader from './components/Loader'
import Quest from './pages/Quest'
import About from './pages/About'
import Login from './pages/Login'
import NotFoundPage from './pages/NotFound';
import { GoogleOAuthProvider } from '@react-oauth/google';
import SignUp from './pages/SignUp';
import './App.css';

function App() {
  const GoogleAuthWrapper = () => {
    return <Login />;
  };

  return (
    <>
      <Router>
        <HideRoute>
          <Navbar />
        </HideRoute>
        
        <Routes>
          <Route path="/" element={<Home />} caseSensitive></Route>
          <Route path="/quest" element={<Quest />} caseSensitive></Route>
          <Route path="/about" element={<About />} caseSensitive></Route>
<<<<<<< HEAD
          <Route path='/login' element={<GoogleAuthWrapper />} caseSensitive></Route>
          <Route path="*" element={<NotFoundPage />} />
=======
          <Route path='/login' element={<Login />} caseSensitive></Route>
          <Route path='/signUp' element={<SignUp />} caseSensitive></Route>
>>>>>>> Redesigned Login and Signup UI with improved layout and styles
        </Routes>

        <HideRoute>
          <Footer />
        </HideRoute>
      </Router>
    </>
  );
}

export default App;
