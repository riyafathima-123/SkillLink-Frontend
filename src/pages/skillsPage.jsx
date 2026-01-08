import React, { useState, useEffect } from 'react';
import { Search, Loader, Filter, Globe, Clock, Star } from 'lucide-react';
import SkillCard from '../components/SkillCard';
import ConnectionModal from '../components/ConnectionModal';
import { skillAPI, userAPI, connectionAPI, matchmakingAPI } from '../services/api';
// Assuming we add matchmaking to api service

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [owners, setOwners] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');

  const [selectedSkill, setSelectedSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const user = await userAPI.getMe();
      setCurrentUser(user);
      // Load default list (latest skills)
      const allSkills = await skillAPI.listSkills();
      setSkills(allSkills);
      fetchOwners(allSkills);
    } catch (err) {
      console.error('Failed to init:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async (skillsList) => {
    const ownersMap = { ...owners };
    for (const skill of skillsList) {
      // Handle flattened structure from Matchmaking API vs Standard API
      const ownerData = skill.users /* matchmaking join */ || skill.owner /* embedded */ || null;
      const ownerId = skill.user_id || skill.owner_id;

      if (ownerData) {
        ownersMap[ownerId] = ownerData;
      } else if (ownerId && !ownersMap[ownerId]) {
        try {
          const p = await userAPI.getProfile(ownerId);
          ownersMap[ownerId] = p;
        } catch (e) { }
      }
    }
    setOwners(ownersMap);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);

    try {
      if (!searchQuery.trim()) {
        // Reset to default list if empty
        const all = await skillAPI.listSkills();
        setSkills(all);
        fetchOwners(all);
        setSearching(false);
        return;
      }

      // Call Matchmaking API
      const res = await matchmakingAPI.findMatches({
        title: searchQuery,
        language: languageFilter,
        availability: availabilityFilter
      });

      const matches = res.matches || [];
      setSkills(matches);
      fetchOwners(matches);

    } catch (err) {
      console.error("Search failed:", err);
      alert("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  // Connection Handlers
  const handleConnect = (skill) => {
    // Determine owner ID safely
    const ownerId = skill.user_id || skill.owner_id;
    if (ownerId === currentUser?.id) {
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
    <div className="max-w-7xl mx-auto px-4">
      {/* Search & Filter Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Find Your Perfect Teacher</h2>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="What do you want to learn? (e.g. React, Spanish)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div className="relative">
            <Globe className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input // Use simple text input for language for now (could be select)
              type="text"
              placeholder="Language (e.g. English)"
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="relative">
            <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Any Availability</option>
              <option value="Weekends">Weekends</option>
              <option value="Weekdays">Weekdays</option>
              <option value="Evenings">Evenings</option>
            </select>
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={searching}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition flex items-center gap-2"
            >
              {searching ? <Loader className="animate-spin" size={20} /> : <Search size={20} />}
              Find Matches
            </button>
          </div>
        </form>
      </div>

      {/* Results Grid */}
      <div className="mb-4 text-sm text-gray-500">
        {skills.length} {skills.length === 1 ? 'teacher' : 'teachers'} found
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => {
          const ownerId = skill.user_id || skill.owner_id;
          const owner = owners[ownerId];
          return (
            <div key={skill.id} className={`relative`}>
              {/* Match Match Badge */}
              {skill.score > 0 && (
                <div className="absolute -top-3 -right-2 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Star size={12} fill="white" /> {skill.score}% Match
                </div>
              )}

              <SkillCard
                skill={skill}
                owner={owner}
                isOwner={ownerId === currentUser?.id}
                onConnect={handleConnect}
              />

              {/* Match Reasons (if available from matchmaking) */}
              {skill.match_reasons && skill.match_reasons.length > 0 && (
                <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded border border-green-100">
                  <strong>Why matched:</strong> {skill.match_reasons.join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>

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