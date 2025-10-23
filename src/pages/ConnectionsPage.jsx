import React, { useState, useEffect } from 'react';
import { Zap, Loader, Check, X, Clock } from 'lucide-react';
import { connectionAPI, userAPI, skillAPI, creditAPI } from '../services/api';

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [users, setUsers] = useState({});
  const [skills, setSkills] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' or 'outgoing'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [connectionsData, currentUserData] = await Promise.all([
        connectionAPI.listConnections(),
        userAPI.getMe(),
      ]);

      console.log('🔍 Connections Page - Current User:', currentUserData);
      console.log('🔍 Connections Page - All Connections:', connectionsData);

      // Filter connections to show only those involving current user
      const myConnections = (connectionsData || []).filter(
        (conn) =>
          conn.learner_id === currentUserData?.id ||
          conn.teacher_id === currentUserData?.id
      );

      console.log('🔍 Connections Page - My Connections:', myConnections);

      setConnections(myConnections);
      setCurrentUser(currentUserData);

      // Fetch related data
      const usersMap = {};
      const skillsMap = {};

      for (const conn of connectionsData) {
        if (!usersMap[conn.learner_id]) {
          try {
            usersMap[conn.learner_id] = await userAPI.getProfile(conn.learner_id);
          } catch (err) {}
        }
        if (!usersMap[conn.teacher_id]) {
          try {
            usersMap[conn.teacher_id] = await userAPI.getProfile(conn.teacher_id);
          } catch (err) {}
        }
        if (!skillsMap[conn.skill_id]) {
          try {
            skillsMap[conn.skill_id] = await skillAPI.getSkill(conn.skill_id);
          } catch (err) {}
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
    try {
      await connectionAPI.updateConnection(connectionId, { status: 'accepted' });
      alert('✓ Connection accepted! Credits have been deducted.');
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
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCancel = async (connectionId) => {
    if (!window.confirm('Are you sure you want to cancel this connection request?'))
      return;

    try {
      await connectionAPI.cancelConnection(connectionId);
      alert('✓ Connection cancelled');
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading connections...</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      accepted: <Check className="w-4 h-4" />,
      rejected: <X className="w-4 h-4" />,
      completed: <Check className="w-4 h-4" />,
    };
    return icons[status];
  };

  // Separate incoming and outgoing requests
  const incomingRequests = connections.filter(
    (conn) => conn.teacher_id === currentUser?.id
  );
  const outgoingRequests = connections.filter(
    (conn) => conn.learner_id === currentUser?.id
  );

  const displayedConnections = activeTab === 'incoming' ? incomingRequests : outgoingRequests;

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">My Connections</h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
            activeTab === 'incoming'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          📥 Incoming Requests
          {incomingRequests.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {incomingRequests.filter((c) => c.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
            activeTab === 'outgoing'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          📤 My Requests
          {outgoingRequests.length > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {outgoingRequests.length}
            </span>
          )}
        </button>
      </div>

      {displayedConnections.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <Zap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
            {activeTab === 'incoming'
              ? 'No incoming requests'
              : 'No outgoing requests'}
          </p>
          <p className="text-gray-400">
            {activeTab === 'incoming'
              ? 'When someone requests your skills, they will appear here'
              : 'Start by finding skills to learn!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedConnections.map((conn) => {
            const learner = users[conn.learner_id];
            const teacher = users[conn.teacher_id];
            const skill = skills[conn.skill_id];
            const isMyRequest = conn.learner_id === currentUser?.id;
            const isTeacher = conn.teacher_id === currentUser?.id;

            return (
              <div
                key={conn.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-l-4 border-purple-500 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {skill?.title || 'Loading...'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {isMyRequest
                        ? `Requested to ${teacher?.full_name || 'Unknown'}`
                        : `Request from ${learner?.full_name || 'Unknown'}`}
                    </p>

                    {conn.message && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mb-3">
                        💬 "{conn.message}"
                      </p>
                    )}

                    <div className="flex gap-3 items-center flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(
                          conn.status
                        )}`}
                      >
                        {getStatusIcon(conn.status)}
                        {conn.status.charAt(0).toUpperCase() + conn.status.slice(1)}
                      </span>
                      <span className="text-lg font-bold text-blue-600 flex items-center gap-1">
                        <Zap className="w-4 h-4" /> {conn.price} credits
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t">
                  {isTeacher && conn.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(conn.id, conn.price)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(conn.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}

                  {isMyRequest && conn.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(conn.id)}
                      className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg font-semibold transition"
                    >
                      Cancel Request
                    </button>
                  )}

                  {conn.status === 'accepted' && (
                    <div className="text-center">
                      <p className="text-sm font-medium text-green-700">
                        ✓ Connection accepted - Schedule your session!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
