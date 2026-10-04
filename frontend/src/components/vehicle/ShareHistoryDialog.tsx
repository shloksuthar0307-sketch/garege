import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Copy } from 'lucide-react';

interface ShareHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
}

export default function ShareHistoryDialog({ isOpen, onClose, vehicleId }: ShareHistoryDialogProps) {
  const [step, setStep] = useState<'select' | 'loading' | 'success'>('select');
  const [options, setOptions] = useState({
    serviceHistory: true,
    maintenance: true,
    warranty: true,
    invoiceDetails: false,
  });
  
  useEffect(() => {
    if (isOpen) {
      setStep('select');
    }
  }, [isOpen]);

  const handleShare = () => {
    setStep('loading');
    // Simulate backend link generation
    setTimeout(() => {
      setStep('success');
    }, 1500);
  };

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(`https://repairtrace.com/share/${vehicleId}/temp-link-12345`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              
              {step === 'select' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Share Vehicle History</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-6">Choose what you want to share.</p>

                  <div className="space-y-4 mb-8">
                    {[
                      { id: 'serviceHistory', label: 'Service History' },
                      { id: 'maintenance', label: 'Maintenance' },
                      { id: 'warranty', label: 'Warranty' },
                      { id: 'invoiceDetails', label: 'Invoice Details' },
                    ].map(opt => (
                      <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                          options[opt.id as keyof typeof options] 
                            ? 'bg-black border-black' 
                            : 'bg-white border-gray-300 group-hover:border-gray-400'
                        }`}>
                          {options[opt.id as keyof typeof options] && <Check size={14} className="text-[var(--text-primary)]" />}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={options[opt.id as keyof typeof options]}
                          onChange={() => setOptions(prev => ({ ...prev, [opt.id]: !prev[opt.id as keyof typeof prev] }))}
                        />
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Link expires</div>
                      <div className="text-sm font-medium text-gray-900">7 days</div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
                      <button onClick={handleShare} className="px-5 py-2 text-sm font-medium text-[var(--text-primary)] bg-black rounded-lg hover:bg-gray-800 transition-colors">
                        Create Link
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 'loading' && (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mb-4" />
                  <p className="text-sm font-medium text-gray-900">Creating secure share link...</p>
                </div>
              )}

              {step === 'success' && (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Link Created</h3>
                  <p className="text-sm text-gray-500 mb-8">Your vehicle history link is ready.</p>
                  
                  <button onClick={handleCopy} className="w-full mb-4 flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium py-3 rounded-xl hover:bg-gray-100 transition-colors">
                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    {copied ? 'Copied to Clipboard' : 'Copy Link'}
                  </button>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Expires in 7 days</p>
                  <button onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-gray-900 pt-4">Done</button>
                </div>
              )}

            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


