import React, { useState } from 'react';
import { Zap, X } from 'lucide-react';

export default function ConnectionModal({ skill, onConfirm, onClose }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm({ skill_id: skill.id, message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Connect</h2>
            <p className="text-gray-600">{skill.title}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700">
            Cost: <span className="font-bold text-blue-600 flex items-center gap-1">
              <Zap className="w-4 h-4" /> {skill.price} credits
            </span>
          </p>
        </div>

        <textarea
          placeholder="Add a message to the teacher (optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3 border-2 border-gray-300 rounded-lg mb-6 focus:border-blue-500 focus:outline-none resize-none"
          rows="3"
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mb-4">{message.length}/500</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
