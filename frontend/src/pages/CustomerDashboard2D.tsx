import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, Wrench, Clock, FileText, User, Bell, ChevronRight, 
  CheckCircle2, AlertTriangle, FileSignature, ChevronDown, Camera,
  LogOut, Settings, HelpCircle, Activity, Calendar, ShieldCheck, X, FileSearch
} from 'lucide-react';

const SIDEBAR_LINKS = [
  { id: 'dashboard', icon: Car, label: 'Dashboard' },
  { id: 'vehicles', icon: ShieldCheck, label: 'My Vehicles' },
  { id: 'history', icon: FileText, label: 'Service History' },
  { id: 'repair', icon: Wrench, label: 'Active Repair' },
  { id: 'appointments', icon: Calendar, label: 'Appointments' },
  { id: 'approvals', icon: FileSignature, label: 'Estimates & Approvals' },
];

export default function CustomerDashboard2D() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-[var(--text-secondary)] font-sans flex overflow-hidden selection:bg-[#35D07F]/30">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-[var(--bg-primary)] border-r border-[var(--border-subtle)] flex-shrink-0 z-20">
        <div className="h-20 flex items-center px-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#35D07F] rounded-xl flex items-center justify-center text-black">
              <Car size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[var(--text-primary)] font-bold tracking-widest text-sm uppercase">RepairTrace</span>
              <span className="text-[9px] text-[#35D07F] tracking-[0.2em] uppercase">Vehicle Transparency</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          {SIDEBAR_LINKS.map(link => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ' + (activeTab === link.id ? 'bg-[#35D07F]/10 text-[#35D07F] shadow-[inset_2px_0_0_#35D07F]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]')}
            >
              <link.icon size={18} className={activeTab === link.id ? 'drop-shadow-[0_0_8px_rgba(53,208,127,0.5)]' : ''} />
              {link.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--border-subtle)] space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-all">
            <HelpCircle size={18} /> Help & Support
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-all">
            <Settings size={18} /> Settings
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        
        {/* HEADER */}
        <header className="h-20 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)] flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4 md:hidden">
            <button className="w-10 h-10 rounded-xl bg-[var(--bg-surface-hover)] flex items-center justify-center text-[var(--text-primary)]" onClick={() => setSidebarOpen(true)}>
              <span className="font-bold text-xs uppercase tracking-widest">Menu</span>
            </button>
          </div>

          <div className="hidden md:block">
            <h1 className="text-xl font-light text-[var(--text-primary)]">Good morning, Shlok</h1>
            <p className="text-xs text-[#35D07F] uppercase tracking-widest font-bold mt-1">Your Honda City is currently being serviced.</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-full hover:bg-[var(--bg-surface-hover)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#0A0A0B]"></span>
            </button>

            <div className="relative">
              <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center gap-3 hover:bg-[var(--bg-surface-hover)] py-1.5 px-2 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-[var(--border-default)] overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=shlok" alt="Shlok" className="w-full h-full object-cover" />
                </div>
                <div className="hidden lg:flex flex-col items-start pr-2">
                  <span className="text-sm font-medium text-[var(--text-primary)]">Shlok Mehta</span>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Premium Member</span>
                </div>
                <ChevronDown size={14} className="text-[var(--text-muted)] hidden lg:block" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-56 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="p-2 space-y-1">
                      <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] rounded-xl"><User size={16} /> My Profile</button>
                      <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] rounded-xl"><Car size={16} /> My Vehicles</button>
                      <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] rounded-xl"><FileText size={16} /> Service History</button>
                      <div className="h-px bg-[var(--bg-surface-hover)] my-1"></div>
                      <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"><LogOut size={16} /> Logout</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* MAIN SCROLLABLE AREA */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-8 pb-24 md:pb-8">
            
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="space-y-8">
                  
                  {/* TOP ROW: HERO & VEHICLE INFO */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* Active Repair Hero */}
                    <div className="xl:col-span-2 bg-[#101010] border border-[#242424] rounded-[24px] p-8 relative overflow-hidden group shadow-2xl">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-[#35D07F]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-8">
                            <div>
                              <h2 className="text-3xl font-light text-[var(--text-primary)] mb-2">Active Repair</h2>
                              <div className="flex items-center gap-3">
                                <span className="text-lg text-[var(--text-secondary)] font-medium">Honda City</span>
                                <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-surface-hover)] px-2 py-1 rounded border border-[var(--border-default)]">GJ01AB1234</span>
                              </div>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-surface-hover)] flex items-center justify-center border border-[var(--border-default)] shadow-inner">
                              <Car size={32} className="text-[#35D07F]" />
                            </div>
                          </div>

                          <div className="mb-10">
                            <div className="flex justify-between items-end mb-3">
                              <span className="text-sm font-bold text-[#35D07F] uppercase tracking-widest flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#35D07F] opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#35D07F]"></span>
                                </span>
                                Repair In Progress
                              </span>
                              <span className="text-3xl font-light text-[var(--text-primary)]">70%</span>
                            </div>
                            <div className="w-full h-2 bg-[#161616] rounded-full overflow-hidden shadow-inner">
                              <motion.div initial={{ width: 0 }} animate={{ width: '70%' }} transition={{ duration: 1.5, ease: 'easeOut' }} className="h-full bg-[#35D07F] rounded-full shadow-[0_0_15px_rgba(53,208,127,0.5)]"></motion.div>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mt-4 flex items-center gap-2">
                              <Clock size={14} className="text-[var(--text-muted)]" />
                              Estimated completion: <span className="text-[var(--text-primary)] font-medium">Today • 5:30 PM</span>
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {[
                            { step: 'Inspection', status: 'done' },
                            { step: 'Diagnosis', status: 'done' },
                            { step: 'Estimate', status: 'done' },
                            { step: 'Repair', status: 'active' },
                            { step: 'Quality', status: 'pending' },
                            { step: 'Pickup', status: 'pending' },
                          ].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2">
                              <div className={'w-full h-1 rounded-full ' + (item.status === 'done' ? 'bg-[#35D07F]' : item.status === 'active' ? 'bg-[#35D07F] shadow-[0_0_10px_rgba(53,208,127,0.5)] animate-pulse' : 'bg-[#242424]')}></div>
                              <span className={'text-[9px] font-bold uppercase tracking-widest text-center ' + (item.status === 'done' ? 'text-[var(--text-secondary)]' : item.status === 'active' ? 'text-[#35D07F]' : 'text-slate-600')}>{item.step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Overview & Health */}
                    <div className="flex flex-col gap-6">
                      <div className="bg-[#101010] border border-[#242424] rounded-[24px] p-6 shadow-xl flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">My Vehicle</h3>
                          <button className="text-[10px] text-[#35D07F] font-bold uppercase tracking-widest hover:underline">View All</button>
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 rounded-xl bg-[var(--bg-surface-hover)] overflow-hidden flex items-center justify-center">
                            <Car size={32} className="text-slate-600" />
                          </div>
                          <div>
                            <h4 className="text-lg text-[var(--text-primary)] font-medium">Honda City</h4>
                            <p className="text-xs text-[var(--text-muted)]">2022 • Petrol • Automatic</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-[#161616] rounded-xl p-3 border border-[#242424]">
                            <span className="block text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Mileage</span>
                            <span className="text-sm text-[var(--text-primary)] font-mono">42,850 km</span>
                          </div>
                          <div className="bg-[#161616] rounded-xl p-3 border border-[#242424]">
                            <span className="block text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Next Service</span>
                            <span className="text-sm text-[var(--text-primary)]">12 Feb 2027</span>
                          </div>
                        </div>
                        <div className="mt-auto flex gap-3">
                          <button className="flex-1 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors border border-[var(--border-subtle)]">Details</button>
                          <button className="flex-1 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors border border-[var(--border-subtle)]">History</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MIDDLE ROW: TRANSPARENCY & UPDATES */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* Repair Transparency Timeline */}
                    <div className="xl:col-span-2 bg-[#101010] border border-[#242424] rounded-[24px] p-8 shadow-xl">
                      <div className="flex justify-between items-center mb-8">
                        <div>
                          <h3 className="text-xl font-light text-[var(--text-primary)]">Repair Transparency</h3>
                          <p className="text-xs text-[var(--text-muted)] mt-1">Live updates from the workshop floor</p>
                        </div>
                        <Activity size={24} className="text-slate-600" />
                      </div>

                      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px before:h-full before:w-px before:bg-gradient-to-b before:from-[#35D07F] before:via-white/10 before:to-transparent">
                        
                        <div className="relative flex gap-6 group">
                          <div className="w-8 h-8 rounded-full bg-[#161616] border border-[#35D07F] text-[#35D07F] flex items-center justify-center shrink-0 z-10 shadow-[0_0_10px_rgba(53,208,127,0.2)]">
                            <Wrench size={14} className="animate-pulse" />
                          </div>
                          <div className="pt-1.5 flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-bold text-[var(--text-primary)]">Brake Replacement In Progress</span>
                              <span className="text-[10px] font-mono text-[#35D07F] bg-[#35D07F]/10 px-2 py-1 rounded">02:00 PM</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)]">Technician Vikram is currently replacing the front brake pads.</p>
                          </div>
                        </div>

                        <div className="relative flex gap-6">
                          <div className="w-8 h-8 rounded-full bg-[#35D07F] text-black flex items-center justify-center shrink-0 z-10">
                            <CheckCircle2 size={14} />
                          </div>
                          <div className="pt-1.5 flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-bold text-[var(--text-primary)]">Estimate Approved</span>
                              <span className="text-[10px] font-mono text-[var(--text-muted)]">12:30 PM</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)]">You approved the repair estimate of ₹8,450.</p>
                          </div>
                        </div>

                        <div className="relative flex gap-6">
                          <div className="w-8 h-8 rounded-full bg-[#161616] border border-amber-500/50 text-amber-400 flex items-center justify-center shrink-0 z-10">
                            <AlertTriangle size={14} />
                          </div>
                          <div className="pt-1.5 flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-bold text-[var(--text-primary)]">Brake Pad Issue Detected</span>
                              <span className="text-[10px] font-mono text-[var(--text-muted)]">10:15 AM</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mb-3">Front brake pads are worn down to 1.2mm.</p>
                            <button onClick={() => setIsEvidenceOpen(true)} className="inline-flex items-center gap-2 bg-[#161616] border border-[#242424] hover:border-amber-500/50 transition-colors px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-amber-400">
                              <Camera size={14} /> View 3 Photos
                            </button>
                          </div>
                        </div>

                        <div className="relative flex gap-6">
                          <div className="w-8 h-8 rounded-full bg-[#161616] border border-[#242424] text-[var(--text-muted)] flex items-center justify-center shrink-0 z-10">
                            <FileSearch size={14} />
                          </div>
                          <div className="pt-1.5 flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-bold text-[var(--text-secondary)]">Vehicle Inspection Completed</span>
                              <span className="text-[10px] font-mono text-[var(--text-muted)]">09:30 AM</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Right Column: Updates & Health */}
                    <div className="space-y-6">
                      
                      <div className="bg-[#101010] border border-amber-500/30 rounded-[24px] p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl"></div>
                        <div className="flex items-start gap-4 relative z-10">
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                            <FileSignature size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm text-[var(--text-primary)] font-bold mb-1">Estimate Approval</h4>
                            <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">Please review the estimate for brake pad replacement.</p>
                            <button onClick={() => setIsApprovalOpen(true)} className="bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                              Review Estimate
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#101010] border border-[#242424] rounded-[24px] p-6 shadow-xl">
                         <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6">Vehicle Health</h3>
                         <div className="space-y-4">
                           {[
                             { name: 'Engine', status: 'Good', color: 'text-[#35D07F]', dot: 'bg-[#35D07F]' },
                             { name: 'Brakes', status: 'Attention', color: 'text-amber-400', dot: 'bg-amber-400' },
                             { name: 'Battery', status: 'Good', color: 'text-[#35D07F]', dot: 'bg-[#35D07F]' },
                             { name: 'Tyres', status: 'Good', color: 'text-[#35D07F]', dot: 'bg-[#35D07F]' },
                           ].map(sys => (
                             <div key={sys.name} className="flex justify-between items-center bg-[#161616] p-3 rounded-xl border border-[#242424]">
                               <span className="text-sm text-[var(--text-primary)] font-medium">{sys.name}</span>
                               <div className="flex items-center gap-2">
                                 <div className={'w-2 h-2 rounded-full ' + sys.dot}></div>
                                 <span className={'text-[10px] font-bold uppercase tracking-widest ' + sys.color}>{sys.status}</span>
                               </div>
                             </div>
                           ))}
                         </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="bg-[#101010] border border-[#242424] rounded-[24px] p-6 shadow-xl">
                        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <button className="bg-[#35D07F]/10 hover:bg-[#35D07F]/20 text-[#35D07F] border border-[#35D07F]/20 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                            <Calendar size={18} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Book Service</span>
                          </button>
                          <button className="bg-[#161616] hover:bg-[var(--bg-surface-hover)] border border-[#242424] text-[var(--text-secondary)] p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                            <FileText size={18} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Invoices</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-t border-[var(--border-subtle)] h-20 px-6 flex justify-between items-center z-40 pb-safe">
        {[
          { id: 'dashboard', icon: Car, label: 'Home' },
          { id: 'history', icon: FileText, label: 'History' },
          { id: 'repair', icon: Wrench, label: 'Service' },
          { id: 'profile', icon: User, label: 'Profile' },
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={'flex flex-col items-center gap-1.5 transition-colors ' + (activeTab === item.id ? 'text-[#35D07F]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]')}
          >
            <item.icon size={22} className={activeTab === item.id ? 'drop-shadow-[0_0_8px_rgba(53,208,127,0.5)]' : ''} />
            <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* MODALS */}
      <AnimatePresence>
        {isApprovalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm z-[100]" onClick={() => setIsApprovalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed bottom-0 md:bottom-auto md:top-1/2 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 bg-[#101010] border border-[#242424] rounded-t-[32px] md:rounded-[32px] z-[101] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] w-full max-w-xl mx-auto"
            >
              <div className="w-12 h-1 bg-[var(--bg-surface-active)] rounded-full mx-auto mb-8 md:hidden"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-light text-[var(--text-primary)] mb-1">Estimate Approval</h2>
                  <p className="text-sm text-[var(--text-muted)]">Brake Pad Replacement</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <FileSignature size={24} />
                </div>
              </div>

              <div className="bg-[#161616] border border-[#242424] rounded-2xl p-6 font-mono text-sm space-y-4 mb-8">
                <div className="flex justify-between text-[var(--text-secondary)]"><span>Parts (OEM Front Pads)</span><span>₹5,500</span></div>
                <div className="flex justify-between text-[var(--text-secondary)]"><span>Labor (1.5 hrs)</span><span>₹2,000</span></div>
                <div className="flex justify-between text-[var(--text-secondary)]"><span>Taxes</span><span>₹950</span></div>
                <div className="h-px bg-[var(--bg-surface-active)] my-4"></div>
                <div className="flex justify-between text-amber-400 font-bold text-xl"><span>Total</span><span>₹8,450</span></div>
              </div>

              <p className="text-xs text-[var(--text-muted)] mb-8 leading-relaxed">
                By approving this estimate, you authorize RepairTrace to proceed with the specified repair work. Additional issues found during repair will require separate approval.
              </p>

              <div className="flex gap-4">
                <button onClick={() => setIsApprovalOpen(false)} className="flex-1 bg-[#161616] hover:bg-[#242424] border border-[#242424] text-[var(--text-primary)] py-4 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors">Reject / Discuss</button>
                <button onClick={() => { alert('Repair Approved!'); setIsApprovalOpen(false); }} className="flex-[2] bg-[#35D07F] hover:bg-[#2EB86F] text-black py-4 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors shadow-[0_0_20px_rgba(53,208,127,0.3)]">Approve Estimate</button>
              </div>
            </motion.div>
          </>
        )}

        {isEvidenceOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex flex-col" onClick={() => setIsEvidenceOpen(false)}>
              <div className="p-6 flex justify-between items-center text-[var(--text-primary)]">
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-widest uppercase">Evidence Viewer</span>
                  <span className="text-xs text-[var(--text-muted)] mt-1">Brake Pad Issue • 10:15 AM</span>
                </div>
                <button onClick={() => setIsEvidenceOpen(false)} className="w-12 h-12 rounded-full bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] flex items-center justify-center transition-colors"><X size={24} /></button>
              </div>
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-4xl bg-zinc-900 aspect-video rounded-[32px] border border-[#242424] flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                   <Camera size={64} className="text-white/20 mb-6" />
                   <span className="text-xl font-light text-[var(--text-primary)]">Worn Brake Pad (1.2mm)</span>
                   <span className="text-sm text-[var(--text-muted)] font-mono mt-2">IMG_8842.JPG</span>
                   
                   <div className="absolute bottom-8 flex gap-3">
                     <div className="w-12 h-1.5 rounded-full bg-white"></div>
                     <div className="w-12 h-1.5 rounded-full bg-white/30 cursor-pointer hover:bg-[var(--bg-surface-hover)]0 transition-colors"></div>
                     <div className="w-12 h-1.5 rounded-full bg-white/30 cursor-pointer hover:bg-[var(--bg-surface-hover)]0 transition-colors"></div>
                   </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


