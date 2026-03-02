import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/header';
import Navigation from '../components/Navigation';
import SkillsPage from './skillsPage';

export default function UserDashboard({ onLogout }) {
    const location = useLocation();
    const user = location.state?.user || JSON.parse(localStorage.getItem('user_data') || '{}');

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg, #eef0fb)' }}>
            <Header user={user} onLogout={onLogout} />
            <Navigation />
            <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.25rem' }}>
                <SkillsPage />
            </main>
        </div>
    );
}
