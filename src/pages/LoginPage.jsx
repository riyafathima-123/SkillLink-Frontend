import React, { useState } from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';
import { userAPI } from '../services/api';
import { Link } from 'react-router-dom';
import '../styles/components.css';

export default function LoginPage({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login with email:', email);
      const response = await userAPI.login(email, password);
      
      if (!response || !response.token) {
        setError('Login response is invalid. Please try again.');
        setLoading(false);
        return;
      }

      onLogin(response.token, response.user);
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <BookOpen />
          </div>
          <h1 className="auth-title">SkillLink</h1>
          <p className="auth-subtitle">Learn & Share Skills Peer-to-Peer</p>
        </div>

        {error && (
          <div className="error-box">
            <AlertCircle className="error-icon" />
            <div className="error-content">
              <p className="error-title">Login Error</p>
              <p className="error-message">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-space">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <Link to="/forgot-password" className="auth-link">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="btn btn-primary"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              Create one
            </Link>
          </p>
        </div>

        <div className="auth-divider">
          <p className="auth-divider-text">Use your account to sign in.</p>
        </div>
      </div>
    </div>
  );
}