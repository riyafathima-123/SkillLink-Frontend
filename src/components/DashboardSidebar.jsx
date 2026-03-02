import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, BookOpen, MessageSquare, Zap, LayoutDashboard, User, Settings } from 'lucide-react';

const NAV_LINKS = [
    { path: '/skills', label: 'Find Skills', Icon: Search },
    { path: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { path: '/connections', label: 'Requests', Icon: Zap },
    { path: '/my-skills', label: 'My Skills', Icon: BookOpen },
    { path: '/messages', label: 'Messages', Icon: MessageSquare },
    { path: '/profile', label: 'Profile', Icon: User },
];

export default function DashboardSidebar({ user, onLogout }) {
    const location = useLocation();

    const isActive = (path) =>
        location.pathname === path ||
        (path === '/skills' && location.pathname === '/dashboard');

    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    return (
        <aside style={{
            width: '220px',
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #f0f4ff 0%, #e8edff 100%)',
            borderRight: '1.5px solid rgba(99,102,241,0.10)',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.75rem 1rem',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
            flexShrink: 0,
        }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem', paddingLeft: '0.5rem' }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(99,102,241,0.30)',
                    flexShrink: 0,
                }}>
                    <BookOpen size={18} color="#fff" />
                </div>
                <span style={{
                    fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                    fontWeight: 800, fontSize: '1.125rem',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.3px',
                }}>
                    SkillLink
                </span>
            </div>

            {/* User Card */}
            <div style={{
                background: '#fff',
                borderRadius: '1.125rem',
                padding: '1rem',
                marginBottom: '1.5rem',
                boxShadow: '0 2px 12px rgba(99,102,241,0.10)',
                border: '1.5px solid rgba(99,102,241,0.08)',
                display: 'flex', alignItems: 'center', gap: '0.625rem',
            }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '0.8125rem',
                    flexShrink: 0,
                    boxShadow: '0 0 0 3px #e0e7ff',
                    overflow: 'hidden',
                }}>
                    {user?.avatar_url
                        ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : initials
                    }
                </div>
                <div style={{ overflow: 'hidden' }}>
                    <p style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '0.8125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Hi {user?.full_name?.split(' ')[0] || 'there'} 👋
                    </p>
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.email}
                    </p>
                </div>
            </div>

            {/* Nav Links */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                {NAV_LINKS.map(({ path, label, Icon }) => {
                    const active = isActive(path);
                    return (
                        <Link key={path} to={path} style={{
                            display: 'flex', alignItems: 'center', gap: '0.625rem',
                            padding: '0.625rem 0.875rem',
                            borderRadius: '0.875rem',
                            textDecoration: 'none',
                            fontWeight: active ? 700 : 500,
                            fontSize: '0.875rem',
                            transition: 'all 0.2s',
                            background: active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                            color: active ? '#fff' : '#64748b',
                            boxShadow: active ? '0 4px 14px rgba(99,102,241,0.25)' : 'none',
                        }}
                            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6366f1'; } }}
                            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; } }}
                        >
                            <Icon size={16} />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <button
                onClick={onLogout}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.625rem 0.875rem',
                    borderRadius: '0.875rem', border: 'none',
                    background: 'transparent', cursor: 'pointer',
                    fontWeight: 500, fontSize: '0.875rem', color: '#94a3b8',
                    transition: 'all 0.2s', fontFamily: 'inherit', marginTop: '0.5rem',
                    width: '100%', textAlign: 'left',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#e11d48'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
            >
                ← Sign out
            </button>
        </aside>
    );
}
