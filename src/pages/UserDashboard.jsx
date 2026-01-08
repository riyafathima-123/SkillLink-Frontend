import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/header';
import Navigation from '../components/Navigation';
import SkillsPage from './skillsPage';

export default function UserDashboard({ onLogout }) {
    const location = useLocation();
    const user = location.state?.user || JSON.parse(localStorage.getItem('user_data') || '{}');

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={user} onLogout={onLogout} />
            <Navigation />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <SkillsPage />
            </div>
        </div>
    );
}
