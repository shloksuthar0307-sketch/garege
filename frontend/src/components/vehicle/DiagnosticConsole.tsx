import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, Save, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

interface DiagnosticConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveToOrder: (dtcCodes: string[]) => void;
  vehicleMake: string;
}

export function DiagnosticConsole({ isOpen, onClose, onSaveToOrder, vehicleMake }: DiagnosticConsoleProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [foundCodes, setFoundCodes] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLogs([
        'INITIALIZING OBD2 PROTOCOL...',
        'ESTABLISHING CONNECTION TO ECU...',
      ]);
      setIsScanning(true);
      setFoundCodes([]);
      
      const scanSequence = [
        `DETECTED VEHICLE: ${vehicleMake.toUpperCase()}`,
        'READING VIN...',
        'VIN: 1HGCM82633AXXXXXX',
        'SCANNING ENGINE CONTROL MODULE (ECM)...',
        '>>> DTC FOUND: P0300 - Random/Multiple Cylinder Misfire Detected',
        'SCANNING TRANSMISSION CONTROL MODULE (TCM)...',
        '>>> OK',
        'SCANNING ANTI-LOCK BRAKING SYSTEM (ABS)...',
        '>>> DTC FOUND: C0201 - Anti-Lock Brake System Relay Circuit',
        'SCANNING SUPPLEMENTAL RESTRAINT SYSTEM (SRS)...',
        '>>> OK',
        'DIAGNOSTIC SCAN COMPLETE.',
      ];

      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < scanSequence.length) {
          const logLine = scanSequence[currentIndex];
          setLogs(prev => [...prev, logLine]);
          
          if (logLine.includes('DTC FOUND:')) {
            const codeMatch = logLine.match(/DTC FOUND: ([A-Z0-9]+)/);
            if (codeMatch && codeMatch[1]) {
              setFoundCodes(prev => [...prev, codeMatch[1]]);
            }
          }
          
          currentIndex++;
        } else {
          setIsScanning(false);
          clearInterval(interval);
        }
      }, 800);

      return () => clearInterval(interval);
    }
  }, [isOpen, vehicleMake]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm"
            onClick={!isScanning ? onClose : undefined}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl bg-[var(--bg-primary)] border border-[#35D07F]/30 rounded-2xl shadow-2xl shadow-[#35D07F]/10 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#35D07F]/20 bg-[#35D07F]/5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[#35D07F]">
                <Terminal size={18} />
                <span className="text-xs font-mono font-bold tracking-widest">SIMULATED DIAGNOSTIC MODE</span>
                {isScanning && (
                  <span className="flex h-2 w-2 relative ml-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#35D07F] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#35D07F]"></span>
                  </span>
                )}
              </div>
              <button 
                onClick={onClose}
                disabled={isScanning}
                className={`p-1 rounded transition-colors ${isScanning ? 'opacity-50 cursor-not-allowed text-slate-600' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)]'}`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Terminal View */}
            <div 
              ref={scrollRef}
              className="p-6 h-80 overflow-y-auto font-mono text-sm bg-[var(--bg-input)]"
            >
              {logs.map((log, index) => (
                <div 
                  key={index} 
                  className={`mb-2 ${log.includes('DTC FOUND:') ? 'text-rose-400' : log.includes('ERROR') ? 'text-red-500' : log.includes('OK') ? 'text-[#35D07F]' : 'text-[var(--text-secondary)]'}`}
                >
                  <span className="opacity-50 mr-2 text-[var(--text-muted)]">{'>'}</span> 
                  {log}
                </div>
              ))}
              {isScanning && (
                <div className="text-[var(--text-muted)] animate-pulse">
                  <span className="opacity-50 mr-2">{'>'}</span>_
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-[var(--border-default)] bg-[var(--bg-secondary)] flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs">
                {isScanning ? (
                  <span className="text-[var(--text-muted)] flex items-center gap-2">
                    <Activity size={14} className="animate-pulse text-[#35D07F]" /> Scanning Modules...
                  </span>
                ) : (
                  <>
                    <span className="text-[var(--text-muted)]">Scan Complete</span>
                    {foundCodes.length > 0 ? (
                      <span className="text-rose-400 flex items-center gap-1 font-bold">
                        <AlertTriangle size={14} /> {foundCodes.length} DTCs Found
                      </span>
                    ) : (
                      <span className="text-[#35D07F] flex items-center gap-1 font-bold">
                        <CheckCircle size={14} /> System Clean
                      </span>
                    )}
                  </>
                )}
              </div>
              
              <button
                disabled={isScanning || foundCodes.length === 0}
                onClick={() => {
                  onSaveToOrder(foundCodes);
                  onClose();
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2
                  ${isScanning || foundCodes.length === 0 
                    ? 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)] cursor-not-allowed' 
                    : 'bg-[#35D07F] text-black hover:bg-[#2EB86F]'}`}
              >
                <Save size={16} /> Save to Service Order
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


