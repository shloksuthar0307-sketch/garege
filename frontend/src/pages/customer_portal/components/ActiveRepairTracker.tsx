import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, FileSignature, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import toast from 'react-hot-toast';

const STEPS = ['Intake', 'Diagnosis', 'Approval', 'In Progress', 'Quality Check', 'Ready'];
const CURRENT_STEP = 2; // In Progress

export default function ActiveRepairTracker({ loading, activeService }: { loading: boolean, activeService?: any }) {
  const navigate = useNavigate();
  const [showNotes, setShowNotes] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await api.patch(`/customer/service-orders/${activeService.id}/`, { status: 'APPROVED' });
      toast.success('Invoice request approved! Work will begin shortly.');
    } catch (e) {
      toast.error('Failed to approve request');
    } finally {
      setIsApproving(false);
    }
  };

  if (loading) return <div className="h-[300px] bg-[var(--bg-primary)]/80 rounded-2xl border border-[var(--border-subtle)] animate-pulse"></div>;

  if (!activeService) {
    return (
      <div className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-[var(--bg-surface-hover)] rounded-2xl flex items-center justify-center text-[var(--text-muted)] mb-4 border border-[var(--border-default)]">
          <Car size={32} />
        </div>
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--text-primary)] mb-2">No Active Repairs</h2>
        <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest">Your vehicles are good to go.</p>
      </div>
    );
  }

    // Determine step based on status
  let currentStep = 0;
  if (['DIAGNOSIS'].includes(activeService.status)) currentStep = 1;
  if (['AWAITING_APPROVAL'].includes(activeService.status)) currentStep = 2;
  if (['APPROVED', 'AWAITING_PARTS', 'IN_WORKSHOP'].includes(activeService.status)) currentStep = 3;
  if (activeService.status === 'QUALITY_CHECK') currentStep = 4;
  if (activeService.status === 'READY_FOR_PICKUP') currentStep = 5;

  const vDetails = activeService.vehicle_details || activeService.vehicle || {};
  const vehicleName = vDetails.make ? `${vDetails.year || ''} ${vDetails.make || ''} ${vDetails.model || ''}`.trim() : 'Unknown Vehicle';
  const vehiclePlate = vDetails.registration_number || vDetails.license_plate || 'No Plate';

  return (
    <div className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl p-6 relative overflow-hidden h-full flex flex-col justify-between">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#35D07F] to-transparent opacity-50"></div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--text-primary)] mb-4">Active Repair Progress</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[var(--bg-surface-hover)] rounded-2xl flex items-center justify-center text-[var(--text-primary)] border border-[var(--border-default)] shrink-0">
              <Car size={32} className="text-[#35D07F]" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-widest text-[var(--text-primary)]">{vehicleName}</h3>
              <p className="text-[var(--text-muted)] text-[10px] font-bold tracking-[0.15em] uppercase mt-1">Plate: {vehiclePlate} • {activeService.title || 'General Service'}</p>
            </div>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-1">Est. Completion</p>
          <p className="text-[#35D07F] text-sm font-bold tracking-widest uppercase">
            {activeService.date_completed ? new Date(activeService.date_completed).toLocaleDateString() : 'Pending'}
          </p>
        </div>
      </div>

      {/* Progress Bar Container - horizontally scrollable on mobile */}
      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="relative mb-8 mt-4 min-w-[500px]">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-[var(--bg-surface-active)] -translate-y-1/2 rounded-full"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-[#35D07F] -translate-y-1/2 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(53,208,127,0.5)]" style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}></div>
          
          <div className="relative flex justify-between">
            {STEPS.map((step, idx) => {
              const isCompleted = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={step} className="flex flex-col items-center relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all z-10 ${
                    isCompleted ? 'bg-[#35D07F] border-[#35D07F] text-black shadow-[0_0_10px_rgba(53,208,127,0.5)]' : 
                    isCurrent ? 'bg-[var(--bg-secondary)] border-[#35D07F] shadow-[0_0_15px_rgba(53,208,127,0.5)]' : 
                    'bg-[var(--bg-secondary)] border-[var(--border-strong)]'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-black' : isCurrent ? 'bg-[#35D07F] animate-pulse' : 'bg-transparent'}`}></div>
                  </div>
                  <span className={`absolute top-8 text-[9px] font-bold uppercase tracking-widest text-center w-24 left-1/2 -translate-x-1/2 ${
                    isCompleted || isCurrent ? 'text-[var(--text-primary)]' : 'text-slate-600'
                  }`}>{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-6 border-t border-[var(--border-subtle)] mt-4">
        <button onClick={() => setShowNotes(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all">
          <Info size={14} /> View Technician Notes
          <span className="ml-1 w-2 h-2 bg-[#35D07F] rounded-full animate-pulse shadow-[0_0_5px_rgba(53,208,127,0.8)]"></span>
        </button>
        {activeService.status === 'AWAITING_APPROVAL' && (
          <button disabled={isApproving} onClick={handleApprove} className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all disabled:opacity-50">
            <FileSignature size={14} /> {isApproving ? 'Approving...' : 'Approve Invoice Request'}
          </button>
        )}
        <button onClick={() => navigate('/customer/messages')} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all ml-auto">
          Contact Advisor
        </button>
      </div>

      {/* Tech Notes Modal */}
      <AnimatePresence>
        {showNotes && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[var(--bg-primary)]/95 backdrop-blur-xl z-20 p-6 flex flex-col border border-[var(--border-default)] rounded-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-[var(--border-default)] pb-4">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-[#35D07F]">Technician Notes</h3>
              <button onClick={() => setShowNotes(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 bg-[var(--bg-surface-hover)] rounded-lg"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar space-y-4 pr-2">
              <div className="bg-[var(--bg-surface-hover)] p-5 rounded-xl border border-[var(--border-subtle)]">
                {activeService.timeline && activeService.timeline.length > 0 ? (
                  activeService.timeline.map((event: any, i: number) => (
                    <div key={i} className="mb-4 last:mb-0 border-b border-[var(--border-subtle)] pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--text-primary)] text-[10px] font-bold tracking-widest uppercase">{event.title}</span>
                        </div>
                        <span className="text-[var(--text-muted)] text-[9px] uppercase tracking-widest">{new Date(event.time).toLocaleString()}</span>
                      </div>
                      {event.description && <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{event.description}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-[var(--text-muted)] text-sm">No technician notes available yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



