import { motion, AnimatePresence } from 'framer-motion';
import { useGarageStore } from '../../hooks/useGarageStore';
import { X, CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';

const CHECKLIST = [
  { id: 1, text: 'Vehicle inspection completed', status: 'completed' },
  { id: 2, text: 'Brake system inspected', status: 'completed' },
  { id: 3, text: 'Front brake pads replacement', status: 'in-progress' },
  { id: 4, text: 'Rotor resurfacing', status: 'pending' },
  { id: 5, text: 'Final safety inspection', status: 'pending' },
];

export function ServiceReportDrawer() {
  const isReportOpen = useGarageStore((state) => state.isReportOpen);
  const setReportOpen = useGarageStore((state) => state.setReportOpen);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!isReportOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-[var(--bg-input)] backdrop-blur-sm z-50 transition-opacity pointer-events-auto"
        onClick={() => setReportOpen(false)}
      />
      
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0a0a0c]/90 backdrop-blur-2xl border-l border-[var(--border-default)] z-50 overflow-y-auto text-[var(--text-primary)] shadow-2xl flex flex-col pointer-events-auto"
      >
        <div className="sticky top-0 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-[var(--border-default)] p-6 flex justify-between items-center z-10">
          <div>
            <h3 className="text-[10px] font-sans tracking-[0.2em] uppercase text-white/50 mb-1">Service Report</h3>
            <h2 className="text-lg font-medium tracking-wide">SRV-2026-0842</h2>
          </div>
          <button onClick={() => setReportOpen(false)} className="p-2 hover:bg-[var(--bg-surface-active)] rounded-full transition-colors text-white/70 hover:text-[var(--text-primary)]">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-12">
          {/* Status Section */}
          <section>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-[9px] font-sans tracking-widest uppercase text-white/40 mb-2">Vehicle</h4>
                <p className="text-sm font-medium">Your Vehicle</p>
              </div>
              <div>
                <h4 className="text-[9px] font-sans tracking-widest uppercase text-white/40 mb-2">Status</h4>
                <p className="text-sm font-medium text-[#35D07F]">IN SERVICE</p>
              </div>
              <div className="col-span-2">
                <h4 className="text-[9px] font-sans tracking-widest uppercase text-white/40 mb-2">Estimated Completion</h4>
                <p className="text-sm font-medium">Today, 4:30 PM</p>
              </div>
            </div>
          </section>

          {/* Cost Breakdown */}
          <section>
            <h3 className="text-[10px] font-sans tracking-[0.2em] uppercase text-white/50 mb-6 border-b border-[var(--border-default)] pb-2">Cost Breakdown</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-3">Parts</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-light text-white/80"><span className="text-white/60">Brake Pads</span><span>$320.00</span></div>
                  <div className="flex justify-between text-sm font-light text-white/80"><span className="text-white/60">Rotor Resurfacing</span><span>$120.00</span></div>
                  <div className="flex justify-between text-sm font-light text-white/80"><span className="text-white/60">Brake Hardware</span><span>$60.00</span></div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-3">Labor</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-light text-white/80"><span className="text-white/60">Brake Service Labor</span><span>$250.00</span></div>
                  <div className="flex justify-between text-sm font-light text-white/80"><span className="text-white/60">Inspection</span><span>$100.00</span></div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-default)] flex justify-between items-end">
                <h4 className="text-[10px] font-sans tracking-widest uppercase text-white/50">Estimated Total</h4>
                <span className="text-2xl font-light">$850.00</span>
              </div>
            </div>
          </section>

          {/* Checklist */}
          <section>
            <h3 className="text-[10px] font-sans tracking-[0.2em] uppercase text-white/50 mb-6 border-b border-[var(--border-default)] pb-2">Repair Checklist</h3>
            <div className="space-y-4">
              {CHECKLIST.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  {item.status === 'completed' && <CheckCircle2 size={16} className="text-[#35D07F] mt-0.5 shrink-0" />}
                  {item.status === 'in-progress' && <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mt-0.5 shrink-0" />}
                  {item.status === 'pending' && <Circle size={16} className="text-white/20 mt-0.5 shrink-0" />}
                  
                  <span className={`text-sm font-light ${item.status === 'completed' ? 'text-white/40 line-through' : item.status === 'in-progress' ? 'text-[var(--text-primary)]' : 'text-white/60'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Photos */}
          <section>
            <h3 className="text-[10px] font-sans tracking-[0.2em] uppercase text-white/50 mb-6 border-b border-[var(--border-default)] pb-2">Mechanic Photos</h3>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-[var(--border-default)] bg-[var(--bg-surface-hover)] cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center text-white/20 font-light text-sm group-hover:scale-110 transition-transform">
                    Photo {i}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-[8px] uppercase tracking-widest text-white/70">Part Inspection</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </motion.div>
    </>
  );
}


