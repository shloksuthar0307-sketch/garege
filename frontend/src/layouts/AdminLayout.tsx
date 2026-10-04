import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Lenis from 'lenis';
import { useRealtimeAdvisor } from '../hooks/useRealtimeAdvisor';
import { 
  LayoutDashboard, Calendar, Wrench, FileSearch, AlertCircle, 
  FileText, CheckSquare, Activity, Car, Users, 
  UserSquare, UserCircle, Receipt, DollarSign, PieChart, 
  Camera, Shield, Bell, Settings, 
  LogOut, Menu, Search, Plus, Building2
} from 'lucide-react';

const SIDEBAR_SECTIONS = [
  {
    title: 'Overview',
    items: [{ name: 'Dashboard', path: '/admin', icon: LayoutDashboard }]
  },
  {
    title: 'Operations',
    items: [
      { name: 'Service Bookings', path: '/admin/bookings', icon: Calendar },
      { name: 'Active Repairs', path: '/admin/repairs', icon: Wrench },
      { name: 'Inspections', path: '/admin/inspections', icon: FileSearch },
      { name: 'Repair Issues', path: '/admin/issues', icon: AlertCircle },
      { name: 'Estimates', path: '/admin/estimates', icon: FileText },
      { name: 'Customer Approvals', path: '/admin/approvals', icon: CheckSquare },
    ]
  },
  {
    title: 'Vehicles & Customers',
    items: [
      { name: 'Vehicles', path: '/admin/vehicles', icon: Car },
      { name: 'Customers', path: '/admin/customers', icon: Users },
      { name: 'Technicians', path: '/admin/technicians', icon: UserSquare },
      { name: 'Service Advisors', path: '/admin/advisors', icon: UserCircle },
    ]
  },
  {
    title: 'Evidence',
    items: [
      { name: 'Evidence Library', path: '/admin/evidence', icon: Camera },
    ]
  },
  {
    title: 'Finance',
    items: [
      { name: 'Invoices', path: '/admin/invoices', icon: Receipt },
      { name: 'Financial Reports', path: '/admin/finance', icon: DollarSign },
    ]
  },
  {
    title: 'System',
    items: [
      { name: 'Analytics', path: '/admin/analytics', icon: PieChart },
      { name: 'Branches', path: '/admin/branches', icon: Building2 },
      { name: 'Users & Roles', path: '/admin/users', icon: Shield },
      { name: 'Audit Logs', path: '/admin/audit', icon: Activity },
      { name: 'Settings', path: '/admin/settings', icon: Settings },
    ]
  }
];

export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isQuickActionOpen, setQuickActionOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useRealtimeAdvisor();

  // Smooth Scrolling for Sidebar using Lenis
  useEffect(() => {
    const sidebar = document.querySelector('#admin-sidebar-scroll') as HTMLElement;
    const content = document.querySelector('#admin-sidebar-content') as HTMLElement;
    
    if (!sidebar || !content) return;

    const lenis = new Lenis({
      wrapper: sidebar,
      content: content,
      lerp: 0.08,
      smoothWheel: true,
    });

    let animationFrameId: number;
    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, [isSidebarOpen]);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-secondary)] font-sans flex overflow-hidden selection:bg-[#35D07F]/30">
      
      {/* SIDEBAR */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-screen bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] flex flex-col flex-shrink-0 relative z-20"
          >
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#111112] to-[#1A1A1C] border border-[#35D07F]/30 flex items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(53,208,127,0.1)]">
                  <div className="w-3.5 h-3.5 border-[2px] border-[#35D07F] rounded-sm rotate-45 relative z-10 shadow-[0_0_8px_rgba(53,208,127,0.4)]"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#35D07F]/20 to-transparent blur-md"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[var(--text-primary)] font-bold tracking-widest text-sm">REPAIRTRACE</span>
                  <span className="text-[9px] text-[#35D07F] tracking-[0.2em]">ADMIN PANEL</span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div id="admin-sidebar-scroll" className="flex-1 overflow-y-auto py-6 custom-scrollbar px-4 relative h-full">
              <div id="admin-sidebar-content" className="space-y-8 min-h-max">
                {SIDEBAR_SECTIONS.map((section, idx) => (
                  <div key={idx}>
                    <h4 className="text-[9px] font-bold text-[var(--text-muted)] tracking-[0.2em] uppercase mb-3 px-2">
                      {section.title}
                    </h4>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
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
            
            {/* User Bottom Area */}
            <div className="p-4 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-[var(--border-default)]">
                  <span className="text-sm font-bold text-[var(--text-primary)]">A</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm text-[var(--text-primary)] font-medium truncate">System Admin</span>
                  <span className="text-[10px] text-[var(--text-muted)] tracking-wider truncate">admin@repairtrace.com</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        
        {/* TOP NAVIGATION */}
        <header className="h-20 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)] flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Menu size={20} />
            </button>
            
            {/* Global Search (Ctrl+K placeholder) */}
            <div className="hidden md:flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-full px-4 py-2 w-96 group focus-within:border-[#35D07F]/50 transition-colors">
              <Search size={16} className="text-[var(--text-muted)] group-focus-within:text-[#35D07F]" />
              <input 
                type="text" 
                placeholder="Search vehicles, customers, repairs..." 
                className="bg-transparent border-none outline-none text-sm text-[var(--text-primary)] w-full placeholder:text-slate-600"
              />
              <div className="flex items-center gap-1">
                <kbd className="bg-[var(--bg-surface-active)] px-1.5 py-0.5 rounded text-[10px] text-[var(--text-muted)] font-mono">Ctrl</kbd>
                <kbd className="bg-[var(--bg-surface-active)] px-1.5 py-0.5 rounded text-[10px] text-[var(--text-muted)] font-mono">K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Actions Dropdown */}
            <div className="relative hidden md:block">
              <button 
                onClick={() => {
                  setQuickActionOpen(!isQuickActionOpen);
                  setNotificationsOpen(false);
                  setProfileOpen(false);
                }}
                className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-colors"
              >
                <Plus size={14} />
                Quick Action
              </button>
              <AnimatePresence>
                {isQuickActionOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-56 bg-[#1A1A1B] border border-[var(--border-default)] rounded-xl shadow-2xl py-2 z-50"
                  >
                    {[
                      { icon: Car, label: 'Add Vehicle', path: '/admin/vehicles' },
                      { icon: Calendar, label: 'New Booking', path: '/admin/bookings' },
                      { icon: Wrench, label: 'Create Job Card', path: '/admin/repairs' },
                      { icon: FileText, label: 'Draft Estimate', path: '/admin/estimates' }
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button 
                          key={idx}
                          onClick={() => {
                            setQuickActionOpen(false);
                            navigate(item.path, { state: { action: 'new' } });
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] flex items-center gap-3 transition-colors"
                        >
                          <Icon size={16} className="text-[#35D07F]" />
                          {item.label}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-6 bg-[var(--bg-surface-active)] mx-2 hidden sm:block"></div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotificationsOpen(!isNotificationsOpen);
                  setQuickActionOpen(false);
                  setProfileOpen(false);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors relative"
              >
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0A0A0B]"></span>
              </button>
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-80 bg-[#1A1A1B] border border-[var(--border-default)] rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-[var(--border-subtle)] flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Notifications</span>
                      <span className="text-xs text-[#35D07F]">Mark all read</span>
                    </div>
                    {[
                      { title: 'New Booking', desc: 'Rahul Sharma booked a major service.', time: '5m ago' },
                      { title: 'Estimate Approved', desc: 'Estimate EST-402 was approved.', time: '1h ago' }
                    ].map((item, idx) => (
                      <div key={idx} className="px-4 py-3 hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer border-l-2 border-transparent hover:border-[#35D07F]">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium text-[var(--text-primary)]">{item.title}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">{item.time}</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                      </div>
                    ))}
                    <div className="px-4 py-2 mt-2 border-t border-[var(--border-subtle)] text-center">
                      <button onClick={() => setNotificationsOpen(false)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">View All Notifications</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown Toggle */}
            <div className="relative">
              <button 
                onClick={() => {
                  setProfileOpen(!isProfileOpen);
                  setQuickActionOpen(false);
                  setNotificationsOpen(false);
                }}
                className="w-10 h-10 rounded-full bg-slate-800 border border-[var(--border-default)] flex items-center justify-center hover:border-white/30 transition-colors overflow-hidden"
              >
                <img src="https://ui-avatars.com/api/?name=Admin&background=111112&color=fff" alt="Profile" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-56 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-[var(--border-subtle)] mb-2">
                      <p className="text-sm font-medium text-[var(--text-primary)]">System Admin</p>
                      <p className="text-xs text-[#35D07F]">Super Administrator</p>
                    </div>
                    <Link to="/admin/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors"><UserCircle size={16}/> My Profile</Link>
                    <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors"><Settings size={16}/> Settings</Link>
                    <div className="h-px bg-[var(--bg-surface-hover)] my-2"></div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"><LogOut size={16}/> Logout</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* MAIN SCROLLABLE AREA */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 relative">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}


