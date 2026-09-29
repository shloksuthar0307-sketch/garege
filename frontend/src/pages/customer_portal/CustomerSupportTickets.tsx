import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { MessageSquare, Search, Plus, User, HeadphonesIcon, Send, Paperclip, Clock, CheckCircle2, AlertCircle, X, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_TICKETS: any[] = [];

const AUTO_RESPONSES = [
  "I'm looking into this for you right now.",
  "Let me check with our head technician and I'll get back to you.",
  "I can confirm that the parts have been ordered and are on the way.",
  "Could you please provide the VIN number for your vehicle?",
  "An advisor will review this and give you a call shortly.",
  "That makes sense. I'll update the repair order right away."
];

export default function CustomerSupportTickets() {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [activeTicketId, setActiveTicketId] = useState(INITIAL_TICKETS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  
  // Simulated Typing State
  const [typingTickets, setTypingTickets] = useState<Record<string, boolean>>({});
  
  // Auto-scroll ref
  const chatEndRef = useRef<HTMLDivElement>(null);

  // New Ticket Modal State
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({ subject: '', priority: 'Normal', message: '' });

  const activeTicket = tickets.find(t => t.id === activeTicketId);
  const filteredTickets = tickets.filter(t => t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase()));

  // Auto-scroll to bottom of chat when new message or typing indicator appears
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [tickets, typingTickets, activeTicketId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'text-[#35D07F] border-[#35D07F]/30 bg-[#35D07F]/10';
      case 'Pending': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'Resolved': return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
      default: return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <AlertCircle size={12} />;
      case 'Pending': return <Clock size={12} />;
      case 'Resolved': return <CheckCircle2 size={12} />;
      default: return null;
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !activeTicket) return;
    
    const targetTicketId = activeTicket.id;
    
    // Add customer message
    setTickets(currentTickets => currentTickets.map(t => {
      if (t.id === targetTicketId) {
        return {
          ...t,
          lastUpdated: 'Just now',
          messages: [...t.messages, {
            id: Date.now(),
            sender: 'customer',
            name: 'You',
            text: replyText,
            time: 'Just now'
          }]
        };
      }
      return t;
    }));

    setReplyText('');
    
    // Trigger "Agent Typing" state
    setTypingTickets(prev => ({ ...prev, [targetTicketId]: true }));
    
    // Simulate API delay for agent reply (2-4 seconds)
    const delay = Math.floor(Math.random() * 2000) + 1500;
    setTimeout(() => {
      setTickets(currentTickets => currentTickets.map(t => {
        if (t.id === targetTicketId) {
          const randomResponse = AUTO_RESPONSES[Math.floor(Math.random() * AUTO_RESPONSES.length)];
          return {
            ...t,
            lastUpdated: 'Just now',
            messages: [...t.messages, {
              id: Date.now(),
              sender: 'agent',
              name: 'Mike (Advisor)',
              text: randomResponse,
              time: 'Just now'
            }]
          };
        }
        return t;
      }));
      setTypingTickets(prev => ({ ...prev, [targetTicketId]: false }));
      
      // Only play toast if the user navigated away from the ticket
      if (activeTicketId !== targetTicketId) {
        toast('New message from Mike (Advisor)', {
          icon: '💬',
          style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' }
        });
      }
    }, delay);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketForm.subject || !newTicketForm.message) {
      toast.error('Please fill in all required fields', { style: { background: '#1A1A1B', color: '#fff' }});
      return;
    }

    const newTicketId = `TKT-${Math.floor(Math.random() * 900) + 100}`;
    const newTicket = {
      id: newTicketId,
      subject: newTicketForm.subject,
      status: 'Open',
      priority: newTicketForm.priority,
      lastUpdated: 'Just now',
      messages: [
        { id: 1, sender: 'customer', name: 'You', text: newTicketForm.message, time: 'Just now' }
      ]
    };

    setTickets(prev => [newTicket, ...prev]);
    setActiveTicketId(newTicket.id);
    setShowNewTicketModal(false);
    setNewTicketForm({ subject: '', priority: 'Normal', message: '' });

    toast.success('Support ticket created successfully!', {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });

    // Auto-reply for new tickets
    setTypingTickets(prev => ({ ...prev, [newTicketId]: true }));
    setTimeout(() => {
      setTickets(currentTickets => currentTickets.map(t => {
        if (t.id === newTicketId) {
          return {
            ...t,
            messages: [...t.messages, {
              id: Date.now(),
              sender: 'agent',
              name: 'System',
              text: 'Thank you for reaching out! A service advisor will review your ticket and reply shortly.',
              time: 'Just now'
            }]
          };
        }
        return t;
      }));
      setTypingTickets(prev => ({ ...prev, [newTicketId]: false }));
    }, 2500);
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-10 h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-white mb-2 flex items-center gap-3">
            <MessageSquare className="text-[#35D07F]" size={28} />
            Support Helpdesk
          </h1>
          <p className="text-slate-400 text-xs tracking-widest uppercase">
            Manage your support tickets and speak with a service advisor.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowNewTicketModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(53,208,127,0.3)]"
          >
            <Plus size={16} /> New Ticket
          </button>
        </motion.div>
      </div>

      {/* Split Pane Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Pane: Ticket List */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-4 bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl flex flex-col overflow-hidden"
        >
          {/* List Search Header */}
          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="SEARCH TICKETS..." 
                className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white uppercase tracking-widest focus:border-[#35D07F] outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredTickets.map(ticket => (
              <div 
                key={ticket.id}
                onClick={() => setActiveTicketId(ticket.id)}
                className={`p-5 border-b border-white/5 cursor-pointer transition-all ${
                  activeTicketId === ticket.id 
                    ? 'bg-white/10 border-l-2 border-l-[#35D07F]' 
                    : 'hover:bg-white/5 border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">{ticket.id}</span>
                  <span className={`px-2 py-0.5 border rounded flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)} {ticket.status}
                  </span>
                </div>
                <h3 className={`text-sm font-bold tracking-wider mb-2 line-clamp-1 ${activeTicketId === ticket.id ? 'text-[#35D07F]' : 'text-white'}`}>
                  {ticket.subject}
                </h3>
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                  <span className="text-slate-500">{ticket.lastUpdated}</span>
                  <span className={`px-2 py-0.5 rounded bg-white/5 ${ticket.priority === 'High' ? 'text-rose-400' : 'text-slate-400'}`}>
                    {ticket.priority} Priority
                  </span>
                </div>
              </div>
            ))}
            {filteredTickets.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-[10px] font-bold tracking-widest uppercase">
                No tickets match your search.
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Pane: Chat Interface */}
        <motion.div 
          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-8 bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl flex flex-col overflow-hidden relative"
        >
          {activeTicket ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4 shrink-0">
                <div>
                  <h2 className="text-xl font-bold tracking-widest text-white mb-1">{activeTicket.subject}</h2>
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
                    {activeTicket.id} • Last updated {activeTicket.lastUpdated}
                  </p>
                </div>
                {activeTicket.status !== 'Resolved' && (
                  <button 
                    onClick={() => {
                      setTickets(tickets.map(t => t.id === activeTicket.id ? {...t, status: 'Resolved'} : t));
                      toast.success('Ticket marked as resolved', { style: { background: '#1A1A1B', color: '#fff' }});
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
                {activeTicket.messages.map(msg => {
                  const isCustomer = msg.sender === 'customer';
                  return (
                    <div key={msg.id} className={`flex w-full ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-4 max-w-[80%] ${isCustomer ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          isCustomer ? 'bg-[#35D07F]/20 text-[#35D07F]' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {isCustomer ? <User size={18} /> : <HeadphonesIcon size={18} />}
                        </div>
                        
                        {/* Bubble */}
                        <div className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">{msg.name}</span>
                            <span className="text-slate-500 text-[9px] uppercase tracking-widest">{msg.time}</span>
                          </div>
                          <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                            isCustomer 
                              ? 'bg-[#35D07F] text-black rounded-tr-sm' 
                              : 'bg-white/10 text-white rounded-tl-sm border border-white/5'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {typingTickets[activeTicket.id] && (
                  <div className="flex w-full justify-start">
                    <div className="flex gap-4 max-w-[80%] flex-row">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-500/20 text-blue-400">
                        <HeadphonesIcon size={18} />
                      </div>
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Advisor Typing</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/10 border border-white/5 rounded-tl-sm flex items-center gap-1.5 h-[52px]">
                          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Auto-scroll anchor */}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-white/5 bg-white/[0.02] shrink-0">
                {activeTicket.status === 'Resolved' ? (
                  <div className="text-center p-4">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">This ticket has been resolved and closed.</p>
                    <button 
                      onClick={() => setShowNewTicketModal(true)}
                      className="mt-2 text-[#35D07F] text-[10px] uppercase tracking-widest underline underline-offset-4"
                    >
                      Open a new ticket
                    </button>
                  </div>
                ) : (
                  <div className="relative flex items-center">
                    <button className="absolute left-3 text-slate-500 hover:text-white transition-colors">
                      <Paperclip size={18} />
                    </button>
                    <input 
                      type="text" 
                      placeholder="TYPE YOUR MESSAGE..." 
                      className="w-full pl-12 pr-16 py-4 bg-black/50 border border-white/10 rounded-xl text-sm text-white placeholder:uppercase placeholder:tracking-widest focus:border-[#35D07F] outline-none transition-all"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    />
                    <button 
                      onClick={handleSendReply}
                      className="absolute right-2 px-3 py-2 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-lg transition-all shadow-[0_0_10px_rgba(53,208,127,0.2)]"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs uppercase tracking-widest">
              Select a ticket to view conversation
            </div>
          )}
        </motion.div>

      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {showNewTicketModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => setShowNewTicketModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-[#0A0A0B] border border-white/10 p-8 rounded-2xl z-10 w-full max-w-lg shadow-2xl relative"
            >
              <button onClick={() => setShowNewTicketModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
              
              <h2 className="text-white text-xl font-bold tracking-widest uppercase mb-2 flex items-center gap-3">
                <MessageSquare className="text-[#35D07F]" size={24} /> New Support Ticket
              </h2>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-8">
                Submit an inquiry and a service advisor will assist you.
              </p>
              
              <form onSubmit={handleCreateTicket}>
                <div className="mb-5">
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 block">Subject</label>
                  <input 
                    type="text" 
                    placeholder="Brief description of the issue"
                    value={newTicketForm.subject}
                    onChange={(e) => setNewTicketForm({...newTicketForm, subject: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-[#35D07F] transition-colors" 
                  />
                </div>
                
                <div className="mb-5">
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 block">Priority</label>
                  <div className="relative">
                    <select 
                      value={newTicketForm.priority}
                      onChange={(e) => setNewTicketForm({...newTicketForm, priority: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-[#35D07F] transition-colors appearance-none cursor-pointer"
                    >
                      <option value="Normal" className="bg-[#111112]">Normal Priority</option>
                      <option value="High" className="bg-[#111112]">High Priority</option>
                    </select>
                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none" />
                  </div>
                </div>

                <div className="mb-8">
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 block">Message</label>
                  <textarea 
                    rows={4} 
                    placeholder="How can we help you today?" 
                    value={newTicketForm.message}
                    onChange={(e) => setNewTicketForm({...newTicketForm, message: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-[#35D07F] transition-colors resize-none placeholder:text-slate-600"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-[#35D07F] hover:bg-[#2bb46c] text-black font-bold tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(53,208,127,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Submit Ticket
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

