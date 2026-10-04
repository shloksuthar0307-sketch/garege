import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Activity, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManagerFinance() {
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

  // Compute metrics
  const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + parseFloat(inv.paid), 0);
  const outstanding = totalRevenue - totalCollected;
  const collectionRate = totalRevenue > 0 ? ((totalCollected / totalRevenue) * 100).toFixed(1) : '0.0';

  const handleExport = () => {
    try {
      const headers = ['Invoice Number', 'Date', 'Customer', 'Amount', 'Paid', 'Status'];
      const csvContent = [
        headers.join(','),
        ...invoices.map(inv => {
          return [
            inv.invoice_number,
            new Date(inv.created_at).toLocaleDateString(),
            `"${inv.customer_name || 'Walk-in Customer'}"`,
            inv.amount,
            inv.paid,
            inv.status
          ].join(',');
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Finance_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-wide">Finance Overview</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Real-time revenue, collections, and financial health metrics.</p>
        </div>
        <div className="flex gap-3">
          <select className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none">
            <option>This Month</option>
            <option>Last Month</option>
            <option>Q3 2026</option>
            <option>Year to Date</option>
          </select>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] rounded-lg text-sm transition-colors border border-[var(--border-default)]">
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-[var(--text-muted)]">Loading financial data...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Metric 1 */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 hover:border-[var(--border-default)] transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Activity size={18} className="text-blue-400" />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                  <ArrowUpRight size={12} /> 12.5%
                </span>
              </div>
              <div className="text-xs text-[var(--text-muted)] font-bold tracking-widest uppercase mb-1">Total Revenue</div>
              <div className="text-2xl font-light text-[var(--text-primary)]">₹{totalRevenue.toLocaleString()}</div>
            </div>

            {/* Metric 2 */}
            <div className="bg-[var(--bg-secondary)] border border-emerald-500/20 rounded-2xl p-6 shadow-[0_0_15px_rgba(53,208,127,0.03)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign size={18} className="text-emerald-400" />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                  <ArrowUpRight size={12} /> 8.2%
                </span>
              </div>
              <div className="text-xs text-emerald-500 font-bold tracking-widest uppercase mb-1 relative z-10">Collected</div>
              <div className="text-2xl font-light text-emerald-400 relative z-10">₹{totalCollected.toLocaleString()}</div>
            </div>

            {/* Metric 3 */}
            <div className="bg-[var(--bg-secondary)] border border-red-500/10 rounded-2xl p-6 hover:border-red-500/20 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <TrendingDown size={18} className="text-red-400" />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
                  <ArrowDownRight size={12} /> 3.1%
                </span>
              </div>
              <div className="text-xs text-red-500 font-bold tracking-widest uppercase mb-1">Outstanding</div>
              <div className="text-2xl font-light text-red-400">₹{outstanding.toLocaleString()}</div>
            </div>

            {/* Metric 4 */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 hover:border-[var(--border-default)] transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <CreditCard size={18} className="text-purple-400" />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                  <ArrowUpRight size={12} /> 2.4%
                </span>
              </div>
              <div className="text-xs text-[var(--text-muted)] font-bold tracking-widest uppercase mb-1">Collection Rate</div>
              <div className="text-2xl font-light text-[var(--text-primary)]">{collectionRate}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Area Mockup */}
            <div className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
              <h2 className="text-lg font-medium text-[var(--text-primary)] mb-6">Revenue Trend</h2>
              <div className="h-64 flex items-center justify-center border border-[var(--border-subtle)] border-dashed rounded-xl bg-white/[0.02]">
                <div className="text-center">
                  <TrendingUp size={32} className="mx-auto text-slate-600 mb-3" />
                  <div className="text-[var(--text-muted)] text-sm">Chart visualization requires external library (e.g. Recharts)</div>
                </div>
              </div>
            </div>

            {/* Recent Transactions List */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
              <h2 className="text-lg font-medium text-[var(--text-primary)] mb-6">Recent Payments</h2>
              <div className="space-y-4">
                {invoices.filter(inv => parseFloat(inv.paid) > 0).slice(0, 5).map(inv => (
                  <div key={`payment-${inv.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-surface-hover)] transition-colors border border-transparent hover:border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <DollarSign size={16} className="text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--text-primary)]">{inv.invoice_number}</div>
                        <div className="text-xs text-[var(--text-muted)]">{new Date(inv.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400">+₹{parseFloat(inv.paid).toLocaleString()}</div>
                      <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{inv.status}</div>
                    </div>
                  </div>
                ))}
                
                {invoices.filter(inv => parseFloat(inv.paid) > 0).length === 0 && (
                  <div className="text-center text-[var(--text-muted)] py-8 text-sm">No recent payments</div>
                )}
              </div>
              <button className="w-full mt-6 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-surface-hover)]">
                View All Transactions
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


