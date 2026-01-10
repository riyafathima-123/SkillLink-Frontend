import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Header from '../components/header';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import { messageAPI, userAPI } from '../services/api';

export default function MessagesPage() {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        fetchInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [user, convos] = await Promise.all([
                userAPI.getMe(),
                messageAPI.getConversations()
            ]);

            setCurrentUser(user);
            setConversations(convos);

            // Check URL for ?userId=... to start/highlight a chat
            const targetUserId = searchParams.get('userId');
            if (targetUserId) {
                handleTargetUser(targetUserId, convos);
            } else if (convos.length > 0) {
                // Automatically select first conversation if no specific target
                // Optional: setSelectedConversation(convos[0]); 
            }

        } catch (err) {
            console.error('Failed to load messaging data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTargetUser = async (targetUserId, currentConvos) => {
        // 1. Check if we already have a conversation with this user
        const existing = currentConvos.find(c => c.participant?.id === targetUserId);
        if (existing) {
            setSelectedConversation(existing);
        } else {
            // 2. If not, fetch user details and create a temporary conversation object
            try {
                const userProfile = await userAPI.getProfile(targetUserId);

                // This is a "temporary" conversation that doesn't have an ID yet
                // It will become real once the first message is sent
                const tempConvo = {
                    id: null, // Indicates new
                    participant: userProfile,
                    last_message: '',
                    updated_at: new Date().toISOString()
                };

                // Add to list strictly for UI (optional, or just set selected)
                // We probably shouldn't add to list until message sent, but for UX we can show it
                setSelectedConversation(tempConvo);
            } catch (err) {
                console.error('Failed to fetch target user for chat', err);
            }
        }
    };

    const handleMessageSent = (newMessage) => {
        // When a message is sent, we need to update the conversation list
        // 1. If it was a new conversation (no ID), we need to refresh the list entirely or patch it
        // 2. If existing, update last_message

        // Simplest approach: reload list to get fresh order and IDs
        messageAPI.getConversations().then(newConvos => {
            setConversations(newConvos);

            // Ensure we keep the current one selected (but updated with real ID if it was new)
            const updatedConvo = newConvos.find(c => c.participant.id === selectedConversation.participant.id);
            if (updatedConvo) {
                setSelectedConversation(updatedConvo);
            }
        });
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            <Header user={currentUser} />
            <div className="flex flex-1 max-w-7xl mx-auto w-full pt-4 px-4 pb-4 overflow-hidden gap-4">
                <Navigation className="hidden md:block w-64 flex-shrink-0" />

                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex overflow-hidden">
                    {/* Left Side: Conversation List */}
                    <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-gray-800">Messages</h2>
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                                {conversations.length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <ConversationList
                                conversations={conversations}
                                selectedId={selectedConversation?.id || (selectedConversation?.participant?.id ? `temp-${selectedConversation.participant.id}` : null)} // hacky key for temp
                                onSelect={setSelectedConversation}
                                loading={loading}
                            />
                        </div>
                    </div>

                    {/* Right Side: Chat Window */}
                    <div className={`flex-1 flex flex-col bg-white ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                        {selectedConversation ? (
                            <>
                                {/* Mobile Back Button Header (only visible on small screens when chat open) */}
                                <div className="md:hidden p-4 border-b border-gray-100 flex items-center">
                                    <button
                                        onClick={() => setSelectedConversation(null)}
                                        className="mr-3 text-gray-500 hover:text-gray-700"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <span className="font-semibold text-gray-800">{selectedConversation.participant?.full_name}</span>
                                </div>

                                <ChatWindow
                                    conversation={selectedConversation}
                                    currentUser={currentUser}
                                    onMessageSent={handleMessageSent}
                                />
                            </>
                        ) : (
                            <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50/50">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 8 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-medium text-gray-700 mb-2">Your Messages</h3>
                                <p className="max-w-xs text-center text-sm">Select a conversation from the list to start chatting or connect with someone new.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
