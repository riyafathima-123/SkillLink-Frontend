import React, { useState, useEffect } from 'react';
import { Search, Loader, Globe, Clock, Star, Sparkles } from 'lucide-react';
import SkillCard from '../components/SkillCard';
import ConnectionModal from '../components/ConnectionModal';
import { skillAPI, userAPI, connectionAPI, matchmakingAPI } from '../services/api';

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [owners, setOwners] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      const user = await userAPI.getMe();
      setCurrentUser(user);
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
      const ownerData = skill.users || skill.owner || null;
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
        const all = await skillAPI.listSkills();
        setSkills(all);
        fetchOwners(all);
        setSearching(false);
        return;
      }
      const res = await matchmakingAPI.findMatches({
        title: searchQuery,
        language: languageFilter,
        availability: availabilityFilter,
      });
      const matches = res.matches || [];
      setSkills(matches);
      fetchOwners(matches);
    } catch (err) {
      console.error('Search failed:', err);
      alert('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleConnect = (skill) => {
    const ownerId = skill.user_id || skill.owner_id;
    if (ownerId === currentUser?.id) { alert('You cannot connect to your own skill'); return; }
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          border: '4px solid #e0e7ff', borderTopColor: '#6366f1',
          animation: 'spin 0.8s linear infinite', marginBottom: '1rem',
        }} />
        <p style={{ color: '#64748b', fontWeight: 500 }}>Loading skills...</p>
      </div>
    );
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 0.875rem 0.75rem 2.75rem',
    borderRadius: '0.875rem',
    border: '1.5px solid #e2e8f0',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    color: '#1e1b4b',
    background: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.25rem' }}>

      {/* Search Card */}
      <div style={{
        background: '#fff',
        borderRadius: '1.5rem',
        boxShadow: '0 4px 24px rgba(99,102,241,0.09)',
        border: '1.5px solid rgba(99,102,241,0.08)',
        padding: '1.75rem',
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.125rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            fontWeight: 700, fontSize: '1.0625rem', color: '#1e1b4b',
          }}>
            Find Your Perfect Teacher
          </h2>
        </div>

        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>

            {/* Keyword */}
            <div style={{ position: 'relative', gridColumn: 'span 2' }} className="search-span">
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="What do you want to learn? (e.g. React, Spanish)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Language */}
            <div style={{ position: 'relative' }}>
              <Globe size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Language (e.g. English)"
                value={languageFilter}
                onChange={e => setLanguageFilter(e.target.value)}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Availability */}
            <div style={{ position: 'relative' }}>
              <Clock size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <select
                value={availabilityFilter}
                onChange={e => setAvailabilityFilter(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="">Any Availability</option>
                <option value="Weekends">Weekends</option>
                <option value="Weekdays">Weekdays</option>
                <option value="Evenings">Evenings</option>
              </select>
            </div>

          </div>

          {/* Search Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="submit"
              disabled={searching}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6875rem 1.75rem',
                background: searching ? '#c7d2fe' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', border: 'none', borderRadius: '9999px',
                fontWeight: 700, fontSize: '0.9rem', cursor: searching ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!searching) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.4)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.3)'; }}
            >
              {searching ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
              {searching ? 'Searching...' : 'Find Matches'}
            </button>
          </div>
        </form>
      </div>

      {/* Result Count */}
      <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '1.125rem', fontWeight: 500 }}>
        {skills.length} {skills.length === 1 ? 'teacher' : 'teachers'} found
      </p>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.25rem',
      }}>
        {skills.map((skill, i) => {
          const ownerId = skill.user_id || skill.owner_id;
          const owner = owners[ownerId];
          return (
            <div
              key={skill.id}
              style={{
                position: 'relative',
                animation: `slideUp 0.35s ease ${i * 0.04}s both`,
              }}
            >
              {skill.score > 0 && (
                <div style={{
                  position: 'absolute', top: '-10px', right: '10px', zIndex: 10,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                  padding: '0.25rem 0.625rem', borderRadius: '9999px',
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                }}>
                  <Star size={10} fill="#fff" /> {skill.score}% Match
                </div>
              )}
              <SkillCard
                skill={skill}
                owner={owner}
                isOwner={ownerId === currentUser?.id}
                onConnect={handleConnect}
              />
              {skill.match_reasons?.length > 0 && (
                <div style={{
                  marginTop: '0.5rem', fontSize: '0.75rem', color: '#059669',
                  background: '#f0fdf4', padding: '0.5rem 0.75rem',
                  borderRadius: '0.75rem', border: '1px solid #bbf7d0',
                }}>
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

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin { animation: spin 0.8s linear infinite; }
        @media (max-width: 640px) {
          .search-span { grid-column: span 1 !important; }
        }
      `}</style>
    </div>
  );
}