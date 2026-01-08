import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import SkillsPage from './pages/skillsPage';
import ConnectionsPage from './pages/ConnectionsPage';
import MySkillsPage from './pages/MySkillsPage';
import Header from './components/header';
import Navigation from './components/Navigation';
import { userAPI, authAPI } from './services/api';
import ResetPasswordConfirmPage from './pages/ResetPasswordConfirmPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

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
      // Prefer Supabase client session validation when available
      try {
        const userResp = await authAPI.getUser();
        if (userResp) {
          // fetch full profile to get role
          const profile = await userAPI.getMe();
          setCurrentUser(profile || userResp);
          setIsLoggedIn(true);
          return;
        }
      } catch (_) {
        // fall through to backend validation
      }

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
    try {
      authAPI.signOut();
    } catch (e) {
      console.warn('Supabase signOut failed', e);
    }
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

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={!isLoggedIn ? <SignUpPage onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/login" element={!isLoggedIn ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/auth/reset-password-confirm" element={<ResetPasswordConfirmPage />} />
        <Route path="/auth/change-password" element={<ChangePasswordPage />} />

        {/* Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute user={currentUser} allowedRoles={['admin']}>
              <AdminDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={currentUser} allowedRoles={['user', 'admin']}>
              <UserDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Re-route root based on role if logged in, otherwise public home or login */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              currentUser?.role === 'admin' ? (
                <Navigate to="/admin/dashboard" />
              ) : (
                <Navigate to="/dashboard" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Specific protected pages (render mostly for users) */}
        <Route
          path="/skills"
          element={
            <ProtectedRoute user={currentUser}>
              <div className="min-h-screen bg-gray-50"><Header user={currentUser} onLogout={handleLogout} /><Navigation /><div className="max-w-7xl mx-auto px-4 py-8"><SkillsPage /></div></div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/connections"
          element={
            <ProtectedRoute user={currentUser}>
              <div className="min-h-screen bg-gray-50"><Header user={currentUser} onLogout={handleLogout} /><Navigation /><div className="max-w-7xl mx-auto px-4 py-8"><ConnectionsPage /></div></div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={currentUser}>
              <div className="bg-gray-50"><Header user={currentUser} onLogout={handleLogout} /><Navigation /><ProfilePage /></div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-skills"
          element={
            <ProtectedRoute user={currentUser}>
              <div className="min-h-screen bg-gray-50"><Header user={currentUser} onLogout={handleLogout} /><Navigation /><div className="max-w-7xl mx-auto px-4 py-8"><MySkillsPage /></div></div>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
