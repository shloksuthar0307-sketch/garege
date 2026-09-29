import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateVehicle } from '../../api/client';

export default function EditVehicleModal({ isOpen, onClose, vehicle }: { isOpen: boolean; onClose: () => void; vehicle: any }) {
  const [formData, setFormData] = useState({
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year || '',
    registration_number: vehicle?.registration_number || '',
    mileage: vehicle?.mileage || 0,
    color: vehicle?.color || '',
    fuel_type: vehicle?.fuel_type || '',
    transmission: vehicle?.transmission || '',
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => updateVehicle(vehicle.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicle.id] });
      onClose();
    },
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (!isOpen || !vehicle) return null;

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
          className="relative w-full md:w-[500px] h-full bg-white shadow-2xl flex flex-col"
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Edit Vehicle</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-gray-400">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Make</label>
                  <input required name="make" value={formData.make} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Model</label>
                  <input required name="model" value={formData.model} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                  <input required type="number" name="year" value={formData.year} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-gray-400">Identity & Usage</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Registration</label>
                  <input required name="registration_number" value={formData.registration_number} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all uppercase" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Mileage (km)</label>
                  <input required type="number" name="mileage" value={formData.mileage} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-gray-400">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                  <input name="color" value={formData.color} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fuel Type</label>
                  <input name="fuel_type" value={formData.fuel_type} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
              </div>
            </div>
          </form>

          <div className="p-6 border-t border-gray-100 flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={mutation.isPending} className="flex-1 px-4 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50">
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

