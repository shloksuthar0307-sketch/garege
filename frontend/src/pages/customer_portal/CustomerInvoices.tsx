import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { motion } from 'framer-motion';
import { Receipt, Search, Filter, Download, ArrowRight, CheckCircle2, Clock, AlertCircle, DollarSign, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customer/invoices/');
      setInvoices(res.data?.results || res.data || []);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('ALL');

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.id.toLowerCase().includes(searchQuery.toLowerCase()) || inv.service.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (filter === 'UNPAID') return inv.status !== 'PAID';
    if (filter === 'PAID') return inv.status === 'PAID';
    return true;
  });

  const handleDownload = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;

    const receiptContent = `
========================================
             REPAIRTRACE
          OFFICIAL INVOICE
========================================
Invoice ID: ${inv.id}
Date:       ${inv.date}
Service:    ${inv.service}
Amount:     ${inv.amount.replace(/[^0-9.,]/g, '')}
Status:     ${inv.status}
========================================
Thank you for choosing RepairTrace!
`.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${id}_receipt.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Invoice ${id} Downloaded`, {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
  };

  const handlePay = (id: string) => {
    toast.success(`Opening secure payment portal for ${id}...`, {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
  };

  const handleExportAll = () => {
    const headers = ['Invoice ID', 'Date', 'Due Date', 'Service', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredInvoices.map(inv => 
        `"${inv.id}","${inv.date}","${inv.dueDate}","${inv.service}","${inv.amount.replace(/[^0-9.]/g, '')}","${inv.status}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'repairtrace_invoices.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('All Invoices Exported Successfully', {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': 
        return <span className="px-2.5 py-1 flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-widest w-fit"><CheckCircle2 size={12} /> Paid</span>;
      case 'OVERDUE': 
        return <span className="px-2.5 py-1 flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 text-[9px] font-bold uppercase tracking-widest w-fit animate-pulse"><AlertCircle size={12} /> Overdue</span>;
      case 'PENDING': 
        return <span className="px-2.5 py-1 flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400 text-[9px] font-bold uppercase tracking-widest w-fit"><Clock size={12} /> Pending</span>;
      default: 
        return <span className="px-2.5 py-1 flex items-center gap-1.5 rounded-lg border border-slate-500/20 bg-slate-500/10 text-slate-400 text-[9px] font-bold uppercase tracking-widest w-fit">{status}</span>;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-white mb-2 flex items-center gap-3">
            <Receipt className="text-[#35D07F]" size={28} />
            Invoices
          </h1>
          <p className="text-slate-400 text-xs tracking-widest uppercase">
            Manage billing, download PDF invoices, and make secure payments.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH INVOICES..." 
              className="pl-10 pr-4 py-2.5 bg-[#0A0A0B] border border-white/10 rounded-xl text-xs text-white uppercase tracking-widest focus:border-[#35D07F] outline-none transition-all w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={handleExportAll} className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all">
            <Download size={16} /> Export All
          </button>
        </motion.div>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Outstanding', value: '₹10,700', icon: DollarSign, color: 'text-rose-400', border: 'border-rose-500/20' },
          { label: 'Next Payment Due', value: 'Oct 12, 2025', icon: Clock, color: 'text-amber-400', border: 'border-white/5' },
          { label: 'Total Paid (YTD)', value: '₹1,24,500', icon: CheckCircle2, color: 'text-[#35D07F]', border: 'border-white/5' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (i * 0.1) }}
            className={`bg-[#0A0A0B]/80 backdrop-blur-md border ${stat.border} rounded-2xl p-6 flex items-center justify-between`}
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

      {/* Filter Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="flex gap-2 mb-6"
      >
        {['ALL', 'UNPAID', 'PAID'].map(tab => (
          <button 
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all border ${
              filter === tab 
                ? 'bg-[#35D07F]/10 border-[#35D07F]/50 text-[#35D07F]' 
                : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* Invoices Table */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden"
      >
        <div className="hidden lg:grid grid-cols-12 gap-4 p-6 border-b border-white/5 text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase bg-white/[0.02]">
          <div className="col-span-4">Invoice & Service</div>
          <div className="col-span-2">Issue Date</div>
          <div className="col-span-2">Due Date</div>
          <div className="col-span-2">Amount & Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-[#35D07F] border-t-transparent rounded-full animate-spin mb-4"></div>
              <h3 className="text-white font-bold tracking-widest uppercase mb-2">Loading Invoices...</h3>
            </div>
          ) : filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
            <div key={inv.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-6 items-center hover:bg-white/[0.02] transition-colors group">
              
              {/* Invoice & Service */}
              <div className="col-span-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 text-slate-400 border border-white/10 shrink-0 group-hover:bg-[#35D07F]/10 group-hover:text-[#35D07F] group-hover:border-[#35D07F]/30 transition-all">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-wider text-sm mb-1 group-hover:text-[#35D07F] transition-colors">{inv.id}</h3>
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest line-clamp-1">{inv.service}</p>
                </div>
              </div>

              {/* Issue Date */}
              <div className="col-span-2 hidden lg:flex items-center gap-2 text-slate-300 text-[10px] tracking-wider uppercase font-bold">
                {inv.date}
              </div>

              {/* Due Date */}
              <div className="col-span-2 hidden lg:flex items-center gap-2 text-slate-300 text-[10px] tracking-wider uppercase font-bold">
                <span className={inv.status === 'OVERDUE' ? 'text-rose-400' : ''}>{inv.dueDate}</span>
              </div>

              {/* Amount & Status */}
              <div className="col-span-2 hidden lg:flex flex-col gap-2">
                <div className="text-white font-bold tracking-widest text-sm">
                  {inv.amount}
                </div>
                <div>{getStatusBadge(inv.status)}</div>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity mt-4 lg:mt-0">
                <button 
                  onClick={() => handleDownload(inv.id)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all border border-transparent hover:border-white/20 tooltip-trigger"
                  title="Download PDF"
                >
                  <Download size={16} />
                </button>
                {inv.status !== 'PAID' && (
                  <button 
                    onClick={() => handlePay(inv.id)}
                    className="px-4 py-2 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all shadow-[0_0_10px_rgba(53,208,127,0.3)] flex items-center gap-2"
                  >
                    Pay Now <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-slate-500 mb-4">
                <Receipt size={24} />
              </div>
              <h3 className="text-white font-bold tracking-widest uppercase mb-2">No Invoices Found</h3>
              <p className="text-slate-500 text-xs tracking-widest uppercase max-w-sm">There are no invoices matching your current filters.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

