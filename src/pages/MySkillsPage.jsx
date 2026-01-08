import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader, BookOpen, GraduationCap, Clock, MapPin, AlertCircle } from 'lucide-react';
import { skillAPI, userAPI } from '../services/api';

export default function MySkillsPage() {
  const [mySkills, setMySkills] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('learn'); // 'learn' or 'teach'

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    tags: '',
    level: 'Beginner',
    availability: '',
    location: '',
    type: 'learn', // 'learn' or 'teach'
    proficiency: 1, // 1-3
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = await userAPI.getMe();
      setCurrentUser(user);

      const allSkills = await skillAPI.listSkills();
      const userId = String(user?.id ?? user?._id ?? '');

      // Filter for current user's skills
      const filtered = (allSkills || []).filter((s) => {
        const ownerVal = s?.owner_id ?? s?.ownerId ?? s?.owner ?? s?.user_id ?? '';
        return String(ownerVal) === userId;
      });

      setMySkills(filtered);
    } catch (err) {
      console.error('Failed to fetch skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please enter a skill title');
      return;
    }

    // Client side validation for teach proficiency
    if (formData.type === 'teach' && parseInt(formData.proficiency) < 2) {
      alert("To teach a skill, your proficiency must be at least Intermediate (Level 2).");
      return;
    }

    setSubmitting(true);
    try {
      const skillData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        tags: formData.tags.split(',').map((t) => t.trim()).filter((t) => t),
        level: formData.level,
        availability: formData.availability,
        location: formData.location,
        type: formData.type,
        proficiency: parseInt(formData.proficiency),
      };

      await skillAPI.createSkill(skillData);
      alert('✓ Skill added successfully to your profile!');

      setFormData({
        title: '',
        description: '',
        category: '',
        price: 0,
        tags: '',
        level: 'Beginner',
        availability: '',
        location: '',
        type: 'learn',
        proficiency: 1,
      });
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;

    try {
      await skillAPI.deleteSkill(skillId);
      // alert('✓ Skill deleted successfully');
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const learnSkills = mySkills.filter(s => s.type === 'learn' || !s.type); // Default to learn if undefined (migrated data)
  const teachSkills = mySkills.filter(s => s.type === 'teach');

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
          <p className="text-gray-600">Manage what you want to learn and what you can teach.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-md transition"
        >
          {showForm ? 'Cancel' : <><Plus className="w-5 h-5" /> Add New Skill</>}
        </button>
      </div>

      {/* Add Skill Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8 animate-fade-in">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
            Add a Skill to your Profile
          </h3>

          <form onSubmit={handleCreateSkill} className="space-y-6">
            {/* Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <label className={`cursor-pointer border-2 rounded-lg p-4 flex flex-col items-center justify-center transition ${formData.type === 'learn' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input
                  type="radio"
                  name="skillType"
                  value="learn"
                  checked={formData.type === 'learn'}
                  onChange={() => setFormData({ ...formData, type: 'learn', proficiency: 1 })}
                  className="hidden"
                />
                <BookOpen className={`w-8 h-8 mb-2 ${formData.type === 'learn' ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className={`font-semibold ${formData.type === 'learn' ? 'text-blue-700' : 'text-gray-600'}`}>I want to Learn</span>
              </label>

              <label className={`cursor-pointer border-2 rounded-lg p-4 flex flex-col items-center justify-center transition ${formData.type === 'teach' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input
                  type="radio"
                  name="skillType"
                  value="teach"
                  checked={formData.type === 'teach'}
                  onChange={() => setFormData({ ...formData, type: 'teach', proficiency: 2 })}
                  className="hidden"
                />
                <GraduationCap className={`w-8 h-8 mb-2 ${formData.type === 'teach' ? 'text-green-500' : 'text-gray-400'}`} />
                <span className={`font-semibold ${formData.type === 'teach' ? 'text-green-700' : 'text-gray-600'}`}>I want to Teach</span>
              </label>
            </div>

            {/* Proficiency Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Proficiency Level (1-3)</label>
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((level) => (
                  <label key={level} className={`cursor-pointer flex-1 border rounded-md p-3 text-center transition ${formData.proficiency === level ? (formData.type === 'teach' ? 'bg-green-100 border-green-500 text-green-800' : 'bg-blue-100 border-blue-500 text-blue-800') : 'bg-gray-50 border-gray-200'}`}>
                    <input
                      type="radio"
                      name="proficiency"
                      value={level}
                      checked={formData.proficiency === level}
                      onChange={() => setFormData({ ...formData, proficiency: level })}
                      className="hidden"
                    />
                    <div className="font-bold text-lg">{level}</div>
                    <div className="text-xs text-gray-500">
                      {level === 1 ? 'Beginner' : level === 2 ? 'Intermediate' : 'Experienced'}
                    </div>
                  </label>
                ))}
              </div>
              {formData.type === 'teach' && formData.proficiency === 1 && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} /> must be at least Intermediate (2) to teach.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Skill Title *</label>
                <input
                  type="text"
                  placeholder="e.g. React.js, Photography, Spanish"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Category</option>
                  <option value="Technology">Technology</option>
                  <option value="Health">Health</option>
                  <option value="Arts">Arts</option>
                  <option value="Language">Language</option>
                  <option value="Business">Business</option>
                  <option value="Academics">Academics</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                placeholder="Briefly describe your goals or what you offer..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-24 resize-none"
              />
            </div>

            {/* Additional Fields for Teach OR Learn/Teach details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><Clock size={14} /> Availability</label>
                <input
                  type="text"
                  placeholder="e.g. Weekends, Evenings"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><MapPin size={14} /> Location</label>
                <input
                  type="text"
                  placeholder="e.g. Remote, New York"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Credits / Hour</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-2.5 rounded-lg text-white font-medium shadow-md transition ${formData.type === 'teach' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {submitting ? 'Saving...' : 'Save Skill'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABS Display */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`pb-3 px-6 text-lg font-medium transition ${activeTab === 'learn' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('learn')}
        >
          <div className="flex items-center gap-2">
            <BookOpen size={20} /> Skills to Learn ({learnSkills.length})
          </div>
        </button>
        <button
          className={`pb-3 px-6 text-lg font-medium transition ${activeTab === 'teach' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('teach')}
        >
          <div className="flex items-center gap-2">
            <GraduationCap size={20} /> Skills to Teach ({teachSkills.length})
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {(activeTab === 'learn' ? learnSkills : teachSkills).length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">
              {activeTab === 'learn' ? "You haven't added any skills to learn yet." : "You aren't teaching any skills yet."}
            </p>
            <button onClick={() => { setFormData({ ...formData, type: activeTab }); setShowForm(true); }} className="mt-4 text-indigo-600 font-medium hover:underline">
              Add a skill now
            </button>
          </div>
        ) : (
          (activeTab === 'learn' ? learnSkills : teachSkills).map((skill) => (
            <div key={skill.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden flex flex-col">
              <div className={`h-2 w-full ${skill.type === 'teach' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold text-gray-900">{skill.title || skill.skill_name}</h4>
                  {skill.type === 'teach' && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${skill.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {skill.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{skill.description}</p>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Proficiency:</span>
                    <span className="font-semibold text-gray-800">Level {skill.proficiency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span>{skill.category}</span>
                  </div>
                  {skill.credits_per_hour > 0 && (
                    <div className="flex justify-between">
                      <span>Rate:</span>
                      <span className="text-indigo-600 font-bold">{skill.credits_per_hour} Cr/hr</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => handleDeleteSkill(skill.id)}
                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                  title="Remove Skill"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}