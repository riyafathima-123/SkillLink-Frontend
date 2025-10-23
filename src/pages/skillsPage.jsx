import React, { useState, useEffect } from 'react';
import { Search, Loader } from 'lucide-react';
import SkillCard from '../components/SkillCard';
import ConnectionModal from '../components/ConnectionModal';
import { skillAPI, userAPI, connectionAPI } from '../services/api';

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [owners, setOwners] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterSkills();
  }, [skills, searchQuery]);

  const fetchData = async () => {
    try {
      const [skillsData, userData] = await Promise.all([
        skillAPI.listSkills(),
        userAPI.getMe(),
      ]);

      setSkills(skillsData || []);
      setCurrentUser(userData);

      // Fetch owner details
      const ownersMap = {};
      for (const skill of skillsData) {
        if (!ownersMap[skill.owner_id]) {
          try {
            const owner = await userAPI.getProfile(skill.owner_id);
            ownersMap[skill.owner_id] = owner;
          } catch (err) {
            console.error('Failed to fetch owner:', err);
          }
        }
      }
      setOwners(ownersMap);
    } catch (err) {
      console.error('Failed to fetch skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterSkills = () => {
    const query = searchQuery.toLowerCase();
    const filtered = skills.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query) ||
        s.tags?.some((t) => t.toLowerCase().includes(query))
    );
    setFilteredSkills(filtered);
  };

  const handleConnect = (skill) => {
    if (skill.owner_id === currentUser?.id) {
      alert('You cannot connect to your own skill');
      return;
    }
    setSelectedSkill(skill);
  };

  const handleConfirmConnection = async (connectionData) => {
    setConnecting(true);
    try {
      await connectionAPI.createConnection(connectionData);
      alert('✓ Connection request sent successfully!');
      setSelectedSkill(null);
      fetchData(); // Refresh data
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading skills...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search skills by name or tags... (e.g., React, Python, Design)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Skills Grid */}
      {filteredSkills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              owner={owners[skill.owner_id]}
              isOwner={skill.owner_id === currentUser?.id}
              onConnect={handleConnect}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
            {searchQuery ? 'No skills found matching your search' : 'No skills available yet'}
          </p>
        </div>
      )}

      {/* Connection Modal */}
      {selectedSkill && (
        <ConnectionModal
          skill={selectedSkill}
          onConfirm={handleConfirmConnection}
          onClose={() => setSelectedSkill(null)}
        />
      )}
    </div>
  );
}