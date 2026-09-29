import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Paperclip, MoreVertical, Phone, User, Trash2, Ban, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { advisorApi } from '../api/advisor';

interface Conversation {
  id: string;
  customer: {
    first_name: string;
    last_name: string;
    username: string;
    phone_number: string;
  };
  vehicle: {
    make: string;
    model: string;
    registration_number: string;
  } | null;
  service_order: {
    order_number: string;
    title: string;
  } | null;
  unread_count: number;
  latest_message: {
    content: string;
    created_at: string;
  } | null;
  created_at: string;
}

interface Message {
  id: string;
  sender: {
    first_name: string;
    last_name: string;
    role: string;
  };
  content: string;
  attachment: string | null;
  is_read: boolean;
  created_at: string;
}

export default function AdvisorMessages() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [activeContactId, setActiveContactId] = useState<string | null>(searchParams.get('contact') || null);
  const [inputMessage, setInputMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const contactId = searchParams.get('contact');
    if (contactId && contactId !== activeContactId) {
      setActiveContactId(contactId);
    }
  }, [searchParams]);

  const { data: conversations = [], isLoading: loadingConvos } = useQuery({
    queryKey: ['advisor-conversations'],
    queryFn: () => advisorApi.getConversations()
  });

  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ['advisor-customers'],
    queryFn: () => advisorApi.getCustomers(),
    enabled: showNewChatModal
  });

  const createConversationMutation = useMutation({
    mutationFn: (customerId: string) => advisorApi.createConversation(customerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['advisor-conversations'] });
      setActiveContactId(data.id);
      setShowNewChatModal(false);
      toast.success('Conversation created');
    },
    onError: () => toast.error('Failed to create conversation')
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['advisor-messages', activeContactId],
    queryFn: () => advisorApi.getMessages(activeContactId!),
    enabled: !!activeContactId
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => advisorApi.markMessagesRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisor-conversations'] });
    }
  });

  const sendMutation = useMutation({
    mutationFn: ({ id, content }: { id: string, content: string }) => advisorApi.sendMessage(id, content),
    onSuccess: () => {
      setInputMessage('');
      queryClient.invalidateQueries({ queryKey: ['advisor-messages', activeContactId] });
      queryClient.invalidateQueries({ queryKey: ['advisor-conversations'] });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // If active conversation has unread messages, mark them as read
    if (activeContactId) {
      const activeConvo = conversations.find((c: Conversation) => c.id === activeContactId);
      if (activeConvo && activeConvo.unread_count > 0) {
        markReadMutation.mutate(activeContactId);
      }
    }
  }, [messages, activeContactId, conversations]);

  // Set default active contact on load
  useEffect(() => {
    if (conversations.length > 0 && !activeContactId) {
      setActiveContactId(conversations[0].id);
    }
  }, [conversations, activeContactId]);

  // WebSocket Connection for Advisor
  useEffect(() => {
    const connectWs = () => {
      const wsBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace('http', 'ws').replace('/api/v1', '');
      const wsUrl = `${wsBase}/ws/advisor/`;
      const token = localStorage.getItem('accessToken');
      const ws = new WebSocket(`${wsUrl}?token=${token}`);

      ws.onopen = () => {
        console.log('Advisor WS Connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'chat_message') {
            queryClient.invalidateQueries({ queryKey: ['advisor-conversations'] });
            
            // If the message belongs to the currently open chat, invalidate messages query
            if (activeContactId && data.data && data.data.conversation === activeContactId) {
              queryClient.invalidateQueries({ queryKey: ['advisor-messages', activeContactId] });
            }
          }
        } catch (error) {
          console.error('Error parsing WS message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Advisor WS Disconnected, reconnecting in 3s...');
        setTimeout(connectWs, 3000);
      };

      return ws;
    };

    const ws = connectWs();

    return () => {
      ws.onclose = null; // Prevent reconnect loop on unmount
      ws.close();
    };
  }, [activeContactId, queryClient]);
  
  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !activeContactId) return;
    sendMutation.mutate({ id: activeContactId, content: inputMessage });
  };

  const handleStartNewChat = (customerId: string) => {
    // Check if conversation already exists with this customer
    const existingConvo = conversations.find((c: any) => c.customer?.id === customerId);
    if (existingConvo) {
      setActiveContactId(existingConvo.id);
      setShowNewChatModal(false);
    } else {
      createConversationMutation.mutate(customerId);
    }
  };

  const activeContact = conversations.find((c: Conversation) => c.id === activeContactId);

  const handleCall = () => {
    if (!activeContact?.customer?.phone_number) {
      toast.error('No phone number on record for this customer.');
      return;
    }
    
    // Normalize the number slightly (remove spaces)
    const phone = activeContact.customer.phone_number.replace(/\s+/g, '');
    
    // The native tel: link! 
    // This allows the device to open the dialer legitimately.
    window.location.href = `tel:${phone}`;
    
    toast.success(`Opening dialer for ${activeContact.customer.first_name}...`, {
      icon: '📞',
      style: { background: '#111112', color: '#fff', border: '1px solid #35D07F' }
    });
  };

  const filteredContacts = conversations.filter((c: Conversation) => {
    const name = `${c.customer?.first_name} ${c.customer?.last_name}`.toLowerCase();
    const vehicle = c.vehicle ? `${c.vehicle.make} ${c.vehicle.model}`.toLowerCase() : '';
    const phone = c.customer?.phone_number?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return name.includes(search) || vehicle.includes(search) || phone.includes(search);
  });

  // Helper for timestamp formatting
  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">Customer Messages</h1>
          <p className="text-sm text-slate-500 mt-1">Direct communication channel with vehicle owners via the mobile app.</p>
        </div>
        <button 
          onClick={() => setShowNewChatModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#35D07F] text-black font-semibold rounded-xl hover:bg-[#2eb86f] transition-colors"
        >
          <Plus size={16} /> New Chat
        </button>
      </div>

      <div className="flex-1 flex bg-[#111B21] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        {/* Contacts Sidebar */}
        <div className="w-80 border-r border-[#202C33] flex flex-col bg-[#111B21]">
          <div className="p-4 border-b border-[#202C33] shrink-0 bg-[#202C33]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8696A0]" />
              <input 
                type="text" 
                placeholder="Search customers, vehicles, phones..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#2A3942] rounded-lg pl-9 pr-4 py-2 text-sm text-[#D1D7DB] placeholder-[#8696A0] focus:outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loadingConvos && <div className="p-4 text-xs text-[#8696A0] animate-pulse">Loading conversations...</div>}
            
            {filteredContacts.map((contact: Conversation) => (
              <div 
                key={contact.id} 
                onClick={() => { setActiveContactId(contact.id); setShowMenu(false); }}
                className={`p-3 border-b border-[#202C33] cursor-pointer transition-colors flex items-center gap-3 ${activeContactId === contact.id ? 'bg-[#2A3942]' : 'hover:bg-[#202C33]'}`}
              >
                <div className="w-12 h-12 rounded-full bg-[#6B7C85] flex items-center justify-center shrink-0">
                  <User size={24} className="text-[#CFD9DF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="text-[15px] font-normal text-[#E9EDEF] truncate">
                      {contact.customer ? (contact.customer.first_name || contact.customer.last_name ? `${contact.customer.first_name} ${contact.customer.last_name}` : contact.customer.username) : 'Unknown Customer'}
                    </h4>
                    <span className={`text-[12px] ${contact.unread_count > 0 ? 'text-[#00A884] font-medium' : 'text-[#8696A0]'}`}>
                      {contact.latest_message ? formatTime(contact.latest_message.created_at) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[13.5px] text-[#8696A0] truncate pr-2">
                      {contact.latest_message?.content || 'No messages yet'}
                    </p>
                    {contact.unread_count > 0 && (
                      <span className="w-5 h-5 bg-[#00A884] rounded-full text-[#111B21] text-[10px] font-bold flex items-center justify-center shrink-0">
                        {contact.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredContacts.length === 0 && !loadingConvos && (
              <div className="p-8 text-center text-[#8696A0] text-sm">No conversations found.</div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#222E35]">
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-2 border-b border-[#202C33] flex justify-between items-center bg-[#202C33] shrink-0 h-[60px]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#6B7C85] flex items-center justify-center shrink-0">
                    <User size={20} className="text-[#CFD9DF]" />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-normal text-[#E9EDEF] leading-tight">
                      {activeContact.customer ? (activeContact.customer.first_name || activeContact.customer.last_name ? `${activeContact.customer.first_name} ${activeContact.customer.last_name}` : activeContact.customer.username) : 'Unknown Customer'}
                    </h2>
                    <p className="text-[13px] text-[#8696A0]">
                      {activeContact.vehicle ? `${activeContact.vehicle.make} ${activeContact.vehicle.model}` : 'No Vehicle'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 relative">
                  <button onClick={handleCall} className="p-2 text-[#AEBAC1] hover:bg-[#111B21]/50 rounded-full transition-colors">
                    <Phone size={20} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className="p-2 text-[#AEBAC1] hover:bg-[#111B21]/50 rounded-full transition-colors">
                    <MoreVertical size={20} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showMenu && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-[#233138] rounded shadow-xl overflow-hidden z-10 py-2">
                      <button 
                        onClick={() => { toast.error('Contact Blocked'); setShowMenu(false); }}
                        className="w-full text-left px-6 py-3 text-[14px] text-[#E9EDEF] hover:bg-[#182229] transition-colors"
                      >
                        Block Contact
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:px-[8%] space-y-3 bg-[#0B141A] relative" style={{ backgroundImage: 'radial-gradient(#ffffff08 1px, transparent 0)', backgroundSize: '16px 16px' }}>
                <div className="text-center mb-6"><span className="text-[12.5px] text-[#8696A0] uppercase tracking-wide bg-[#182229] px-4 py-1.5 rounded-lg shadow-sm">TODAY</span></div>
                
                {loadingMessages && <div className="text-center text-xs text-[#8696A0] animate-pulse">Loading messages...</div>}
                
                {messages.map((msg: Message) => {
                  const isAdvisor = msg.sender.role === 'SERVICE_ADVISOR' || msg.sender.role === 'SUPER_ADMIN';
                  
                  return (
                    <div key={msg.id} className={`flex ${isAdvisor ? 'justify-end' : 'justify-start'} mb-1`}>
                      <div className={`relative max-w-[85%] md:max-w-[65%] rounded-lg px-2.5 pt-1.5 pb-1 shadow-sm ${
                        isAdvisor 
                          ? 'bg-[#005C4B] text-[#E9EDEF] rounded-tr-none'
                          : 'bg-[#202C33] text-[#E9EDEF] rounded-tl-none'
                      }`}>
                        {/* Top-corner tail */}
                        <div className={`absolute top-0 w-3 h-3 ${isAdvisor ? '-right-[8px]' : '-left-[8px]'}`} style={{ overflow: 'hidden' }}>
                          <div className={`w-4 h-4 -mt-2 ${isAdvisor ? 'bg-[#005C4B] -ml-2 rounded-bl-[8px]' : 'bg-[#202C33] rounded-br-[8px]'}`}></div>
                        </div>

                        <div className="text-[14.2px] leading-[19px] whitespace-pre-wrap">
                          {msg.content}
                          {/* Invisible spacer so text wraps around the absolute timestamp */}
                          <span className="inline-block w-[65px] h-[12px]"></span>
                        </div>
                        
                        {msg.attachment && (
                          <div className="mt-1 pb-[10px]">
                            <a href={`${(import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '')}${msg.attachment}`} target="_blank" rel="noopener noreferrer" className="text-xs underline flex items-center gap-1 opacity-90 hover:opacity-100">
                              <Paperclip size={12} /> View Attachment
                            </a>
                          </div>
                        )}
                        
                        <div className={`absolute bottom-0.5 right-1.5 text-[11px] font-sans flex items-center gap-[2px] ${isAdvisor ? 'text-white/70' : 'text-white/50'}`}>
                          {formatTime(msg.created_at)}
                          {isAdvisor && (
                            <span className={`ml-[2px] ${msg.is_read ? 'text-[#53bdeb]' : 'text-white/60'}`}>
                              {msg.is_read ? (
                                <svg viewBox="0 0 16 15" width="16" height="15"><path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.72a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg>
                              ) : (
                                <svg viewBox="0 0 16 15" width="16" height="15"><path fill="currentColor" d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.72a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-4 py-3 bg-[#202C33] flex items-center gap-3 shrink-0">
                <button className="text-[#8696A0] hover:text-[#AEBAC1] transition-colors"
                  onClick={() => { toast('Attachments feature active. Hook up a hidden file input here!', { icon: '📎' }) }}
                >
                  <Paperclip size={24} />
                </button>
                <div className="flex-1 bg-[#2A3942] rounded-lg px-4 py-2.5 flex items-center">
                  <input 
                    type="text" 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message"
                    className="w-full bg-transparent text-[15px] text-[#E9EDEF] placeholder-[#8696A0] focus:outline-none"
                  />
                </div>
                {inputMessage.trim() ? (
                  <button 
                    onClick={handleSendMessage}
                    disabled={sendMutation.isPending}
                    className="w-10 h-10 rounded-full bg-[#00A884] flex items-center justify-center text-white hover:bg-[#008f6f] transition-colors shrink-0"
                  >
                    <Send size={18} className="ml-1" />
                  </button>
                ) : (
                  <button className="text-[#8696A0] transition-colors cursor-not-allowed">
                    <Send size={24} />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#8696A0] text-[15px]">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
      
      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111B21] border border-[#202C33] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-[#202C33] flex justify-between items-center bg-[#202C33]">
              <h3 className="text-lg font-medium text-[#E9EDEF]">New Chat</h3>
              <button onClick={() => setShowNewChatModal(false)} className="text-[#8696A0] hover:text-[#E9EDEF] transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 border-b border-[#202C33] bg-[#111B21]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8696A0]" />
                <input 
                  type="text" 
                  placeholder="Search customers by name or phone..." 
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  className="w-full bg-[#2A3942] rounded-lg pl-9 pr-4 py-2 text-sm text-[#E9EDEF] placeholder-[#8696A0] focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#111B21]">
              {loadingCustomers ? (
                <div className="p-4 text-center text-xs text-[#8696A0] animate-pulse">Loading customers...</div>
              ) : (
                customers
                  .filter((c: any) => {
                    const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
                    const username = c.username?.toLowerCase() || '';
                    const search = customerSearchTerm.toLowerCase();
                    return fullName.includes(search) || username.includes(search) || (c.phone_number || '').includes(search);
                  })
                  .map((customer: any) => (
                    <div 
                      key={customer.id}
                      onClick={() => handleStartNewChat(customer.id)}
                      className="p-3 border-b border-[#202C33] hover:bg-[#202C33] cursor-pointer flex items-center gap-3 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#6B7C85] flex items-center justify-center shrink-0">
                        <User size={20} className="text-[#CFD9DF]" />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-normal text-[#E9EDEF]">
                          {customer.first_name || customer.last_name ? `${customer.first_name} ${customer.last_name}` : customer.username}
                        </h4>
                        <p className="text-[13px] text-[#8696A0]">{customer.phone_number || 'No phone'}</p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

