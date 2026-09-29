import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Search, Filter, Download, CheckCircle2, XCircle, RotateCcw, Eye, Car, Calendar, DollarSign, Receipt, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ORDERS = [
  { id: 'ORD-10482', service: 'Brake Pad Replacement & Rotor Resurfacing', vehicle: '2019 Toyota Camry', date: 'Oct 12, 2025', amount: '₹18,500', status: 'Completed' },
  { id: 'ORD-10479', service: 'Full Synthetic Oil Change', vehicle: '2021 Ford F-150', date: 'Sep 28, 2025', amount: '₹6,200', status: 'Completed' },
  { id: 'ORD-10470', service: 'Wheel Alignment', vehicle: '2019 Toyota Camry', date: 'Aug 15, 2025', amount: '₹4,500', status: 'Completed' },
  { id: 'ORD-10392', service: 'AC System Diagnostic', vehicle: '2021 Ford F-150', date: 'Jul 02, 2025', amount: '₹1,500', status: 'Refunded' },
  { id: 'ORD-10305', service: 'Battery Replacement', vehicle: '2019 Toyota Camry', date: 'May 14, 2025', amount: '₹8,900', status: 'Cancelled' },
];

export default function CustomerOrderHistory() {
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
        return <span className="px-2.5 py-1 flex items-center gap-1.5 rounded-lg border border-slate-500/20 bg-slate-500/10 text-slate-400 text-[9px] font-bold uppercase tracking-widest">{status}</span>;
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
          <h1 className="text-3xl font-bold tracking-widest uppercase text-white mb-2 flex items-center gap-3">
            <Package className="text-[#35D07F]" size={28} />
            Order History
          </h1>
          <p className="text-slate-400 text-xs tracking-widest uppercase">
            View all past orders, service completions, and transactions.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH ORDERS..." 
              className="pl-10 pr-4 py-2.5 bg-[#0A0A0B] border border-white/10 rounded-xl text-xs text-white uppercase tracking-widest focus:border-[#35D07F] outline-none transition-all w-64"
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
                  ? 'bg-white/10 border-white/30 text-white' 
                  : 'bg-[#0A0A0B] border-white/10 text-slate-400 hover:text-white'
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
                  className="absolute right-0 top-full mt-3 w-56 bg-[#111112] border border-white/10 rounded-xl shadow-2xl p-5 z-20"
                >
                  <h3 className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-4 flex items-center justify-between">
                    Filter by Status
                    {filterStatus !== 'All' && (
                      <span onClick={() => setFilterStatus('All')} className="text-[#35D07F] cursor-pointer hover:underline">Reset</span>
                    )}
                  </h3>
                  <div className="space-y-3">
                    {['All', 'Completed', 'Refunded', 'Cancelled'].map(status => (
                      <label key={status} className="flex items-center gap-3 cursor-pointer group" onClick={() => setFilterStatus(status)}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          filterStatus === status ? 'border-[#35D07F] bg-[#35D07F]' : 'border-white/20 group-hover:border-[#35D07F]/50'
                        }`}>
                          {filterStatus === status && <Check size={12} className="text-black" />}
                        </div>
                        <span className={`text-xs tracking-wider transition-colors ${filterStatus === status ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-200'}`}>
                          {status}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={handleExportCSV} className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all">
            <Download size={16} /> Export CSV
          </button>
        </motion.div>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: '42', icon: Package, color: 'text-white' },
          { label: 'Total Spent (YTD)', value: '₹1,24,500', icon: DollarSign, color: 'text-[#35D07F]' },
          { label: 'Vehicles Serviced', value: '2', icon: Car, color: 'text-blue-400' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (i * 0.1) }}
            className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-1">{stat.label}</p>
              <h3 className={`text-2xl font-bold tracking-widest ${stat.color}`}>{stat.value}</h3>
            </div>
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-slate-400">
              <stat.icon size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Orders Table */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden"
      >
        <div className="hidden lg:grid grid-cols-12 gap-4 p-6 border-b border-white/5 text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase bg-white/[0.02]">
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
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 text-slate-400 border border-white/10 shrink-0 group-hover:bg-[#35D07F]/10 group-hover:text-[#35D07F] group-hover:border-[#35D07F]/30 transition-all">
                    <Receipt size={16} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-wider text-sm mb-1 group-hover:text-[#35D07F] transition-colors line-clamp-1">{order.service}</h3>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest">{order.id}</p>
                  </div>
                </div>

                {/* Vehicle */}
                <div className="col-span-3 hidden lg:flex items-center gap-2 text-slate-300 text-xs tracking-wider">
                  <Car size={14} className="text-slate-500" /> {order.vehicle}
                </div>

                {/* Date & Amount */}
                <div className="col-span-2 hidden lg:block space-y-1">
                  <div className="flex items-center gap-2 text-white font-bold tracking-widest text-sm">
                    {order.amount}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[10px] tracking-widest uppercase">
                    <Calendar size={12} /> {order.date}
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2 hidden lg:block">
                  {getStatusBadge(order.status)}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => navigate('/customer/invoices')} className="p-2.5 bg-white/5 hover:bg-[#35D07F]/10 text-slate-400 hover:text-[#35D07F] rounded-lg transition-all border border-transparent hover:border-[#35D07F]/20">
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-slate-500 mb-4">
              <Receipt size={24} />
            </div>
            <h3 className="text-white font-bold tracking-widest uppercase mb-2">No Orders Found</h3>
            <p className="text-slate-500 text-xs tracking-widest uppercase">Try adjusting your search or status filter.</p>
          </div>
        )}
        
        {/* Pagination / Footer */}
        {filteredOrders.length > 0 && (
          <div className="p-4 border-t border-white/5 flex justify-center bg-white/[0.01]">
            <button className="text-slate-500 hover:text-white text-[10px] font-bold tracking-widest uppercase transition-colors">
              Load More Orders
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

