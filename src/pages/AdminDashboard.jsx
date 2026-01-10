import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    LogOut, Users, Shield, Activity, Check, X, Loader,
    BookOpen, CreditCard, Award, Eye, Search, Filter
} from 'lucide-react';
import { skillAPI, userAPI, adminAPI } from '../services/api';

const TABS = {
    SKILLS: 'skills',
    USERS: 'users',
    TEACHING: 'teaching',
    LEARNING: 'learning',
    CREDITS: 'credits'
};

export default function AdminDashboard({ onLogout }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(location.state?.user || JSON.parse(localStorage.getItem('user_data') || '{}'));
    const [activeTab, setActiveTab] = useState(TABS.SKILLS);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTabData();
    }, [activeTab]);

    const fetchTabData = async () => {
        setLoading(true);
        try {
            if (!user.id) {
                const me = await userAPI.getMe();
                setUser(me);
            }

            let result = [];
            switch (activeTab) {
                case TABS.SKILLS:
                    result = await skillAPI.getPendingSkills();
                    break;
                case TABS.USERS:
                    result = await adminAPI.listUsers();
                    break;
                case TABS.TEACHING:
                    result = await adminAPI.listTeachingRequests();
                    break;
                case TABS.LEARNING:
                    result = await adminAPI.listAllConnections();
                    break;
                case TABS.CREDITS:
                    result = await adminAPI.listAllTransactions();
                    break;
                default:
                    break;
            }
            setData(result || []);
        } catch (err) {
            console.error("Failed to load admin data:", err);
            // alert("Error loading data: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (actionFn, id, successMsg) => {
        console.log('[ADMIN] handleAction called with id:', id);
        setActionLoading(id);
        try {
            const result = await actionFn(id);
            console.log('[ADMIN] Action result:', result);
            setData(prev => prev.filter(item => item.id !== id));
            // In some tabs like Learning/Users we might want to refresh instead of filter
            if (activeTab === TABS.LEARNING || activeTab === TABS.USERS) {
                fetchTabData();
            }
        } catch (err) {
            console.error('[ADMIN] Action error:', err);
            alert("Action failed: " + (err.response?.data?.error || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const filteredData = data.filter(item => {
        const query = searchQuery.toLowerCase();
        return (
            (item.full_name?.toLowerCase().includes(query)) ||
            (item.email?.toLowerCase().includes(query)) ||
            (item.skill_name?.toLowerCase().includes(query)) ||
            (item.title?.toLowerCase().includes(query)) ||
            (item.id?.toLowerCase().includes(query))
        );
    });

    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <Shield className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
                <p className="text-gray-600 mb-6 text-center">You do not have administrative privileges to access this area.</p>
                <button onClick={() => navigate('/')} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium">Return Home</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Admin Console</h1>
                            <p className="text-xs text-indigo-600 font-medium tracking-wide uppercase">System Management</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="bg-gray-100 p-2.5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto w-full px-4 py-6">
                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200">
                    {Object.values(TABS).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${activeTab === tab
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {tab === TABS.SKILLS && <BookOpen size={18} />}
                            {tab === TABS.USERS && <Users size={18} />}
                            {tab === TABS.TEACHING && <Shield size={18} />}
                            {tab === TABS.LEARNING && <Activity size={18} />}
                            {tab === TABS.CREDITS && <CreditCard size={18} />}
                            <span className="capitalize">{tab}</span>
                        </button>
                    ))}
                </div>

                {/* Search and Filters */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                        />
                    </div>
                    <button onClick={fetchTabData} className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm">
                        <Activity size={18} /> Refresh
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Loader className="animate-spin text-indigo-600 mb-4" size={40} />
                            <p className="text-gray-500 font-medium">Loading {activeTab}...</p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="bg-gray-50 p-6 rounded-full mb-4">
                                <Search size={40} className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No {activeTab} found</h3>
                            <p className="text-gray-500 mt-2">Try adjusting your search or check back later.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        {activeTab === TABS.SKILLS && (
                                            <>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Skill Info</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Requester</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Credits/hr</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                            </>
                                        )}
                                        {activeTab === TABS.USERS && (
                                            <>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Teaching Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                            </>
                                        )}
                                        {activeTab === TABS.TEACHING && (
                                            <>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date Requested</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                            </>
                                        )}
                                        {activeTab === TABS.LEARNING && (
                                            <>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pair</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Skill</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Credits</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                            </>
                                        )}
                                        {activeTab === TABS.CREDITS && (
                                            <>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredData.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            {activeTab === TABS.SKILLS && (
                                                <>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900">{item.skill_name || item.title}</div>
                                                        <div className="text-xs text-indigo-600 font-semibold">{item.category}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{item.users?.full_name || 'Anonymous'}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-indigo-600">{item.credits_per_hour} Cr</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleAction(skillAPI.approveSkill, item.id)}
                                                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                                                            >
                                                                <Check size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction(skillAPI.rejectSkill, item.id)}
                                                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                            {activeTab === TABS.USERS && (
                                                <>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900">{item.full_name}</div>
                                                        <div className="text-xs text-gray-500">{item.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${item.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                            {item.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${item.teaching_status === 'approved' ? 'bg-green-100 text-green-700' :
                                                            item.teaching_status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                                            {item.teaching_status || 'none'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                                                            <Eye size={18} />
                                                        </button>
                                                    </td>
                                                </>
                                            )}
                                            {activeTab === TABS.TEACHING && (
                                                <>
                                                    <td className="px-6 py-4 font-bold text-gray-900">{item.full_name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{item.email}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleAction((id) => adminAPI.updateTeachingStatus(id, 'approved'), item.id)}
                                                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-all flex items-center gap-1.5"
                                                            >
                                                                <Check size={14} /> Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction((id) => adminAPI.updateTeachingStatus(id, 'rejected'), item.id)}
                                                                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all flex items-center gap-1.5"
                                                            >
                                                                <X size={14} /> Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                            {activeTab === TABS.LEARNING && (
                                                <>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-sm">
                                                                <p className="font-bold text-gray-900">{item.learner?.full_name}</p>
                                                                <p className="text-[10px] text-gray-400 italic">as learner</p>
                                                            </div>
                                                            <X size={12} className="text-gray-300" />
                                                            <div className="text-sm">
                                                                <p className="font-bold text-gray-900">{item.teacher?.full_name}</p>
                                                                <p className="text-[10px] text-gray-400 italic">as teacher</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-indigo-600">{item.skill?.skill_name}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                            item.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-700">{item.credits_amount}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        {item.status === 'accepted' && (
                                                            <button
                                                                onClick={() => handleAction(adminAPI.validateConnection, item.id)}
                                                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-1.5"
                                                            >
                                                                <Check size={14} /> Validate
                                                            </button>
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                            {activeTab === TABS.CREDITS && (
                                                <>
                                                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                                                        {item.id.split('-')[0]}...
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900">{item.users?.full_name}</div>
                                                        <div className="text-[10px] text-gray-500">{item.users?.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${item.type === 'spend' ? 'bg-red-50 text-red-600' :
                                                            item.type === 'purchase' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                                            {item.type}
                                                        </span>
                                                    </td>
                                                    <td className={`px-6 py-4 font-bold ${item.type === 'spend' ? 'text-red-500' : 'text-green-500'}`}>
                                                        {item.type === 'spend' ? '-' : '+'}{item.amount}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-500">
                                                        {new Date(item.created_at).toLocaleString()}
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
