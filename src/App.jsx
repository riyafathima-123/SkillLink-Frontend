import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SkillsPage from './pages/skillsPage';
import ConnectionsPage from './pages/ConnectionsPage';
import MySkillsPage from './pages/MySkillsPage';
import Header from './components/header';
import Navigation from './components/Navigation';
import { userAPI } from './services/api';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      validateToken();
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async () => {
    try {
      const user = await userAPI.getMe();
      setCurrentUser(user);
      setIsLoggedIn(true);
    } catch (err) {
      console.error('Token validation failed:', err);
      localStorage.removeItem('auth_token');
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (token, user) => {
    localStorage.setItem('auth_token', token);
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading SkillLink...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header user={currentUser} onLogout={handleLogout} />
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<SkillsPage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/my-skills" element={<MySkillsPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
