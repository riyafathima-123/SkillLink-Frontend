import React, { useState } from 'react';
import { BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/components.css';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [full_name, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !full_name) {
      setError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await authAPI.signUp(email, password, full_name);
      console.log('Sign up successful:', response);
      
      setMessage('Account created successfully! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Sign up failed:', err);
      const errorMsg = err.message || 'Failed to create account';
      setError(errorMsg);
    } finally {
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
          <h1 className="auth-title" style={{ fontSize: '1.875rem' }}>Create Account</h1>
          <p className="auth-subtitle">Join SkillLink and start connecting</p>
        </div>

        {message && (
          <div className="success-box">
            <CheckCircle className="success-icon" />
            <p className="success-message">{message}</p>
          </div>
        )}

        {error && (
          <div className="error-box">
            <AlertCircle className="error-icon" />
            <p className="error-message">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-space">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              required
              disabled={loading}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
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
              placeholder="At least 6 characters"
              required
              disabled={loading}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password || !full_name}
            className="btn btn-primary"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}