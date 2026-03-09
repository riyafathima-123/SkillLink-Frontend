import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Loader, Check, X, Clock, MessageSquare, Inbox, Send } from 'lucide-react';
import { connectionAPI, userAPI, skillAPI, creditAPI } from '../services/api';

const STATUS_STYLES = {
  pending: { bg: '#fef3c7', color: '#b45309', border: '#fde68a', bar: '#f59e0b' },
  accepted: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7', bar: '#10b981' },
  rejected: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', bar: '#ef4444' },
  completed: { bg: '#e0e7ff', color: '#3730a3', border: '#a5b4fc', bar: '#6366f1' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const icons = {
    pending: <Clock size={12} />, accepted: <Check size={12} />,
    rejected: <X size={12} />, completed: <Check size={12} />,
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: s.bg, color: s.color,
      border: `1.5px solid ${s.border}`,
      padding: '0.25rem 0.75rem', borderRadius: '9999px',
      fontSize: '0.75rem', fontWeight: 700,
    }}>
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function ConnectionsPage() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [users, setUsers] = useState({});
  const [skills, setSkills] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incoming');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [connectionsData, currentUserData] = await Promise.all([
        connectionAPI.listConnections(),
        userAPI.getMe(),
      ]);
      const myConnections = (connectionsData || []).filter(
        conn => conn.learner_id === currentUserData?.id || conn.teacher_id === currentUserData?.id
      );
      setConnections(myConnections);
      setCurrentUser(currentUserData);

      const usersMap = {}, skillsMap = {};
      for (const conn of connectionsData) {
        if (!usersMap[conn.learner_id]) {
          try { usersMap[conn.learner_id] = await userAPI.getProfile(conn.learner_id); } catch { }
        }
        if (!usersMap[conn.teacher_id]) {
          try { usersMap[conn.teacher_id] = await userAPI.getProfile(conn.teacher_id); } catch { }
        }
        if (!skillsMap[conn.skill_id]) {
          try { skillsMap[conn.skill_id] = await skillAPI.getSkill(conn.skill_id); } catch { }
        }
      }
      setUsers(usersMap);
      setSkills(skillsMap);
    } catch (err) {
      console.error('Failed to fetch connections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (connectionId, price) => {
    if (!window.confirm(`Accept this connection request? The learner will be charged ${price} credits.`)) return;
    try {
      await connectionAPI.updateConnection(connectionId, { status: 'accepted' });
      alert(`✓ Connection accepted! ${price} credits have been transferred.`);
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleReject = async (connectionId) => {
    try {
      await connectionAPI.updateConnection(connectionId, { status: 'rejected' });
      alert('✓ Connection rejected');
      fetchData();
    } catch (err) { alert('Error: ' + (err.response?.data?.error || err.message)); }
  };

  const handleCancel = async (connectionId) => {
    if (!window.confirm('Are you sure you want to cancel this connection request?')) return;
    try {
      await connectionAPI.cancelConnection(connectionId);
      alert('✓ Connection cancelled');
      fetchData();
    } catch (err) { alert('Error: ' + (err.response?.data?.error || err.message)); }
  };

  const handleComplete = async (connectionId) => {
    if (!window.confirm('Mark this session as complete? This will notify the admin for approval and credit transfer.')) return;
    try {
      await connectionAPI.submitCompletion(connectionId);
      alert('✓ Session marked complete - pending admin approval for credit transfer');
      fetchData();
    } catch (err) { alert('Error: ' + (err.response?.data?.error || err.message)); }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 0' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          border: '4px solid #e0e7ff', borderTopColor: '#6366f1',
          animation: 'spin 0.8s linear infinite', marginBottom: '1rem',
        }} />
        <p style={{ color: '#64748b', fontWeight: 500 }}>Loading connections...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const incomingRequests = connections.filter(c => c.teacher_id === currentUser?.id);
  const outgoingRequests = connections.filter(c => c.learner_id === currentUser?.id);
  const pendingIncoming = incomingRequests.filter(c => c.status === 'pending').length;
  const displayed = activeTab === 'incoming' ? incomingRequests : outgoingRequests;

  const tabBtn = (id, label, Icon, badge) => {
    const active = activeTab === id;
    return (
      <button onClick={() => setActiveTab(id)} style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        padding: '0.75rem 1.25rem', borderRadius: '0.875rem', border: 'none', cursor: 'pointer',
        fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit',
        transition: 'all 0.2s',
        background: active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f1f5f9',
        color: active ? '#fff' : '#64748b',
        boxShadow: active ? '0 4px 16px rgba(99,102,241,0.28)' : 'none',
      }}>
        <Icon size={15} />
        {label}
        {badge > 0 && (
          <span style={{
            background: active ? 'rgba(255,255,255,0.3)' : '#ef4444',
            color: '#fff', fontSize: '0.7rem', fontWeight: 700,
            padding: '0.1rem 0.45rem', borderRadius: '9999px', minWidth: '18px', textAlign: 'center',
          }}>{badge}</span>
        )}
      </button>
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.35s ease both' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{
          fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
          fontWeight: 800, fontSize: '1.625rem', color: '#1e1b4b', marginBottom: '0.25rem',
        }}>
          Connection Requests
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Manage your incoming and outgoing learning requests</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', background: '#f1f5f9', padding: '0.375rem', borderRadius: '1rem' }}>
        {tabBtn('incoming', 'Incoming Requests', Inbox, pendingIncoming)}
        {tabBtn('outgoing', 'My Requests', Send, outgoingRequests.length)}
      </div>

      {/* Empty State */}
      {displayed.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: '1.5rem', padding: '4rem 2rem',
          textAlign: 'center', border: '1.5px solid rgba(99,102,241,0.07)',
          boxShadow: '0 2px 16px rgba(99,102,241,0.06)',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #e0e7ff, #ede9fe)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <Zap size={28} color="#8b5cf6" />
          </div>
          <p style={{ color: '#64748b', fontWeight: 600, fontSize: '1rem', marginBottom: '0.375rem' }}>
            {activeTab === 'incoming' ? 'No incoming requests' : 'No outgoing requests'}
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            {activeTab === 'incoming'
              ? 'When someone requests your skills, they will appear here'
              : 'Start by finding skills to learn!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {displayed.map((conn, i) => {
            const learner = users[conn.learner_id];
            const teacher = users[conn.teacher_id];
            const skill = skills[conn.skill_id];
            const isMyRequest = conn.learner_id === currentUser?.id;
            const isTeacher = conn.teacher_id === currentUser?.id;
            const s = STATUS_STYLES[conn.status] || STATUS_STYLES.pending;

            return (
              <div key={conn.id} style={{
                background: '#fff', borderRadius: '1.25rem',
                boxShadow: '0 2px 16px rgba(99,102,241,0.08)',
                border: '1.5px solid rgba(99,102,241,0.07)',
                overflow: 'hidden',
                animation: `slideUp 0.35s ease ${i * 0.05}s both`,
              }}>
                {/* Status bar */}
                <div style={{ height: '4px', background: s.bar }} />

                <div style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.875rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                        fontWeight: 700, fontSize: '1rem', color: '#1e1b4b', marginBottom: '0.25rem',
                      }}>
                        {skill?.title || skill?.skill_name || 'Loading...'}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.625rem' }}>
                        {isMyRequest
                          ? `Requested to teach: ${teacher?.full_name || 'Unknown'}`
                          : `Request from: ${learner?.full_name || 'Unknown'}`}
                      </p>
                      {conn.message && (
                        <p style={{
                          fontSize: '0.8125rem', color: '#475569',
                          background: '#f8f9ff', padding: '0.5rem 0.75rem',
                          borderRadius: '0.625rem', border: '1px solid #e0e7ff',
                          marginBottom: '0.625rem',
                        }}>
                          💬 "{conn.message}"
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                        <StatusBadge status={conn.status} />
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: '0.25rem',
                          fontWeight: 700, color: '#6366f1', fontSize: '0.9rem',
                        }}>
                          <Zap size={14} fill="#6366f1" color="#6366f1" /> {conn.price} credits
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ borderTop: '1.5px solid #f1f5f9', paddingTop: '0.875rem' }}>
                    {isTeacher && conn.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.625rem' }}>
                        <button onClick={() => handleAccept(conn.id, conn.price)} style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#fff', border: 'none', borderRadius: '0.75rem',
                          padding: '0.625rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(16,185,129,0.25)', fontFamily: 'inherit',
                        }}>
                          <Check size={15} /> Accept
                        </button>
                        <button onClick={() => handleReject(conn.id)} style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: '#fff', border: 'none', borderRadius: '0.75rem',
                          padding: '0.625rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(239,68,68,0.25)', fontFamily: 'inherit',
                        }}>
                          <X size={15} /> Reject
                        </button>
                      </div>
                    )}

                    {isMyRequest && conn.status === 'pending' && (
                      <button onClick={() => handleCancel(conn.id)} style={{
                        width: '100%', background: '#f1f5f9', color: '#64748b',
                        border: 'none', borderRadius: '0.75rem', padding: '0.625rem',
                        fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                        Cancel Request
                      </button>
                    )}

                    {conn.status === 'accepted' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#059669', textAlign: 'center' }}>
                          ✓ Connection accepted — session is active!
                        </p>
                        <div style={{ display: 'flex', gap: '0.625rem' }}>
                          <button
                            onClick={() => navigate(`/messages?userId=${isMyRequest ? teacher?.id : learner?.id}`)}
                            style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                              color: '#fff', border: 'none', borderRadius: '0.75rem',
                              padding: '0.625rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                              boxShadow: '0 4px 12px rgba(99,102,241,0.28)', fontFamily: 'inherit',
                            }}>
                            <MessageSquare size={15} /> Message
                          </button>
                          {isMyRequest && (
                            <button onClick={() => navigate(`/assessment/${conn.id}?skillId=${conn.skill_id}`)} style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              color: '#fff', border: 'none', borderRadius: '0.75rem',
                              padding: '0.625rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                              boxShadow: '0 4px 12px rgba(16,185,129,0.25)', fontFamily: 'inherit',
                            }}>
                              <Check size={15} /> Take Assessment
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
