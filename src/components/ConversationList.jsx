import React from 'react';

export default function ConversationList({ conversations, selectedId, onSelect, loading }) {
    if (loading) {
        return (
            <div className="space-y-4 p-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p>No conversations yet.</p>
                <p className="text-sm mt-2">Connect with others to start messaging!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200 overflow-y-auto">
            {conversations.map((convo) => {
                const isSelected = selectedId === convo.id;
                const participant = convo.participant || {};

                return (
                    <button
                        key={convo.id || `temp-${participant.id}`}
                        onClick={() => onSelect(convo)}
                        className={`flex items-center px-4 py-3 hover:bg-gray-50 transition-colors duration-150 text-left w-full border-b border-gray-100 ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                            }`}
                    >
                        <div className="relative">
                            <img
                                src={participant.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.full_name || 'User')}&background=random`}
                                alt={participant.full_name}
                                className="w-12 h-12 rounded-full object-cover border border-gray-200"
                            />
                            {/* Online status indicator could go here */}
                        </div>

                        <div className="ml-3 flex-1 overflow-hidden">
                            <div className="flex justify-between items-baseline">
                                <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                    {participant.full_name}
                                </h3>
                                {convo.updated_at && (
                                    <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
                                        {new Date(convo.updated_at).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </span>
                                )}
                            </div>
                            <p className={`text-sm truncate mt-0.5 ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                                {convo.last_message || 'Start a conversation'}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
