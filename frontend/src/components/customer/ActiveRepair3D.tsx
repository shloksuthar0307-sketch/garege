import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGarageStore } from '../../hooks/useGarageStore';
import { CheckCircle2, Clock, Wrench, ShieldCheck, ChevronRight, FileText, Camera } from 'lucide-react';

export function ActiveRepair3D() {
  const [activeModal, setActiveModal] = React.useState<string | null>(null);
  const diagnosticsMode = useGarageStore(s => s.diagnosticsMode);

  return (
    <div className="w-full relative bg-[#0a0a0a] flex flex-col md:flex-row overflow-hidden" style={{ height: "100vh", minHeight: "100vh" }}>
      {/* 2D Background Area */}
      <div className="flex-1 relative" style={{ height: "100vh", minHeight: "100vh" }}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-40 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
      </div>

      {/* Right Sidebar - Repair Tracking */}
      <div className="w-full md:w-[400px] bg-[#0a0a0a] border-l border-[var(--border-subtle)] flex flex-col z-10">
        <div className="p-8 border-b border-[var(--border-subtle)] bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] flex items-center justify-center">
              <Wrench className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <h2 className="text-[var(--text-primary)] font-medium text-lg">Active Repair</h2>
              <p className="text-gray-500 text-sm">RO #9482-A</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Vehicle</p>
                <p className="text-[var(--text-primary)] font-medium">Your Vehicle</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                <p className="text-amber-400 font-medium">In Diagnostics</p>
              </div>
            </div>
            <div className="w-full bg-[var(--bg-surface-hover)] rounded-full h-1.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '45%' }}
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
              />
            </div>
          </div>
        </div>

        {/* Action Required Card */}
        <div className="p-8 pb-4">
          <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full" />
            <ShieldCheck className="w-6 h-6 text-red-400 mb-3" />
            <h3 className="text-[var(--text-primary)] font-medium mb-1">Estimate Approval Needed</h3>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              We've completed the digital inspection. Brake rotors and pads require replacement.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveModal('estimate')}
                className="flex-1 bg-red-500 text-[var(--text-primary)] py-3 rounded-xl font-medium text-sm hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Modals Triggered by Physics Zones */}
      <AnimatePresence>
        {activeModal === 'estimate' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[var(--bg-overlay)] backdrop-blur-sm flex items-center justify-center p-4 md:p-0 pointer-events-auto"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="bg-[#111] border border-[var(--border-default)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center">
                <h2 className="text-xl font-medium text-[var(--text-primary)]">Repair Estimate</h2>
                <button onClick={() => setActiveModal('none')} className="text-gray-400 hover:text-[var(--text-primary)]">X</button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Brake System Overhaul</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">During the multipoint inspection, we discovered that both front brake pads are worn down to 2mm, which is below the safe threshold of 3mm. The rotors also show significant scoring and heat damage, requiring complete replacement.</p>
                </div>
                
                <div className="bg-[var(--bg-input)] rounded-xl p-1 border border-[var(--border-subtle)]">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-[var(--border-subtle)]">
                        <th className="font-medium p-3">Item</th>
                        <th className="font-medium p-3">Qty</th>
                        <th className="font-medium p-3 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300 divide-y divide-white/5">
                      <tr>
                        <td className="p-3">OEM Front Brake Pads</td>
                        <td className="p-3">1 Set</td>
                        <td className="p-3 text-right font-mono">?14,500</td>
                      </tr>
                      <tr>
                        <td className="p-3">OEM Vented Brake Rotors</td>
                        <td className="p-3">2</td>
                        <td className="p-3 text-right font-mono">?28,000</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-gray-400">Labor (3 hours @ ?6,000/hr)</td>
                        <td className="p-3">-</td>
                        <td className="p-3 text-right font-mono text-gray-400">?18,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="p-6 border-t border-[var(--border-subtle)] bg-[#0a0a0a] flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Estimated Total</p>
                  <p className="text-2xl font-mono text-[var(--text-primary)]">?72,500</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setActiveModal('none')} className="px-6 py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-gray-200 transition-colors">Authorize Repair</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeModal === 'history' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[var(--bg-overlay)] backdrop-blur-sm flex items-center justify-center p-4 md:p-0 pointer-events-auto"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="bg-[#111] border border-[var(--border-default)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center">
                <h2 className="text-xl font-medium text-[var(--text-primary)]">Service History Terminal</h2>
                <button onClick={() => setActiveModal('none')} className="text-gray-400 hover:text-[var(--text-primary)]">X</button>
              </div>
              <div className="p-6">
                <p className="text-gray-400 mb-4">You have successfully accessed the Service History terminal on Floor 2.</p>
                <div className="space-y-4">
                  <div className="p-4 bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl">
                    <p className="text-[var(--text-primary)] font-medium">Oil Change & Filter</p>
                    <p className="text-sm text-gray-400">12 August 2026 &bull; 14,200 km</p>
                  </div>
                  <div className="p-4 bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl">
                    <p className="text-[var(--text-primary)] font-medium">Tire Rotation & Alignment</p>
                    <p className="text-sm text-gray-400">05 March 2026 &bull; 9,800 km</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


