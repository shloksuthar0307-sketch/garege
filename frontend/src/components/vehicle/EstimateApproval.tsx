import { motion, AnimatePresence } from 'framer-motion';
import { useGarageStore } from '../../hooks/useGarageStore';
import { CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import { useState } from 'react';

export function EstimateApproval() {
  const serviceStage = useGarageStore((state) => state.serviceStage);
  const setServiceStage = useGarageStore((state) => state.setServiceStage);
  const diagnosticsMode = useGarageStore((state) => state.diagnosticsMode);

  const [isApproving, setIsApproving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Hide if in diagnostics mode (clutter) or if not in ESTIMATE stage
  if (diagnosticsMode) return null;

  const handleApprove = () => {
    setIsApproving(true);
    setTimeout(() => {
      setIsApproving(false);
      setShowConfirmation(true);
      setServiceStage('APPROVED');
      
      // Auto move to repairing after a few seconds
      setTimeout(() => {
        setShowConfirmation(false);
        setServiceStage('REPAIRING');
      }, 3000);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {(serviceStage === 'ESTIMATE' || showConfirmation) && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="absolute bottom-32 left-8 z-40 pointer-events-auto"
        >
          {showConfirmation ? (
            <div className="bg-[#35D07F]/10 backdrop-blur-xl border border-[#35D07F]/30 rounded-2xl p-6 flex items-center gap-4 text-[var(--text-primary)] shadow-2xl">
              <CheckCircle2 size={32} className="text-[#35D07F]" />
              <div>
                <h3 className="text-[10px] font-sans tracking-widest uppercase text-[#35D07F] mb-1">Success</h3>
                <h2 className="text-lg font-medium tracking-wide">WORK APPROVED</h2>
                <p className="text-sm font-light text-white/70">Your service advisor has been notified.</p>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] backdrop-blur-xl border border-[var(--border-default)] rounded-2xl p-6 text-[var(--text-primary)] shadow-2xl w-80">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-500">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-[10px] font-sans tracking-widest uppercase text-white/50 mb-1">Action Required</h3>
                  <h2 className="text-lg font-medium tracking-wide">REVIEW ESTIMATE</h2>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-light text-white/70">Parts</span>
                  <span className="font-medium">$500.00</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-light text-white/70">Labor</span>
                  <span className="font-medium">$350.00</span>
                </div>
                <div className="pt-4 border-t border-[var(--border-default)] flex justify-between items-center">
                  <span className="text-[10px] font-sans tracking-widest uppercase text-white/50">Estimated Total</span>
                  <span className="text-xl font-medium">$850.00</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="w-full bg-[#35D07F] hover:bg-[#2EB86F] text-black font-semibold text-xs tracking-widest uppercase py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isApproving ? 'Processing...' : 'Approve Work'}
                </button>
                <button className="w-full bg-transparent hover:bg-[var(--bg-surface-hover)] border border-[var(--border-strong)] text-[var(--text-primary)] font-medium text-xs tracking-widest uppercase py-3 rounded-lg transition-colors">
                  Decline
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}


