import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Search, Filter, Plus, ShieldAlert, FileText, ChevronRight, X, CalendarClock, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import ActiveRepairTracker from './components/ActiveRepairTracker';

export default function CustomerRepairs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const navigate = useNavigate();

  // Filter state
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Action Required', 'In Progress'
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRequestSubmit = async () => {
    try {
      await api.post('/customer/service-orders/', {
        type: 'repair_request',
        notes: 'Submitted via modal'
      });
      toast.success('Repair request submitted to the service team!', {
        style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
        iconTheme: { primary: '#35D07F', secondary: '#000' }
      });
      setShowRequestModal(false);
    } catch (error) {
      toast.error('Failed to submit request');
    }
  };

  const searchLower = searchQuery.toLowerCase();
  
  // Basic mock filtering logic for the static components based on search + filter
  const matchesTrackerSearch = searchLower === '' || 'toyota camry active repair tracker maintenance inspection in progress'.includes(searchLower);
  const matchesPendingSearch = searchLower === '' || 'ford f-150 f150 pending estimate diagnostic action required amber'.includes(searchLower);

  const showTracker = matchesTrackerSearch && (filterStatus === 'All' || filterStatus === 'In Progress');
  const showPending = matchesPendingSearch && (filterStatus === 'All' || filterStatus === 'Action Required');

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-white mb-2 flex items-center gap-3">
            <Wrench className="text-[#35D07F]" size={28} />
            Active Repairs
          </h1>
          <p className="text-slate-400 text-xs tracking-widest uppercase">
            Track the progress of your ongoing services and estimates.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH REPAIRS..." 
              className="pl-10 pr-4 py-2.5 bg-[#0A0A0B] border border-white/10 rounded-xl text-xs text-white uppercase tracking-widest focus:border-[#35D07F] outline-none transition-all w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative" ref={filterMenuRef}>
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center justify-center p-2.5 border rounded-xl transition-all ${
                showFilterMenu || filterStatus !== 'All' 
                  ? 'bg-white/10 border-white/30 text-white' 
                  : 'bg-[#0A0A0B] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Filter size={18} />
              {filterStatus !== 'All' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#35D07F]"></span>
              )}
            </button>

            <AnimatePresence>
              {showFilterMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-3 w-64 bg-[#111112] border border-white/10 rounded-xl shadow-2xl p-5 z-20"
                >
                  <h3 className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-4 flex items-center justify-between">
                    Filter by Status
                    {filterStatus !== 'All' && (
                      <span onClick={() => setFilterStatus('All')} className="text-[#35D07F] cursor-pointer hover:underline">Reset</span>
                    )}
                  </h3>
                  <div className="space-y-3">
                    {['All', 'Action Required', 'In Progress'].map(status => (
                      <label key={status} className="flex items-center gap-3 cursor-pointer group" onClick={() => setFilterStatus(status)}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          filterStatus === status ? 'border-[#35D07F] bg-[#35D07F]' : 'border-white/20 group-hover:border-[#35D07F]/50'
                        }`}>
                          {filterStatus === status && <Check size={12} className="text-black" />}
                        </div>
                        <span className={`text-xs tracking-wider transition-colors ${filterStatus === status ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-200'}`}>
                          {status}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setShowRequestModal(true)} 
            className="flex items-center gap-2 px-6 py-2.5 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(53,208,127,0.3)]"
          >
            <Plus size={16} /> New Request
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main Active Repair Tracker */}
        <div className="xl:col-span-2 space-y-6">
          {showTracker ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <ActiveRepairTracker loading={false} />
            </motion.div>
          ) : (
            <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
              <Wrench size={32} className="text-slate-500 mb-4" />
              <h3 className="text-white font-bold tracking-widest uppercase mb-2">No Active Repairs Match</h3>
              <p className="text-slate-500 text-xs tracking-widest uppercase">Try adjusting your search criteria or filter.</p>
            </div>
          )}

          {/* Past Repairs Prompt */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 group hover:bg-white/10 transition-all cursor-pointer" onClick={() => navigate('/customer/billing')}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-widest uppercase mb-1">Looking for past repairs?</h3>
                  <p className="text-slate-400 text-[10px] tracking-widest uppercase">View your complete service history in the Order History tab.</p>
                </div>
              </div>
              <button className="px-6 py-2.5 bg-[#111112] border border-white/10 text-white rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all flex items-center gap-2">
                View History <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Sidebar Column for Pending Estimates */}
        {showPending && (
          <div className="xl:col-span-1 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden h-full flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold tracking-widest text-white mb-1">2021 Ford F-150</h3>
                    <p className="text-slate-400 text-[9px] font-bold tracking-[0.15em] uppercase">Diagnostic Service</p>
                  </div>
                  <div className="px-2 py-1 border border-amber-500/30 bg-amber-500/10 text-amber-400 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                    <ShieldAlert size={12} /> Action Required
                  </div>
                </div>
                
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-6 flex-1">
                  <p className="text-slate-300 text-xs leading-relaxed mb-4">
                    The diagnostic scan revealed a misfire on cylinder 3. We recommend replacing the spark plugs and ignition coil. An estimate has been generated for your approval to proceed with repairs.
                  </p>
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Total Estimate</span>
                    <span className="text-white text-lg font-bold tracking-widest">₹12,400</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button onClick={() => navigate('/customer/support')} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    Review & Approve Estimate
                  </button>
                  <button onClick={() => navigate('/customer/support')} className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all">
                    Contact Advisor
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* New Request Modal Overlay */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => setShowRequestModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-[#0A0A0B] border border-white/10 p-8 rounded-2xl z-10 w-full max-w-lg shadow-2xl relative"
            >
              <button onClick={() => setShowRequestModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
              
              <h2 className="text-white text-xl font-bold tracking-widest uppercase mb-2 flex items-center gap-3">
                <CalendarClock className="text-[#35D07F]" size={24} /> New Service Request
              </h2>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-8">
                Submit a repair or maintenance request for your vehicle.
              </p>
              
              <div className="mb-5">
                <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 block">Select Vehicle</label>
                <div className="relative">
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-[#35D07F] transition-colors appearance-none cursor-pointer">
                    <option value="camry" className="bg-[#111112]">2019 Toyota Camry (ABC-1234)</option>
                    <option value="f150" className="bg-[#111112]">2021 Ford F-150 (XYZ-9876)</option>
                  </select>
                  <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none" />
                </div>
              </div>
              
              <div className="mb-5">
                <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 block">Describe the Issue</label>
                <textarea 
                  rows={4} 
                  placeholder="e.g. The brakes are squeaking when I stop, and the steering wheel vibrates..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-[#35D07F] transition-colors resize-none placeholder:text-slate-600"
                ></textarea>
              </div>
              
              <div className="mb-8">
                <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 block">Preferred Drop-off Date</label>
                <input 
                  type="date" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-slate-300 text-sm outline-none focus:border-[#35D07F] transition-colors [color-scheme:dark] cursor-pointer" 
                />
              </div>

              <button 
                onClick={handleRequestSubmit} 
                className="w-full py-4 bg-[#35D07F] hover:bg-[#2bb46c] text-black font-bold tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(53,208,127,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Submit Request
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

