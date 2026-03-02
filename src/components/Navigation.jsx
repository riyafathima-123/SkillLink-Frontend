import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Zap, BookOpen, MessageSquare } from 'lucide-react';

const TABS = [
  { path: '/skills', label: 'Find Skills', icon: Search },
  { path: '/connections', label: 'Requests', icon: Zap },
  { path: '/my-skills', label: 'My Skills', icon: BookOpen },
  { path: '/messages', label: 'Messages', icon: MessageSquare },
];

export default function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ||
    (path === '/skills' && (location.pathname === '/' || location.pathname === '/dashboard'));

  return (
    <nav style={{
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1.5px solid rgba(99,102,241,0.08)',
      boxShadow: '0 2px 12px rgba(99,102,241,0.05)',
      position: 'sticky',
      top: '68px',
      zIndex: 40,
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', padding: '0.625rem 0' }}>
          {TABS.map(({ path, label, icon: Icon }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1.125rem',
                  borderRadius: '9999px',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  background: active
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'transparent',
                  color: active ? '#fff' : '#64748b',
                  boxShadow: active ? '0 4px 14px rgba(99,102,241,0.3)' : 'none',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = '#f0f4ff';
                    e.currentTarget.style.color = '#6366f1';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#64748b';
                  }
                }}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
