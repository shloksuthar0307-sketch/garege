import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Plus, FileText, 
  MoreHorizontal, AlertCircle, Camera, CheckCircle, Clock, ShieldCheck,
  Edit2, Trash2, X
} from 'lucide-react';

const INITIAL_INSPECTIONS = [
  {
    id: 'INSP-1092', bookingId: 'BK-10042', vehicle: 'Porsche 718 Cayman', reg: 'MH-01-AB-1234',
    template: '50-Point Pre-Service Check', tech: 'Rahul Sharma', status: 'In Progress',
    issuesFound: 2, evidenceCount: 4, date: '2026-09-22T09:15:00'
  },
  {
    id: 'INSP-1091', bookingId: 'BK-10039', vehicle: 'BMW M4', reg: 'KA-03-YZ-9999',
    template: 'Brake System Diagnostic', tech: 'Suresh Kumar', status: 'Completed',
    issuesFound: 1, evidenceCount: 8, date: '2026-09-21T11:30:00'
  },
  {
    id: 'INSP-1088', bookingId: 'BK-10024', vehicle: 'Honda City', reg: 'KA-05-AA-1111',
    template: 'Post-Repair Quality Control', tech: 'Vikram Singh', status: 'Reviewed',
    issuesFound: 0, evidenceCount: 2, date: '2026-09-20T16:45:00'
  },
  {
    id: 'INSP-1085', bookingId: 'BK-10015', vehicle: 'Ford Endeavour', reg: 'HR-26-BB-3333',
    template: 'Comprehensive 120-Point', tech: 'Amit Patel', status: 'Completed',
    issuesFound: 4, evidenceCount: 12, date: '2026-09-19T10:00:00'
  },
  {
    id: 'INSP-1080', bookingId: 'BK-10010', vehicle: 'Mercedes C-Class', reg: 'TS-09-CC-4444',
    template: 'AC System Check', tech: 'Unassigned', status: 'Pending',
    issuesFound: 0, evidenceCount: 0, date: '2026-09-23T09:00:00'
  }
];

const STATUS_COLORS: Record<string, string> = {
  'Pending': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'In Progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Completed': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Reviewed': 'bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/20',
};

export default function AdminInspections() {
  const [inspections, setInspections] = useState(INITIAL_INSPECTIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingInspection, setEditingInspection] = useState<any>(null);

  const [formData, setFormData] = useState({
    vehicle: '', reg: '', bookingId: '', template: '', tech: '', 
    status: 'Pending', issuesFound: 0, evidenceCount: 0, date: ''
  });

  const handleOpenModal = (inspection = null) => {
    if (inspection) {
      setEditingInspection(inspection);
      setFormData({ ...inspection });
    } else {
      setEditingInspection(null);
      setFormData({
        vehicle: '', reg: '', bookingId: '', template: '', tech: '', 
        status: 'Pending', issuesFound: 0, evidenceCount: 0, date: ''
      });
    }
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInspection) {
      setInspections(inspections.map(i => i.id === editingInspection.id ? { ...formData, id: i.id } : i));
    } else {
      const newId = 'INSP-' + Math.floor(1000 + Math.random() * 9000);
      setInspections([{ ...formData, id: newId }, ...inspections]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this inspection record?')) {
      setInspections(inspections.filter(i => i.id !== id));
    }
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-8 relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">Inspections</h1>
          <p className="text-sm text-slate-500 mt-1">Review multi-point inspection reports and identified issues.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
        >
          <Plus size={16} />
          New Inspection
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#111112] border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Total Inspections</span>
            <span className="text-xl text-white font-light">{inspections.length}</span>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2"></div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Pending Review</span>
            <span className="text-xl text-amber-400 font-light">
              {inspections.filter(i => i.status === 'Pending').length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search inspections..." 
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
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Inspection ID</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Vehicle & Booking</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Template & Tech</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Findings</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inspections.map((insp) => (
                <tr key={insp.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-slate-500" />
                      <span className="text-sm font-mono text-white group-hover:text-[#35D07F] transition-colors">{insp.id}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                      <Clock size={10} /> 
                      {insp.date ? new Date(insp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Date'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{insp.vehicle}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-[10px]">{insp.reg}</span>
                      <span>&bull; {insp.bookingId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-[#35D07F]" />
                      <span className="text-sm text-slate-300">{insp.template}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Tech: <span className={!insp.tech || insp.tech === 'Unassigned' ? 'italic' : 'text-slate-400'}>{insp.tech || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1.5">
                      {Number(insp.issuesFound) > 0 ? (
                        <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded w-fit">
                          <AlertCircle size={12} /> {insp.issuesFound} Issues Found
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded w-fit">
                          <CheckCircle size={12} /> All Clear
                        </div>
                      )}
                      
                      {Number(insp.evidenceCount) > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-widest">
                          <Camera size={10} /> {insp.evidenceCount} Media attached
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={'px-3 py-1 rounded-full text-xs border ' + (STATUS_COLORS[insp.status] || 'bg-white/5 text-slate-400 border-white/10')}>
                      {insp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right relative">
                    <div className="flex items-center justify-end gap-2">
                      <button className="text-xs text-[#35D07F] hover:bg-[#35D07F]/10 px-3 py-1.5 rounded transition-colors uppercase tracking-widest font-bold">
                        View
                      </button>
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === insp.id ? null : insp.id)}
                        className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors focus:outline-none"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {activeMenuId === insp.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-8 top-10 w-40 bg-[#1A1A1B] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden text-left"
                        >
                          <button 
                            onClick={() => handleOpenModal(insp)}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                          >
                            <Edit2 size={14} /> Edit Inspection
                          </button>
                          <div className="h-px bg-white/10"></div>
                          <button 
                            onClick={() => handleDelete(insp.id)}
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
          <span>Showing {inspections.length} recent inspections</span>
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
                  {editingInspection ? 'Edit Inspection' : 'New Inspection Record'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vehicle</label>
                    <input 
                      required type="text"
                      value={formData.vehicle} onChange={e => setFormData({...formData, vehicle: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reg No.</label>
                    <input 
                      required type="text"
                      value={formData.reg} onChange={e => setFormData({...formData, reg: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Booking ID</label>
                    <input 
                      required type="text"
                      value={formData.bookingId} onChange={e => setFormData({...formData, bookingId: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Inspection Template</label>
                    <select 
                      value={formData.template} onChange={e => setFormData({...formData, template: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    >
                      <option value="">Select Template</option>
                      <option>50-Point Pre-Service Check</option>
                      <option>Comprehensive 120-Point</option>
                      <option>Brake System Diagnostic</option>
                      <option>AC System Check</option>
                      <option>Post-Repair Quality Control</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Technician</label>
                    <input 
                      type="text" placeholder="Unassigned"
                      value={formData.tech} onChange={e => setFormData({...formData, tech: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</label>
                    <select 
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    >
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                      <option>Reviewed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Issues Found</label>
                    <input 
                      type="number" min="0"
                      value={formData.issuesFound} onChange={e => setFormData({...formData, issuesFound: parseInt(e.target.value) || 0})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Evidence Files Count</label>
                    <input 
                      type="number" min="0"
                      value={formData.evidenceCount} onChange={e => setFormData({...formData, evidenceCount: parseInt(e.target.value) || 0})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#35D07F] text-black hover:bg-[#2EB86F] transition-colors uppercase tracking-widest">
                    {editingInspection ? 'Save Changes' : 'Create Record'}
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

