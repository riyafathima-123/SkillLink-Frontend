import React, { useState, useEffect } from 'react';
import { Zap, X, AlertCircle } from 'lucide-react';
import { creditAPI } from '../services/api';

export default function ConnectionModal({ skill, onConfirm, onClose }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const data = await creditAPI.getBalance();
      setCredits(data.balance);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    } finally {
      setLoadingBalance(false);
    }
  };

  const hasEnoughCredits = credits !== null && credits >= skill.price;

  const handleConfirm = async () => {
    if (!hasEnoughCredits) {
      alert('Insufficient credits! You need ' + skill.price + ' credits but only have ' + credits);
      return;
    }
    
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
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-700">
              Cost: <span className="font-bold text-blue-600 inline-flex items-center gap-1">
                <Zap className="w-4 h-4" /> {skill.price} credits
              </span>
            </p>
            {!loadingBalance && (
              <p className="text-sm text-gray-700">
                Balance: <span className="font-bold text-green-600">{credits} credits</span>
              </p>
            )}
          </div>
          {!loadingBalance && !hasEnoughCredits && (
            <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded p-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">
                Insufficient credits! You need {skill.price - credits} more credits.
              </p>
            </div>
          )}
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
            disabled={loading || loadingBalance || !hasEnoughCredits}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connecting...' : loadingBalance ? 'Loading...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
