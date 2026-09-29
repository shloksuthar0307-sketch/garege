import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, AlertTriangle, Camera, FileText, CheckCircle2, XCircle, ChevronRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_APPROVALS = [
  {
    id: 'EST-9921',
    vehicle: '2022 Porsche 911',
    serviceType: 'Brake Pad Replacement',
    issue: 'Front brake pads below recommended thickness (2mm remaining).',
    evidenceCount: 3,
    partsCost: 1500.00,
    laborCost: 1000.00,
    tax: 180.00,
    total: 2680.00,
    status: 'WAITING FOR YOUR APPROVAL',
    timestamp: '2 hours ago'
  },
  {
    id: 'EST-8804',
    vehicle: '2019 Toyota Camry',
    serviceType: 'Suspension Repair',
    issue: 'Front left strut leaking fluid. Requires immediate replacement to prevent further damage.',
    evidenceCount: 2,
    partsCost: 450.00,
    laborCost: 300.00,
    tax: 52.50,
    total: 802.50,
    status: 'WAITING FOR YOUR APPROVAL',
    timestamp: '1 day ago'
  }
];

export default function CustomerApprovals() {
  const [approvals, setApprovals] = useState(MOCK_APPROVALS);
  const [selectedEstimate, setSelectedEstimate] = useState<typeof MOCK_APPROVALS[0] | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleApprove = () => {
    if (!selectedEstimate) return;
    
    toast.success(`Estimate ${selectedEstimate.id} Approved Successfully`, {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
    
    setApprovals(prev => prev.filter(a => a.id !== selectedEstimate.id));
    setShowConfirm(false);
    setSelectedEstimate(null);
  };

  const handleDecline = () => {
    if (!selectedEstimate) return;
    
    toast('Estimate Declined. An advisor will contact you.', {
      icon: 'ℹ️',
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
    });
    
    setApprovals(prev => prev.filter(a => a.id !== selectedEstimate.id));
    setShowConfirm(false);
    setSelectedEstimate(null);
  };

  return (
    <div className="max-w-[1000px] mx-auto pb-10 min-h-[calc(100vh-140px)] flex flex-col relative">
      {/* Header */}
      <div className="mb-8 shrink-0">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-white mb-2 flex items-center gap-3">
            <CheckSquare className="text-[#35D07F]" size={28} />
            Pending Approvals
          </h1>
          <p className="text-slate-400 text-xs tracking-widest uppercase">
            {approvals.length} approval{approvals.length !== 1 ? 's' : ''} require your attention.
          </p>
        </motion.div>
      </div>

      {/* Approvals List */}
      <div className="flex-1 space-y-6">
        <AnimatePresence>
          {approvals.map((approval, index) => (
            <motion.div 
              key={approval.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.1 }}
              className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
              
              <div className="space-y-4 flex-1">
                <div>
                  <h2 className="text-xl font-bold tracking-widest text-white uppercase">{approval.vehicle}</h2>
                  <p className="text-[#35D07F] font-bold text-sm tracking-widest uppercase">{approval.serviceType}</p>
                </div>
                
                <div className="bg-[#111112] rounded-xl p-4 border border-white/5 space-y-3">
                  <div className="flex gap-3">
                    <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                    <div>
                      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block mb-1">Inspection Issue</span>
                      <p className="text-slate-300 text-sm">{approval.issue}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2 border-t border-white/5">
                    <Camera className="text-slate-400 shrink-0" size={18} />
                    <div>
                      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block mb-1">Evidence</span>
                      <p className="text-slate-300 text-xs font-bold tracking-widest">{approval.evidenceCount} photos attached</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-64 bg-black/40 rounded-xl border border-white/5 p-5 flex flex-col justify-between shrink-0">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Parts</span>
                    <span className="text-slate-300 text-[10px] font-mono tracking-wider">${approval.partsCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Labor</span>
                    <span className="text-slate-300 text-[10px] font-mono tracking-wider">${approval.laborCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-3">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Tax</span>
                    <span className="text-slate-300 text-[10px] font-mono tracking-wider">${approval.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-white text-xs font-bold uppercase tracking-widest">Total</span>
                    <span className="text-white text-sm font-bold font-mono tracking-wider">${approval.total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-center">
                    <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[9px] font-bold tracking-widest uppercase">
                      {approval.status}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedEstimate(approval)}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-bold tracking-widest uppercase border border-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <FileText size={14} /> Review Estimate
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {approvals.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/20">
              <Check size={28} />
            </div>
            <h3 className="text-white font-bold tracking-widest uppercase mb-2">No Pending Approvals</h3>
            <p className="text-slate-500 text-xs tracking-widest uppercase">You're all caught up. No estimates require your attention.</p>
          </motion.div>
        )}
      </div>

      {/* Review & Confirm Modal */}
      <AnimatePresence>
        {selectedEstimate && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0A0A0B] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl relative flex flex-col"
            >
              {!showConfirm ? (
                <>
                  <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0A0A0B]/90 backdrop-blur z-10">
                    <div>
                      <h3 className="text-lg font-bold tracking-widest text-white uppercase">Estimate Details</h3>
                      <p className="text-[#35D07F] text-[10px] font-bold tracking-widest uppercase">ID: {selectedEstimate.id}</p>
                    </div>
                    <button onClick={() => setSelectedEstimate(null)} className="text-slate-500 hover:text-white transition-colors">
                      <XCircle size={24} />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-8">
                    {/* Overview */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#111112] p-4 rounded-xl border border-white/5">
                        <span className="text-slate-500 text-[9px] font-bold tracking-widest uppercase block mb-1">Vehicle</span>
                        <span className="text-white text-sm font-bold tracking-widest uppercase">{selectedEstimate.vehicle}</span>
                      </div>
                      <div className="bg-[#111112] p-4 rounded-xl border border-white/5">
                        <span className="text-slate-500 text-[9px] font-bold tracking-widest uppercase block mb-1">Service</span>
                        <span className="text-white text-sm font-bold tracking-widest uppercase">{selectedEstimate.serviceType}</span>
                      </div>
                    </div>

                    {/* Inspection & Evidence */}
                    <div>
                      <h4 className="text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-amber-500" /> Inspection Findings
                      </h4>
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 mb-4">
                        <p className="text-slate-300 text-sm leading-relaxed">{selectedEstimate.issue}</p>
                      </div>
                      
                      <h4 className="text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2 mt-6">
                        <Camera size={14} className="text-[#35D07F]" /> Photographic Evidence
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].slice(0, selectedEstimate.evidenceCount).map(i => (
                          <div key={i} className="aspect-video bg-[#111112] rounded-lg border border-white/5 flex items-center justify-center text-slate-600 relative overflow-hidden group cursor-pointer">
                            <Camera size={24} />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-[9px] text-white font-bold tracking-widest uppercase">View</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Costs */}
                    <div>
                      <h4 className="text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                        <FileText size={14} className="text-[#35D07F]" /> Itemized Estimate
                      </h4>
                      <div className="bg-[#111112] border border-white/5 rounded-xl overflow-hidden">
                        <div className="flex justify-between p-4 border-b border-white/5">
                          <span className="text-slate-300 text-xs font-bold tracking-widest uppercase">Parts & Materials</span>
                          <span className="text-slate-300 text-xs font-mono">${selectedEstimate.partsCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between p-4 border-b border-white/5">
                          <span className="text-slate-300 text-xs font-bold tracking-widest uppercase">Labor</span>
                          <span className="text-slate-300 text-xs font-mono">${selectedEstimate.laborCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between p-4 border-b border-white/5 bg-black/20">
                          <span className="text-slate-500 text-xs font-bold tracking-widest uppercase">Taxes & Fees</span>
                          <span className="text-slate-500 text-xs font-mono">${selectedEstimate.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between p-5 bg-[#35D07F]/10">
                          <span className="text-[#35D07F] text-sm font-bold tracking-widest uppercase">Total Estimate</span>
                          <span className="text-[#35D07F] text-sm font-bold font-mono">${selectedEstimate.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 border-t border-white/5 bg-[#080808] flex gap-4 sticky bottom-0 z-10">
                    <button 
                      onClick={handleDecline}
                      className="flex-1 py-4 bg-white/5 hover:bg-rose-500/10 text-white hover:text-rose-400 rounded-xl text-xs font-bold tracking-widest uppercase transition-all"
                    >
                      Decline / Query
                    </button>
                    <button 
                      onClick={() => setShowConfirm(true)}
                      className="flex-1 py-4 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(53,208,127,0.3)]"
                    >
                      Approve Estimate
                    </button>
                  </div>
                </>
              ) : (
                /* CONFIRMATION DIALOG */
                <div className="p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                  <div className="w-20 h-20 rounded-full bg-[#35D07F]/20 flex items-center justify-center text-[#35D07F] mb-6">
                    <AlertTriangle size={40} />
                  </div>
                  <h3 className="text-2xl font-bold tracking-widest text-white uppercase mb-2">Confirm Approval</h3>
                  <p className="text-slate-400 text-sm mb-8 max-w-md">
                    You are authorizing the repair for <strong className="text-white">{selectedEstimate.serviceType}</strong> on your {selectedEstimate.vehicle}.
                  </p>
                  
                  <div className="bg-[#111112] border border-[#35D07F]/30 rounded-xl p-6 mb-10 w-full max-w-xs mx-auto shadow-[0_0_20px_rgba(53,208,127,0.1)]">
                    <span className="text-slate-500 text-[10px] font-bold tracking-widest uppercase block mb-1">Authorized Total</span>
                    <span className="text-[#35D07F] text-3xl font-bold font-mono tracking-wider">${selectedEstimate.total.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-4 w-full">
                    <button 
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleApprove}
                      className="flex-1 py-4 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(53,208,127,0.3)] flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} /> Confirm Approval
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

