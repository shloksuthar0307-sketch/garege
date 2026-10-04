import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';
import { CheckSquare, AlertTriangle, Camera, FileText, CheckCircle2, XCircle, ChevronRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../../api/customer';

export default function CustomerApprovals() {
  const queryClient = useQueryClient();
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: rawEstimates = [], isLoading: loading } = useQuery({
    queryKey: ['customer-estimates'],
    queryFn: customerApi.getEstimates,
  });

  const approvals = rawEstimates.filter((e: any) => e.status === 'SENT' || e.status === 'VIEWED').map((o: any) => ({
    id: o.id,
    vehicle: o.service_order_details?.vehicle_details ? `${o.service_order_details.vehicle_details.make} ${o.service_order_details.vehicle_details.model}` : 'Unknown Vehicle',
    serviceType: o.service_order_details?.type || 'General Service',
    issue: o.service_order_details?.title || 'Diagnostic complete',
    evidenceCount: 0,
    partsCost: parseFloat(o.items?.reduce((acc: number, item: any) => acc + (item.type === 'PART' ? parseFloat(item.total_price) : 0), 0) || '0'),
    laborCost: parseFloat(o.items?.reduce((acc: number, item: any) => acc + (item.type === 'LABOR' ? parseFloat(item.total_price) : 0), 0) || '0'),
    tax: parseFloat(o.tax || '0'),
    total: parseFloat(o.total || '0'),
    status: o.status
  }));

  const approveMutation = useMutation({
    mutationFn: customerApi.approveEstimate,
    onSuccess: () => {
      toast.success('Estimate Approved Successfully', {
        style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
        iconTheme: { primary: '#35D07F', secondary: '#000' }
      });
      queryClient.invalidateQueries({ queryKey: ['customer-estimates'] });
      setShowConfirm(false);
      setSelectedEstimate(null);
    },
    onError: () => toast.error('Failed to approve estimate')
  });

  const declineMutation = useMutation({
    mutationFn: customerApi.declineEstimate,
    onSuccess: () => {
      toast('Estimate Declined. An advisor will contact you.', {
        icon: 'ℹ️',
        style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      });
      queryClient.invalidateQueries({ queryKey: ['customer-estimates'] });
      setShowConfirm(false);
      setSelectedEstimate(null);
    },
    onError: () => toast.error('Failed to decline estimate')
  });

  const handleApprove = () => {
    if (selectedEstimate) approveMutation.mutate(selectedEstimate.id);
  };

  const handleDecline = () => {
    if (selectedEstimate) declineMutation.mutate(selectedEstimate.id);
  };

  return (
    <div className="max-w-[1000px] mx-auto pb-10 min-h-[calc(100vh-140px)] flex flex-col relative">
      {/* Header */}
      <div className="mb-8 shrink-0">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <CheckSquare className="text-[#35D07F]" size={28} />
            Pending Approvals
          </h1>
          <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">
            {approvals.length} approval{approvals.length !== 1 ? 's' : ''} require your attention.
          </p>
        </motion.div>
      </div>

      {/* Approvals List */}
      <div className="flex-1 space-y-6">
        <AnimatePresence>
          {approvals.length === 0 ? <div className="p-16 text-center text-[var(--text-muted)] uppercase tracking-widest text-xs font-bold bg-[var(--bg-primary)]/80 rounded-2xl border border-[var(--border-subtle)] col-span-full">No pending approvals found.</div> : approvals.map((approval, index) => (
            <motion.div 
              key={approval.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.1 }}
              className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
              
              <div className="space-y-4 flex-1">
                <div>
                  <h2 className="text-xl font-bold tracking-widest text-[var(--text-primary)] uppercase">{approval.vehicle}</h2>
                  <p className="text-[#35D07F] font-bold text-sm tracking-widest uppercase">{approval.serviceType}</p>
                </div>
                
                <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-subtle)] space-y-3">
                  <div className="flex gap-3">
                    <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                    <div>
                      <span className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest block mb-1">Inspection Issue</span>
                      <p className="text-[var(--text-secondary)] text-sm">{approval.issue}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2 border-t border-[var(--border-subtle)]">
                    <Camera className="text-[var(--text-muted)] shrink-0" size={18} />
                    <div>
                      <span className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest block mb-1">Evidence</span>
                      <p className="text-[var(--text-secondary)] text-xs font-bold tracking-widest">{approval.evidenceCount} photos attached</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-64 bg-[var(--bg-input)] rounded-xl border border-[var(--border-subtle)] p-5 flex flex-col justify-between shrink-0">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">Parts</span>
                    <span className="text-[var(--text-secondary)] text-[10px] font-mono tracking-wider">${approval.partsCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">Labor</span>
                    <span className="text-[var(--text-secondary)] text-[10px] font-mono tracking-wider">${approval.laborCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--border-default)] pb-3">
                    <span className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">Tax</span>
                    <span className="text-[var(--text-secondary)] text-[10px] font-mono tracking-wider">${approval.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-[var(--text-primary)] text-xs font-bold uppercase tracking-widest">Total</span>
                    <span className="text-[var(--text-primary)] text-sm font-bold font-mono tracking-wider">${approval.total.toFixed(2)}</span>
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
                    className="w-full py-3 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] rounded-lg text-[10px] font-bold tracking-widest uppercase border border-[var(--border-default)] transition-all flex items-center justify-center gap-2"
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
            <h3 className="text-[var(--text-primary)] font-bold tracking-widest uppercase mb-2">No Pending Approvals</h3>
            <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">You're all caught up. No estimates require your attention.</p>
          </motion.div>
        )}
      </div>

      {/* Review & Confirm Modal */}
      <AnimatePresence>
        {selectedEstimate && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[var(--bg-overlay)] backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl relative flex flex-col"
            >
              {!showConfirm ? (
                <>
                  <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center sticky top-0 bg-[var(--bg-primary)]/90 backdrop-blur z-10">
                    <div>
                      <h3 className="text-lg font-bold tracking-widest text-[var(--text-primary)] uppercase">Estimate Details</h3>
                      <p className="text-[#35D07F] text-[10px] font-bold tracking-widest uppercase">ID: {selectedEstimate.id}</p>
                    </div>
                    <button onClick={() => setSelectedEstimate(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                      <XCircle size={24} />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-8">
                    {/* Overview */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-subtle)]">
                        <span className="text-[var(--text-muted)] text-[9px] font-bold tracking-widest uppercase block mb-1">Vehicle</span>
                        <span className="text-[var(--text-primary)] text-sm font-bold tracking-widest uppercase">{selectedEstimate.vehicle}</span>
                      </div>
                      <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-subtle)]">
                        <span className="text-[var(--text-muted)] text-[9px] font-bold tracking-widest uppercase block mb-1">Service</span>
                        <span className="text-[var(--text-primary)] text-sm font-bold tracking-widest uppercase">{selectedEstimate.serviceType}</span>
                      </div>
                    </div>

                    {/* Inspection & Evidence */}
                    <div>
                      <h4 className="text-[var(--text-muted)] text-[10px] font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-amber-500" /> Inspection Findings
                      </h4>
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 mb-4">
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{selectedEstimate.issue}</p>
                      </div>
                      
                      <h4 className="text-[var(--text-muted)] text-[10px] font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2 mt-6">
                        <Camera size={14} className="text-[#35D07F]" /> Photographic Evidence
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].slice(0, selectedEstimate.evidenceCount).map(i => (
                          <div key={i} className="aspect-video bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)] flex items-center justify-center text-slate-600 relative overflow-hidden group cursor-pointer">
                            <Camera size={24} />
                            <div className="absolute inset-0 bg-[var(--bg-input)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-[9px] text-[var(--text-primary)] font-bold tracking-widest uppercase">View</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Costs */}
                    <div>
                      <h4 className="text-[var(--text-muted)] text-[10px] font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                        <FileText size={14} className="text-[#35D07F]" /> Itemized Estimate
                      </h4>
                      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                        <div className="flex justify-between p-4 border-b border-[var(--border-subtle)]">
                          <span className="text-[var(--text-secondary)] text-xs font-bold tracking-widest uppercase">Parts & Materials</span>
                          <span className="text-[var(--text-secondary)] text-xs font-mono">${selectedEstimate.partsCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between p-4 border-b border-[var(--border-subtle)]">
                          <span className="text-[var(--text-secondary)] text-xs font-bold tracking-widest uppercase">Labor</span>
                          <span className="text-[var(--text-secondary)] text-xs font-mono">${selectedEstimate.laborCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between p-4 border-b border-[var(--border-subtle)] bg-black/20">
                          <span className="text-[var(--text-muted)] text-xs font-bold tracking-widest uppercase">Taxes & Fees</span>
                          <span className="text-[var(--text-muted)] text-xs font-mono">${selectedEstimate.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between p-5 bg-[#35D07F]/10">
                          <span className="text-[#35D07F] text-sm font-bold tracking-widest uppercase">Total Estimate</span>
                          <span className="text-[#35D07F] text-sm font-bold font-mono">${selectedEstimate.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 border-t border-[var(--border-subtle)] bg-[#080808] flex gap-4 sticky bottom-0 z-10">
                    <button 
                      onClick={handleDecline}
                      className="flex-1 py-4 bg-[var(--bg-surface-hover)] hover:bg-rose-500/10 text-[var(--text-primary)] hover:text-rose-400 rounded-xl text-xs font-bold tracking-widest uppercase transition-all"
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
                  <h3 className="text-2xl font-bold tracking-widest text-[var(--text-primary)] uppercase mb-2">Confirm Approval</h3>
                  <p className="text-[var(--text-muted)] text-sm mb-8 max-w-md">
                    You are authorizing the repair for <strong className="text-[var(--text-primary)]">{selectedEstimate.serviceType}</strong> on your {selectedEstimate.vehicle}.
                  </p>
                  
                  <div className="bg-[var(--bg-secondary)] border border-[#35D07F]/30 rounded-xl p-6 mb-10 w-full max-w-xs mx-auto shadow-[0_0_20px_rgba(53,208,127,0.1)]">
                    <span className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase block mb-1">Authorized Total</span>
                    <span className="text-[#35D07F] text-3xl font-bold font-mono tracking-wider">${selectedEstimate.total.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-4 w-full">
                    <button 
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 py-4 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] rounded-xl text-xs font-bold tracking-widest uppercase transition-all"
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




