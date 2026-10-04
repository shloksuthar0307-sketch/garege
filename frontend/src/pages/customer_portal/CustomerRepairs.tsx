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
  }, []);  const [vehicles, setVehicles] = useState<any[]>([]);
  const [pendingEstimates, setPendingEstimates] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [issue, setIssue] = useState('');
  const [dropOffDate, setDropOffDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.get('/customer/vehicles/').then(res => {
      const v = res.data?.results || res.data || [];
      setVehicles(v);
      if (v.length > 0) setSelectedVehicle(v[0].id);
    }).catch(console.error);

    api.get('/customer/service-orders/').then(res => {
      const orders = res.data?.results || res.data || [];
      const pending = orders.filter((o: any) => o.status === 'AWAITING_APPROVAL' || o.status === 'DIAGNOSIS');
      setPendingEstimates(pending);
    }).catch(console.error);
  }, []);  const handleApproveEstimate = async (orderId: string) => {
    try {
      await api.patch(`/customer/service-orders/${orderId}/`, { status: 'IN_WORKSHOP' });
      toast.success('Estimate approved! The team will begin work shortly.', {
        style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(245,158,11,0.2)' },
        iconTheme: { primary: '#f59e0b', secondary: '#000' }
      });
      // Refresh pending estimates
      api.get('/customer/service-orders/').then(res => {
        const orders = res.data?.results || res.data || [];
        setPendingEstimates(orders.filter((o: any) => o.status === 'AWAITING_APPROVAL' || o.status === 'DIAGNOSIS'));
      });
    } catch (error) {
      toast.error('Failed to approve estimate');
    }
  };

  const handleRequestSubmit = async () => {
    if (!selectedVehicle || !issue) {
      toast.error('Please select a vehicle and describe the issue');
      return;
    }
    try {
      setIsSubmitting(true);
      await api.post('/customer/service-orders/', {
        vehicle: selectedVehicle,
        title: issue.substring(0, 50),
        type: 'REPAIR',
        status: 'PENDING'
      });
      toast.success('Repair request submitted to the service team!', {
        style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
        iconTheme: { primary: '#35D07F', secondary: '#000' }
      });
      setShowRequestModal(false);
      setIssue('');
    } catch (error) {
      toast.error('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const searchLower = searchQuery.toLowerCase();
  
  // Basic mock filtering logic for the static components based on search + filter
  const matchesTrackerSearch = searchLower === '' || 'toyota camry active repair tracker maintenance inspection in progress'.includes(searchLower);
  const matchesPendingSearch = searchLower === '' || 'Vehicle f150 pending estimate diagnostic action required amber'.includes(searchLower);

  const showTracker = matchesTrackerSearch && (filterStatus === 'All' || filterStatus === 'In Progress');
  const showPending = matchesPendingSearch && (filterStatus === 'All' || filterStatus === 'Action Required');

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <Wrench className="text-[#35D07F]" size={28} />
            Active Repairs
          </h1>
          <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">
            Track the progress of your ongoing services and estimates.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH REPAIRS..." 
              className="pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] uppercase tracking-widest focus:border-[#35D07F] outline-none transition-all w-64"
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
                  ? 'bg-[var(--bg-surface-active)] border-white/30 text-[var(--text-primary)]' 
                  : 'bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
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
                  className="absolute right-0 top-full mt-3 w-64 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl shadow-2xl p-5 z-20"
                >
                  <h3 className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-4 flex items-center justify-between">
                    Filter by Status
                    {filterStatus !== 'All' && (
                      <span onClick={() => setFilterStatus('All')} className="text-[#35D07F] cursor-pointer hover:underline">Reset</span>
                    )}
                  </h3>
                  <div className="space-y-3">
                    {['All', 'Action Required', 'In Progress'].map(status => (
                      <label key={status} className="flex items-center gap-3 cursor-pointer group" onClick={() => setFilterStatus(status)}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          filterStatus === status ? 'border-[#35D07F] bg-[#35D07F]' : 'border-[var(--border-strong)] group-hover:border-[#35D07F]/50'
                        }`}>
                          {filterStatus === status && <Check size={12} className="text-black" />}
                        </div>
                        <span className={`text-xs tracking-wider transition-colors ${filterStatus === status ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'}`}>
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
            <div className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl p-10 flex flex-col items-center justify-center text-center">
              <Wrench size={32} className="text-[var(--text-muted)] mb-4" />
              <h3 className="text-[var(--text-primary)] font-bold tracking-widest uppercase mb-2">No Active Repairs Match</h3>
              <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">Try adjusting your search criteria or filter.</p>
            </div>
          )}

          {/* Past Repairs Prompt */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 group hover:bg-[var(--bg-surface-active)] transition-all cursor-pointer" onClick={() => navigate('/customer/billing')}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--bg-surface-hover)] rounded-full flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-[var(--text-primary)] font-bold tracking-widest uppercase mb-1">Looking for past repairs?</h3>
                  <p className="text-[var(--text-muted)] text-[10px] tracking-widest uppercase">View your complete service history in the Order History tab.</p>
                </div>
              </div>
              <button className="px-6 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all flex items-center gap-2">
                View History <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>

                {/* Sidebar Column for Pending Estimates */}
        {showPending && (
          <div className="xl:col-span-1 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              {pendingEstimates.length === 0 ? (
                <div className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl p-6 text-center text-[var(--text-muted)] text-xs font-bold tracking-widest uppercase">
                  No action required.
                </div>
              ) : (
                pendingEstimates.map(est => (
                  <div key={est.id} className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden h-full flex flex-col mb-4">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
                    
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-lg font-bold tracking-widest text-[var(--text-primary)] mb-1">{est.vehicle ? (est.vehicle.year + ' ' + est.vehicle.make + ' ' + est.vehicle.model) : 'Unknown Vehicle'}</h3>
                        <p className="text-[var(--text-muted)] text-[9px] font-bold tracking-[0.15em] uppercase">{est.type || 'Diagnostic Service'}</p>
                      </div>
                      <div className="px-2 py-1 border border-amber-500/30 bg-amber-500/10 text-amber-400 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                        <ShieldAlert size={12} /> Action Required
                      </div>
                    </div>
                    
                    <div className="bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-xl p-4 mb-6 flex-1">
                      <p className="text-[var(--text-secondary)] text-xs leading-relaxed mb-4">
                        {est.title || 'Diagnostic scan completed. Estimate generated for your approval.'}
                      </p>
                      <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-between items-center">
                        <span className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest font-bold">Total Estimate</span>
                        <span className="text-[var(--text-primary)] text-lg font-bold tracking-widest">?{est.total_cost || '0'}</span>
                      </div>
                    </div>
                    
                                        <div className="flex flex-col gap-3">
                      <button onClick={() => handleApproveEstimate(est.id)} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                        Review & Approve Estimate
                      </button>
                      <button onClick={() => navigate('/customer/support')} className="w-full py-3 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all">
                        Contact Advisor
                      </button>
                    </div>
                  </div>
                ))
              )}
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
              className="absolute inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm" 
              onClick={() => setShowRequestModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-[var(--bg-primary)] border border-[var(--border-default)] p-8 rounded-2xl z-10 w-full max-w-lg shadow-2xl relative"
            >
              <button onClick={() => setShowRequestModal(false)} className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <X size={20} />
              </button>
              
              <h2 className="text-[var(--text-primary)] text-xl font-bold tracking-widest uppercase mb-2 flex items-center gap-3">
                <CalendarClock className="text-[#35D07F]" size={24} /> New Service Request
              </h2>
              <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest mb-8">
                Submit a repair or maintenance request for your vehicle.
              </p>
              
              <div className="mb-5">
                <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-2 block">Select Vehicle</label>
                <div className="relative">
                  <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3.5 text-[var(--text-primary)] text-sm outline-none focus:border-[#35D07F] transition-colors appearance-none cursor-pointer">{vehicles.length === 0 && <option value="" disabled className="bg-[var(--bg-secondary)]">No vehicles found</option>}{vehicles.map(v => (<option key={v.id} value={v.id} className="bg-[var(--bg-secondary)]">{v.year} {v.make} {v.model}</option>))}</select>
                  <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] rotate-90 pointer-events-none" />
                </div>
              </div>
              
              <div className="mb-5">
                <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-2 block">Describe the Issue</label>
                <textarea rows={4} value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="e.g. The brakes are squeaking when I stop, and the steering wheel vibrates..." className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3.5 text-[var(--text-primary)] text-sm outline-none focus:border-[#35D07F] transition-colors resize-none placeholder:text-slate-600"></textarea>
              </div>
              
              <div className="mb-8">
                <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-2 block">Preferred Drop-off Date</label>
                <input type="date" value={dropOffDate} onChange={(e) => setDropOffDate(e.target.value)} className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3.5 text-[var(--text-secondary)] text-sm outline-none focus:border-[#35D07F] transition-colors [color-scheme:dark] cursor-pointer" />
              </div>

              <button 
                onClick={handleRequestSubmit} 
                className="w-full py-4 bg-[#35D07F] hover:bg-[#2bb46c] text-black font-bold tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(53,208,127,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> {isSubmitting ? "Submitting..." : "Submit Request"}</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}













