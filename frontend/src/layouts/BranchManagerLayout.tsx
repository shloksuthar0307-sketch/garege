import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../lib/auth';
import React, { useState, useEffect } from 'react';
import { useRealtimeAdvisor } from '../hooks/useRealtimeAdvisor';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import { 
  LayoutDashboard, Calendar, Wrench, AlertCircle, 
  Car, Users, Receipt, DollarSign, PieChart, Bell, 
  Settings, LogOut, Menu, Search, Package, MessageSquare, User
} from 'lucide-react';

const SIDEBAR_SECTIONS = [
  {
    title: 'Overview',
    items: [{ name: 'Dashboard', path: '/manager', icon: LayoutDashboard }]
  },
  {
    title: 'Operations',
    items: [
      { name: 'Service Orders', path: '/manager/service-orders', icon: Wrench },
      { name: 'Workshop Floor', path: '/manager/workshop', icon: Car },
      { name: 'Appointments', path: '/manager/appointments', icon: Calendar },
      { name: 'Inventory', path: '/manager/inventory', icon: Package },
    ]
  },
  {
    title: 'Team & Customers',
    items: [
      { name: 'Technicians', path: '/manager/technicians', icon: Users },
      { name: 'Customers', path: '/manager/customers', icon: Users },
      { name: 'Customer Issues', path: '/manager/issues', icon: MessageSquare },
    ]
  },
  {
    title: 'Finance',
    items: [
      { name: 'Invoices', path: '/manager/invoices', icon: Receipt },
      { name: 'Finance Overview', path: '/manager/finance', icon: DollarSign },
    ]
  },
  {
    title: 'System',
    items: [
      { name: 'Reports', path: '/manager/reports', icon: PieChart },
      { name: 'Settings', path: '/manager/settings', icon: Settings },
    ]
  }
];

export default function BranchManagerLayout() {
  useRealtimeAdvisor();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const sidebar = document.querySelector('#manager-sidebar-scroll') as HTMLElement;
    const content = document.querySelector('#manager-sidebar-content') as HTMLElement;
    if (!sidebar || !content) return;
    const lenis = new Lenis({ wrapper: sidebar, content: content, lerp: 0.08, smoothWheel: true });
    let animationFrameId: number;
    function raf(time: number) { lenis.raf(time); animationFrameId = requestAnimationFrame(raf); }
    animationFrameId = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(animationFrameId); lenis.destroy(); };
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth < 1024) setSidebarOpen(false); else setSidebarOpen(true); };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    clearTokens();
navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-secondary)] font-sans flex overflow-hidden selection:bg-[#35D07F]/30">
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-screen bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] flex flex-col flex-shrink-0 relative z-20"
          >
            <div className="h-20 flex items-center px-6 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#111112] to-[#1A1A1C] border border-[#35D07F]/30 flex items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(53,208,127,0.1)]">
                  <div className="w-3.5 h-3.5 border-[2px] border-[#35D07F] rounded-sm rotate-45 relative z-10 shadow-[0_0_8px_rgba(53,208,127,0.4)]"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#35D07F]/20 to-transparent blur-md"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[var(--text-primary)] font-bold tracking-widest text-sm">REPAIRTRACE</span>
                  <span className="text-[9px] text-[#35D07F] tracking-[0.2em]">BRANCH MGR</span>
                </div>
              </div>
            </div>

            <div id="manager-sidebar-scroll" className="flex-1 overflow-y-auto py-6 custom-scrollbar px-4 relative h-full">
              <div id="manager-sidebar-content" className="space-y-8 min-h-max">
                {SIDEBAR_SECTIONS.map((section, idx) => (
                  <div key={idx}>
                    <h4 className="text-[9px] font-bold text-[var(--text-muted)] tracking-[0.2em] uppercase mb-3 px-2">{section.title}</h4>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.path} to={item.path}
                            className={'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ' + (isActive ? 'bg-[#35D07F]/10 text-[#35D07F]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]')}
                          >
                            <Icon size={18} />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className="h-20 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)] flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              <Menu size={20} />
            </button>
            <div className="hidden md:flex flex-col justify-center">
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Current Branch</span>
              <span className="text-sm text-[var(--text-primary)] font-medium">Ahmedabad — Vehicle Service Center</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-full px-4 py-2 w-64 group focus-within:border-[#35D07F]/50 transition-colors">
              <Search size={16} className="text-[var(--text-muted)] group-focus-within:text-[#35D07F]" />
              <input type="text" placeholder="Search orders, VIN..." className="bg-transparent border-none outline-none text-sm text-[var(--text-primary)] w-full placeholder:text-slate-600" />
            </div>

            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0A0A0B]"></span>
            </button>

            <div className="relative">
              <button onClick={() => setProfileOpen(!isProfileOpen)} className="w-10 h-10 rounded-full bg-slate-800 border border-[var(--border-default)] flex items-center justify-center hover:border-white/30 transition-colors overflow-hidden">
                <span className="text-sm font-bold text-[var(--text-primary)]">M</span>
              </button>
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-3 w-48 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl shadow-2xl py-2 z-50">
                    <button onClick={() => { setProfileOpen(false); navigate('/manager/profile'); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] transition-colors"><User size={16}/> Profile</button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"><LogOut size={16}/> Logout</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}









