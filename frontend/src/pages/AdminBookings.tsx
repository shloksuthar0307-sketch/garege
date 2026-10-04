import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Search, Filter, Plus, Calendar as CalendarIcon, 
  List, AlertCircle, Clock, MoreHorizontal, X, Edit2, Trash2
} from 'lucide-react';



const STATUS_COLORS: Record<string, string> = {
  'Scheduled': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'In Progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Pending': 'bg-slate-500/10 text-[var(--text-muted)] border-slate-500/20',
  'Confirmed': 'bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/20',
  'Completed': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const PRIORITY_COLORS: Record<string, string> = {
  'Low': 'text-[var(--text-muted)]',
  'Normal': 'text-blue-400',
  'High': 'text-rose-400',
};

export default function AdminBookings() {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const location = useLocation();

  // Read role from JWT and fetch bookings
  useEffect(() => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.user?.role || payload.role || '');
      }
    } catch { }
    
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const res = await fetch(`${apiBaseUrl}/advisor/appointments/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((b: any) => ({
          id: b.id.substring(0, 8),
          raw_id: b.id, // Keep full ID for updates
          customer: b.customer ? `${b.customer.first_name} ${b.customer.last_name}`.trim() : 'Unknown',
          vehicle: b.vehicle ? `${b.vehicle.make} ${b.vehicle.model}` : 'Unknown',
          reg: b.vehicle?.registration_number || '',
          type: b.service_type || 'General Service',
          date: b.date_time,
          advisor: 'Unassigned', // API does not return advisor directly on appointment
          status: b.status || 'Scheduled',
          priority: 'Normal' // Priority is not in model, default to Normal
        }));
        setBookings(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setIsLoading(false);
    }
  };


  // Only these roles may create bookings
  const canCreateBooking = userRole === 'CUSTOMER' || userRole === 'BRANCH_MANAGER';

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

  const handleOpenModal = (booking: any = null) => {
    // For NEW bookings, enforce role restriction
    if (!booking && !canCreateBooking) return;
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call for saving
    if (editingBooking) {
      setBookings(bookings.map(b => b.id === editingBooking.id ? { ...formData, id: b.id } : b));
    } else {
      const newId = 'BK-' + Math.floor(10000 + Math.random() * 90000);
      setBookings([{ ...formData, id: newId }, ...bookings]);
    }
    // Real implementation would be: await fetch(...) then fetchBookings()
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      // Real implementation would be: await fetch(...) then fetchBookings()
      setBookings(bookings.filter(b => b.id !== id));
    }
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-8 relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight">Service Bookings</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage appointments, scheduling, and service intake.</p>
        </div>
        {canCreateBooking && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
          >
            <Plus size={16} />
            New Booking
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 rounded-2xl">
        <div className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl p-1">
          <button 
            onClick={() => setView('list')}
            className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (view === 'list' ? 'bg-[#35D07F]/10 text-[#35D07F]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]')}
          >
            <List size={16} /> List View
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (view === 'calendar' ? 'bg-[#35D07F]/10 text-[#35D07F]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]')}
          >
            <CalendarIcon size={16} /> Calendar
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border-default)] hover:border-white/30 text-[var(--text-secondary)] px-4 py-2.5 rounded-xl text-sm transition-colors">
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
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-visible"
        >
          <div className="overflow-visible min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Booking ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Customer & Vehicle</th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Service Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Date & Time</th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Advisor</th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={`skel-${i}`} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-20 mb-2"></div><div className="h-3 bg-white/5 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-32 mb-2"></div><div className="h-3 bg-white/5 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-24 mb-2"></div><div className="h-3 bg-white/5 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-white/5 rounded-full w-20"></div></td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  ))
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[var(--text-muted)]">
                      <div className="flex flex-col items-center justify-center">
                        <CalendarIcon size={32} className="mb-3 opacity-20" />
                        <p>No bookings found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.raw_id || booking.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-[var(--text-primary)] group-hover:text-[#35D07F] transition-colors">{booking.id}</span>
                      <div className={'flex items-center gap-1 text-[10px] uppercase tracking-wider mt-1 ' + PRIORITY_COLORS[booking.priority]}>
                        <AlertCircle size={10} /> {booking.priority} Priority
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[var(--text-primary)]">{booking.customer}</div>
                      <div className="text-xs text-[var(--text-muted)]">{booking.vehicle} &bull; <span className="font-mono">{booking.reg}</span></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[var(--text-secondary)]">{booking.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                        <CalendarIcon size={14} className="text-[var(--text-muted)]" />
                        {new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                        <Clock size={12} />
                        {new Date(booking.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={'text-sm ' + (!booking.advisor || booking.advisor === 'Unassigned' ? 'text-amber-500/70 italic' : 'text-[var(--text-secondary)]')}>
                        {booking.advisor || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={'px-3 py-1 rounded-full text-xs border ' + (STATUS_COLORS[booking.status] || 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)] border-[var(--border-default)]')}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === booking.id ? null : booking.id)}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 rounded-lg hover:bg-[var(--bg-surface-hover)] transition-colors focus:outline-none"
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
                            className="absolute right-8 top-10 w-40 bg-[#1A1A1B] border border-[var(--border-default)] rounded-xl shadow-2xl z-50 overflow-hidden"
                          >
                            <button 
                              onClick={() => handleOpenModal(booking)}
                              className="w-full text-left px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] flex items-center gap-2 transition-colors"
                            >
                              <Edit2 size={14} /> Edit Booking
                            </button>
                            <div className="h-px bg-[var(--bg-surface-active)]"></div>
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
                ))
              )}
            </tbody>
          </table>
        </div>
          
          <div className="p-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-sm text-[var(--text-muted)]">
            <span>Showing {bookings.length} bookings</span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 rounded border border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)] transition-colors">Prev</button>
              <button className="px-3 py-1 rounded border border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)] transition-colors">Next</button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-8 flex flex-col items-center justify-center min-h-[500px]"
        >
          <CalendarIcon size={48} className="text-slate-600 mb-4" />
          <h2 className="text-xl font-light text-[var(--text-primary)] mb-2">Calendar View (Under Construction)</h2>
          <p className="text-[var(--text-muted)] text-center max-w-md">
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
              className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm z-[100]"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl z-[101] shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)] bg-white/[0.02]">
                <h2 className="text-xl font-light text-[var(--text-primary)]">
                  {editingBooking ? 'Edit Booking' : 'New Service Booking'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Customer */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Customer Name</label>
                    <input 
                      required type="text"
                      value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
                      placeholder="e.g. Shlok Mehta"
                    />
                  </div>
                  
                  {/* Vehicle */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Vehicle Model</label>
                    <input 
                      required type="text"
                      value={formData.vehicle} onChange={e => setFormData({...formData, vehicle: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
                      placeholder="e.g. Your Vehicle"
                    />
                  </div>

                  {/* Reg No */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Registration No.</label>
                    <input 
                      required type="text"
                      value={formData.reg} onChange={e => setFormData({...formData, reg: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
                      placeholder="e.g. MH-01-AB-1234"
                    />
                  </div>

                  {/* Service Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Service Type</label>
                    <input 
                      required type="text"
                      value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
                      placeholder="e.g. Major Service"
                    />
                  </div>

                  {/* Date/Time */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Date & Time</label>
                    <input 
                      required type="datetime-local"
                      value={formData.date ? formData.date.slice(0, 16) : ''} 
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>

                  {/* Advisor */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Service Advisor</label>
                    <input 
                      type="text"
                      value={formData.advisor} onChange={e => setFormData({...formData, advisor: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
                      placeholder="Unassigned"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Status</label>
                    <select 
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
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
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Priority</label>
                    <select 
                      value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
                    >
                      <option>Low</option>
                      <option>Normal</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-subtle)] mt-8">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
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



