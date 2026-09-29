import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, Filter, Plus, Car, Calendar, 
  ChevronRight, Wrench, MoreHorizontal, Edit2, Trash2, X
} from 'lucide-react';

const INITIAL_VEHICLES = [
  {
    id: 'VH-1024', make: 'Porsche', model: '718 Cayman', year: '2021',
    reg: 'MH-01-AB-1234', vin: 'WP0ZZZ98...4452', owner: 'Shlok Mehta',
    lastService: '2026-09-22', status: 'In Service',
    color: 'Guards Red'
  },
  {
    id: 'VH-1018', make: 'BMW', model: 'M4 Competition', year: '2023',
    reg: 'KA-03-YZ-9999', vin: 'WBS43AY0...8821', owner: 'Rahul Dravid',
    lastService: '2026-08-15', status: 'Active',
    color: 'Isle of Man Green'
  },
  {
    id: 'VH-1015', make: 'Audi', model: 'A6 45 TFSI', year: '2022',
    reg: 'DL-04-ZZ-9999', vin: 'WAUZZZF2...1109', owner: 'Priya Kumar',
    lastService: '2026-07-10', status: 'Active',
    color: 'Mythos Black'
  },
  {
    id: 'VH-1010', make: 'Mercedes-Benz', model: 'C 300d', year: '2022',
    reg: 'TN-01-CC-4444', vin: 'WDD20600...3321', owner: 'Suresh Raina',
    lastService: '2026-09-01', status: 'Active',
    color: 'Polar White'
  },
  {
    id: 'VH-1006', make: 'Honda', model: 'City ZX', year: '2020',
    reg: 'HR-26-BB-3333', vin: 'MAKGM668...5501', owner: 'Amit Patel',
    lastService: '2025-01-15', status: 'Inactive',
    color: 'Radiant Red'
  }
];

const STATUS_COLORS: Record<string, string> = {
  'Active': 'bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/20',
  'In Service': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Inactive': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const location = useLocation();

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

  const handleOpenModal = (vehicle = null) => {
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
          <h1 className="text-3xl font-light text-white tracking-tight">Vehicle Management</h1>
          <p className="text-sm text-slate-500 mt-1">Complete registry of all customer vehicles in the database.</p>
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
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#111112] border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Total Vehicles</span>
            <span className="text-xl text-white font-light">{vehicles.length}</span>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2"></div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Currently In Workshop</span>
            <span className="text-xl text-blue-400 font-light">
              {vehicles.filter(v => v.status === 'In Service').length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search make, model, reg, VIN..." 
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
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111112] border border-white/5 rounded-2xl overflow-visible"
      >
        <div className="overflow-visible min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Make & Model</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Registration & VIN</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Owner</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Last Service</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {vehicles.map((vehicle) => {
                return (
                  <tr key={vehicle.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center">
                          <Car size={20} className="text-slate-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{vehicle.make} {vehicle.model}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{vehicle.year} &bull; {vehicle.color}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-white bg-white/5 px-2 py-0.5 rounded w-fit border border-white/10">
                        {vehicle.reg}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1.5 uppercase tracking-widest">
                        VIN: {vehicle.vin}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                        {vehicle.owner} <ChevronRight size={14} />
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Calendar size={14} className="text-slate-500" />
                        {vehicle.lastService ? new Date(vehicle.lastService).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={'flex items-center gap-1.5 px-2.5 py-1 rounded-full border w-fit ' + (STATUS_COLORS[vehicle.status] || 'bg-white/5')}>
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
                          className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors focus:outline-none"
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
                            className="absolute right-8 top-10 w-40 bg-[#1A1A1B] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden text-left"
                          >
                            <button 
                              onClick={() => handleOpenModal(vehicle)}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <Edit2 size={14} /> Edit Vehicle
                            </button>
                            <div className="h-px bg-white/10"></div>
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
        
        <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-slate-500">
          <span>Showing {vehicles.length} vehicles</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors">Prev</button>
            <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors">Next</button>
          </div>
        </div>
      </motion.div>

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
                  {editingVehicle ? 'Edit Vehicle Registry' : 'Register New Vehicle'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Make */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Make</label>
                    <input 
                      required type="text" placeholder="e.g. Porsche"
                      value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Model */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Model</label>
                    <input 
                      required type="text" placeholder="e.g. 718 Cayman"
                      value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Year */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Year</label>
                    <input 
                      required type="text" placeholder="e.g. 2021"
                      value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Color */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Color</label>
                    <input 
                      required type="text" placeholder="e.g. Guards Red"
                      value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Registration */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Registration No.</label>
                    <input 
                      required type="text" placeholder="e.g. MH-01-AB-1234"
                      value={formData.reg} onChange={e => setFormData({...formData, reg: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* VIN */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">VIN</label>
                    <input 
                      required type="text" placeholder="17-character VIN"
                      value={formData.vin} onChange={e => setFormData({...formData, vin: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Owner */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Owner</label>
                    <input 
                      required type="text" placeholder="e.g. Shlok Mehta"
                      value={formData.owner} onChange={e => setFormData({...formData, owner: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</label>
                    <select 
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    >
                      <option>Active</option>
                      <option>In Service</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
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

