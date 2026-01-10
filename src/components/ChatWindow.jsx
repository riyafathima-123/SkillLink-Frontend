import React, { useState, useEffect, useRef } from 'react';
import { messageAPI } from '../services/api';

export default function ChatWindow({ conversation, currentUser, onMessageSent }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const participant = conversation?.participant;

    // Logic to determine unique ID for fetching: 
    // If conversation.id exists, use it. If not (new temp conversation), we can't fetch messages yet (it's empty).
    const conversationId = conversation?.id;

    useEffect(() => {
        if (conversationId) {
            loadMessages();
        } else {
            setMessages([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const data = await messageAPI.getMessages(conversationId);
            setMessages(data);
        } catch (err) {
            console.error('Failed to load messages', err);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || sending) return;

        if (!participant?.id) {
            console.error('No recipient identified');
            return;
        }

        const textPayload = inputText.trim();
        setSending(true);

        // Optimistic update
        const tempMessage = {
            id: `temp-${Date.now()}`,
            sender_id: currentUser.id,
            text: textPayload,
            created_at: new Date().toISOString(),
            pending: true,
        };

        setMessages((prev) => [...prev, tempMessage]);
        setInputText('');

        try {
            // Send to backend
            const sentMessage = await messageAPI.sendMessage(participant.id, textPayload);

            // Replace temp message with real one
            setMessages((prev) =>
                prev.map(msg => msg.id === tempMessage.id ? sentMessage : msg)
            );

            // Notify parent to refresh list (update last message snippet)
            if (onMessageSent) {
                onMessageSent(sentMessage);
            }
        } catch (err) {
            console.error('Failed to send message', err);
            // Remove failed optimistic message or show error
            setMessages((prev) => prev.filter(msg => msg.id !== tempMessage.id));
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    if (!conversation) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 8 9 8z" />
                </svg>
                <p className="text-lg font-medium">Select a conversation to start messaging</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center bg-white">
                <img
                    src={participant?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant?.full_name || 'U')}&background=random`}
                    alt={participant?.full_name}
                    className="w-10 h-10 rounded-full border border-gray-200"
                />
                <div className="ml-3">
                    <h2 className="text-lg font-semibold text-gray-800">{participant?.full_name}</h2>
                    {/* <p className="text-xs text-green-500 font-medium">Online</p> */}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
                {loading && messages.length === 0 ? (
                    <div className="flex justify-center pt-10">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        <p>No messages yet. Say hello!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender_id === currentUser.id;
                        const showAvatar = !isMe && (idx === messages.length - 1 || messages[idx + 1]?.sender_id !== msg.sender_id);

                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {!isMe && (
                                    <div className="w-8 flex-shrink-0 mr-2 flex items-end">
                                        {showAvatar && (
                                            <img
                                                src={participant?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant?.full_name)}`}
                                                alt=""
                                                className="w-8 h-8 rounded-full"
                                            />
                                        )}
                                    </div>
                                )}

                                <div
                                    className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm ${isMe
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                        } ${msg.pending ? 'opacity-70' : ''}`}
                                >
                                    <p>{msg.text}</p>
                                    <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-end space-x-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Write a message..."
                        className="flex-1 px-4 py-3 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-xl transition-all"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || sending}
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}
