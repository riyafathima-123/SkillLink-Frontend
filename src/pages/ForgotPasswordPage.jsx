import React, { useState } from 'react';
import { BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email) {
      return;
    }

    // Since we can't send emails, just show a message
    setMessage('Since email is not configured, please contact support to reset your password or use the "Change Password" option if you\'re already logged in.');
    
    // Optionally redirect to login after a delay
    setTimeout(() => {
      navigate('/login');
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BookOpen className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password?</h1>
          <p className="text-gray-600 text-sm">We'll help you reset your password</p>
        </div>

        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">{message}</p>
          </div>
        )}

        {!message && (
          <>
            <p className="text-gray-600 text-sm mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              ⚠️ Email system is not configured. Please use one of these options:
            </p>

            <div className="space-y-4">
              <Link
                to="/change-password"
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg font-semibold text-center transition"
              >
                Change Password (if logged in)
              </Link>

              <button
                type="button"
                onClick={() => setEmail('contacted')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 p-3 rounded-lg font-semibold transition"
              >
                Contact Support
              </button>
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:underline font-medium">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}