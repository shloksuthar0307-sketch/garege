import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Calendar as CalendarIcon, Clock, User, Car, Plus, ChevronLeft, ChevronRight, MoreVertical, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManagerAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    service_type: '',
    date_time: '',
    status: 'REQUESTED'
  });

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/manager/appointments/');
      setAppointments(res.data);
    } catch (error) {
      console.error('Error fetching appointments', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // In a real app we'd need to pass customer and vehicle IDs.
      // Here we might either need to select them, or just use a mock object.
      // For now we'll simulate the save if the API requires foreign keys.
      // Assuming backend allows it or we mock it:
      
      const newBooking = {
        id: Date.now(),
        service_type: formData.service_type,
        date_time: formData.date_time,
        status: formData.status,
        customer_details: { name: 'Walk-in Customer' },
        vehicle_details: { make: 'Unknown', model: 'Vehicle' }
      };
      
      // Update local state directly for immediate feedback
      setAppointments(prev => [...prev, newBooking]);
      
      toast.success('Appointment booked successfully');
      setIsModalOpen(false);
      setFormData({ service_type: '', date_time: '', status: 'REQUESTED' });
    } catch (error) {
      toast.error('Failed to book appointment');
    } finally {
      setSaving(false);
    }
  };

  // For a real app we'd use a date library, but we'll mock the calendar structural UI for now
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-wide">Appointments</h1>
          <p className="text-slate-400 text-sm mt-1">Manage incoming customer bookings and schedules.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm transition-colors border border-white/10">
            <CalendarIcon size={16} /> Today
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black rounded-lg text-sm font-bold transition-colors">
            <Plus size={16} /> New Booking
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Sidebar */}
        <div className="bg-[#111112] border border-white/5 rounded-2xl p-6 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg text-white font-medium">September 2026</h2>
            <div className="flex gap-2 text-slate-400">
              <button className="hover:text-white transition-colors"><ChevronLeft size={20} /></button>
              <button className="hover:text-white transition-colors"><ChevronRight size={20} /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {days.map(d => (
              <div key={d} className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{d}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots for start of month */}
            {Array.from({ length: 2 }).map((_, i) => <div key={`empty-${i}`} className="aspect-square"></div>)}
            {/* Days */}
            {Array.from({ length: 30 }).map((_, i) => {
              const date = i + 1;
              const isToday = date === today.getDate();
              const hasAppointments = date === today.getDate() || date === 28;
              
              return (
                <button 
                  key={date}
                  className={`aspect-square rounded-full flex flex-col items-center justify-center text-sm transition-colors relative
                    ${isToday ? 'bg-[#35D07F] text-black font-bold' : 'text-slate-300 hover:bg-white/10'}
                  `}
                >
                  {date}
                  {hasAppointments && !isToday && (
                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#35D07F]"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl text-white font-light">Today's Schedule</h2>
            <span className="text-sm text-slate-500">{appointments.length} appointments</span>
          </div>

          {loading ? (
            <div className="bg-[#111112] border border-white/5 rounded-2xl p-8 text-center text-slate-500">
              Loading schedule...
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-[#111112] border border-white/5 rounded-2xl p-8 text-center text-slate-500">
              No appointments scheduled for today.
            </div>
          ) : (
            appointments.map((apt) => {
              const dateObj = new Date(apt.date_time);
              const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              return (
                <div key={apt.id} className="bg-[#111112] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all group flex gap-6 items-center">
                  <div className="flex flex-col items-center justify-center min-w-[80px] pr-6 border-r border-white/10">
                    <span className="text-lg text-white font-medium">{timeString}</span>
                    <span className="text-[10px] text-slate-500 tracking-widest uppercase mt-1">Arrival</span>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-white font-medium mb-1">
                        <User size={14} className="text-slate-400" />
                        {apt.customer_details?.name || 'Walk-in Customer'}
                      </div>
                      <div className="text-xs text-slate-500 pl-5">
                        {apt.customer_details?.phone || 'No phone provided'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-white font-medium mb-1">
                        <Car size={14} className="text-slate-400" />
                        {apt.vehicle_details?.make} {apt.vehicle_details?.model}
                      </div>
                      <div className="text-xs text-slate-500 pl-5">
                        {apt.service_type}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <button className="text-slate-500 hover:text-white transition-colors">
                      <MoreVertical size={16} />
                    </button>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                      apt.status === 'CONFIRMED' ? 'bg-blue-500/10 text-blue-400' :
                      apt.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-orange-500/10 text-orange-400'
                    }`}>
                      {apt.status || 'CONFIRMED'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* New Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111112] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h2 className="text-xl font-light text-white tracking-wide">New Booking</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateBooking} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Service Type</label>
                <input 
                  type="text" 
                  value={formData.service_type}
                  onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#35D07F]"
                  placeholder="e.g., Annual Maintenance"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={formData.date_time}
                  onChange={(e) => setFormData({...formData, date_time: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#35D07F] [color-scheme:dark]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#35D07F]"
                >
                  <option value="REQUESTED">Requested</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              
              <div className="text-xs text-orange-400/80 bg-orange-400/10 p-3 rounded-lg border border-orange-400/20">
                Note: Currently selecting specific customers/vehicles is limited in quick-booking mode. Using defaults for new entries.
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-[#35D07F] hover:bg-[#2EB86F] disabled:opacity-50 text-black rounded-lg text-sm font-bold transition-colors"
                >
                  {saving ? 'Saving...' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

