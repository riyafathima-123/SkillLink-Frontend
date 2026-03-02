import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Sparkles, Loader } from 'lucide-react';
import DashboardSidebar from '../components/DashboardSidebar';
import SkillsPage from './skillsPage';
import { userAPI, creditAPI } from '../services/api';

export default function UserDashboard({ onLogout }) {
    const location = useLocation();
    const [user, setUser] = useState(
        location.state?.user || JSON.parse(localStorage.getItem('user_data') || '{}')
    );
    const [credits, setCredits] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        // Fetch fresh user data + credits
        const load = async () => {
            try {
                const me = await userAPI.getMe();
                setUser(me);
            } catch { }
            try {
                const bal = await creditAPI.getBalance();
                setCredits(Math.round((bal.balance || 0) * 100) / 100);
            } catch { }
        };
        load();
        const interval = setInterval(async () => {
            try {
                const bal = await creditAPI.getBalance();
                setCredits(Math.round((bal.balance || 0) * 100) / 100);
            } catch { }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const timeGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg, #eef0fb)', fontFamily: "'Inter', sans-serif" }}>

            {/* Desktop Sidebar */}
            <div className="dashboard-sidebar-desktop">
                <DashboardSidebar user={user} onLogout={onLogout} />
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100,
                    background: 'rgba(30,27,75,0.45)',
                    display: 'flex',
                }} onClick={() => setSidebarOpen(false)}>
                    <div onClick={e => e.stopPropagation()}>
                        <DashboardSidebar user={user} onLogout={onLogout} />
                    </div>
                </div>
            )}

            {/* Main Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

                {/* Top Header Bar */}
                <header style={{
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1.5px solid rgba(99,102,241,0.08)',
                    padding: '0 1.5rem',
                    height: '68px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'sticky', top: 0, zIndex: 50,
                    boxShadow: '0 2px 16px rgba(99,102,241,0.06)',
                }}>
                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="dashboard-hamburger"
                        style={{
                            display: 'none', border: 'none', background: 'transparent',
                            cursor: 'pointer', padding: '0.5rem', borderRadius: '8px',
                        }}
                    >
                        <span style={{ fontSize: '1.25rem' }}>☰</span>
                    </button>

                    {/* Greeting */}
                    <div>
                        <h1 style={{
                            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                            fontWeight: 800, fontSize: '1.1875rem',
                            color: '#1e1b4b', lineHeight: 1.2,
                        }}>
                            {timeGreeting()}, {user?.full_name?.split(' ')[0] || 'there'} 👋
                        </h1>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                            Explore skills, connect, and grow today
                        </p>
                    </div>

                    {/* Credits + Avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.375rem',
                            background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                            border: '1.5px solid #fde68a', borderRadius: '9999px',
                            padding: '0.375rem 0.875rem',
                            boxShadow: '0 2px 8px rgba(251,191,36,0.18)',
                        }}>
                            <span style={{ fontSize: '0.875rem' }}>⚡</span>
                            <span style={{ fontWeight: 700, color: '#b45309', fontSize: '0.875rem' }}>{credits}</span>
                            <span style={{ fontSize: '0.7rem', color: '#d97706' }}>credits</span>
                        </div>

                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: '0.8125rem',
                            boxShadow: '0 0 0 2.5px #e0e7ff',
                            overflow: 'hidden', flexShrink: 0,
                        }}>
                            {user?.avatar_url
                                ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : (user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?').toUpperCase()
                            }
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{ flex: 1, padding: '1.75rem 1.5rem' }}>

                    {/* Welcome Banner */}
                    <div style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
                        borderRadius: '1.5rem',
                        padding: '1.5rem 1.75rem',
                        marginBottom: '1.75rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        boxShadow: '0 8px 32px rgba(99,102,241,0.28)',
                        overflow: 'hidden',
                        position: 'relative',
                    }}>
                        {/* Decorative circles */}
                        <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                        <div style={{ position: 'absolute', right: '60px', bottom: '-40px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                                background: 'rgba(255,255,255,0.18)', borderRadius: '9999px',
                                padding: '0.25rem 0.75rem', marginBottom: '0.625rem',
                            }}>
                                <Sparkles size={12} color="#fff" />
                                <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>Your Learning Hub</span>
                            </div>
                            <h2 style={{
                                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                                color: '#fff', fontWeight: 800, fontSize: '1.375rem',
                                marginBottom: '0.375rem',
                            }}>
                                Discover Skills &amp; Connect with Teachers
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem' }}>
                                Find the perfect teacher for any skill you want to master
                            </p>
                        </div>

                        <div style={{
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: '1.125rem',
                            padding: '1rem 1.25rem',
                            position: 'relative', zIndex: 1,
                            display: 'flex', flexDirection: 'column', gap: '0.5rem',
                            alignItems: 'flex-end',
                        }} className="banner-stats">
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.625rem', lineHeight: 1 }}>
                                    ⚡ {credits}
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', marginTop: '0.2rem' }}>
                                    Available Credits
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skills Section Label */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <div>
                            <h3 style={{
                                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                                fontWeight: 700, fontSize: '1.0625rem', color: '#1e1b4b',
                            }}>
                                Find Skills
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                                Browse all available teachers and skills
                            </p>
                        </div>
                    </div>

                    {/* Skills Page Content */}
                    <SkillsPage />
                </main>
            </div>

            <style>{`
                .dashboard-sidebar-desktop { display: flex; }
                .dashboard-hamburger { display: none !important; }
                @media (max-width: 768px) {
                    .dashboard-sidebar-desktop { display: none !important; }
                    .dashboard-hamburger { display: flex !important; }
                    .banner-stats { display: none !important; }
                }
            `}</style>
        </div>
    );
}
