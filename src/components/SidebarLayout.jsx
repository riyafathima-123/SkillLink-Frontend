import React, { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';

/**
 * Wraps any inner page (Connections, Profile, My Skills, Messages, etc.)
 * with the DashboardSidebar + a simple content area.
 */
export default function SidebarLayout({ user, onLogout, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg, #eef0fb)', fontFamily: "'Inter', sans-serif" }}>
            {/* Desktop Sidebar */}
            <div className="sidebar-layout-desktop">
                <DashboardSidebar user={user} onLogout={onLogout} />
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(30,27,75,0.45)', display: 'flex' }}
                    onClick={() => setSidebarOpen(false)}>
                    <div onClick={e => e.stopPropagation()}>
                        <DashboardSidebar user={user} onLogout={onLogout} />
                    </div>
                </div>
            )}

            {/* Main */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Mobile top bar */}
                <div style={{
                    display: 'none', padding: '0.875rem 1.25rem',
                    background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)',
                    borderBottom: '1.5px solid rgba(99,102,241,0.08)',
                    alignItems: 'center', gap: '1rem',
                }} className="sidebar-mobile-bar">
                    <button onClick={() => setSidebarOpen(true)} style={{
                        border: 'none', background: 'transparent', cursor: 'pointer',
                        fontSize: '1.25rem', padding: '0.25rem',
                    }}>☰</button>
                    <span style={{
                        fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                        fontWeight: 800, fontSize: '1.125rem',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>SkillLink</span>
                </div>

                <main style={{ flex: 1, padding: '1.75rem 1.5rem', maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
                    {children}
                </main>
            </div>

            <style>{`
                .sidebar-layout-desktop { display: flex; }
                .sidebar-mobile-bar { display: none; }
                @media (max-width: 768px) {
                    .sidebar-layout-desktop { display: none !important; }
                    .sidebar-mobile-bar { display: flex !important; }
                }
            `}</style>
        </div>
    );
}
