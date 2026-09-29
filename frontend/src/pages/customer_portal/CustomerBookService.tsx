import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Car, Clock, PenTool, CheckCircle2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

const SERVICE_TYPES = [
  { id: 'maintenance', name: 'Routine Maintenance', desc: 'Oil changes, tire rotations, fluid checks.' },
  { id: 'repair', name: 'Mechanical Repair', desc: 'Brakes, engine, transmission, or suspension.' },
  { id: 'diagnostic', name: 'Diagnostic Service', desc: 'Check engine light or unidentified noises.' }
];

const TIME_SLOTS = [
  '08:00 AM', '09:30 AM', '11:00 AM', '01:00 PM', '02:30 PM', '04:00 PM'
];

export default function CustomerBookService() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    vehicleId: '',
    serviceType: '',
    date: '',
    time: '',
    notes: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customer/vehicles/');
      setVehicles(res.data?.results || res.data || []);
    } catch (error) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customer/service-orders/', formData);
      toast.success('Service Appointment Booked Successfully!', {
        style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
        iconTheme: { primary: '#35D07F', secondary: '#000' }
      });
      setTimeout(() => {
        navigate('/customer/repairs');
      }, 1500);
    } catch (error) {
      toast.error('Failed to book service appointment');
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-white mb-2">
            Book a Service
          </h1>
          <p className="text-slate-400 text-xs tracking-widest uppercase">
            Schedule your next maintenance or repair appointment in minutes.
          </p>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 relative px-4">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5 z-0 rounded-full"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#35D07F] z-0 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
        
        {[1, 2, 3].map(num => (
          <div key={num} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold tracking-widest transition-all ${
            step >= num ? 'bg-[#35D07F] text-black shadow-[0_0_15px_rgba(53,208,127,0.4)]' : 'bg-[#111112] text-slate-500 border border-white/10'
          }`}>
            {step > num ? <CheckCircle2 size={20} /> : num}
          </div>
        ))}
      </div>

      {/* Form Container */}
      <motion.div 
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 sm:p-10 shadow-2xl"
      >
        <form onSubmit={handleSubmit}>
          
          {/* Step 1: Vehicle & Service Type */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h3 className="text-white text-sm font-bold tracking-[0.15em] uppercase mb-4 flex items-center gap-2">
                  <Car className="text-[#35D07F]" size={18} /> Select Vehicle
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vehicles.map(v => (
                    <div 
                      key={v.id}
                      onClick={() => setFormData({ ...formData, vehicleId: v.id })}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        formData.vehicleId === v.id 
                          ? 'bg-[#35D07F]/10 border-[#35D07F]/50 text-[#35D07F]' 
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'
                      }`}
                    >
                      <span className="text-xs font-bold tracking-widest uppercase">{v.make} {v.model} ({v.plate})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white text-sm font-bold tracking-[0.15em] uppercase mb-4 flex items-center gap-2">
                  <PenTool className="text-[#35D07F]" size={18} /> Service Required
                </h3>
                <div className="space-y-3">
                  {SERVICE_TYPES.map(type => (
                    <div 
                      key={type.id}
                      onClick={() => setFormData({ ...formData, serviceType: type.id })}
                      className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        formData.serviceType === type.id 
                          ? 'bg-[#35D07F]/10 border-[#35D07F]/50 text-[#35D07F]' 
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'
                      }`}
                    >
                      <div>
                        <span className="text-sm font-bold tracking-widest uppercase block mb-1">{type.name}</span>
                        <span className="text-xs text-slate-500">{type.desc}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.serviceType === type.id ? 'border-[#35D07F]' : 'border-slate-500'}`}>
                        {formData.serviceType === type.id && <div className="w-2.5 h-2.5 bg-[#35D07F] rounded-full"></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="button"
                disabled={!formData.vehicleId || !formData.serviceType}
                onClick={handleNext}
                className="w-full py-4 bg-[#35D07F] hover:bg-[#2bb46c] disabled:bg-[#35D07F]/20 disabled:text-black/50 disabled:cursor-not-allowed text-black font-bold tracking-widest uppercase rounded-xl transition-all flex items-center justify-center gap-2 mt-8"
              >
                Continue to Scheduling <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h3 className="text-white text-sm font-bold tracking-[0.15em] uppercase mb-4 flex items-center gap-2">
                  <Calendar className="text-[#35D07F]" size={18} /> Select Date
                </h3>
                <input 
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white text-sm focus:border-[#35D07F] outline-none transition-colors [color-scheme:dark]"
                />
              </div>

              <div>
                <h3 className="text-white text-sm font-bold tracking-[0.15em] uppercase mb-4 flex items-center gap-2">
                  <Clock className="text-[#35D07F]" size={18} /> Available Times
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TIME_SLOTS.map(time => (
                    <div 
                      key={time}
                      onClick={() => setFormData({ ...formData, time })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all text-center ${
                        formData.time === time 
                          ? 'bg-[#35D07F]/10 border-[#35D07F]/50 text-[#35D07F]' 
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'
                      }`}
                    >
                      <span className="text-[10px] font-bold tracking-widest uppercase">{time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button type="button" onClick={handleBack} className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold tracking-widest uppercase rounded-xl transition-all">Back</button>
                <button 
                  type="button"
                  disabled={!formData.date || !formData.time}
                  onClick={handleNext}
                  className="flex-1 py-4 bg-[#35D07F] hover:bg-[#2bb46c] disabled:bg-[#35D07F]/20 disabled:text-black/50 disabled:cursor-not-allowed text-black font-bold tracking-widest uppercase rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Review Details <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-white text-sm font-bold tracking-[0.15em] uppercase mb-4">Confirm Appointment Details</h3>
              
              <div className="bg-black/40 border border-white/5 rounded-xl p-6 space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">Vehicle</span>
                  <span className="text-white text-[10px] font-bold tracking-widest uppercase">
                    {vehicles.find(v => v.id === formData.vehicleId) ? `${vehicles.find(v => v.id === formData.vehicleId).make} ${vehicles.find(v => v.id === formData.vehicleId).model}` : ''}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">Service</span>
                  <span className="text-white text-[10px] font-bold tracking-widest uppercase">{SERVICE_TYPES.find(t => t.id === formData.serviceType)?.name}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">Date</span>
                  <span className="text-[#35D07F] text-[10px] font-bold tracking-widest uppercase">{formData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">Time</span>
                  <span className="text-[#35D07F] text-[10px] font-bold tracking-widest uppercase">{formData.time}</span>
                </div>
              </div>

              <div>
                <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 block">Additional Notes (Optional)</label>
                <textarea 
                  rows={3} 
                  placeholder="Any specific issues we should look into?"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-[#35D07F] transition-colors resize-none placeholder:text-slate-600"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={handleBack} className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold tracking-widest uppercase rounded-xl transition-all">Back</button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-[#35D07F] hover:bg-[#2bb46c] text-black font-bold tracking-widest uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(53,208,127,0.3)]"
                >
                  <CheckCircle2 size={18} /> Confirm Booking
                </button>
              </div>
            </div>
          )}

        </form>
      </motion.div>
    </div>
  );
}

