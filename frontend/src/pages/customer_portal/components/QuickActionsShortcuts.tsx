import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Calendar, Zap, Wrench, FileText, Shield, FileCheck, History, MapPin, HeadphonesIcon, X, Plus } from 'lucide-react';

export default function QuickActionsShortcuts() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const shortcuts = [
    { id: 'live_service', label: 'Live Service', icon: Activity },
    { id: 'book_service', label: 'Book Service', icon: Calendar },
    { id: 'fasttrack', label: 'FastTrack', icon: Zap },
    { id: 'one_time_service', label: 'One-Time Service', icon: Plus },
    { id: 'analysis', label: 'Car Analysis', icon: Wrench },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'puc', label: 'PUC', icon: FileCheck },
    { id: 'license', label: 'License', icon: FileText },
    { id: 'insurance', label: 'Insurance', icon: Shield },
    { id: 'history', label: 'Service History', icon: History },
    { id: 'garage', label: 'Garage', icon: MapPin },
    { id: 'support', label: 'Support', icon: HeadphonesIcon },
  ];

  const handleActionClick = (actionId: string) => {
    if (actionId === 'fasttrack' || actionId === 'one_time_service') {
      setActiveModal(actionId);
    } else if (actionId === 'book_service') {
      document.getElementById('book_service_btn')?.click();
    } else {
      let targetId = actionId;
      if (['puc', 'license', 'insurance'].includes(actionId)) {
        targetId = 'documents';
      }
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-5 mb-6">
      <h2 className="text-white text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
        <Zap className="text-[#35D07F]" size={16} /> Quick Actions
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {shortcuts.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action.id)}
            className="flex flex-col items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#35D07F]/30 rounded-xl transition-all"
          >
            <action.icon size={20} className="text-[#35D07F]" />
            <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase text-center">{action.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activeModal === 'fasttrack' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0A0A0B] border border-white/10 p-6 rounded-2xl z-10 w-full max-w-2xl shadow-2xl relative max-h-[80vh] overflow-y-auto">
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
              <h2 className="text-white text-lg font-bold tracking-widest uppercase mb-6 flex items-center gap-2"><Zap className="text-[#35D07F]" /> FastTrack Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Oil Change', 'Brake Inspection', 'Wheel Alignment', 'AC Check', 'Car Wash', 'PUC Assistance'].map((service, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-1">{service}</h3>
                      <p className="text-slate-400 text-xs mb-2">Est. time: 45 mins • Starting at ₹999</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 bg-[#35D07F] text-black text-xs font-bold uppercase tracking-widest py-2 rounded-lg hover:bg-[#2bb46c] transition-colors">Book Now</button>
                      <button className="flex-1 bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest py-2 rounded-lg hover:bg-white/10 transition-colors">Estimate</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {activeModal === 'one_time_service' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0A0A0B] border border-white/10 p-6 rounded-2xl z-10 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
              <h2 className="text-white text-lg font-bold tracking-widest uppercase mb-6 flex items-center gap-2"><Plus className="text-[#35D07F]" /> One-Time Service</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 block">Select Vehicle</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-[#35D07F]">
                    <option>2019 Toyota Camry (ABC-1234)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 block">Select Individual Service</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-[#35D07F]">
                    <option>Engine Diagnostics</option>
                    <option>Battery Check</option>
                    <option>Wiper Replacement</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 block">Select Date/Time</label>
                  <input type="datetime-local" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-[#35D07F] color-scheme-dark" />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 block">Select Garage</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-[#35D07F]">
                    <option>Premium Auto Care (Main)</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest">Est. Total</span>
                  <span className="text-white font-bold">₹1,200</span>
                </div>
              </div>

              <button className="w-full mt-6 py-3 bg-[#35D07F] text-black font-bold tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(53,208,127,0.3)] hover:bg-[#2bb46c] transition-all">
                Confirm Service
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
