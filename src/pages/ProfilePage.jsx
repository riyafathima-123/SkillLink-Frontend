import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Mail, Calendar, Edit2, Plus, X, GraduationCap, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { userAPI, skillAPI } from '../services/api';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [skills, setSkills] = useState([]);
    const [activeTab, setActiveTab] = useState('about'); // about, learning, teaching
    const [showSkillModal, setShowSkillModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Skill Form State
    const [skillForm, setSkillForm] = useState({
        title: '',
        category: '',
        description: '',
        type: 'learn', // 'learn' | 'teach'
        proficiency: 1,
        credits: 0,
        availability: '',
        location: '',
        isCustomSkill: false
    });

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const userData = await userAPI.getMe();
            setUser(userData);

            const allSkills = await skillAPI.listSkills();
            // Filter skills for this user
            const userId = String(userData.id);
            const userSkills = allSkills.filter(s => {
                const ownerId = s.owner_id || s.ownerId || s.owner || s.user_id;
                return String(ownerId) === userId;
            });
            setSkills(userSkills);
        } catch (error) {
            console.error("Failed to load profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSkill = async (e) => {
        e.preventDefault();
        try {
            // Validation
            if (skillForm.type === 'teach' && skillForm.proficiency < 2) {
                alert("To teach a skill, proficiency must be at least Intermediate (2).");
                return;
            }

            await skillAPI.createSkill({
                title: skillForm.title,
                category: skillForm.category,
                description: skillForm.description,
                type: skillForm.type,
                proficiency: skillForm.type === 'teach' ? parseInt(skillForm.proficiency) : 1, // Default learn to 1
                price: parseFloat(skillForm.credits),
                availability: skillForm.availability,
                location: skillForm.location
            });

            alert("Skill added successfully!");
            setShowSkillModal(false);
            setSkillForm({
                title: '', category: '', description: '', type: 'learn', proficiency: 1, credits: 0, availability: '', location: '', isCustomSkill: false
            });
            fetchProfileData();
        } catch (error) {
            alert(error.response?.data?.error || "Failed to add skill");
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    const learnSkills = skills.filter(s => s.type === 'learn' || !s.type);
    const teachSkills = skills.filter(s => s.type === 'teach');

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header / Cover */}
            <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-700">
                <div className="absolute -bottom-16 left-8 flex items-end">
                    <div className="relative">
                        <img
                            src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.full_name}&background=random`}
                            alt="Profile"
                            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                        />
                        <button className="absolute bottom-2 right-2 p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600">
                            <Camera size={16} />
                        </button>
                    </div>
                    <div className="ml-4 mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 mt-16">{user?.full_name}</h1>
                        <p className="text-gray-600">{user?.role === 'admin' ? 'Administrator' : 'Community Member'}</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">About</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                {user?.bio || "No bio added yet. Click edit to tell the community about yourself."}
                            </p>
                            <div className="space-y-3 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Mail size={16} /> {user?.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} /> Joined {new Date(user?.created_at).toLocaleDateString()}
                                </div>
                                {/* <button className="w-full mt-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
                                    <Edit2 size={16} /> Edit Profile
                                </button> */}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Stats</h3>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <div className="text-xl font-bold text-blue-600">{learnSkills.length}</div>
                                    <div className="text-xs text-blue-700">Learning</div>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <div className="text-xl font-bold text-green-600">{teachSkills.length}</div>
                                    <div className="text-xs text-green-700">Teaching</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Skills Section */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="border-b px-6 py-4 flex justify-between items-center bg-white">
                                <div className="flex space-x-6">
                                    <button
                                        onClick={() => setActiveTab('about')}
                                        className={`pb-4 px-2 text-sm font-medium transition relative ${activeTab === 'about' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Overview
                                        {activeTab === 'about' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 -mb-4"></div>}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('skills')}
                                        className={`pb-4 px-2 text-sm font-medium transition relative ${activeTab === 'skills' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Skills & Expertise
                                        {activeTab === 'skills' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 -mb-4"></div>}
                                    </button>
                                </div>
                                <button
                                    onClick={() => setShowSkillModal(true)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition"
                                >
                                    <Plus size={16} /> Add Skill
                                </button>
                            </div>

                            <div className="p-6 min-h-[400px]">
                                {activeTab === 'about' && (
                                    <div className="text-center py-12 text-gray-500">
                                        <p>Activity timeline and recent connections coming soon.</p>
                                    </div>
                                )}

                                {activeTab === 'skills' && (
                                    <div className="space-y-8">
                                        {/* Teaching Skills */}
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <GraduationCap className="text-green-600" size={20} /> Skills I Can Teach
                                            </h4>
                                            {teachSkills.length === 0 ? (
                                                <p className="text-gray-500 italic text-sm">No teaching skills added yet.</p>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {teachSkills.map(skill => (
                                                        <div key={skill.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-white">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <div className="font-semibold text-gray-900">{skill.skill_name || skill.title}</div>
                                                                    <div className="text-xs text-gray-500 mt-1">{skill.category}</div>
                                                                </div>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${skill.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                    {skill.is_approved ? 'Active' : 'Pending'}
                                                                </span>
                                                            </div>
                                                            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="font-medium">Lvl {skill.proficiency}</span>
                                                                </div>
                                                                {skill.credits_per_hour > 0 && <div>{skill.credits_per_hour} cr/hr</div>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <hr />

                                        {/* Learning Skills */}
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <BookOpen className="text-blue-600" size={20} /> Skills I Want to Learn
                                            </h4>
                                            {learnSkills.length === 0 ? (
                                                <p className="text-gray-500 italic text-sm">No learning interests added yet.</p>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {learnSkills.map(skill => (
                                                        <div key={skill.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-gray-50">
                                                            <div className="font-semibold text-gray-900">{skill.skill_name || skill.title}</div>
                                                            <div className="text-xs text-gray-500 mt-1">{skill.category}</div>
                                                            <p className="text-sm text-gray-600 mt-2 line-clamp-1">{skill.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Skill Modal */}
            {showSkillModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">Add New Skill</h3>
                            <button onClick={() => setShowSkillModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddSkill} className="p-6 space-y-4">
                            {/* Type Toggle */}
                            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                                <button
                                    type="button"
                                    onClick={() => setSkillForm({ ...skillForm, type: 'learn', proficiency: 1 })}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition flex items-center justify-center gap-2 ${skillForm.type === 'learn' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <BookOpen size={16} /> I want to Learn
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSkillForm({ ...skillForm, type: 'teach' })}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition flex items-center justify-center gap-2 ${skillForm.type === 'teach' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <GraduationCap size={16} /> I want to Teach
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                                {skillForm.isCustomSkill ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            required
                                            className="flex-1 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Type your skill..."
                                            value={skillForm.title}
                                            onChange={(e) => setSkillForm({ ...skillForm, title: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setSkillForm({ ...skillForm, isCustomSkill: false, title: '' })}
                                            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium whitespace-nowrap transition"
                                        >
                                            Back to List
                                        </button>
                                    </div>
                                ) : (
                                    <select
                                        required
                                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={skillForm.title}
                                        onChange={(e) => {
                                            if (e.target.value === 'Other') {
                                                setSkillForm({ ...skillForm, title: '', isCustomSkill: true });
                                            } else {
                                                setSkillForm({ ...skillForm, title: e.target.value });
                                            }
                                        }}
                                    >
                                        <option value="" disabled>Select a skill...</option>
                                        <optgroup label="Technical">
                                            <option value="Python">Python</option>
                                            <option value="JavaScript">JavaScript</option>
                                            <option value="React">React</option>
                                            <option value="SQL">SQL</option>
                                            <option value="Machine Learning">Machine Learning</option>
                                            <option value="Cloud Computing">Cloud Computing</option>
                                            <option value="Data Analysis">Data Analysis</option>
                                            <option value="Power BI">Power BI</option>
                                            <option value="Excel Analytics">Excel Analytics</option>
                                            <option value="Prompt Engineering">Prompt Engineering</option>
                                            <option value="Data Visualization">Data Visualization</option>
                                            <option value="Recommendation Systems">Recommendation Systems</option>
                                        </optgroup>
                                        <optgroup label="Creative">
                                            <option value="Graphic Design">Graphic Design</option>
                                            <option value="UI/UX Design">UI/UX Design</option>
                                            <option value="Video Editing">Video Editing</option>
                                            <option value="Content Writing">Content Writing</option>
                                            <option value="Branding">Branding</option>
                                            <option value="Photography">Photography</option>
                                        </optgroup>
                                        <optgroup label="Other">
                                            <option value="Digital Marketing">Digital Marketing</option>
                                            <option value="SEO">SEO</option>
                                            <option value="Social Media Marketing">Social Media Marketing</option>
                                            <option value="Sales">Sales</option>
                                            <option value="Business Strategy">Business Strategy</option>
                                            <option value="Entrepreneurship">Entrepreneurship</option>
                                            <option value="Yoga">Yoga</option>
                                            <option value="Nutrition Planning">Nutrition Planning</option>
                                            <option value="Cooking">Cooking</option>
                                            <option value="Language Learning">Language Learning</option>
                                            <option value="Event Planning">Event Planning</option>
                                            <option value="Other">Other (Type manually)</option>
                                        </optgroup>
                                    </select>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        className="w-full p-2.5 border rounded-lg outline-none"
                                        value={skillForm.category}
                                        onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                                    >
                                        <option value="">Select...</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Business">Business</option>
                                        <option value="Arts">Arts</option>
                                        <option value="Languages">Languages</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                {skillForm.type === 'teach' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Credits / Hour</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full p-2.5 border rounded-lg outline-none"
                                            value={skillForm.credits}
                                            onChange={(e) => setSkillForm({ ...skillForm, credits: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Proficiency - ONLY FOR TEACH */}
                            {skillForm.type === 'teach' && (
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                    <label className="block text-sm font-semibold text-green-800 mb-2">My Proficiency Level</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3].map((lvl) => (
                                            <button
                                                key={lvl}
                                                type="button"
                                                onClick={() => setSkillForm({ ...skillForm, proficiency: lvl })}
                                                disabled={lvl === 1} // Disable level 1 for teachers if strictly enforced
                                                className={`flex-1 py-2 border rounded-lg text-sm font-medium transition ${skillForm.proficiency === lvl ? 'bg-green-600 text-white border-green-600' : (lvl === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:border-green-400')}`}
                                            >
                                                {lvl === 1 ? 'Beginner (X)' : lvl === 2 ? 'Intermediate' : 'Expert'}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                        <AlertCircle size={12} /> Teachers must be Intermediate (2) or Expert (3).
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea
                                    className="w-full p-2.5 border rounded-lg outline-none h-20 resize-none"
                                    placeholder="What will you learn or teach?"
                                    value={skillForm.description}
                                    onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition mt-4"
                            >
                                {skillForm.type === 'teach' ? 'Submit for Approval' : 'Add to Profile'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
