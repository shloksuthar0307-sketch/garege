import { motion, AnimatePresence } from 'framer-motion';
import { useGarageStore, DIAGNOSTICS_DATA } from '../../hooks/useGarageStore';
import { X, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export function DiagnosticCard() {
  const activeId = useGarageStore((state) => state.activeDiagnosticId);
  const setActiveId = useGarageStore((state) => state.setActiveDiagnostic);
  const setCameraPreset = useGarageStore((state) => state.setCameraPreset);

  const data = activeId ? DIAGNOSTICS_DATA[activeId] : null;

  const handleClose = () => {
    setActiveId(null);
    setCameraPreset('Overview');
  };

  if (!data) return null;

  const statusColors = {
    critical: 'text-red-500 border-red-500/30 bg-red-500/10',
    warning: 'text-amber-500 border-amber-500/30 bg-amber-500/10',
    good: 'text-green-500 border-green-500/30 bg-green-500/10'
  };

  const StatusIcon = {
    critical: AlertCircle,
    warning: AlertTriangle,
    good: CheckCircle2
  }[data.status];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed right-8 top-32 w-80 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white shadow-2xl z-40 pointer-events-auto"
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg border ${statusColors[data.status]}`}>
            <StatusIcon size={20} />
          </div>
          <div>
            <h3 className="text-[10px] font-sans tracking-widest uppercase text-white/50 mb-1">Diagnostic</h3>
            <h2 className="text-lg font-medium tracking-wide">{data.label}</h2>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h4 className="text-[9px] font-sans tracking-widest uppercase text-white/40 mb-2">Issue Detected</h4>
            <p className="text-sm font-light text-white/90 leading-relaxed">{data.issue}</p>
          </div>

          <div>
            <h4 className="text-[9px] font-sans tracking-widest uppercase text-white/40 mb-2">Recommended Action</h4>
            <p className="text-sm font-light text-white/90 leading-relaxed">{data.recommendation}</p>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-between items-center">
            <div>
              <h4 className="text-[9px] font-sans tracking-widest uppercase text-white/40 mb-1">Estimated Cost</h4>
              <p className="text-xl font-light">${data.cost}</p>
            </div>
            <div className={`px-3 py-1 rounded-full border text-[9px] font-sans tracking-widest uppercase ${statusColors[data.status]}`}>
              {data.urgency} URGENCY
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

