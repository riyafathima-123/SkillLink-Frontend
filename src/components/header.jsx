import React, { useState, useEffect } from 'react';
import { BookOpen, Zap, LogOut, Menu, X } from 'lucide-react';
import { creditAPI } from '../services/api';

export default function Header({ user, onLogout }) {
  const [credits, setCredits] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchBalance();
    // Poll balance every 3 seconds to catch credit changes
    const interval = setInterval(fetchBalance, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchBalance = async () => {
    try {
      const data = await creditAPI.getBalance();
      setCredits(Math.round(data.balance * 100) / 100);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b-2 border-blue-500 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-brand">
              SkillLink
            </h1>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-yellow-100 px-4 py-2 rounded-full border border-yellow-200">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span className="font-bold text-yellow-700">{credits}</span>
              <span className="text-sm text-yellow-600">credits</span>
            </div>

            <div className="text-right border-r pr-6">
              <p className="font-semibold text-gray-800">{user?.full_name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>

            <button
              onClick={onLogout}
              className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile View */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t space-y-3">
            <div className="flex items-center gap-2 bg-yellow-100 px-3 py-2 rounded-lg">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="font-bold text-yellow-700">{credits} credits</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">{user?.full_name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full text-left p-2 hover:bg-red-50 rounded text-red-600 font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
