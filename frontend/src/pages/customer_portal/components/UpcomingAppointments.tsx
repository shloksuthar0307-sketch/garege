import React, { useState } from 'react';
import { Calendar, MapPin, User, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function UpcomingAppointments({ loading }: { loading: boolean }) {
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  if (loading) return <div className="h-[300px] bg-[#0A0A0B]/80 rounded-2xl border border-white/5 animate-pulse"></div>;

  if (isCancelled) {
    return (
      <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500 mb-4">
          <Calendar size={20} />
        </div>
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white mb-2">No Upcoming Appointments</h2>
        <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-6">Your schedule is clear.</p>
        <button className="px-6 py-2.5 bg-[#35D07F] text-black rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all shadow-[0_0_10px_rgba(53,208,127,0.3)]">
          Book a Service
        </button>
      </div>
    );
  }

  const handleConfirmReschedule = () => {
    if (!selectedSlot) {
      toast.error('Please select an available time slot.', {
        style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      });
      return;
    }
    toast.success('Appointment successfully rescheduled to ' + selectedSlot, {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
    setShowReschedule(false);
  };

  const handleConfirmCancel = () => {
    toast.success('Appointment cancelled.', {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(244,63,94,0.2)' }
    });
    setShowCancel(false);
    setIsCancelled(true);
  };

  return (
    <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-full flex flex-col relative overflow-hidden">
      <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white mb-6">Upcoming Appointment</h2>
      
      <div className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-[#35D07F]/30 transition-all">
        <div className="w-12 h-12 bg-[#35D07F]/10 text-[#35D07F] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#35D07F] group-hover:text-black transition-colors">
          <Calendar size={20} />
        </div>
        <h3 className="text-xl font-bold tracking-widest text-white mb-1">Tue, Oct 6</h3>
        <p className="text-[#35D07F] text-sm font-bold tracking-widest uppercase mb-4">10:30 AM</p>
        
        <p className="text-slate-300 text-xs font-bold tracking-wider uppercase mb-1">Oil Change + Tire Rotation</p>
        <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-6">2019 Toyota Camry</p>

        <div className="w-full space-y-2 text-left bg-black/20 p-3 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-slate-400">
            <User size={12} className="text-[#35D07F]" /> Advisor: John Smith
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-slate-400">
            <MapPin size={12} className="text-[#35D07F]" /> Main Service Center
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={() => setShowReschedule(true)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all">Reschedule</button>
        <button onClick={() => setShowCancel(true)} className="flex-1 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all">Cancel</button>
      </div>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showReschedule && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0A0A0B]/95 backdrop-blur-xl z-20 flex flex-col p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-white">Reschedule</h3>
              <button onClick={() => setShowReschedule(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-4">Select an available time slot</p>
            <div className="space-y-3 flex-1 overflow-auto custom-scrollbar pr-2">
              {['Wed, Oct 7 - 09:00 AM', 'Wed, Oct 7 - 02:30 PM', 'Thu, Oct 8 - 11:00 AM'].map(slot => (
                <button 
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-bold tracking-widest transition-all ${
                    selectedSlot === slot ? 'bg-[#35D07F]/10 border-[#35D07F] text-[#35D07F]' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
            <button onClick={handleConfirmReschedule} className="w-full mt-4 py-3 bg-[#35D07F] text-black rounded-xl text-[10px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(53,208,127,0.3)]">
              Confirm Reschedule
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0A0A0B]/95 backdrop-blur-xl z-20 flex flex-col p-6 items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6 border border-rose-500/20">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-lg font-bold tracking-widest text-white mb-2 uppercase">Cancel Appointment?</h3>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-8 leading-relaxed max-w-[200px]">
              Are you sure you want to cancel your upcoming service? This action cannot be undone.
            </p>
            <div className="w-full space-y-3">
              <button onClick={() => setShowCancel(false)} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all">
                Keep Appointment
              </button>
              <button onClick={handleConfirmCancel} className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                Cancel Appointment
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

