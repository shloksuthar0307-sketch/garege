import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Search, FileText, Filter, Download, MoreVertical, DollarSign, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function ManagerInvoices() {
      const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceOrders, setServiceOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/manager/invoices/');
      setInvoices(res.data);
    } catch (error) {
      console.error('Error fetching invoices', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (isModalOpen && serviceOrders.length === 0) {
      api.get('/manager/service-orders/')
         .then(res => setServiceOrders(res.data))
         .catch(err => console.error(err));
    }
  }, [isModalOpen]);

    const handleDownload = (inv: any) => {
    toast.success('Downloading invoice ' + inv.invoice_number, {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
  };

  const handleMarkPaid = async (inv: any) => {
    try {
      await api.patch('/manager/invoices/' + inv.id + '/', { status: 'PAID', paid: inv.amount });
      toast.success('Invoice marked as paid');
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to update invoice');
    }
  };

  const handleCreateInvoice = async () => {
    if (!selectedOrder || !amount) {
      toast.error('Please select an order and enter an amount');
      return;
    }
    const order = serviceOrders.find(o => o.id === selectedOrder);
    if (!order) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/manager/invoices/', {
        customer: order.customer_id,
        vehicle: order.vehicle,
        service_order: order.id,
        amount: parseFloat(amount),
        status: 'UNPAID'
      });
      toast.success('Invoice created successfully');
      setIsModalOpen(false);
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalOutstanding = invoices
    .filter(inv => inv.status === 'UNPAID' || inv.status === 'PARTIAL')
    .reduce((sum, inv) => sum + (parseFloat(inv.amount) - parseFloat(inv.paid)), 0);

  const totalPaid = invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + parseFloat(inv.paid), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-wide">Invoices</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Manage customer billing and track outstanding payments.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg flex items-center px-3 py-2">
            <Search size={16} className="text-[var(--text-muted)] mr-2" />
            <input type="text" placeholder="Search invoices..." className="bg-transparent border-none outline-none text-sm text-[var(--text-primary)] w-48 placeholder:text-slate-600" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] rounded-lg text-sm transition-colors">
            <Filter size={16} /> Filters
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#35D07F] hover:bg-[#2bb46c] text-black font-bold tracking-widest uppercase rounded-lg text-xs transition-colors shadow-[0_0_15px_rgba(53,208,127,0.3)]"><Plus size={16} /> New Invoice</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <DollarSign size={24} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-sm text-[var(--text-muted)] font-bold tracking-widest uppercase mb-1">Total Paid (30d)</div>
            <div className="text-3xl font-light text-[var(--text-primary)]">₹{totalPaid.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="bg-[var(--bg-secondary)] border border-red-500/10 rounded-2xl p-6 flex items-center gap-6 shadow-[0_0_15px_rgba(239,68,68,0.03)]">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <DollarSign size={24} className="text-red-400" />
          </div>
          <div>
            <div className="text-sm text-red-500 font-bold tracking-widest uppercase mb-1">Outstanding</div>
            <div className="text-3xl font-light text-red-400">₹{totalOutstanding.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-secondary)]">
            <thead className="bg-[#1A1A1B] text-[var(--text-muted)] text-xs uppercase tracking-wider border-b border-[var(--border-subtle)]">
              <tr>
                <th className="px-6 py-4 font-medium">Invoice #</th>
                <th className="px-6 py-4 font-medium">Date Issued</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-[var(--text-muted)]">Loading invoices...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-[var(--text-muted)]">No invoices found.</td></tr>
              ) : invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[var(--bg-surface-hover)] transition-colors group">
                  <td className="px-6 py-4 font-mono text-[var(--text-primary)] flex items-center gap-3">
                    <FileText size={16} className="text-[var(--text-muted)]" />
                    {inv.invoice_number}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(inv.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[var(--text-primary)]">{inv.customer_name || 'Walk-in Customer'}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-[var(--text-primary)]">
                    ₹{parseFloat(inv.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                      inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' :
                      inv.status === 'UNPAID' ? 'bg-red-500/10 text-red-400' :
                      'bg-orange-500/10 text-orange-400'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] rounded-md text-[var(--text-primary)] transition-colors"><Download size={16} /></button>
                    <button className="p-1.5 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] rounded-md text-[var(--text-primary)] transition-colors"><MoreVertical size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
          <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--bg-secondary)] border border-[var(--border-default)] p-8 rounded-2xl z-10 w-full max-w-lg shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white"><X size={20} /></button>
              <h2 className="text-xl font-light text-[var(--text-primary)] mb-6 tracking-wide">Create New Invoice</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-2 block">Service Order</label>
                  <select value={selectedOrder} onChange={(e) => setSelectedOrder(e.target.value)} className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3.5 text-sm text-[var(--text-primary)] outline-none focus:border-[#35D07F]">
                    <option value="">Select a Service Order</option>
                    {serviceOrders.map(o => (
                      <option key={o.id} value={o.id}>{o.order_number} - {o.vehicle_details?.make} {o.vehicle_details?.model}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-2 block">Amount (?)</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3.5 text-sm text-[var(--text-primary)] outline-none focus:border-[#35D07F]" />
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-[var(--bg-surface-hover)] text-[var(--text-primary)] rounded-xl text-xs font-bold tracking-widest uppercase transition-colors">Cancel</button>
                <button onClick={handleCreateInvoice} disabled={isSubmitting} className="flex-1 py-3 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-colors shadow-[0_0_15px_rgba(53,208,127,0.3)] disabled:opacity-50">{isSubmitting ? 'Creating...' : 'Create Invoice'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}









