import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader } from 'lucide-react';
import { skillAPI, userAPI } from '../services/api';

export default function MySkillsPage() {
  const [mySkills, setMySkills] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    tags: '',
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
      const filtered = allSkills.filter((s) => s.owner_id === user.id);
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

    setSubmitting(true);
    try {
      const skillData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t),
      };

      await skillAPI.createSkill(skillData);
      alert('✓ Skill created successfully!');

      setFormData({
        title: '',
        description: '',
        price: 0,
        tags: '',
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
      alert('✓ Skill deleted successfully');
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading your skills...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Create Skill Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mb-8 transition transform hover:scale-105"
      >
        <Plus className="w-5 h-5" />
        {showForm ? 'Cancel' : 'Create New Skill'}
      </button>

      {/* Create Skill Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md border-l-4 border-green-500 p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Create a New Skill</h3>

          <form onSubmit={handleCreateSkill} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Skill Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Web Development, Python Basics, UI Design"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                placeholder="Describe what you'll teach..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition resize-none"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Credit Price *
                </label>
                <input
                  type="number"
                  placeholder="10"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition"
                  min="0"
                  step="0.5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="web, react, javascript"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {submitting ? 'Creating...' : '✓ Create Skill'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My Skills List */}
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Skills</h3>

      {mySkills.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <Plus className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">You haven't posted any skills yet</p>
          <p className="text-gray-400">Create your first skill to start teaching!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mySkills.map((skill) => (
            <div
              key={skill.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-l-4 border-green-500 p-6"
            >
              <h4 className="text-lg font-bold text-gray-800 mb-2">{skill.title}</h4>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {skill.description || 'No description'}
              </p>

              {skill.tags && skill.tags.length > 0 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {skill.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t flex items-center justify-between">
                <p className="text-lg font-bold text-blue-600">
                  💰 {skill.price} credits
                </p>
                <button
                  onClick={() => handleDeleteSkill(skill.id)}
                  className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}