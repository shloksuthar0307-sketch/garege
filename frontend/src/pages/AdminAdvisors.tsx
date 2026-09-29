import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Plus, Phone, Mail, 
  Briefcase, Star, IndianRupee, MessageCircle, MoreHorizontal,
  Edit2, Trash2, X, ExternalLink
} from 'lucide-react';

const INITIAL_ADVISORS = [
  {
    id: 'ADV-01', name: 'Rohan Desai', email: 'rohan.d@jango.com', phone: '+91 98765 00001',
    activeClients: 12, conversionRate: 85.5, csat: 4.8, revenue: 1250000,
    avatar: 'https://i.pravatar.cc/150?u=rohan'
  },
  {
    id: 'ADV-02', name: 'Neha Sharma', email: 'neha.s@jango.com', phone: '+91 98765 00002',
    activeClients: 8, conversionRate: 92.0, csat: 4.9, revenue: 850000,
    avatar: 'https://i.pravatar.cc/150?u=neha'
  },
  {
    id: 'ADV-03', name: 'Vikram Joshi', email: 'vikram.j@jango.com', phone: '+91 98765 00003',
    activeClients: 15, conversionRate: 74.5, csat: 4.2, revenue: 1680000,
    avatar: 'https://i.pravatar.cc/150?u=vikram2'
  },
  {
    id: 'ADV-04', name: 'Pooja Singh', email: 'pooja.s@jango.com', phone: '+91 98765 00004',
    activeClients: 5, conversionRate: 68.0, csat: 4.5, revenue: 420000,
    avatar: 'https://i.pravatar.cc/150?u=pooja'
  }
];

export default function AdminAdvisors() {
  const [advisors, setAdvisors] = useState(INITIAL_ADVISORS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingAdvisor, setEditingAdvisor] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', 
    activeClients: 0, conversionRate: 0, csat: 5.0, revenue: 0, avatar: ''
  });

  const handleOpenModal = (adv = null) => {
    if (adv) {
      setEditingAdvisor(adv);
      setFormData({ ...adv });
    } else {
      setEditingAdvisor(null);
      setFormData({
        name: '', email: '', phone: '', 
        activeClients: 0, conversionRate: 0, csat: 5.0, revenue: 0, 
        avatar: 'https://i.pravatar.cc/150?u=' + Math.random()
      });
    }
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAdvisor) {
      setAdvisors(advisors.map(a => a.id === editingAdvisor.id ? { ...formData, id: a.id } : a));
    } else {
      const newId = 'ADV-0' + (advisors.length + 1);
      setAdvisors([{ ...formData, id: newId }, ...advisors]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this service advisor?')) {
      setAdvisors(advisors.filter(a => a.id !== id));
    }
    setActiveMenuId(null);
  };

  const avgConversion = advisors.length ? (advisors.reduce((sum, a) => sum + Number(a.conversionRate), 0) / advisors.length).toFixed(1) : '0.0';
  const avgCsat = advisors.length ? (advisors.reduce((sum, a) => sum + Number(a.csat), 0) / advisors.length).toFixed(1) : '0.0';

  return (
    <div className="space-y-8 relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">Service Advisors</h1>
          <p className="text-sm text-slate-500 mt-1">Manage customer-facing advisors, view conversion rates, and track revenue generation.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
        >
          <Plus size={16} />
          Add Advisor
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#111112] border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Avg Conversion</span>
            <div className="flex items-center gap-2">
              <span className="text-xl text-[#35D07F] font-light">{avgConversion}%</span>
            </div>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2"></div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Global CSAT</span>
            <div className="flex items-center gap-1.5">
              <Star size={14} className="text-amber-400 fill-current" />
              <span className="text-xl text-white font-light">{avgCsat}<span className="text-sm text-slate-500">/5</span></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search advisors..." 
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
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Service Advisor</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Contact Details</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase text-center">Active Clients</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Conversion Rate</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">CSAT</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase text-right">Revenue (MTD)</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {advisors.map((advisor) => {
                const convRate = Number(advisor.conversionRate);
                const csat = Number(advisor.csat);
                
                return (
                  <tr key={advisor.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={advisor.avatar} alt={advisor.name} className="w-10 h-10 rounded-full border border-white/10" />
                        <div>
                          <div className="text-sm font-medium text-white group-hover:text-[#35D07F] transition-colors cursor-pointer">{advisor.name}</div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">{advisor.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5 text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <Mail size={12} className="text-slate-500" /> {advisor.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={12} className="text-slate-500" /> {advisor.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-sm text-slate-300">
                        <Briefcase size={14} className="text-slate-500" />
                        <span className="font-mono">{advisor.activeClients}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className={'text-sm font-bold font-mono ' + (convRate >= 80 ? 'text-[#35D07F]' : convRate >= 70 ? 'text-amber-400' : 'text-rose-400')}>
                          {convRate}%
                        </span>
                        <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={'h-full rounded-full ' + (convRate >= 80 ? 'bg-[#35D07F]' : convRate >= 70 ? 'bg-amber-400' : 'bg-rose-400')}
                            style={{ width: Math.min(convRate, 100) + '%' }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Star size={14} className={csat >= 4.5 ? 'text-amber-400 fill-current' : 'text-slate-500'} />
                        <span className="text-sm font-mono text-white">{csat}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end text-sm text-white font-mono font-medium">
                        <IndianRupee size={14} className="text-slate-500 mr-0.5" />
                        {Number(advisor.revenue).toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap relative">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => window.location.href = `mailto:${advisor.email}`}
                          className="text-xs text-blue-400 hover:bg-blue-400/10 px-3 py-1.5 rounded transition-colors uppercase tracking-widest font-bold flex items-center gap-1.5"
                        >
                          <MessageCircle size={12} /> Message
                        </button>
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === advisor.id ? null : advisor.id)}
                          className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors focus:outline-none"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeMenuId === advisor.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-8 top-10 w-48 bg-[#1A1A1B] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden text-left"
                          >
                            <Link 
                              to="/advisor/dashboard"
                              className="w-full text-left px-4 py-2.5 text-sm text-[#35D07F] hover:bg-white/5 flex items-center gap-2 transition-colors font-bold"
                            >
                              <ExternalLink size={14} /> Open Advisor Portal
                            </Link>
                            <div className="h-px bg-white/10"></div>
                            <button 
                              onClick={() => handleOpenModal(advisor)}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <Edit2 size={14} /> Edit Advisor
                            </button>
                            <div className="h-px bg-white/10"></div>
                            <button 
                              onClick={() => handleDelete(advisor.id)}
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
          <span>Showing {advisors.length} advisors</span>
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
                  {editingAdvisor ? 'Edit Advisor Profile' : 'Add New Advisor'}
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
                      required type="text" placeholder="e.g. Rohan Desai"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                    <input 
                      required type="email" placeholder="rohan@jango.com"
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                    <input 
                      required type="text" placeholder="+91 98765 00001"
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Active Clients */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Clients</label>
                    <input 
                      type="number" min="0"
                      value={formData.activeClients} onChange={e => setFormData({...formData, activeClients: parseInt(e.target.value) || 0})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Conversion Rate */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Conversion Rate %</label>
                    <input 
                      type="number" min="0" max="100" step="0.1"
                      value={formData.conversionRate} onChange={e => setFormData({...formData, conversionRate: parseFloat(e.target.value) || 0})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* CSAT */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">CSAT (0-5)</label>
                    <input 
                      type="number" min="0" max="5" step="0.1"
                      value={formData.csat} onChange={e => setFormData({...formData, csat: parseFloat(e.target.value) || 0})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Revenue */}
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Revenue MTD (?)</label>
                    <input 
                      type="number" min="0" step="1000"
                      value={formData.revenue} onChange={e => setFormData({...formData, revenue: parseInt(e.target.value) || 0})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#35D07F] text-black hover:bg-[#2EB86F] transition-colors uppercase tracking-widest">
                    {editingAdvisor ? 'Save Changes' : 'Add Advisor'}
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

