import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Check, Clock, Loader, MessageSquare, GraduationCap, ClipboardCheck } from 'lucide-react';
import { connectionAPI, userAPI, skillAPI } from '../services/api';

export default function LearningHistoryPage() {
    const navigate = useNavigate();
    const [connections, setConnections] = useState([]);
    const [users, setUsers] = useState({});
    const [skills, setSkills] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('learning'); // 'learning' or 'completed'

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [connectionsData, currentUserData] = await Promise.all([
                connectionAPI.listConnections(),
                userAPI.getMe(),
            ]);

            // Filter connections where current user is the LEARNER
            const myLearningConnections = (connectionsData || []).filter(
                (conn) => conn.learner_id === currentUserData?.id
            );

            setConnections(myLearningConnections);
            setCurrentUser(currentUserData);

            // Fetch related data
            const usersMap = {};
            const skillsMap = {};

            for (const conn of myLearningConnections) {
                if (!usersMap[conn.teacher_id]) {
                    try {
                        usersMap[conn.teacher_id] = await userAPI.getProfile(conn.teacher_id);
                    } catch (err) { }
                }
                if (!skillsMap[conn.skill_id]) {
                    try {
                        skillsMap[conn.skill_id] = await skillAPI.getSkill(conn.skill_id);
                    } catch (err) { }
                }
            }

            setUsers(usersMap);
            setSkills(skillsMap);
        } catch (err) {
            console.error('Failed to fetch learning history:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading your learning history...</p>
            </div>
        );
    }

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            accepted: 'bg-blue-100 text-blue-700 border-blue-200',
            rejected: 'bg-red-100 text-red-700 border-red-200',
            completed: 'bg-green-100 text-green-700 border-green-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    // Separate current learning and completed
    const currentLearning = connections.filter((c) => c.status === 'accepted' && !c.status.includes('completed'));
    const completedLearning = connections.filter((c) => c.status === 'completed');
    const allLearning = connections.filter((c) => c.status === 'accepted' || c.status === 'completed');

    const displayedConnections = activeTab === 'learning' ? currentLearning : completedLearning;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">My Learning</h2>
                    <p className="text-gray-500">Skills you are learning and have learned</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('learning')}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${activeTab === 'learning'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                >
                    <BookOpen className="w-5 h-5" />
                    Currently Learning
                    {currentLearning.length > 0 && (
                        <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                            {currentLearning.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${activeTab === 'completed'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                >
                    <Check className="w-5 h-5" />
                    Completed
                    {completedLearning.length > 0 && (
                        <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                            {completedLearning.length}
                        </span>
                    )}
                </button>
            </div>

            {displayedConnections.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">
                        {activeTab === 'learning'
                            ? "You're not currently learning any skills"
                            : "You haven't completed any learning sessions yet"}
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 text-blue-600 font-medium hover:underline"
                    >
                        Find skills to learn
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayedConnections.map((conn) => {
                        const teacher = users[conn.teacher_id];
                        const skill = skills[conn.skill_id];

                        return (
                            <div
                                key={conn.id}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden"
                            >
                                <div className={`h-1.5 w-full ${conn.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {skill?.title || skill?.skill_name || 'Loading...'}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Teacher: <span className="font-medium text-gray-700">{teacher?.full_name || 'Unknown'}</span>
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(conn.status)}`}>
                                            {conn.status.charAt(0).toUpperCase() + conn.status.slice(1)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                        <Clock className="w-4 h-4" />
                                        Started: {new Date(conn.created_at).toLocaleDateString()}
                                    </div>

                                    {conn.credits_amount > 0 && (
                                        <div className="text-sm text-gray-600 mb-4">
                                            Credits: <span className="font-bold text-indigo-600">{conn.credits_amount}</span>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => navigate(`/messages?userId=${teacher?.id}`)}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            Message Teacher
                                        </button>
                                        {conn.status === 'accepted' && (
                                            <button
                                                onClick={() => navigate(`/assessment/${conn.id}?skillId=${conn.skill_id}`)}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                                            >
                                                <ClipboardCheck className="w-4 h-4" />
                                                Take Assessment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
