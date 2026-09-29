import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Plus, AlertTriangle, AlertOctagon, 
  AlertCircle, Info, MoreHorizontal, IndianRupee, Image as ImageIcon,
  Edit2, Trash2, X
} from 'lucide-react';

const INITIAL_ISSUES = [
  {
    id: 'ISS-4092', bookingId: 'BK-10042', vehicle: 'Porsche 718 Cayman', date: '2026-09-22T10:15:00',
    category: 'Engine', title: 'Timing Chain Tensioner Wear', severity: 'Critical',
    status: 'Identified', estCost: 45000, evidenceCount: 3
  },
  {
    id: 'ISS-4091', bookingId: 'BK-10042', vehicle: 'Porsche 718 Cayman', date: '2026-09-22T10:20:00',
    category: 'Suspension', title: 'Front Left Strut Leaking', severity: 'High',
    status: 'Quoted', estCost: 12500, evidenceCount: 1
  },
  {
    id: 'ISS-4088', bookingId: 'BK-10039', vehicle: 'BMW M4', date: '2026-09-21T14:30:00',
    category: 'Brakes', title: 'Rear Brake Pads Worn (2mm remaining)', severity: 'Critical',
    status: 'Approved', estCost: 68000, evidenceCount: 2
  },
  {
    id: 'ISS-4085', bookingId: 'BK-10035', vehicle: 'Audi A6', date: '2026-09-20T09:00:00',
    category: 'Electrical', title: 'Battery Health at 45%', severity: 'Medium',
    status: 'Identified', estCost: 0, evidenceCount: 0
  },
  {
    id: 'ISS-4080', bookingId: 'BK-10024', vehicle: 'Honda City', date: '2026-09-19T16:45:00',
    category: 'Aesthetic', title: 'Rear Bumper Scratch (Deep)', severity: 'Low',
    status: 'Repaired', estCost: 18000, evidenceCount: 4
  },
  {
    id: 'ISS-4075', bookingId: 'BK-10015', vehicle: 'Ford Endeavour', date: '2026-09-18T11:00:00',
    category: 'HVAC', title: 'AC Compressor Noise', severity: 'High',
    status: 'Deferred', estCost: 3200, evidenceCount: 1
  }
];

const SEVERITY_CONFIG: Record<string, { icon: React.ElementType, color: string, bg: string }> = {
  'Critical': { icon: AlertOctagon, color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' },
  'High': { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
  'Medium': { icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  'Low': { icon: Info, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
};

const STATUS_COLORS: Record<string, string> = {
  'Identified': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'Quoted': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Approved': 'bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/20',
  'Repaired': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Deferred': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const CATEGORIES = ['Engine', 'Suspension', 'Brakes', 'Electrical', 'Aesthetic', 'HVAC', 'Transmission', 'Exhaust', 'Other'];

export default function AdminIssues() {
  const [issues, setIssues] = useState(INITIAL_ISSUES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingIssue, setEditingIssue] = useState<any>(null);

  const [formData, setFormData] = useState({
    bookingId: '', vehicle: '', category: 'Engine', title: '', 
    severity: 'Medium', status: 'Identified', estCost: 0, evidenceCount: 0, date: ''
  });

  const handleOpenModal = (issue = null) => {
    if (issue) {
      setEditingIssue(issue);
      setFormData({ ...issue });
    } else {
      setEditingIssue(null);
      setFormData({
        bookingId: '', vehicle: '', category: 'Engine', title: '', 
        severity: 'Medium', status: 'Identified', estCost: 0, evidenceCount: 0, 
        date: new Date().toISOString()
      });
    }
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIssue) {
      setIssues(issues.map(i => i.id === editingIssue.id ? { ...formData, id: i.id } : i));
    } else {
      const newId = 'ISS-' + Math.floor(1000 + Math.random() * 9000);
      setIssues([{ ...formData, id: newId }, ...issues]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this issue record?')) {
      setIssues(issues.filter(i => i.id !== id));
    }
    setActiveMenuId(null);
  };

  const criticalCount = issues.filter(i => i.severity === 'Critical' && ['Identified', 'Quoted'].includes(i.status)).length;

  return (
    <div className="space-y-8 relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">Repair Issues</h1>
          <p className="text-sm text-slate-500 mt-1">Global log of all mechanical and aesthetic issues discovered during inspections.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
        >
          <Plus size={16} />
          Log Issue
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#111112] border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Active Critical</span>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <span className="text-xl text-rose-500 font-light">{criticalCount}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search issues..." 
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
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Issue ID & Date</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Vehicle & Category</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Description</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Severity</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase text-right">Est. Cost</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {issues.map((issue) => {
                const SeverityIcon = SEVERITY_CONFIG[issue.severity].icon;
                const isUnresolvedCritical = issue.severity === 'Critical' && ['Identified', 'Quoted'].includes(issue.status);

                return (
                  <tr key={issue.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-white group-hover:text-[#35D07F] transition-colors">{issue.id}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {issue.date ? new Date(issue.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">{issue.vehicle}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-[10px]">{issue.bookingId}</span>
                        <span>&bull; {issue.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-200">{issue.title}</div>
                      {Number(issue.evidenceCount) > 0 && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1.5 uppercase tracking-widest">
                          <ImageIcon size={10} /> {issue.evidenceCount} photos attached
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={'flex items-center gap-1.5 px-2.5 py-1 rounded border w-fit ' + SEVERITY_CONFIG[issue.severity].bg + ' ' + SEVERITY_CONFIG[issue.severity].color}>
                        {isUnresolvedCritical && (
                          <span className="relative flex h-2 w-2 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                          </span>
                        )}
                        {!isUnresolvedCritical && <SeverityIcon size={12} />}
                        <span className="text-xs font-bold">{issue.severity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={'px-3 py-1 rounded-full text-[11px] uppercase tracking-widest font-bold border ' + (STATUS_COLORS[issue.status] || 'bg-white/5 text-slate-400 border-white/10')}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {Number(issue.estCost) > 0 ? (
                        <div className="flex items-center justify-end text-sm text-white font-mono">
                          <IndianRupee size={14} className="text-slate-500 mr-0.5" />
                          {Number(issue.estCost).toLocaleString('en-IN')}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === issue.id ? null : issue.id)}
                        className="text-slate-500 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors focus:outline-none"
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeMenuId === issue.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-8 top-10 w-40 bg-[#1A1A1B] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden text-left"
                          >
                            <button 
                              onClick={() => handleOpenModal(issue)}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <Edit2 size={14} /> Edit Issue
                            </button>
                            <div className="h-px bg-white/10"></div>
                            <button 
                              onClick={() => handleDelete(issue.id)}
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
          <span>Showing {issues.length} recent issues</span>
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
                  {editingIssue ? 'Edit Issue' : 'Log New Issue'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Booking ID */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Booking ID</label>
                    <input 
                      required type="text" placeholder="e.g. BK-10042"
                      value={formData.bookingId} onChange={e => setFormData({...formData, bookingId: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Vehicle */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vehicle</label>
                    <input 
                      required type="text" placeholder="e.g. Porsche 718 Cayman"
                      value={formData.vehicle} onChange={e => setFormData({...formData, vehicle: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
                    <select 
                      value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    >
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  {/* Severity */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Severity</label>
                    <select 
                      value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                  {/* Title */}
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Issue Description</label>
                    <input 
                      required type="text" placeholder="e.g. Timing Chain Tensioner Wear"
                      value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
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
                      <option>Identified</option>
                      <option>Quoted</option>
                      <option>Approved</option>
                      <option>Deferred</option>
                      <option>Repaired</option>
                    </select>
                  </div>
                  {/* Est Cost */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Est. Cost (?)</label>
                    <input 
                      type="number" min="0" step="100"
                      value={formData.estCost} onChange={e => setFormData({...formData, estCost: parseInt(e.target.value) || 0})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#35D07F] text-black hover:bg-[#2EB86F] transition-colors uppercase tracking-widest">
                    {editingIssue ? 'Save Changes' : 'Log Issue'}
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

