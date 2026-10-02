import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send, ShieldCheck, Check, CheckCheck } from 'lucide-react';

const ClientChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('unfazed_access_token');
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

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const convRes = await api.get('/chat/conversations');
        if (convRes.data.success && convRes.data.conversations?.length > 0) {
          const conv = convRes.data.conversations[0];
          setConversation(conv);

          const msgRes = await api.get(`/chat/messages/${conv.conversationId}`);
          if (msgRes.data.success) {
            setMessages(msgRes.data.messages || []);
          }

          socketRef.current?.emit('join_conversation', {
            conversationId: conv.conversationId
          });

          socketRef.current?.emit('mark_read', {
            conversationId: conv.conversationId
          });
        }
      } catch (err) {
        console.error('Failed to load client chat:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();

    return () => {
      if (conversation?.conversationId) {
        socketRef.current?.emit('leave_conversation', {
          conversationId: conversation.conversationId
        });
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation) return;

    const text = newMessage.trim();
    setNewMessage('');

    socketRef.current?.emit('typing_stop', {
      conversationId: conversation.conversationId
    });

    socketRef.current?.emit('send_message', {
      conversationId: conversation.conversationId,
      receiverId: conversation.participant.id,
      message: text
    });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!conversation) return;

    socketRef.current?.emit('typing_start', {
      conversationId: conversation.conversationId
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing_stop', {
        conversationId: conversation.conversationId
      });
    }, 1500);
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading secure chat...</div>;
  }

  return (
    <div className="h-[calc(100vh-10rem)] bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-600 to-teal-800 text-white font-bold text-sm flex items-center justify-center">
            {conversation?.participant.name?.charAt(0) || 'T'}
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900">{conversation?.participant.name}</h2>
            <span className="text-xs text-teal-600 font-semibold">{conversation?.participant.title || 'Therapist'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted Session Chat</span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#F8FAFC]">
        {messages.length > 0 ? (
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
                      ? 'bg-teal-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  {m.message}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                  <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && (
                    <span>
                      {m.status === 'read' ? (
                        <CheckCheck className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Check className="w-3 h-3 text-slate-400" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 space-y-1">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600">Start the conversation</p>
            <p className="text-[11px] text-slate-400">
              Message your therapist with questions, session prep, or schedule clarifications.
            </p>
          </div>
        )}

        {isTyping && (
          <div className="flex items-center gap-1.5 text-slate-400 text-xs italic">
            <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
            <span>Therapist is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a confidential message..."
          value={newMessage}
          onChange={handleTyping}
          className="flex-1 text-xs border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white transition-colors flex-shrink-0 shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ClientChatPage;
