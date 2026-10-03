import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import {
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  Search,
  Check,
  CheckCheck,
  Clock,
  Sparkles
} from 'lucide-react';

const ChatPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize Socket.io connection
  useEffect(() => {
    const token = localStorage.getItem('unfazed_token');
    const socketUrl = import.meta.env.VITE_API_URL?.startsWith('http')
      ? new URL(import.meta.env.VITE_API_URL).origin
      : 'http://localhost:5000';

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('receive_message', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on('user_typing', ({ userId, isTyping: typingStatus }) => {
      if (userId !== user?.id) {
        setIsTyping(typingStatus);
      }
    });

    socket.on('messages_read', () => {
      setMessages((prev) =>
        prev.map((m) => (m.senderId === user?.id ? { ...m, status: 'read' } : m))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Fetch conversations list
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get('/chat/conversations');
        if (data.success && data.conversations) {
          setConversations(data.conversations);
          if (data.conversations.length > 0 && !activeConv) {
            setActiveConv(data.conversations[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConv) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const { data } = await api.get(`/chat/messages/${activeConv.conversationId}`);
        if (data.success) {
          setMessages(data.messages || []);
        }

        socketRef.current?.emit('join_conversation', {
          conversationId: activeConv.conversationId
        });

        socketRef.current?.emit('mark_read', {
          conversationId: activeConv.conversationId
        });
      } catch (err) {
        console.error('Failed to load message history:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    return () => {
      socketRef.current?.emit('leave_conversation', {
        conversationId: activeConv.conversationId
      });
    };
  }, [activeConv]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;

    const text = newMessage.trim();
    setNewMessage('');

    socketRef.current?.emit('typing_stop', {
      conversationId: activeConv.conversationId
    });

    socketRef.current?.emit(
      'send_message',
      {
        conversationId: activeConv.conversationId,
        receiverId: activeConv.participant.id,
        message: text
      },
      (res) => {
        if (!res?.success) {
          console.error('Message delivery failed:', res?.error);
        }
      }
    );
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!activeConv) return;

    socketRef.current?.emit('typing_start', {
      conversationId: activeConv.conversationId
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing_stop', {
        conversationId: activeConv.conversationId
      });
    }, 1500);
  };

  const filteredConversations = conversations.filter((c) =>
    c.participant.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-2xl border border-[#E8E4DC] shadow-xs flex overflow-hidden">
      {/* Left Pane: Conversation List */}
      <div className="w-80 border-r border-[#E8E4DC] flex flex-col bg-[#FAF8F4]">
        <div className="p-4 border-b border-[#E8E4DC] bg-white">
          <h2 className="font-bold text-sm text-[#1C1C1A]">Direct Client Messages</h2>
          <div className="mt-2.5 relative">
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-[#E8E4DC] rounded-lg outline-none focus:ring-2 focus:ring-brand-400 bg-[#FAF8F4]"
            />
            <Search className="w-3.5 h-3.5 text-[#6B6860] absolute left-2.5 top-2" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#E8E4DC]">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#6B6860]">Loading chats...</div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isSelected = activeConv?.conversationId === conv.conversationId;
              return (
                <button
                  key={conv.conversationId}
                  type="button"
                  onClick={() => setActiveConv(conv)}
                  className={`w-full text-left p-3.5 transition-colors flex items-center gap-3 ${
                    isSelected
                      ? 'bg-brand-50 border-l-4 border-brand-600'
                      : 'hover:bg-[#F0EDE6]'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {conv.participant.name.charAt(0)}
                  </div>
                  <div className="flex-1 truncate">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#1C1C1A] truncate">
                        {conv.participant.name}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-accent-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B6860] truncate mt-0.5">
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-[#6B6860] px-4">
              No clients found in your directory.
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Active Chat Window */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="h-16 px-6 border-b border-[#E8E4DC] flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-brand-700 text-white font-bold text-xs flex items-center justify-center">
                {activeConv.participant.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1C1C1A]">{activeConv.participant.name}</h3>
                <span className="text-[11px] text-[#6B6860]">{activeConv.participant.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Encrypted Session Chat</span>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#FAF8F4]">
            {loadingMessages ? (
              <div className="py-12 text-center text-xs text-[#6B6860]">Loading messages...</div>
            ) : messages.length > 0 ? (
              messages.map((m) => {
                const isMe = m.senderId === user?.id;
                return (
                  <div
                    key={m._id || m.createdAt}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                        isMe
                          ? 'bg-accent-500 text-white rounded-br-xs'
                          : 'bg-white text-[#1C1C1A] border border-[#E8E4DC] rounded-bl-xs'
                      }`}
                    >
                      {m.message}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[#6B6860] mt-1 px-1">
                      <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && (
                        <span>
                          {m.status === 'read' ? (
                            <CheckCheck className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Check className="w-3 h-3 text-[#6B6860]" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center text-xs text-[#6B6860] space-y-1">
                <MessageSquare className="w-8 h-8 text-[#C8C4BC] mx-auto" />
                <p className="font-semibold text-[#1C1C1A]">Start the conversation</p>
                <p className="text-[11px] text-[#6B6860]">
                  Send appointment reminders, care plan links, or check in with {activeConv.participant.name}.
                </p>
              </div>
            )}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-[#6B6860] text-xs italic">
                <div className="w-2 h-2 rounded-full bg-[#6B6860] animate-pulse" />
                <span>{activeConv.participant.name} is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-[#E8E4DC] bg-white flex items-center gap-2">
            <input
              type="text"
              placeholder={`Write a confidential message to ${activeConv.participant.name}...`}
              value={newMessage}
              onChange={handleTyping}
              className="flex-1 text-xs border border-[#E8E4DC] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-400 bg-[#FAF8F4]"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="p-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white transition-colors flex-shrink-0 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-xs text-[#6B6860]">
          <MessageSquare className="w-10 h-10 text-[#C8C4BC] mb-2" />
          <p className="font-semibold text-[#1C1C1A]">Select a conversation to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
