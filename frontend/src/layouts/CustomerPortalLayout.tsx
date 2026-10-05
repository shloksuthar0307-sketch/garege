import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../lib/auth';
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { advisorApi } from '../api/advisor';
import { useRealtimeCustomer } from '../hooks/useRealtimeCustomer';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, User, Shield, Settings, Users, 
  FolderHeart, Receipt, CreditCard, LifeBuoy, BookOpen, 
  MessageSquare, Bell, Search, LogOut, Menu, Car, 
  Package, Wrench, Calendar, Box, CheckSquare, History
} from 'lucide-react';

const SIDEBAR_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
      { name: 'My Vehicles', path: '/customer/vehicles', icon: Car },
      { name: 'Active Repairs', path: '/customer/repairs', icon: Wrench },
      { name: 'Pending Approvals', path: '/customer/approvals', icon: CheckSquare },
      { name: 'Service History', path: '/customer/records', icon: History },
    ]
  },
  {
    title: 'Billing & Orders',
    items: [
      { name: 'Order History', path: '/customer/billing', icon: Package },
      { name: 'Invoices', path: '/customer/invoices', icon: Receipt },
    ]
  },
  {
    title: 'Support',
    items: [
      { name: 'Direct Messages', path: '/customer/messages', icon: MessageSquare },
      { name: 'Notifications', path: '/customer/notifications', icon: Bell },
      { name: 'Support Tickets', path: '/customer/support', icon: LifeBuoy },
    ]
  },
  {
    title: 'Account',
    items: [
      { name: 'Profile', path: '/customer/profile', icon: User },
      { name: 'Security', path: '/customer/security', icon: Shield },
      { name: 'Preferences', path: '/customer/preferences', icon: Settings },
    ]
  }
];

export default function CustomerPortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const token = getAccessToken();
  let userId = '';
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.user?.id;
    } catch (e) {}
  }
  useRealtimeCustomer(userId);

  const { data: conversations = [] } = useQuery({
    queryKey: ['advisor-conversations'],
    queryFn: () => advisorApi.getConversations()
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['advisor-notifications'],
    queryFn: () => advisorApi.getNotifications()
  });

  const unreadNotificationsCount = notifications.filter((n: any) => !n.is_read).length;

  const unreadMessagesCount = conversations.reduce((acc: number, c: any) => acc + (c.unread_count || 0), 0);

  return (
    <div className="flex h-screen bg-[#050505] text-[var(--text-secondary)] font-sans overflow-hidden selection:bg-[#35D07F]/30">
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-primary)]/90 backdrop-blur-xl flex flex-col z-20"
          >
            <div className="h-20 flex items-center px-6 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#35D07F] to-[#25a05d] rounded-xl flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(53,208,127,0.4)]">
                  C
                </div>
                <div className="flex flex-col">
                  <span className="text-[var(--text-primary)] font-bold tracking-widest text-sm uppercase">Portal</span>
                  <span className="text-[9px] text-[#35D07F] tracking-[0.2em] uppercase">Premium Access</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-8 custom-scrollbar">
              {SIDEBAR_SECTIONS.map((section) => (
                <div key={section.title}>
                  <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-3 px-3">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname.includes(item.path);
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
                            isActive 
                              ? 'bg-[#35D07F]/10 text-[#35D07F] shadow-[inset_2px_0_0_#35D07F]' 
                              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
                          }`}
                        >
                          <item.icon size={16} className={isActive ? 'drop-shadow-[0_0_8px_rgba(53,208,127,0.5)]' : ''} />
                          {item.name}
                          {item.name === 'Direct Messages' && unreadMessagesCount > 0 && (
                            <span className="ml-auto bg-[#35D07F] text-black text-[10px] px-2 py-0.5 rounded-full font-bold">
                              {unreadMessagesCount}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[var(--border-subtle)] bg-[#080808]">
              <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-3 px-3">
                Account
              </h3>
              <div className="space-y-1">
                <Link to="/customer/profile" className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${location.pathname.includes('/customer/profile') ? 'text-[#35D07F] bg-[var(--bg-surface-hover)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'}`}>
                  <User size={16} /> Profile
                </Link>
                <Link to="/customer/security" className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${location.pathname.includes('/customer/security') ? 'text-[#35D07F] bg-[var(--bg-surface-hover)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'}`}>
                  <Shield size={16} /> Security
                </Link>
                <Link to="/customer/preferences" className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${location.pathname.includes('/customer/preferences') ? 'text-[#35D07F] bg-[var(--bg-surface-hover)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'}`}>
                  <Settings size={16} /> Preferences
                </Link>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-bold uppercase tracking-widest transition-all mt-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
        <header className="h-20 border-b border-[var(--border-subtle)] bg-[#050505]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-lg hover:bg-[var(--bg-surface-hover)]"
            >
              <Menu size={20} />
            </button>
            <div className="relative group hidden sm:block">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input 
                type="text" 
                placeholder="Search across projects, orders, tickets... (Ctrl+K)" 
                className="pl-11 pr-12 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-full text-xs font-bold tracking-widest focus:outline-none focus:border-[#35D07F]/50 focus:ring-1 focus:ring-[#35D07F]/50 transition-all w-96 placeholder:text-slate-600 text-[var(--text-primary)] shadow-inner"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[var(--text-muted)] bg-[var(--bg-surface-hover)] px-2 py-1 rounded">
                CTRL K
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate('/customer/notifications')}
                className="relative text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-full hover:bg-[var(--bg-surface-hover)]"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-[#35D07F] text-black text-[10px] font-bold rounded-full flex items-center justify-center border border-[#050505] shadow-[0_0_8px_rgba(53,208,127,0.8)]">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            <div 
              onClick={() => navigate('/customer/profile')}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#35D07F] to-[#1e7c44] flex items-center justify-center border-2 border-[#111112] cursor-pointer hover:opacity-80 transition-opacity text-black font-bold text-sm shadow-[0_0_10px_rgba(53,208,127,0.3)] overflow-hidden"
              title="My Profile"
            >
              {(() => {
                try {
                  const saved = localStorage.getItem('repairtrace_profile');
                  if (saved) {
                    const profileData = JSON.parse(saved);
                    if (profileData.avatar) {
                      return <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />;
                    }
                    return profileData.firstName.charAt(0).toUpperCase();
                  }
                } catch (e) {}
                return 'S';
              })()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-10 custom-scrollbar relative">
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#35D07F]/5 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <Outlet />
          </div>
        </div>
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => navigate('/customer/messages')}
          className="w-14 h-14 bg-[#35D07F] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(53,208,127,0.4)] hover:bg-[#2bb46c] transition-all hover:scale-105 active:scale-95 group"
        >
          <MessageSquare size={24} className="text-black group-hover:animate-pulse" />
        </button>
      </div>
    </div>
  );
}


