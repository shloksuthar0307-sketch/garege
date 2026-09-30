import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, MapPin, Clock, Phone, User, X } from 'lucide-react';

export default function GarageVisitSection() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 hover:border-[#35D07F]/30 transition-colors rounded-2xl p-5">
      <h2 className="text-white text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
        <Eye className="text-[#35D07F]" size={16} /> Don't Just Trust Us — See It Yourself
      </h2>
      <p className="text-slate-400 text-xs mb-6">
        If you want to verify the work yourself, you can visit our garage and see your vehicle, service progress and repair details in person.
      </p>
      
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-all">
          <MapPin size={16} /> Visit Our Garage
        </button>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all">
          View Service Details
        </button>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0A0A0B] border border-white/10 p-6 rounded-2xl z-10 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
              <h2 className="text-white text-lg font-bold tracking-widest uppercase mb-6 flex items-center gap-2"><MapPin className="text-[#35D07F]" /> Premium Auto Care Garage</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="text-slate-400 mt-1" size={16} />
                  <div>
                    <span className="text-slate-300 text-sm block">123 Service Road, Tech District</span>
                    <a href="#" className="text-[#35D07F] text-xs underline">Get Directions</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-slate-400" size={16} />
                  <span className="text-slate-300 text-sm block">09:00 AM - 07:00 PM</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-slate-400" size={16} />
                  <span className="text-slate-300 text-sm block">+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="text-slate-400" size={16} />
                  <span className="text-slate-300 text-sm block">Advisor: Mike Johnson</span>
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Service Order</span>
                  <span className="text-white text-sm font-bold">SO-2938</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Current Status</span>
                  <span className="text-[#35D07F] text-sm font-bold uppercase">Repair In Progress</span>
                </div>
              </div>

              <button className="w-full bg-[#35D07F] text-black font-bold tracking-widest uppercase rounded-xl py-3 hover:bg-[#2bb46c] transition-all">
                Schedule a Visit
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
