import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileStore } from '../store/useProfileStore';
import { useTechnicianStore } from '../store/useTechnicianStore';
import { FloatingLaborTimer } from '../components/FloatingLaborTimer';
import { 
  LayoutDashboard, Wrench, FileSearch, AlertCircle, 
  CheckSquare, Activity, Clock, Car, Camera,
  CheckCircle2, Box, Menu, X, LogOut, UserCircle
} from 'lucide-react';
import { NotificationCenter } from '../components/NotificationCenter';
import { ConnectionStatus } from '../components/ConnectionStatus';

const SIDEBAR_SECTIONS = [
  {
    title: 'Overview',
    items: [{ name: 'Dashboard', path: '/technician', icon: LayoutDashboard }]
  },
  {
    title: 'My Work',
    items: [
      { name: 'Assigned Vehicles', path: '/technician/assigned', icon: Car },
      { name: 'Today\'s Jobs', path: '/technician/today', icon: Activity },
      { name: 'Active Repairs', path: '/technician/repairs', icon: Wrench },
      { name: 'Completed Jobs', path: '/technician/completed', icon: CheckCircle2 },
    ]
  },
  {
    title: 'Inspection',
    items: [
      { name: 'Inspections', path: '/technician/inspections', icon: FileSearch },
      { name: 'Repair Issues', path: '/technician/issues', icon: AlertCircle },
      { name: 'Evidence', path: '/technician/evidence', icon: Camera },
    ]
  },
  {
    title: 'Repair',
    items: [
      { name: 'Repair Progress', path: '/technician/repair', icon: Clock },
      { name: 'Parts', path: '/technician/parts', icon: Box },
      { name: 'Completion', path: '/technician/completion', icon: CheckSquare },
    ]
  },
  {
    title: 'History',
    items: [
      { name: 'My Service History', path: '/technician/history', icon: Clock },
    ]
  }
];

export default function TechnicianLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const { profileImage } = useProfileStore();
  const { greasyHandsMode, toggleGreasyHandsMode } = useTechnicianStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-root)] text-[var(--text-secondary)] font-sans flex overflow-hidden selection:bg-[#35D07F]/30">
      
      {/* SIDEBAR */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-screen bg-[var(--bg-primary)] border-r border-[var(--border-subtle)] flex flex-col flex-shrink-0 relative z-20"
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
                  <span className="text-[9px] text-[#35D07F] tracking-[0.2em]">WORKSHOP UI</span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-6 custom-scrollbar px-4 space-y-8">
              {SIDEBAR_SECTIONS.map((section, idx) => (
                <div key={idx}>
                  <h4 className="text-[9px] font-bold text-[var(--text-muted)] tracking-[0.2em] uppercase mb-3 px-2">
                    {section.title}
                  </h4>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path || (item.path === '/technician' && location.pathname === '/technician/dashboard');
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ' + (isActive ? 'bg-[#35D07F]/10 text-[#35D07F]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]')}
                        >
                          <Icon size={18} className={isActive ? 'text-[#35D07F]' : 'text-[var(--text-muted)]'} />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* User Bottom Area */}
            <div className="p-4 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-default)] overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Tech" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle size={20} className="text-[var(--text-muted)]" />
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm text-[var(--text-primary)] font-medium truncate">Vikram Singh</span>
                  <span className="text-[10px] text-[#35D07F] tracking-wider truncate">Master Technician</span>
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
              className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex flex-col">
              <span className="text-[var(--text-primary)] font-medium">Workshop Floor</span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Bay 4  Active</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ConnectionStatus />
            <NotificationCenter />

            {/* Profile Dropdown Toggle */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!isProfileOpen)}
                className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-default)] flex items-center justify-center hover:border-white/30 transition-colors overflow-hidden"
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={20} className="text-[var(--text-muted)]" />
                )}
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-56 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-[var(--border-subtle)] mb-2">
                      <p className="text-sm font-medium text-[var(--text-primary)]">Vikram Singh</p>
                      <p className="text-xs text-[#35D07F]">Master Technician</p>
                    </div>
                    <Link to="/technician/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors"><UserCircle size={18}/> My Profile</Link>
                    <div className="h-px bg-[var(--bg-surface-hover)] my-2"></div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"><LogOut size={18}/> Logout</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* MAIN SCROLLABLE AREA */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 relative">
          <Outlet />
        </main>
        
        <FloatingLaborTimer />
      </div>
    </div>
  );
}


