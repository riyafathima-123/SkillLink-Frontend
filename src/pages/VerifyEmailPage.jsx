import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { authAPI } from '../services/api';
import { Link } from 'react-router-dom';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSendMagicLink = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await authAPI.sendMagicLink(email, { shouldCreateUser: false });
      setMessage('A sign-in link has been sent to your email. Use it to sign in without a password.');
    } catch (err) {
      console.error('Send magic link failed', err);
      setError(err.message || 'Failed to send link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BookOpen className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Email verification</h1>
          <p className="text-gray-600">Check your inbox for the verification link. If you didn't receive it, request a sign-in link below.</p>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg p-3"
            />
          </div>

          <button
            type="button"
            onClick={handleSendMagicLink}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send sign-in link'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
