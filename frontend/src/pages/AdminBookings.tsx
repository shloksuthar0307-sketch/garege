import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Search, Filter, Plus, Calendar as CalendarIcon, 
  List, AlertCircle, Clock, MoreHorizontal, X, Edit2, Trash2
} from 'lucide-react';

const INITIAL_BOOKINGS = [
  {
    id: 'BK-10042', customer: 'Shlok Mehta', vehicle: 'Porsche 718 Cayman', reg: 'MH-01-AB-1234',
    type: 'Major Service', date: '2026-09-22T09:00:00', advisor: 'Amit Patel', status: 'Scheduled', priority: 'Normal'
  },
  {
    id: 'BK-10041', customer: 'Rahul Dravid', vehicle: 'BMW M4', reg: 'KA-03-YZ-9999',
    type: 'Brake Replacement', date: '2026-09-22T10:30:00', advisor: 'Neha Gupta', status: 'In Progress', priority: 'High'
  },
  {
    id: 'BK-10040', customer: 'Vikram Singh', vehicle: 'Ford Endeavour', reg: 'DL-04-CC-1111',
    type: 'AC Diagnostics', date: '2026-09-22T14:00:00', advisor: 'Unassigned', status: 'Pending', priority: 'Low'
  },
  {
    id: 'BK-10039', customer: 'Priya Kumar', vehicle: 'Audi A6', reg: 'TS-09-EF-5555',
    type: 'General Checkup', date: '2026-09-23T09:00:00', advisor: 'Amit Patel', status: 'Confirmed', priority: 'Normal'
  }
];

const STATUS_COLORS: Record<string, string> = {
  'Scheduled': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'In Progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Pending': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'Confirmed': 'bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/20',
  'Completed': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const PRIORITY_COLORS: Record<string, string> = {
  'Low': 'text-slate-500',
  'Normal': 'text-blue-400',
  'High': 'text-rose-400',
};

export default function AdminBookings() {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.action === 'new') {
      setIsModalOpen(true);
      setEditingBooking(null);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Form State
  const [formData, setFormData] = useState({
    customer: '', vehicle: '', reg: '', type: '', date: '', advisor: '', status: 'Scheduled', priority: 'Normal'
  });

  const handleOpenModal = (booking = null) => {
    if (booking) {
      setEditingBooking(booking);
      setFormData({ ...booking });
    } else {
      setEditingBooking(null);
      setFormData({
        customer: '', vehicle: '', reg: '', type: '', date: '', advisor: '', status: 'Scheduled', priority: 'Normal'
      });
    }
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBooking) {
      setBookings(bookings.map(b => b.id === editingBooking.id ? { ...formData, id: b.id } : b));
    } else {
      const newId = 'BK-' + Math.floor(10000 + Math.random() * 90000);
      setBookings([{ ...formData, id: newId }, ...bookings]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      setBookings(bookings.filter(b => b.id !== id));
    }
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-8 relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">Service Bookings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage appointments, scheduling, and service intake.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
        >
          <Plus size={16} />
          New Booking
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#111112] border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-xl p-1">
          <button 
            onClick={() => setView('list')}
            className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (view === 'list' ? 'bg-[#35D07F]/10 text-[#35D07F]' : 'text-slate-400 hover:text-white')}
          >
            <List size={16} /> List View
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (view === 'calendar' ? 'bg-[#35D07F]/10 text-[#35D07F]' : 'text-slate-400 hover:text-white')}
          >
            <CalendarIcon size={16} /> Calendar
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F] transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 bg-black/50 border border-white/10 hover:border-white/30 text-slate-300 px-4 py-2.5 rounded-xl text-sm transition-colors">
            <Filter size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Content Area */}
      {view === 'list' ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#111112] border border-white/5 rounded-2xl overflow-visible"
        >
          <div className="overflow-visible min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Booking ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Customer & Vehicle</th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Service Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Date & Time</th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Advisor</th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-white group-hover:text-[#35D07F] transition-colors">{booking.id}</span>
                      <div className={'flex items-center gap-1 text-[10px] uppercase tracking-wider mt-1 ' + PRIORITY_COLORS[booking.priority]}>
                        <AlertCircle size={10} /> {booking.priority} Priority
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">{booking.customer}</div>
                      <div className="text-xs text-slate-500">{booking.vehicle} &bull; <span className="font-mono">{booking.reg}</span></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300">{booking.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-white">
                        <CalendarIcon size={14} className="text-slate-500" />
                        {new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <Clock size={12} />
                        {new Date(booking.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={'text-sm ' + (!booking.advisor || booking.advisor === 'Unassigned' ? 'text-amber-500/70 italic' : 'text-slate-300')}>
                        {booking.advisor || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={'px-3 py-1 rounded-full text-xs border ' + (STATUS_COLORS[booking.status] || 'bg-white/5 text-slate-400 border-white/10')}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === booking.id ? null : booking.id)}
                        className="text-slate-500 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors focus:outline-none"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeMenuId === booking.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-8 top-10 w-40 bg-[#1A1A1B] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                          >
                            <button 
                              onClick={() => handleOpenModal(booking)}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <Edit2 size={14} /> Edit Booking
                            </button>
                            <div className="h-px bg-white/10"></div>
                            <button 
                              onClick={() => handleDelete(booking.id)}
                              className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-slate-500">
            <span>Showing {bookings.length} bookings</span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors">Prev</button>
              <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors">Next</button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#111112] border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[500px]"
        >
          <CalendarIcon size={48} className="text-slate-600 mb-4" />
          <h2 className="text-xl font-light text-white mb-2">Calendar View (Under Construction)</h2>
          <p className="text-slate-500 text-center max-w-md">
            The full interactive drag-and-drop calendar interface is currently being wired up to the scheduling API.
          </p>
          <button 
            onClick={() => setView('list')}
            className="mt-6 text-[#35D07F] hover:text-[#2EB86F] text-sm uppercase tracking-widest"
          >
            Return to List View
          </button>
        </motion.div>
      )}

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#111112] border border-white/10 rounded-2xl z-[101] shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                <h2 className="text-xl font-light text-white">
                  {editingBooking ? 'Edit Booking' : 'New Service Booking'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Customer */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Customer Name</label>
                    <input 
                      required type="text"
                      value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F] transition-colors"
                      placeholder="e.g. Shlok Mehta"
                    />
                  </div>
                  
                  {/* Vehicle */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vehicle Model</label>
                    <input 
                      required type="text"
                      value={formData.vehicle} onChange={e => setFormData({...formData, vehicle: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F] transition-colors"
                      placeholder="e.g. Porsche 718 Cayman"
                    />
                  </div>

                  {/* Reg No */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Registration No.</label>
                    <input 
                      required type="text"
                      value={formData.reg} onChange={e => setFormData({...formData, reg: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F] transition-colors"
                      placeholder="e.g. MH-01-AB-1234"
                    />
                  </div>

                  {/* Service Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Service Type</label>
                    <input 
                      required type="text"
                      value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F] transition-colors"
                      placeholder="e.g. Major Service"
                    />
                  </div>

                  {/* Date/Time */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date & Time</label>
                    <input 
                      required type="datetime-local"
                      value={formData.date ? formData.date.slice(0, 16) : ''} 
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F] transition-colors"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>

                  {/* Advisor */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Service Advisor</label>
                    <input 
                      type="text"
                      value={formData.advisor} onChange={e => setFormData({...formData, advisor: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F] transition-colors"
                      placeholder="Unassigned"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</label>
                    <select 
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F] transition-colors"
                    >
                      <option>Scheduled</option>
                      <option>Confirmed</option>
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Priority</label>
                    <select 
                      value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F] transition-colors"
                    >
                      <option>Low</option>
                      <option>Normal</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-8">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#35D07F] text-black hover:bg-[#2EB86F] transition-colors uppercase tracking-widest"
                  >
                    {editingBooking ? 'Save Changes' : 'Create Booking'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

