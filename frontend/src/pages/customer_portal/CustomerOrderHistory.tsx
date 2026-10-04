import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Search, Filter, Download, CheckCircle2, XCircle, RotateCcw, Eye, Car, Calendar, DollarSign, Receipt, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';


export default function CustomerOrderHistory() {
  const [ORDERS, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/customer/service-orders/');
        const raw = res.data?.results || res.data || [];
        const formatted = raw.map((o: any) => ({
          id: o.id,
          service: o.title || 'General Service',
          vehicle: o.vehicle ? `${o.vehicle.year || ''} ${o.vehicle.make} ${o.vehicle.model}`.trim() : 'Unknown',
          date: o.date_created ? new Date(o.date_created).toLocaleDateString() : 'Unknown Date',
          amount: '₹' + (o.total_cost || '0'),
          status: ['COMPLETED', 'CANCELLED'].includes(o.status) ? (o.status === 'COMPLETED' ? 'Completed' : 'Cancelled') : o.status
        }));
        setOrders(formatted);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Filter state
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOrders = ORDERS.filter(order => {
    const matchesSearch = `${order.service} ${order.id} ${order.vehicle}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed': 
        return <span className="px-2.5 py-1 flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-widest"><CheckCircle2 size={12} /> Completed</span>;
      case 'Cancelled': 
        return <span className="px-2.5 py-1 flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 text-[9px] font-bold uppercase tracking-widest"><XCircle size={12} /> Cancelled</span>;
      case 'Refunded': 
        return <span className="px-2.5 py-1 flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400 text-[9px] font-bold uppercase tracking-widest"><RotateCcw size={12} /> Refunded</span>;
      default: 
        return <span className="px-2.5 py-1 flex items-center gap-1.5 rounded-lg border border-slate-500/20 bg-slate-500/10 text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-widest">{status}</span>;
    }
  };

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Vehicle', 'Service', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => 
        `"${order.id}","${order.date}","${order.vehicle}","${order.service}","${order.amount.replace(/[^0-9.]/g, '')}","${order.status}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'repairtrace_order_history.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV Exported Successfully', {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <Package className="text-[#35D07F]" size={28} />
            Order History
          </h1>
          <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">
            View all past orders, service completions, and transactions.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH ORDERS..." 
              className="pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] uppercase tracking-widest focus:border-[#35D07F] outline-none transition-all w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative" ref={filterMenuRef}>
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center justify-center p-2.5 border rounded-xl transition-all ${
                showFilterMenu || filterStatus !== 'All' 
                  ? 'bg-[var(--bg-surface-active)] border-white/30 text-[var(--text-primary)]' 
                  : 'bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Filter size={18} />
              {filterStatus !== 'All' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#35D07F]"></span>
              )}
            </button>

            <AnimatePresence>
              {showFilterMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-3 w-56 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl shadow-2xl p-5 z-20"
                >
                  <h3 className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-4 flex items-center justify-between">
                    Filter by Status
                    {filterStatus !== 'All' && (
                      <span onClick={() => setFilterStatus('All')} className="text-[#35D07F] cursor-pointer hover:underline">Reset</span>
                    )}
                  </h3>
                  <div className="space-y-3">
                    {['All', 'Completed', 'Refunded', 'Cancelled'].map(status => (
                      <label key={status} className="flex items-center gap-3 cursor-pointer group" onClick={() => setFilterStatus(status)}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          filterStatus === status ? 'border-[#35D07F] bg-[#35D07F]' : 'border-[var(--border-strong)] group-hover:border-[#35D07F]/50'
                        }`}>
                          {filterStatus === status && <Check size={12} className="text-black" />}
                        </div>
                        <span className={`text-xs tracking-wider transition-colors ${filterStatus === status ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'}`}>
                          {status}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={handleExportCSV} className="flex items-center gap-2 px-6 py-2.5 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-xl text-xs font-bold tracking-widest uppercase transition-all">
            <Download size={16} /> Export CSV
          </button>
        </motion.div>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[{ label: 'Total Orders', value: ORDERS.length.toString(), icon: Package, color: 'text-[var(--text-primary)]' }, { label: 'Total Spent (YTD)', value: '?' + ORDERS.reduce((sum, o) => { const amt = parseFloat(o.amount.replace(/[^0-9.]/g, '')); return sum + (isNaN(amt) ? 0 : amt); }, 0).toLocaleString(), icon: DollarSign, color: 'text-[#35D07F]' }, { label: 'Vehicles Serviced', value: new Set(ORDERS.map(o => o.vehicle)).size.toString(), icon: Car, color: 'text-blue-400' }].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (i * 0.1) }}
            className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-1">{stat.label}</p>
              <h3 className={`text-2xl font-bold tracking-widest ${stat.color}`}>{stat.value}</h3>
            </div>
            <div className="w-12 h-12 bg-[var(--bg-surface-hover)] rounded-full flex items-center justify-center text-[var(--text-muted)]">
              <stat.icon size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Orders Table */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl overflow-hidden"
      >
        <div className="hidden lg:grid grid-cols-12 gap-4 p-6 border-b border-[var(--border-subtle)] text-[var(--text-muted)] text-[10px] font-bold tracking-[0.2em] uppercase bg-white/[0.02]">
          <div className="col-span-4">Service Details</div>
          <div className="col-span-3">Vehicle</div>
          <div className="col-span-2">Date & Amount</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="divide-y divide-white/5">
            {filteredOrders.map((order) => (
              <div key={order.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-6 items-center hover:bg-white/[0.02] transition-colors group">
                
                {/* Service Details */}
                <div className="col-span-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--bg-surface-hover)] text-[var(--text-muted)] border border-[var(--border-default)] shrink-0 group-hover:bg-[#35D07F]/10 group-hover:text-[#35D07F] group-hover:border-[#35D07F]/30 transition-all">
                    <Receipt size={16} />
                  </div>
                  <div>
                    <h3 className="text-[var(--text-primary)] font-bold tracking-wider text-sm mb-1 group-hover:text-[#35D07F] transition-colors line-clamp-1">{order.service}</h3>
                    <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest">{order.id}</p>
                  </div>
                </div>

                {/* Vehicle */}
                <div className="col-span-3 hidden lg:flex items-center gap-2 text-[var(--text-secondary)] text-xs tracking-wider">
                  <Car size={14} className="text-[var(--text-muted)]" /> {order.vehicle}
                </div>

                {/* Date & Amount */}
                <div className="col-span-2 hidden lg:block space-y-1">
                  <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold tracking-widest text-sm">
                    {order.amount}
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] tracking-widest uppercase">
                    <Calendar size={12} /> {order.date}
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2 hidden lg:block">
                  {getStatusBadge(order.status)}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => navigate('/customer/invoices')} className="p-2.5 bg-[var(--bg-surface-hover)] hover:bg-[#35D07F]/10 text-[var(--text-muted)] hover:text-[#35D07F] rounded-lg transition-all border border-transparent hover:border-[#35D07F]/20">
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[var(--bg-surface-hover)] rounded-full flex items-center justify-center text-[var(--text-muted)] mb-4">
              <Receipt size={24} />
            </div>
            <h3 className="text-[var(--text-primary)] font-bold tracking-widest uppercase mb-2">No Orders Found</h3>
            <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">Try adjusting your search or status filter.</p>
          </div>
        )}
        
        {/* Pagination / Footer */}
        {filteredOrders.length > 0 && (
          <div className="p-4 border-t border-[var(--border-subtle)] flex justify-center bg-white/[0.01]">
            <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[10px] font-bold tracking-widest uppercase transition-colors">
              Load More Orders
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}




