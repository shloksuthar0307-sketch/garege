import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, CheckSquare, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { advisorApi } from '../../api/advisor';
import toast from 'react-hot-toast';
import { TechnicianSelector } from '../technicians/TechnicianSelector';

export default function VehicleCheckIn({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    bookingId: '',
    mileage: '',
    tech: '',
    concern: '',
    requireInspection: true
  });
  
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: advisorApi.createServiceOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisor-active-services'] });
      queryClient.invalidateQueries({ queryKey: ['advisor-stats'] });
      toast.success('Vehicle successfully checked in!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to check in vehicle. Please try again.');
    }
  });

  const handleCheckIn = () => {
    // In a real app, you would pass actual vehicle/customer IDs
    // For now we'll send a mock payload to the backend
    mutation.mutate({
      vehicle_id: 'mock-vehicle-id', // Needs valid UUID if backend enforces it, else we need to handle it
      title: 'General Service',
      type: 'Maintenance',
      status: 'CHECKED_IN',
      order_number: 'RT-' + Math.floor(1000 + Math.random() * 9000)
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#111112] border border-white/10 rounded-2xl z-[101] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
    >
      <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02] shrink-0">
        <div>
          <h2 className="text-xl font-light text-white flex items-center gap-2">
            <Car size={20} className="text-[#35D07F]" /> Vehicle Check-In
          </h2>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Transition from Booked to Received</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
        {/* Lookup Booking */}
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Booking / Customer</label>
            <select 
              value={formData.bookingId} 
              onChange={e => setFormData({...formData, bookingId: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
            >
              <option value="">-- Select --</option>
              <option value="1">BK-1042: Shlok Mehta - Porsche 718 Cayman</option>
              <option value="2">BK-1043: Rahul Dravid - BMW M4</option>
              <option value="walkin">Walk-in Customer (New Booking)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Mileage */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Mileage (KM)</label>
            <input 
              type="number" placeholder="e.g. 45000"
              value={formData.mileage} onChange={e => setFormData({...formData, mileage: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
            />
          </div>
          {/* Assign Technician */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Assign Technician</label>
            <TechnicianSelector 
              value={formData.tech} 
              onChange={(val) => setFormData({...formData, tech: val})} 
            />
          </div>

          {/* Customer Concerns */}
          <div className="space-y-2 col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Customer Concerns / Instructions</label>
            <textarea 
              rows={3} placeholder="Any specific issues mentioned by the customer..."
              value={formData.concern} onChange={e => setFormData({...formData, concern: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F] resize-none"
            ></textarea>
          </div>

          {/* Inspection Options */}
          <div className="col-span-2 bg-[#0A0A0B] border border-white/5 rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div 
                className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors 
                  ${formData.requireInspection ? 'border-[#35D07F] bg-[#35D07F]/10' : 'border-white/20 bg-white/5 group-hover:border-[#35D07F]'}`}
                onClick={() => setFormData({...formData, requireInspection: !formData.requireInspection})}
              >
                {formData.requireInspection && <CheckSquare size={14} className="text-[#35D07F]" />}
              </div>
              <div onClick={() => setFormData({...formData, requireInspection: !formData.requireInspection})}>
                <div className="text-sm font-medium text-white">Require Multi-Point Inspection</div>
                <div className="text-xs text-slate-500 mt-1">Technician must complete a digital inspection before starting repairs.</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center p-6 border-t border-white/5 bg-white/[0.02] shrink-0">
        <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          Cancel
        </button>
        <button 
          onClick={handleCheckIn} 
          disabled={mutation.isPending}
          className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
        >
          <CheckSquare size={16} /> {mutation.isPending ? 'Checking In...' : 'Confirm Check-In'}
        </button>
      </div>
    </motion.div>
  );
}

