import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Plus, Phone, Wrench, 
  Activity, MoreHorizontal, Edit2, Trash2, X, ExternalLink
} from 'lucide-react';

const INITIAL_TECHNICIANS = [
  {
    id: 'TECH-001', name: 'Vikram Singh', specialization: 'Master Technician (German Brands)',
    phone: '+91 98765 11111', activeJobs: 3, efficiency: 94.5,
    status: 'On Duty', avatar: 'https://i.pravatar.cc/150?u=vikram'
  },
  {
    id: 'TECH-002', name: 'Suresh Kumar', specialization: 'Suspension & Brakes Specialist',
    phone: '+91 98765 22222', activeJobs: 1, efficiency: 88.2,
    status: 'On Duty', avatar: 'https://i.pravatar.cc/150?u=suresh'
  },
  {
    id: 'TECH-003', name: 'Amit Patel', specialization: 'Diagnostics & Electrical',
    phone: '+91 98765 33333', activeJobs: 2, efficiency: 91.0,
    status: 'On Duty', avatar: 'https://i.pravatar.cc/150?u=amit'
  },
  {
    id: 'TECH-004', name: 'Rahul Sharma', specialization: 'General Service & Maintenance',
    phone: '+91 98765 44444', activeJobs: 0, efficiency: 82.5,
    status: 'Off Duty', avatar: 'https://i.pravatar.cc/150?u=rahul'
  },
  {
    id: 'TECH-005', name: 'Arjun Reddy', specialization: 'Aesthetic & Bodywork',
    phone: '+91 98765 55555', activeJobs: 0, efficiency: 87.9,
    status: 'On Leave', avatar: 'https://i.pravatar.cc/150?u=arjun'
  }
];

const STATUS_COLORS: Record<string, string> = {
  'On Duty': 'bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/20',
  'Off Duty': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'On Leave': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default function AdminTechnicians() {
  const [technicians, setTechnicians] = useState(INITIAL_TECHNICIANS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingTech, setEditingTech] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '', specialization: '', phone: '', 
    activeJobs: 0, efficiency: 85.0, status: 'On Duty', avatar: ''
  });

  const handleOpenModal = (tech = null) => {
    if (tech) {
      setEditingTech(tech);
      setFormData({ ...tech });
    } else {
      setEditingTech(null);
      setFormData({
        name: '', specialization: '', phone: '', 
        activeJobs: 0, efficiency: 85.0, status: 'On Duty', 
        avatar: 'https://i.pravatar.cc/150?u=' + Math.random()
      });
    }
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTech) {
      setTechnicians(technicians.map(t => t.id === editingTech.id ? { ...formData, id: t.id } : t));
    } else {
      const newId = 'TECH-00' + (technicians.length + 1);
      setTechnicians([{ ...formData, id: newId }, ...technicians]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this technician?')) {
      setTechnicians(technicians.filter(t => t.id !== id));
    }
    setActiveMenuId(null);
  };

  const activeCount = technicians.filter(t => t.status === 'On Duty').length;
  const avgEfficiency = (technicians.reduce((sum, t) => sum + Number(t.efficiency), 0) / technicians.length).toFixed(1);

  return (
    <div className="space-y-8 relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">Technicians</h1>
          <p className="text-sm text-slate-500 mt-1">Manage workshop staff, skill specializations, and performance metrics.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
        >
          <Plus size={16} />
          Add Technician
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#111112] border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Active Staff</span>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#35D07F] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#35D07F]"></span>
              </span>
              <span className="text-xl text-white font-light">{activeCount} / {technicians.length}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2"></div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Avg Efficiency</span>
            <div className="flex items-center gap-1.5">
              <Activity size={14} className="text-blue-400" />
              <span className="text-xl text-blue-400 font-light">{avgEfficiency}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by name, ID, skill..." 
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
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Technician</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Specialization</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase text-center">Active Jobs</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Efficiency</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {technicians.map((tech) => {
                const efficiency = Number(tech.efficiency);
                return (
                  <tr key={tech.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={tech.avatar} alt={tech.name} className="w-10 h-10 rounded-full border border-white/10" />
                        <div>
                          <div className="text-sm font-medium text-white group-hover:text-[#35D07F] transition-colors cursor-pointer">{tech.name}</div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">{tech.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 text-sm text-slate-300">
                        {tech.specialization}
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                          <Phone size={10} /> {tech.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm ' + (tech.activeJobs > 0 ? 'bg-[#35D07F]/10 border border-[#35D07F]/20 text-[#35D07F]' : 'bg-white/5 border border-white/10 text-slate-400')}>
                        <Wrench size={14} className={tech.activeJobs > 0 ? 'text-[#35D07F]' : 'text-slate-500'} />
                        <span className="font-mono font-bold">{tech.activeJobs}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className={'text-sm font-bold font-mono ' + (efficiency >= 90 ? 'text-[#35D07F]' : efficiency >= 85 ? 'text-amber-400' : 'text-rose-400')}>
                          {efficiency}%
                        </span>
                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={'h-full rounded-full ' + (efficiency >= 90 ? 'bg-[#35D07F]' : efficiency >= 85 ? 'bg-amber-400' : 'bg-rose-400')}
                            style={{ width: Math.min(efficiency, 100) + '%' }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={'flex items-center gap-1.5 px-2.5 py-1 rounded-full border w-fit ' + (STATUS_COLORS[tech.status] || 'bg-white/5')}>
                        <span className="text-[11px] font-bold uppercase tracking-widest">{tech.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap relative">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-xs text-[#35D07F] hover:bg-[#35D07F]/10 px-3 py-1.5 rounded transition-colors uppercase tracking-widest font-bold">
                          Assign Job
                        </button>
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === tech.id ? null : tech.id)}
                          className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors focus:outline-none"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeMenuId === tech.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-8 top-10 w-48 bg-[#1A1A1B] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden text-left"
                          >
                            <Link 
                              to="/technician/dashboard"
                              className="w-full text-left px-4 py-2.5 text-sm text-[#35D07F] hover:bg-white/5 flex items-center gap-2 transition-colors font-bold"
                            >
                              <ExternalLink size={14} /> Open Tech Portal
                            </Link>
                            <div className="h-px bg-white/10"></div>
                            <button 
                              onClick={() => handleOpenModal(tech)}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <Edit2 size={14} /> Edit Technician
                            </button>
                            <div className="h-px bg-white/10"></div>
                            <button 
                              onClick={() => handleDelete(tech.id)}
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
          <span>Showing {technicians.length} staff members</span>
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
                  {editingTech ? 'Edit Technician Profile' : 'Add New Technician'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                    <input 
                      required type="text" placeholder="e.g. John Doe"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                    <input 
                      required type="text" placeholder="+91 98765 43210"
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Specialization */}
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Specialization</label>
                    <input 
                      required type="text" placeholder="e.g. Master Technician (German Brands)"
                      value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})}
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
                      <option>On Duty</option>
                      <option>Off Duty</option>
                      <option>On Leave</option>
                    </select>
                  </div>
                  {/* Efficiency */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Efficiency %</label>
                    <input 
                      type="number" min="0" max="100" step="0.1"
                      value={formData.efficiency} onChange={e => setFormData({...formData, efficiency: parseFloat(e.target.value) || 0})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#35D07F] text-black hover:bg-[#2EB86F] transition-colors uppercase tracking-widest">
                    {editingTech ? 'Save Changes' : 'Add Technician'}
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

