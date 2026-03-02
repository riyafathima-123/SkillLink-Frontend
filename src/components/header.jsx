import React, { useState, useEffect } from 'react';
import { BookOpen, Zap, LogOut, Menu, X, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { creditAPI } from '../services/api';

export default function Header({ user, onLogout }) {
  const [credits, setCredits] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchBalance();
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

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <header style={{
      background: 'rgba(255,255,255,0.82)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1.5px solid rgba(99,102,241,0.10)',
      boxShadow: '0 2px 20px rgba(99,102,241,0.07)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              flexShrink: 0,
            }}>
              <BookOpen size={20} color="#fff" />
            </div>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              fontWeight: 800,
              fontSize: '1.3125rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}>
              SkillLink
            </span>
          </div>

          {/* Desktop Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="hidden-mobile">
            {/* Credits Badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
              border: '1.5px solid #fde68a',
              borderRadius: '9999px',
              padding: '0.375rem 0.875rem',
              boxShadow: '0 2px 8px rgba(251,191,36,0.18)',
            }}>
              <Zap size={15} color="#d97706" fill="#d97706" />
              <span style={{ fontWeight: 700, color: '#b45309', fontSize: '0.875rem' }}>{credits}</span>
              <span style={{ fontSize: '0.75rem', color: '#d97706' }}>credits</span>
            </div>

            {/* User Link */}
            <Link to="/profile" style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              textDecoration: 'none',
              padding: '0.375rem 0.75rem',
              borderRadius: '12px',
              transition: 'background 0.15s',
              background: 'transparent',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Avatar */}
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '0.8125rem',
                flexShrink: 0,
                boxShadow: '0 0 0 2.5px #e0e7ff',
              }}>
                {initials}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 600, color: '#1e1b4b', fontSize: '0.875rem', lineHeight: 1.3 }}>{user?.full_name}</p>
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.3 }}>{user?.email}</p>
              </div>
            </Link>

            {/* Logout */}
            <button
              onClick={onLogout}
              title="Logout"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '36px', height: '36px',
                borderRadius: '10px', border: 'none',
                background: 'transparent', cursor: 'pointer',
                color: '#94a3b8', transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#e11d48'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              padding: '0.5rem', border: 'none', background: 'transparent',
              cursor: 'pointer', color: '#64748b', borderRadius: '8px',
            }}
            className="show-mobile"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div style={{
            borderTop: '1.5px solid #e2e8f0',
            padding: '1rem 0',
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: '9999px', padding: '0.375rem 0.875rem',
              width: 'fit-content',
            }}>
              <Zap size={14} color="#d97706" fill="#d97706" />
              <span style={{ fontWeight: 700, color: '#b45309', fontSize: '0.875rem' }}>{credits} credits</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '0.75rem',
              }}>{initials}</div>
              <div>
                <p style={{ fontWeight: 600, color: '#1e1b4b', fontSize: '0.875rem' }}>{user?.full_name}</p>
                <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => { setMobileMenuOpen(false); onLogout(); }}
              style={{
                border: 'none', background: '#fff1f2', color: '#e11d48',
                borderRadius: '10px', padding: '0.625rem 1rem',
                fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                fontSize: '0.875rem',
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile   { display: none !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
