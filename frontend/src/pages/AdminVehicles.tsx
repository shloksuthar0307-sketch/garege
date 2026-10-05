import { API_BASE_URL, WS_BASE_URL } from '../lib/config';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../lib/auth';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, Filter, Plus, Car, Calendar, 
  ChevronRight, Wrench, MoreHorizontal, Edit2, Trash2, X
} from 'lucide-react';




const STATUS_COLORS: Record<string, string> = {
  'Active': 'bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/20',
  'In Service': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Inactive': 'bg-slate-500/10 text-[var(--text-muted)] border-slate-500/20',
};

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const location = useLocation();

  // ── Fetch real vehicles from backend ──────────────────────────────────────
  const fetchVehicles = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || API_BASE_URL + '/api/v1';
      const token = getAccessToken();
      const res = await fetch(`${apiBaseUrl}/admin-vehicles/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Normalise API fields → component fields
        const mapped = (Array.isArray(data) ? data : data.results ?? []).map((v: any) => ({
          ...v,
          reg: v.reg || v.registration_number || '',
          owner: v.owner_name || v.owner || 'Unknown',
          lastService: v.last_service || null,
          status: v.status || (v.health_status === 'critical' ? 'In Service' : 'Active'),
        }));
        setVehicles(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch admin vehicles', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (location.state?.action === 'new') {
      setIsModalOpen(true);
      setEditingVehicle(null);
      // Clean up the state so it doesn't reopen on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const [formData, setFormData] = useState({
    make: '', model: '', year: '', reg: '', vin: '',
    owner: '', lastService: '', status: 'Active', color: ''
  });

  const handleOpenModal = (vehicle: any = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({ ...vehicle });
    } else {
      setEditingVehicle(null);
      setFormData({
        make: '', model: '', year: '', reg: '', vin: '',
        owner: '', lastService: new Date().toISOString().split('T')[0], status: 'Active', color: ''
      });
    }
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      setVehicles(vehicles.map(v => v.id === editingVehicle.id ? { ...formData, id: v.id } : v));
    } else {
      const newId = 'VH-' + Math.floor(1000 + Math.random() * 9000);
      setVehicles([{ ...formData, id: newId }, ...vehicles]);
    }
    setIsModalOpen(false);
    // Re-fetch so newly-registered customer vehicles appear automatically
    fetchVehicles();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle registry?')) {
      setVehicles(vehicles.filter(v => v.id !== id));
    }
    setActiveMenuId(null);
  };

  const changeStatus = (id: string, newStatus: string) => {
    setVehicles(vehicles.map(v => v.id === id ? { ...v, status: newStatus } : v));
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-8 relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight">Vehicle Management</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Complete registry of all customer vehicles in the database.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
        >
          <Plus size={16} />
          Register Vehicle
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Total Vehicles</span>
            <span className="text-xl text-[var(--text-primary)] font-light">{vehicles.length}</span>
          </div>
          <div className="w-px h-8 bg-[var(--bg-surface-active)] mx-2"></div>
          <div className="flex flex-col">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Currently In Workshop</span>
            <span className="text-xl text-blue-400 font-light">
              {vehicles.filter(v => v.status === 'In Service').length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search make, model, reg, VIN..." 
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
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-visible"
      >
        <div className="overflow-visible min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Make & Model</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Registration & VIN</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Owner</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Last Service</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                // Loading skeleton rows
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-6 py-5">
                        <div className="h-4 bg-white/[0.05] rounded-lg w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Car size={32} className="mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
                    <p className="text-sm text-[var(--text-muted)]">No vehicles registered yet.</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1 opacity-60">Customer vehicles will appear here automatically once added.</p>
                  </td>
                </tr>
              ) : vehicles.map((vehicle) => {
                return (
                  <tr key={vehicle.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-input)] border border-[var(--border-default)] flex items-center justify-center">
                          <Car size={20} className="text-[var(--text-muted)]" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[var(--text-primary)]">{vehicle.make} {vehicle.model}</div>
                          <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{vehicle.year} &bull; {vehicle.color}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-[var(--text-primary)] bg-[var(--bg-surface-hover)] px-2 py-0.5 rounded w-fit border border-[var(--border-default)]">
                        {vehicle.reg}
                      </div>
                      <div className="text-[10px] font-mono text-[var(--text-muted)] mt-1.5 uppercase tracking-widest">
                        VIN: {vehicle.vin}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                        {vehicle.owner} <ChevronRight size={14} />
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <Calendar size={14} className="text-[var(--text-muted)]" />
                        {vehicle.lastService ? new Date(vehicle.lastService).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={'flex items-center gap-1.5 px-2.5 py-1 rounded-full border w-fit ' + (STATUS_COLORS[vehicle.status] || 'bg-[var(--bg-surface-hover)]')}>
                        <span className="text-[11px] font-bold uppercase tracking-widest">{vehicle.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap relative">
                      <div className="flex items-center justify-end gap-2">
                        {vehicle.status !== 'In Service' && (
                          <button 
                            onClick={() => changeStatus(vehicle.id, 'In Service')}
                            className="text-xs text-[#35D07F] hover:bg-[#35D07F]/10 px-3 py-1.5 rounded transition-colors uppercase tracking-widest font-bold flex items-center gap-1"
                          >
                            <Wrench size={12} /> Book
                          </button>
                        )}
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === vehicle.id ? null : vehicle.id)}
                          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] transition-colors focus:outline-none"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeMenuId === vehicle.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-8 top-10 w-40 bg-[#1A1A1B] border border-[var(--border-default)] rounded-xl shadow-2xl z-50 overflow-hidden text-left"
                          >
                            <button 
                              onClick={() => handleOpenModal(vehicle)}
                              className="w-full text-left px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] flex items-center gap-2 transition-colors"
                            >
                              <Edit2 size={14} /> Edit Vehicle
                            </button>
                            <div className="h-px bg-[var(--bg-surface-active)]"></div>
                            <button 
                              onClick={() => handleDelete(vehicle.id)}
                              className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-sm text-[var(--text-muted)]">
          <span>Showing {vehicles.length} vehicles</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded border border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)] transition-colors">Prev</button>
            <button className="px-3 py-1 rounded border border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)] transition-colors">Next</button>
          </div>
        </div>
      </motion.div>

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
                  {editingVehicle ? 'Edit Vehicle Registry' : 'Register New Vehicle'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Make */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Make</label>
                    <input 
                      required type="text" placeholder="e.g. Vehicle"
                      value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Model */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Model</label>
                    <input 
                      required type="text" placeholder="e.g. 718 Cayman"
                      value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Year */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Year</label>
                    <input 
                      required type="text" placeholder="e.g. 2021"
                      value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Color */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Color</label>
                    <input 
                      required type="text" placeholder="e.g. Guards Red"
                      value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Registration */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Registration No.</label>
                    <input 
                      required type="text" placeholder="e.g. MH-01-AB-1234"
                      value={formData.reg} onChange={e => setFormData({...formData, reg: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* VIN */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">VIN</label>
                    <input 
                      required type="text" placeholder="17-character VIN"
                      value={formData.vin} onChange={e => setFormData({...formData, vin: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Owner */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Owner</label>
                    <input 
                      required type="text" placeholder="e.g. Shlok Mehta"
                      value={formData.owner} onChange={e => setFormData({...formData, owner: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Status</label>
                    <select 
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                    >
                      <option>Active</option>
                      <option>In Service</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-subtle)] mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#35D07F] text-black hover:bg-[#2EB86F] transition-colors uppercase tracking-widest">
                    {editingVehicle ? 'Save Changes' : 'Register Vehicle'}
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



