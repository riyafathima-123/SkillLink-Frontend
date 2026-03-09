import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, BookOpen, MessageSquare, Zap, LayoutDashboard, User } from 'lucide-react';

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
            width: '224px',
            minHeight: '100vh',
            background: '#ffffff',
            borderRight: '1px solid #e8ecf0',
            boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: '1.5rem',
            paddingBottom: '1.25rem',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
            flexShrink: 0,
        }}>

            {/* Logo */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0 1.25rem', marginBottom: '1.75rem',
            }}>
                <div style={{
                    width: '34px', height: '34px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(99,102,241,0.30)',
                    flexShrink: 0,
                }}>
                    <BookOpen size={17} color="#fff" />
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
                margin: '0 0.875rem 1.75rem',
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '0.875rem',
                border: '1px solid #e8ecf0',
                display: 'flex', alignItems: 'center', gap: '0.625rem',
            }}>
                <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '0.8125rem',
                    flexShrink: 0,
                    boxShadow: '0 0 0 2px #e0e7ff',
                    overflow: 'hidden',
                }}>
                    {user?.avatar_url
                        ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : initials}
                </div>
                <div style={{ overflow: 'hidden', minWidth: 0 }}>
                    <p style={{
                        fontWeight: 700, color: '#0f172a', fontSize: '0.8125rem',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {user?.full_name?.split(' ')[0] || 'there'} 👋
                    </p>
                    <p style={{
                        fontSize: '0.6875rem', color: '#94a3b8',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {user?.email}
                    </p>
                </div>
            </div>

            {/* Section Label */}
            <p style={{
                fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                padding: '0 1.25rem', marginBottom: '0.375rem',
            }}>
                Menu
            </p>

            {/* Nav Links */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', flex: 1, padding: '0 0.625rem' }}>
                {NAV_LINKS.map(({ path, label, Icon }) => {
                    const active = isActive(path);
                    return (
                        <Link key={path} to={path} style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.625rem 0.875rem',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontWeight: active ? 700 : 500,
                            fontSize: '0.875rem',
                            transition: 'all 0.15s',
                            position: 'relative',
                            // Active: light indigo tint + left bar
                            background: active ? '#eef2ff' : 'transparent',
                            color: active ? '#4f46e5' : '#64748b',
                            // Left accent bar
                            borderLeft: active ? '3px solid #6366f1' : '3px solid transparent',
                            paddingLeft: active ? 'calc(0.875rem - 3px)' : '0.875rem',
                        }}
                            onMouseEnter={e => {
                                if (!active) {
                                    e.currentTarget.style.background = '#f8fafc';
                                    e.currentTarget.style.color = '#4f46e5';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!active) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#64748b';
                                }
                            }}
                        >
                            <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Divider */}
            <div style={{ height: '1px', background: '#e8ecf0', margin: '0.875rem 1.25rem' }} />

            {/* Sign out */}
            <div style={{ padding: '0 0.625rem' }}>
                <button onClick={onLogout} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.5rem 0.875rem',
                    borderRadius: '10px', border: 'none',
                    background: 'transparent', cursor: 'pointer',
                    fontWeight: 500, fontSize: '0.875rem', color: '#94a3b8',
                    transition: 'all 0.15s', fontFamily: 'inherit',
                    width: '100%', textAlign: 'left',
                }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#e11d48'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                >
                    ← Sign out
                </button>
            </div>
        </aside>
    );
}
