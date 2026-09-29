import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Search, Filter, Plus, FileSignature, Clock, 
  Send, IndianRupee, CheckCircle2, XCircle, MoreHorizontal,
  Edit2, Trash2, X
} from 'lucide-react';

const INITIAL_ESTIMATES = [
  {
    id: 'EST-9042', bookingId: 'BK-10042', customer: 'Shlok Mehta', vehicle: 'Porsche 718 Cayman',
    date: '2026-09-22T10:45:00', expiry: '2026-09-29T10:45:00',
    itemsCount: 4, amount: 57500, status: 'Sent'
  },
  {
    id: 'EST-9041', bookingId: 'BK-10042', customer: 'Shlok Mehta', vehicle: 'Porsche 718 Cayman',
    date: '2026-09-22T10:30:00', expiry: '2026-09-29T10:30:00',
    itemsCount: 1, amount: 12500, status: 'Draft'
  },
  {
    id: 'EST-9038', bookingId: 'BK-10039', customer: 'Rahul Dravid', vehicle: 'BMW M4',
    date: '2026-09-21T15:00:00', expiry: '2026-09-28T15:00:00',
    itemsCount: 2, amount: 68000, status: 'Viewed'
  },
  {
    id: 'EST-9035', bookingId: 'BK-10035', customer: 'Priya Kumar', vehicle: 'Audi A6',
    date: '2026-09-20T11:00:00', expiry: '2026-09-27T11:00:00',
    itemsCount: 6, amount: 142000, status: 'Approved'
  },
  {
    id: 'EST-9030', bookingId: 'BK-10024', customer: 'Amit Patel', vehicle: 'Honda City',
    date: '2026-09-19T14:00:00', expiry: '2026-09-20T14:00:00', // Expired
    itemsCount: 3, amount: 18000, status: 'Expired'
  },
  {
    id: 'EST-9025', bookingId: 'BK-10015', customer: 'Vikram Singh', vehicle: 'Ford Endeavour',
    date: '2026-09-18T09:30:00', expiry: '2026-09-25T09:30:00',
    itemsCount: 1, amount: 3200, status: 'Rejected'
  }
];

const STATUS_CONFIG: Record<string, { icon: React.ElementType, bg: string, color: string }> = {
  'Draft': { icon: FileSignature, bg: 'bg-slate-500/10 border-slate-500/20', color: 'text-slate-400' },
  'Sent': { icon: Send, bg: 'bg-blue-500/10 border-blue-500/20', color: 'text-blue-400' },
  'Viewed': { icon: Clock, bg: 'bg-amber-500/10 border-amber-500/20', color: 'text-amber-400' },
  'Approved': { icon: CheckCircle2, bg: 'bg-[#35D07F]/10 border-[#35D07F]/20', color: 'text-[#35D07F]' },
  'Rejected': { icon: XCircle, bg: 'bg-rose-500/10 border-rose-500/20', color: 'text-rose-400' },
  'Expired': { icon: XCircle, bg: 'bg-slate-500/10 border-slate-500/20', color: 'text-slate-600' },
};

export default function AdminEstimates() {
  const [estimates, setEstimates] = useState(INITIAL_ESTIMATES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingEstimate, setEditingEstimate] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.action === 'new') {
      setIsModalOpen(true);
      setEditingEstimate(null);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const [formData, setFormData] = useState({
    bookingId: '', customer: '', vehicle: '', 
    itemsCount: 1, amount: 0, status: 'Draft',
    date: '', expiry: ''
  });

  const handleOpenModal = (est = null) => {
    if (est) {
      setEditingEstimate(est);
      setFormData({ ...est });
    } else {
      setEditingEstimate(null);
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      setFormData({
        bookingId: '', customer: '', vehicle: '', 
        itemsCount: 1, amount: 0, status: 'Draft',
        date: now.toISOString(), expiry: nextWeek.toISOString()
      });
    }
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEstimate) {
      setEstimates(estimates.map(i => i.id === editingEstimate.id ? { ...formData, id: i.id } : i));
    } else {
      const newId = 'EST-' + Math.floor(1000 + Math.random() * 9000);
      setEstimates([{ ...formData, id: newId }, ...estimates]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this estimate?')) {
      setEstimates(estimates.filter(i => i.id !== id));
    }
    setActiveMenuId(null);
  };

  const changeStatus = (id: string, newStatus: string) => {
    setEstimates(estimates.map(est => est.id === id ? { ...est, status: newStatus } : est));
    setActiveMenuId(null);
  };

  // Calculate total awaiting approval amount
  const awaitingApprovalAmount = estimates
    .filter(est => est.status === 'Sent' || est.status === 'Viewed')
    .reduce((sum, est) => sum + Number(est.amount), 0);

  return (
    <div className="space-y-8 relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">Estimates</h1>
          <p className="text-sm text-slate-500 mt-1">Manage repair estimates, customer quotes, and approvals.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
        >
          <Plus size={16} />
          Create Estimate
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#111112] border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Awaiting Approval</span>
            <div className="flex items-center gap-1">
              <IndianRupee size={14} className="text-amber-400" />
              <span className="text-xl text-amber-400 font-light">{awaitingApprovalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search estimates..." 
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
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Estimate ID</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Customer & Vehicle</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Details</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase text-right">Total Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {estimates.map((est) => {
                const StatusIcon = STATUS_CONFIG[est.status].icon;
                const isExpiringSoon = est.expiry && new Date(est.expiry).getTime() - new Date().getTime() < 86400000 * 2;
                
                return (
                  <tr key={est.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-white group-hover:text-[#35D07F] transition-colors">{est.id}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {est.date ? new Date(est.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">{est.customer}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-[10px]">{est.bookingId}</span>
                        <span>&bull; {est.vehicle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300">{est.itemsCount} Line Item{Number(est.itemsCount) !== 1 ? 's' : ''}</div>
                      <div className={'flex items-center gap-1.5 text-[10px] mt-1.5 uppercase tracking-widest ' + (isExpiringSoon && est.status !== 'Approved' && est.status !== 'Rejected' ? 'text-amber-400' : 'text-slate-500')}>
                        <Clock size={10} /> Valid till {est.expiry ? new Date(est.expiry).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={'flex items-center gap-1.5 px-2.5 py-1 rounded-full border w-fit ' + (STATUS_CONFIG[est.status]?.bg || 'bg-white/5') + ' ' + (STATUS_CONFIG[est.status]?.color || 'text-white')}>
                        <StatusIcon size={12} />
                        <span className="text-[11px] font-bold uppercase tracking-widest">{est.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end text-sm text-white font-mono font-medium">
                        <IndianRupee size={14} className="text-slate-500 mr-0.5" />
                        {Number(est.amount).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">Incl. Taxes</div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap relative">
                      <div className="flex items-center justify-end gap-2">
                        {est.status === 'Draft' && (
                          <button 
                            onClick={() => changeStatus(est.id, 'Sent')}
                            className="text-xs text-blue-400 hover:bg-blue-400/10 px-3 py-1.5 rounded transition-colors uppercase tracking-widest font-bold flex items-center gap-1"
                          >
                            <Send size={12} /> Send
                          </button>
                        )}
                        {(est.status === 'Sent' || est.status === 'Viewed') && (
                          <button 
                            onClick={() => changeStatus(est.id, 'Approved')}
                            className="text-xs text-[#35D07F] hover:bg-[#35D07F]/10 px-3 py-1.5 rounded transition-colors uppercase tracking-widest font-bold flex items-center gap-1"
                          >
                            <CheckCircle2 size={12} /> Approve
                          </button>
                        )}
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === est.id ? null : est.id)}
                          className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors focus:outline-none"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeMenuId === est.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-8 top-10 w-40 bg-[#1A1A1B] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden text-left"
                          >
                            <button 
                              onClick={() => handleOpenModal(est)}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <Edit2 size={14} /> Edit Estimate
                            </button>
                            {est.status !== 'Rejected' && (
                              <button 
                                onClick={() => changeStatus(est.id, 'Rejected')}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                              >
                                <XCircle size={14} /> Mark Rejected
                              </button>
                            )}
                            <div className="h-px bg-white/10"></div>
                            <button 
                              onClick={() => handleDelete(est.id)}
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
          <span>Showing {estimates.length} recent estimates</span>
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
                  {editingEstimate ? 'Edit Estimate' : 'Create New Estimate'}
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
                  {/* Customer */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Customer</label>
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
                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</label>
                    <select 
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    >
                      <option>Draft</option>
                      <option>Sent</option>
                      <option>Viewed</option>
                      <option>Approved</option>
                      <option>Rejected</option>
                      <option>Expired</option>
                    </select>
                  </div>
                  {/* Line Items Count */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Line Items Count</label>
                    <input 
                      type="number" min="1"
                      value={formData.itemsCount} onChange={e => setFormData({...formData, itemsCount: parseInt(e.target.value) || 1})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Total Amount */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Amount (?)</label>
                    <input 
                      type="number" min="0" step="100"
                      value={formData.amount} onChange={e => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#35D07F] text-black hover:bg-[#2EB86F] transition-colors uppercase tracking-widest">
                    {editingEstimate ? 'Save Changes' : 'Create Estimate'}
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

