import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Plus, ShieldCheck, Clock, CheckCircle2, 
  XCircle, Smartphone, Mail, MessageSquare, Phone, MoreHorizontal,
  Edit2, Trash2, X
} from 'lucide-react';

const INITIAL_APPROVALS = [
  {
    id: 'AUTH-7092', entityId: 'EST-9042', type: 'Estimate', 
    customer: 'Shlok Mehta', vehicle: 'Porsche 718 Cayman',
    channel: 'App', status: 'Approved', 
    timestamp: '2026-09-22T11:05:00', authorizedBy: 'Shlok Mehta',
    signature: 'IP: 192.168.1.45 | Fingerprint: a8f9c2'
  },
  {
    id: 'AUTH-7091', entityId: 'ISS-4088', type: 'Repair Issue', 
    customer: 'Rahul Dravid', vehicle: 'BMW M4',
    channel: 'SMS', status: 'Approved', 
    timestamp: '2026-09-21T16:30:00', authorizedBy: 'Rahul Dravid',
    signature: 'Reply: YES | +91 98765 43210'
  },
  {
    id: 'AUTH-7085', entityId: 'EST-9035', type: 'Estimate', 
    customer: 'Priya Kumar', vehicle: 'Audi A6',
    channel: 'Email', status: 'Declined', 
    timestamp: '2026-09-20T14:15:00', authorizedBy: 'Priya Kumar',
    signature: 'priya.k@email.com | Token Validated'
  },
  {
    id: 'AUTH-7080', entityId: 'EST-9030', type: 'Estimate', 
    customer: 'Amit Patel', vehicle: 'Honda City',
    channel: 'Verbal', status: 'Approved', 
    timestamp: '2026-09-20T14:20:00', authorizedBy: 'Amit Patel (via Vikram)',
    signature: 'Call Recording ID: CR-4899'
  }
];

const STATUS_CONFIG: Record<string, { icon: React.ElementType, color: string, bg: string }> = {
  'Pending': { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  'Approved': { icon: CheckCircle2, color: 'text-[#35D07F]', bg: 'bg-[#35D07F]/10 border-[#35D07F]/20' },
  'Declined': { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
};

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  'App': Smartphone,
  'Email': Mail,
  'SMS': MessageSquare,
  'Verbal': Phone,
};

export default function AdminApprovals() {
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingApproval, setEditingApproval] = useState<any>(null);

  const [formData, setFormData] = useState({
    entityId: '', type: 'Estimate', customer: '', vehicle: '',
    channel: 'App', status: 'Pending', authorizedBy: '', signature: '', timestamp: ''
  });

  const handleOpenModal = (approval = null) => {
    if (approval) {
      setEditingApproval(approval);
      setFormData({ ...approval });
    } else {
      setEditingApproval(null);
      setFormData({
        entityId: '', type: 'Estimate', customer: '', vehicle: '',
        channel: 'App', status: 'Pending', authorizedBy: '', signature: '', 
        timestamp: new Date().toISOString()
      });
    }
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingApproval) {
      setApprovals(approvals.map(i => i.id === editingApproval.id ? { ...formData, id: i.id } : i));
    } else {
      const newId = 'AUTH-' + Math.floor(1000 + Math.random() * 9000);
      setApprovals([{ ...formData, id: newId }, ...approvals]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this authorization record? This affects audit trails.')) {
      setApprovals(approvals.filter(i => i.id !== id));
    }
    setActiveMenuId(null);
  };

  const changeStatus = (id: string, newStatus: string) => {
    setApprovals(approvals.map(app => app.id === id ? { ...app, status: newStatus } : app));
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-8 relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">Customer Approvals</h1>
          <p className="text-sm text-slate-500 mt-1">Audit log of all digital and verbal authorizations for repairs and estimates.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
        >
          <Plus size={16} />
          Record Approval
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#111112] border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Pending Signatures</span>
            <span className="text-xl text-amber-400 font-light">
              {approvals.filter(a => a.status === 'Pending').length}
            </span>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2"></div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Approved Records</span>
            <span className="text-xl text-[#35D07F] font-light">
              {approvals.filter(a => a.status === 'Approved').length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search authorizations..." 
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
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Approval ID & Time</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Customer & Vehicle</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Reference Entity</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Channel</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Digital Signature / Audit</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {approvals.map((approval) => {
                const StatusIcon = STATUS_CONFIG[approval.status].icon;
                const ChannelIcon = CHANNEL_ICONS[approval.channel] || Smartphone;
                
                return (
                  <tr key={approval.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className={approval.status === 'Approved' ? 'text-[#35D07F]' : 'text-slate-500'} />
                        <span className="text-sm font-mono text-white group-hover:text-[#35D07F] transition-colors">{approval.id}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {approval.timestamp ? new Date(approval.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ' at ' + new Date(approval.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">{approval.customer}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{approval.vehicle}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-slate-300 border border-white/10">
                          {approval.entityId}
                        </span>
                        <span className="text-xs text-slate-500">{approval.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <ChannelIcon size={14} className="text-slate-500" />
                        {approval.channel}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={'flex items-center gap-1.5 px-2.5 py-1 rounded border w-fit ' + STATUS_CONFIG[approval.status].bg + ' ' + STATUS_CONFIG[approval.status].color}>
                        <StatusIcon size={12} />
                        <span className="text-xs font-bold">{approval.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300">{approval.authorizedBy}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">{approval.signature}</div>
                    </td>
                    <td className="px-6 py-4 text-right relative whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {approval.status === 'Pending' && (
                          <button 
                            onClick={() => changeStatus(approval.id, 'Approved')}
                            className="text-xs text-[#35D07F] hover:bg-[#35D07F]/10 px-3 py-1.5 rounded transition-colors uppercase tracking-widest font-bold flex items-center gap-1"
                          >
                            <CheckCircle2 size={12} /> Approve
                          </button>
                        )}
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === approval.id ? null : approval.id)}
                          className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors focus:outline-none"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeMenuId === approval.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-8 top-10 w-40 bg-[#1A1A1B] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden text-left"
                          >
                            <button 
                              onClick={() => handleOpenModal(approval)}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <Edit2 size={14} /> Edit Record
                            </button>
                            {approval.status !== 'Declined' && (
                              <button 
                                onClick={() => changeStatus(approval.id, 'Declined')}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                              >
                                <XCircle size={14} /> Mark Declined
                              </button>
                            )}
                            <div className="h-px bg-white/10"></div>
                            <button 
                              onClick={() => handleDelete(approval.id)}
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
          <span>Showing {approvals.length} recent authorizations</span>
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
                  {editingApproval ? 'Edit Authorization' : 'Record New Authorization'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Entity ID */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reference ID</label>
                    <input 
                      required type="text" placeholder="e.g. EST-9042"
                      value={formData.entityId} onChange={e => setFormData({...formData, entityId: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Entity Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Entity Type</label>
                    <select 
                      value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    >
                      <option>Estimate</option>
                      <option>Repair Issue</option>
                      <option>Work Order</option>
                    </select>
                  </div>
                  {/* Customer */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Customer Name</label>
                    <input 
                      required type="text" placeholder="e.g. Shlok Mehta"
                      value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})}
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
                  {/* Channel */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Auth Channel</label>
                    <select 
                      value={formData.channel} onChange={e => setFormData({...formData, channel: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    >
                      <option>App</option>
                      <option>Email</option>
                      <option>SMS</option>
                      <option>Verbal</option>
                    </select>
                  </div>
                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</label>
                    <select 
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    >
                      <option>Pending</option>
                      <option>Approved</option>
                      <option>Declined</option>
                    </select>
                  </div>
                  {/* Authorized By */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Authorized By</label>
                    <input 
                      required type="text" placeholder="Name or System"
                      value={formData.authorizedBy} onChange={e => setFormData({...formData, authorizedBy: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Signature Trail */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Audit Signature</label>
                    <input 
                      required type="text" placeholder="IP Address, Call ID, etc."
                      value={formData.signature} onChange={e => setFormData({...formData, signature: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#35D07F] text-black hover:bg-[#2EB86F] transition-colors uppercase tracking-widest">
                    {editingApproval ? 'Save Changes' : 'Record Approval'}
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

