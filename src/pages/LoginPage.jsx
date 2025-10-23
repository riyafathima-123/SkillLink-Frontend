import React, { useState } from 'react';
import { BookOpen, User } from 'lucide-react';

const DEMO_USERS = [
  {
    id: '83eaa959-ed83-48be-8cbf-a80ba272b585',
    name: 'Riya fathima',
    email: '22gcs02@meaec.edu.in',
    token: 'ka6BpUABev7JOIxS5b23ZiExoEqdGGC3M1hGtB+3WZ7ZH3xxxWCctrnFCAEgaaqAfV8Sr/rJsQmKfAcTjnKsjg==',
  },
  {
    id: '257631aa-31ab-4c9c-816f-497877e5a554',
    name: 'Shishana',
    email: '22ncs03@meaec.edu.in',
    token: 'ka6BpUABev7JOIxS5b23ZiExoEqdGGC3M1hGtB+3WZ7ZH3xxxWCctrnFCAEgaaqAfV8Sr/rJsQmKfAcTjnKsjg==' ,
  },
  {
    id: '1c203541-2549-41ba-9f94-d0069aecfc97',
    name: 'Rineesha pk',
    email: '22mcs21@meaec.edu.in',
    token: 'ka6BpUABev7JOIxS5b23ZiExoEqdGGC3M1hGtB+3WZ7ZH3xxxWCctrnFCAEgaaqAfV8Sr/rJsQmKfAcTjnKsjg==' ,
  },
];

export default function LoginPage({ onLogin }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (user) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onLogin(user.token, {
        id: user.id,
        full_name: user.name,
        email: user.email,
        bio: 'Welcome to SkillLink!',
        avatar_url: null,
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BookOpen className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">SkillLink</h1>
          <p className="text-gray-600">
            Learn & Share Skills Peer-to-Peer
          </p>
        </div>

        {/* Demo Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>Demo Mode:</strong> Select any user to login
          </p>
        </div>

        {/* Login Buttons */}
        <div className="space-y-3">
          {DEMO_USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => handleLogin(user)}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-lg font-semibold transition transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              <User className="w-5 h-5" />
              {loading ? 'Logging in...' : `Login as ${user.name}`}
            </button>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-xs text-gray-500">
            This is a demo. No real authentication required.
          </p>
        </div>
      </div>
    </div>
  );
}