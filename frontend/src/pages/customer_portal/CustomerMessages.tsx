import { API_BASE_URL, WS_BASE_URL } from '../../lib/config';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../../lib/auth';
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, User, HeadphonesIcon, Send, Paperclip, Circle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

// Types
interface Message {
  id: string;
  sender: {
    name: string;
    role: string;
  };
  content: string;
  attachment: string | null;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  advisor: string | null;
  unread_count: number;
  latest_message: {
    content: string;
    created_at: string;
  } | null;
  created_at: string;
}

export default function CustomerMessages() {
  const queryClient = useQueryClient();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Get user ID from token
  const token = getAccessToken();
  let userId = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.user?.id || payload.user_id;
    } catch (e) {}
  }

  // Fetch conversations
  const { data: conversationsResponse, isLoading: loadingConvos } = useQuery({
    queryKey: ['customer-conversations'],
    queryFn: () => api.get('/customer/conversations/')
  });
  const conversations = conversationsResponse?.data || [];

  // Set default active chat
  useEffect(() => {
    if (conversations.length > 0 && !activeChatId) {
      setActiveChatId(conversations[0].id);
    }
  }, [conversations, activeChatId]);

  // Fetch messages for active chat
  const { data: messagesResponse, isLoading: loadingMessages } = useQuery({
    queryKey: ['customer-messages', activeChatId],
    queryFn: () => api.get(`/customer/messages/?conversation=${activeChatId}`),
    enabled: !!activeChatId
  });
  const messages = messagesResponse?.data || [];

  // Mutations
  const sendMutation = useMutation({
    mutationFn: ({ id, content }: { id: string, content: string }) => api.post('/customer/messages/', { conversation: id, content, sender: userId }),
    onSuccess: () => {
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['customer-messages', activeChatId] });
      queryClient.invalidateQueries({ queryKey: ['customer-conversations'] });
    }
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.post('/customer/messages/mark_read/', { conversation_id: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-conversations'] });
    }
  });

  // WebSocket Connection
  useEffect(() => {
    if (!userId) return;

    const connectWs = () => {
      const wsBase = (import.meta.env.VITE_API_URL || API_BASE_URL).replace('http', 'ws').replace('/api/v1', '');
      const wsUrl = `${wsBase}/ws/customer/${userId}/`;
      const token = getAccessToken();
      const ws = new WebSocket(`${wsUrl}?token=${token}`);

      ws.onopen = () => {
        console.log('Customer WS Connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'chat_message') {
            queryClient.invalidateQueries({ queryKey: ['customer-conversations'] });
            
            // If the message belongs to the currently open chat, invalidate messages query
            if (activeChatId && data.data && data.data.conversation === activeChatId) {
              queryClient.invalidateQueries({ queryKey: ['customer-messages', activeChatId] });
            }
          }
        } catch (error) {
          console.error('Error parsing WS message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Customer WS Disconnected, reconnecting in 3s...');
        setTimeout(connectWs, 3000);
      };

      wsRef.current = ws;
    };

    connectWs();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect loop on unmount
        wsRef.current.close();
      }
    };
  }, [userId, activeChatId, queryClient]);

  // Auto-scroll and mark as read
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Mark as read if active conversation has unread messages
    if (activeChatId) {
      const activeConvo = conversations.find((c: Conversation) => c.id === activeChatId);
      if (activeConvo && activeConvo.unread_count > 0) {
        markReadMutation.mutate(activeChatId);
      }
    }
  }, [messages, activeChatId, conversations, markReadMutation]);

  const handleSendReply = () => {
    if (!replyText.trim() || !activeChatId) return;
    sendMutation.mutate({ id: activeChatId, content: replyText });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-[#35D07F]';
      case 'busy': return 'text-amber-500';
      case 'offline': return 'text-[var(--text-muted)]';
      default: return 'text-[var(--text-muted)]';
    }
  };

  const filteredChats = conversations.filter((c: Conversation) => 
    'Service Advisor'.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const activeChat = conversations.find((c: Conversation) => c.id === activeChatId);

  // Helper for timestamp formatting
  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-10 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <MessageSquare className="text-[#35D07F]" size={28} />
            Direct Messages
          </h1>
          <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">
            Chat directly with your assigned technicians and service advisors.
          </p>
        </motion.div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Pane */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-4 bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl flex flex-col overflow-hidden"
        >
          <div className="p-4 border-b border-[var(--border-subtle)] bg-white/[0.02]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
              <input 
                type="text" 
                placeholder="SEARCH CONTACTS..." 
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] uppercase tracking-widest focus:border-[#35D07F] outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loadingConvos && <div className="p-8 text-center text-[var(--text-muted)] text-[10px] tracking-widest uppercase animate-pulse">Loading conversations...</div>}
            {filteredChats.map((chat: Conversation) => (
              <div 
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`p-5 border-b border-[var(--border-subtle)] cursor-pointer transition-all flex gap-4 items-center ${
                  activeChatId === chat.id 
                    ? 'bg-[var(--bg-surface-active)] border-l-2 border-l-[#35D07F]' 
                    : 'hover:bg-[var(--bg-surface-hover)] border-l-2 border-l-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center text-[var(--text-secondary)]">
                    <HeadphonesIcon size={18} />
                  </div>
                  <Circle size={12} className={`absolute bottom-0 right-0 fill-current ${getStatusColor('online')}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`text-sm font-bold tracking-wider truncate ${activeChatId === chat.id ? 'text-[#35D07F]' : 'text-[var(--text-primary)]'}`}>
                      Service Advisor
                    </h3>
                    <span className={`text-[9px] uppercase tracking-widest font-bold whitespace-nowrap ml-2 ${chat.unread_count > 0 ? 'text-[#35D07F]' : 'text-[var(--text-muted)]'}`}>
                      {chat.latest_message ? formatTime(chat.latest_message.created_at) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest font-bold truncate pr-2">
                      {chat.latest_message?.content || 'No messages'}
                    </p>
                    {chat.unread_count > 0 && (
                      <span className="w-4 h-4 bg-[#35D07F] rounded-full text-black text-[9px] font-bold flex items-center justify-center shrink-0">
                        {chat.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredChats.length === 0 && !loadingConvos && (
              <div className="p-8 text-center text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase">
                No contacts match your search.
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Pane */}
        <motion.div 
          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-8 bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl flex flex-col overflow-hidden relative"
        >
          {activeChat ? (
            <>
              <div className="p-6 border-b border-[var(--border-subtle)] bg-white/[0.02] flex items-center gap-4 shrink-0">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center text-[var(--text-secondary)]">
                    <HeadphonesIcon size={18} />
                  </div>
                  <Circle size={12} className={`absolute bottom-0 right-0 fill-current ${getStatusColor('online')}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-widest text-[var(--text-primary)] mb-1">Service Advisor</h2>
                  <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
                    Service Team • Online
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
                {loadingMessages && <div className="text-center text-[var(--text-muted)] text-[10px] tracking-widest uppercase animate-pulse">Loading messages...</div>}
                {messages.map((msg: Message) => {
                  const isCustomer = msg.sender.role === 'CUSTOMER';
                  return (
                    <div key={msg.id} className={`flex w-full ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-4 max-w-[80%] ${isCustomer ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          isCustomer ? 'bg-[#35D07F]/20 text-[#35D07F]' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {isCustomer ? <User size={18} /> : <HeadphonesIcon size={18} />}
                        </div>
                        
                        <div className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest">{isCustomer ? 'You' : msg.sender.name || 'Advisor'}</span>
                            <span className="text-[var(--text-muted)] text-[9px] uppercase tracking-widest">{formatTime(msg.created_at)}</span>
                          </div>
                          <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                            isCustomer 
                              ? 'bg-[#35D07F] text-black rounded-tr-sm' 
                              : 'bg-[var(--bg-surface-active)] text-[var(--text-primary)] rounded-tl-sm border border-[var(--border-subtle)]'
                          }`}>
                            {msg.content}
                          </div>
                          {msg.attachment && (
                            <a href={`${(import.meta.env.VITE_API_URL || API_BASE_URL + '/api/v1').replace('/api/v1', '')}${msg.attachment}`} target="_blank" rel="noopener noreferrer" className="mt-2 text-[10px] text-blue-400 uppercase tracking-widest flex items-center gap-1 hover:text-blue-300">
                              <Paperclip size={12} /> View Attachment
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-[var(--border-subtle)] bg-white/[0.02] shrink-0">
                <div className="relative flex items-center">
                  <button onClick={() => { toast('Attachments feature coming soon!', { icon: '📎' }) }} className="absolute left-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                    <Paperclip size={18} />
                  </button>
                  <input 
                    type="text" 
                    placeholder="TYPE YOUR MESSAGE..." 
                    className="w-full pl-12 pr-16 py-4 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl text-sm text-[var(--text-primary)] placeholder:uppercase placeholder:tracking-widest focus:border-[#35D07F] outline-none transition-all"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  />
                  <button 
                    onClick={handleSendReply}
                    disabled={sendMutation.isPending || !replyText.trim()}
                    className="absolute right-2 px-3 py-2 bg-[#35D07F] hover:bg-[#2bb46c] disabled:opacity-50 text-black rounded-lg transition-all shadow-[0_0_10px_rgba(53,208,127,0.2)]"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] text-xs uppercase tracking-widest">
              Select a contact to start messaging
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}


