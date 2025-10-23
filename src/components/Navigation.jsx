import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Zap, Plus } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();

  const tabs = [
    { path: '/', label: 'Find Skills', icon: <Search className="w-4 h-4" /> },
    { path: '/connections', label: 'My Connections', icon: <Zap className="w-4 h-4" /> },
    { path: '/my-skills', label: 'Teach Skills', icon: <Plus className="w-4 h-4" /> },
  ];

  return (
    <nav className="bg-white border-b sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-4 py-4 font-semibold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
                location.pathname === tab.path
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-blue-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
