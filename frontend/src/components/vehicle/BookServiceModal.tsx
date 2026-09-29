import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';

interface BookServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
}

export default function BookServiceModal({ isOpen, onClose, vehicleId }: BookServiceModalProps) {
  const [step, setStep] = useState<'form' | 'loading' | 'success'>('form');
  const [formData, setFormData] = useState({
    serviceType: 'Maintenance',
    preferredDate: '',
    notes: '',
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setStep('loading');
    
    // Simulate API call to backend booking endpoint
    setTimeout(() => {
      setStep('success');
    }, 1500);
  };

  const handleDone = () => {
    setStep('form');
    setFormData({ serviceType: 'Maintenance', preferredDate: '', notes: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ x: '100%' }} 
          animate={{ x: 0 }} 
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full md:w-[450px] h-full bg-white shadow-2xl flex flex-col"
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Book Service</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
          </div>
          
          {step === 'form' && (
            <>
              <form id="booking-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">Service Type</label>
                  <select 
                    name="serviceType" 
                    value={formData.serviceType} 
                    onChange={handleChange} 
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none"
                  >
                    <option value="Maintenance">Scheduled Maintenance</option>
                    <option value="Repair">Mechanical Repair</option>
                    <option value="Diagnostic">Diagnostic Check</option>
                    <option value="Inspection">Vehicle Inspection</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">Preferred Date</label>
                  <div className="relative">
                    <input 
                      required
                      type="date" 
                      name="preferredDate" 
                      value={formData.preferredDate} 
                      onChange={handleChange} 
                      className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" 
                    />
                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">Additional Notes</label>
                  <textarea 
                    name="notes" 
                    value={formData.notes} 
                    onChange={handleChange} 
                    rows={4}
                    placeholder="Describe any specific issues or requests..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none" 
                  />
                </div>
              </form>

              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button onClick={onClose} type="button" className="flex-1 px-4 py-3.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" form="booking-form" className="flex-[2] px-4 py-3.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-900 transition-colors">
                  Confirm Booking
                </button>
              </div>
            </>
          )}

          {step === 'loading' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin mb-6" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Request</h3>
              <p className="text-sm text-gray-500">Checking availability and securing your booking slot...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
              <p className="text-sm text-gray-500 mb-8 max-w-[260px]">
                Your service appointment has been successfully scheduled. An advisor will contact you shortly.
              </p>
              <button onClick={handleDone} className="w-full max-w-[200px] px-4 py-3.5 rounded-xl bg-gray-100 text-gray-900 text-sm font-medium hover:bg-gray-200 transition-colors">
                Done
              </button>
            </div>
          )}
          
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

