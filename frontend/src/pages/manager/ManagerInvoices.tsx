import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Search, FileText, Filter, Download, MoreVertical, DollarSign } from 'lucide-react';

export default function ManagerInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchInvoices();
  }, []);

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
          <h1 className="text-3xl font-light text-white tracking-wide">Invoices</h1>
          <p className="text-slate-400 text-sm mt-1">Manage customer billing and track outstanding payments.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-[#111112] border border-white/10 rounded-lg flex items-center px-3 py-2">
            <Search size={16} className="text-slate-400 mr-2" />
            <input type="text" placeholder="Search invoices..." className="bg-transparent border-none outline-none text-sm text-white w-48 placeholder:text-slate-600" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#111112] border border-white/10 hover:bg-white/5 text-white rounded-lg text-sm transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111112] border border-white/5 rounded-2xl p-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <DollarSign size={24} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-sm text-slate-500 font-bold tracking-widest uppercase mb-1">Total Paid (30d)</div>
            <div className="text-3xl font-light text-white">₹{totalPaid.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="bg-[#111112] border border-red-500/10 rounded-2xl p-6 flex items-center gap-6 shadow-[0_0_15px_rgba(239,68,68,0.03)]">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <DollarSign size={24} className="text-red-400" />
          </div>
          <div>
            <div className="text-sm text-red-500 font-bold tracking-widest uppercase mb-1">Outstanding</div>
            <div className="text-3xl font-light text-red-400">₹{totalOutstanding.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="bg-[#111112] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#1A1A1B] text-slate-400 text-xs uppercase tracking-wider border-b border-white/5">
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
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading invoices...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No invoices found.</td></tr>
              ) : invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-mono text-white flex items-center gap-3">
                    <FileText size={16} className="text-slate-500" />
                    {inv.invoice_number}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(inv.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{inv.customer_name || 'Walk-in Customer'}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-white">
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
                    <button className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-white transition-colors"><Download size={16} /></button>
                    <button className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-white transition-colors"><MoreVertical size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

