import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Users, Shield, Activity, Check, X, Loader, BookOpen } from 'lucide-react';
import { skillAPI, userAPI } from '../services/api';

export default function AdminDashboard({ onLogout }) {
    const location = useLocation();
    const [user, setUser] = useState(location.state?.user || JSON.parse(localStorage.getItem('user_data') || '{}'));
    const [stats, setStats] = useState({ users: 0, activeRequests: 0, pendingSkills: 0 });
    const [pendingSkills, setPendingSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Determine user if not present (reload scenario)
            if (!user.id) {
                const me = await userAPI.getMe();
                setUser(me);
            }

            // Fetch Pending Skills
            const pending = await skillAPI.getPendingSkills();
            setPendingSkills(pending || []);

            // In a real app we'd have dedicated stats endpoints, mocking 'users' count for now or fetching list size if feasible
            // const allSkills = await skillAPI.listSkills(); 
            setStats({
                users: '--', // Not fetching all users to avoid load
                activeRequests: pending?.length || 0,
                pendingSkills: pending?.length || 0
            });

        } catch (err) {
            console.error("Failed to load admin data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (skillId) => {
        if (!window.confirm("Approve this skill for public listing?")) return;
        setActionLoading(skillId);
        try {
            await skillAPI.approveSkill(skillId);
            setPendingSkills(prev => prev.filter(s => s.id !== skillId));
            setStats(prev => ({ ...prev, activeRequests: prev.activeRequests - 1 }));
        } catch (err) {
            alert("Failed to approve: " + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (skillId) => {
        if (!window.confirm("Reject and delete this skill request?")) return;
        setActionLoading(skillId);
        try {
            await skillAPI.rejectSkill(skillId);
            setPendingSkills(prev => prev.filter(s => s.id !== skillId));
            setStats(prev => ({ ...prev, activeRequests: prev.activeRequests - 1 }));
        } catch (err) {
            alert("Failed to reject: " + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100"><Loader className="animate-spin text-indigo-600" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <Shield className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Admin Console</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{user.full_name}</span>
                        <button
                            onClick={onLogout}
                            className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Pending Approvals</p>
                            <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.pendingSkills}</p>
                        </div>
                        <div className="bg-indigo-50 p-3 rounded-full">
                            <Activity className="h-6 w-6 text-indigo-600" />
                        </div>
                    </div>
                    {/* Placeholders for future stats */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between opacity-60">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">--</p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-full">
                            <Users className="h-6 w-6 text-gray-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <BookOpen size={20} className="text-gray-500" /> Skill Approval Requests
                        </h2>
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full">{pendingSkills.length} pending</span>
                    </div>

                    {pendingSkills.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                            <p>No new skills waiting for approval.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {pendingSkills.map((skill) => (
                                <div key={skill.id} className="p-6 hover:bg-gray-50 transition flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">{skill.skill_name || skill.title}</h3>
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded uppercase">{skill.category}</span>
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">Level {skill.proficiency}</span>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-3">{skill.description}</p>

                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <div className="flex items-center gap-2">
                                                {skill.users?.avatar_url ? (
                                                    <img src={skill.users.avatar_url} alt="" className="w-5 h-5 rounded-full" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full bg-gray-300"></div>
                                                )}
                                                <span className="font-medium text-gray-700">{skill.users?.full_name || 'Unknown User'}</span>
                                            </div>
                                            <span>•</span>
                                            <span>{new Date(skill.created_at).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span className="font-medium text-indigo-600">{skill.credits_per_hour} credits/hr</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 md:border-l md:pl-6">
                                        <button
                                            onClick={() => handleApprove(skill.id)}
                                            disabled={actionLoading === skill.id}
                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition disabled:opacity-50"
                                        >
                                            {actionLoading === skill.id ? <Loader className="animate-spin" size={16} /> : <Check size={16} />}
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(skill.id)}
                                            disabled={actionLoading === skill.id}
                                            className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium shadow-sm transition disabled:opacity-50"
                                        >
                                            <X size={16} />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
