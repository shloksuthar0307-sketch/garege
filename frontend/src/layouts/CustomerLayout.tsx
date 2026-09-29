import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, User, Shield, Settings, Users, 
  FolderHeart, Receipt, CreditCard, LifeBuoy, BookOpen, 
  MessageSquare, Bell, Search, LogOut, Menu, X, Plus, Clock
} from 'lucide-react';

const SIDEBAR_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/customer', icon: LayoutDashboard },
      { name: 'My Drafts', path: '/customer/drafts', icon: FolderHeart },
    ]
  },
  {
    title: 'Organization',
    items: [
      { name: 'Team Roster', path: '/customer/organization', icon: Users },
      { name: 'Shared Resources', path: '/customer/shared', icon: FolderHeart },
    ]
  },
  {
    title: 'Billing & Orders',
    items: [
      { name: 'Order History', path: '/customer/billing', icon: Receipt },
      { name: 'Payment Methods', path: '/customer/payments', icon: CreditCard },
      { name: 'Subscription', path: '/customer/subscription', icon: Clock },
    ]
  },
  {
    title: 'Support',
    items: [
      { name: 'Tickets', path: '/customer/support', icon: LifeBuoy },
      { name: 'Knowledge Base', path: '/customer/faq', icon: BookOpen },
    ]
  }
];

export default function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-[#0a0a0b] text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 border-r border-white/5 bg-[#111112]/90 backdrop-blur-xl flex flex-col z-20"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold">
                  C
                </div>
                <span className="font-semibold text-lg tracking-wide">Portal</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-8 custom-scrollbar">
              {SIDEBAR_SECTIONS.map((section) => (
                <div key={section.title}>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path || (item.path !== '/customer' && location.pathname.startsWith(item.path));
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                            isActive 
                              ? 'bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          <item.icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/5">
              <div className="space-y-1">
                <Link to="/customer/profile" className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${location.pathname.includes('/customer/profile') ? 'text-indigo-400 bg-white/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                  <User size={18} className={location.pathname.includes('/customer/profile') ? 'text-indigo-400' : 'text-slate-500'} /> Profile
                </Link>
                <Link to="/customer/security" className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${location.pathname.includes('/customer/security') ? 'text-indigo-400 bg-white/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                  <Shield size={18} className={location.pathname.includes('/customer/security') ? 'text-indigo-400' : 'text-slate-500'} /> Security
                </Link>
                <Link to="/customer/preferences" className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${location.pathname.includes('/customer/preferences') ? 'text-indigo-400 bg-white/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                  <Settings size={18} className={location.pathname.includes('/customer/preferences') ? 'text-indigo-400' : 'text-slate-500'} /> Preferences
                </Link>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 transition-all mt-2"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0b] relative">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/5 bg-[#111112]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Menu size={20} />
            </button>
            
            <div className="relative group hidden sm:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search projects, orders, or ask for help... (Ctrl+K)" 
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all w-80 placeholder:text-slate-600"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600 bg-white/5 px-1.5 py-0.5 rounded">
                ⌘K
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)] border border-[#111112]"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-2 border-[#111112] cursor-pointer hover:opacity-80 transition-opacity">
              <span className="font-bold text-sm">JD</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 md:p-10 custom-scrollbar relative">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
          <div className="max-w-6xl mx-auto relative z-10">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95">
          <MessageSquare size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
}

