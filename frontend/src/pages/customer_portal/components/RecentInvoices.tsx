import React from 'react';
import { Receipt, Download, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function RecentInvoices({ loading, invoices = [] }: { loading: boolean; invoices?: any[] }) {
  const navigate = useNavigate();

  if (loading) return <div className="h-[300px] bg-[var(--bg-primary)]/80 rounded-2xl border border-[var(--border-subtle)] animate-pulse" />;

  const handleDownload = (e: React.MouseEvent, inv: any) => {
    e.stopPropagation();
    const content = [
      '========================================',
      '             REPAIRTRACE',
      '           OFFICIAL INVOICE',
      '========================================',
      `Invoice:  ${inv.invoice_number || inv.id}`,
      `Service:  ${inv.description || inv.service_order_title || 'Vehicle Service'}`,
      `Amount:   ₹${inv.amount}`,
      `Status:   ${inv.status}`,
      '========================================',
      'Thank you for choosing RepairTrace!',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `${inv.invoice_number || inv.id}_receipt.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Invoice ${inv.invoice_number || inv.id} downloaded`, {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
  };

  const recent = [...invoices].sort((a, b) => {
    const da = new Date(a.created_at || 0).getTime();
    const db = new Date(b.created_at || 0).getTime();
    return db - da;
  }).slice(0, 5);

  return (
    <div className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--text-primary)]">Recent Invoices</h2>
        <button onClick={() => navigate('/customer/invoices')} className="text-[#35D07F] text-[10px] font-bold uppercase tracking-widest hover:underline transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-center">
        {recent.length === 0 ? (
          <div className="text-center text-[var(--text-muted)] text-xs font-bold tracking-widest uppercase py-8 flex flex-col items-center gap-3">
            <CheckCircle2 size={32} className="opacity-20" />
            No invoices found
          </div>
        ) : (
          recent.map(inv => {
            const isPaid = inv.status === 'PAID';
            const isOverdue = inv.status === 'OVERDUE';
            const iconClass = isPaid
              ? 'bg-[#35D07F]/10 text-[#35D07F]'
              : isOverdue
              ? 'bg-rose-500/10 text-rose-400'
              : 'bg-amber-500/10 text-amber-400';
            const statusClass = isPaid ? 'text-[#35D07F]' : isOverdue ? 'text-rose-400' : 'text-amber-400';

            return (
              <div
                key={inv.id}
                onClick={() => navigate('/customer/invoices')}
                className="p-4 bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-surface-active)] rounded-xl transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconClass}`}>
                    <Receipt size={14} />
                  </div>
                  <div>
                    <p className="text-[var(--text-primary)] text-xs font-bold tracking-widest group-hover:text-[#35D07F] transition-colors">
                      {inv.invoice_number || inv.id?.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-[var(--text-muted)] text-[9px] uppercase tracking-wider">
                      {inv.description || inv.service_order_title || 'Vehicle Service'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="text-[var(--text-primary)] text-sm font-bold tracking-widest">₹{inv.amount}</p>
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${statusClass}`}>{inv.status}</p>
                  </div>
                  {isPaid ? (
                    <button
                      onClick={e => handleDownload(e, inv)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-[var(--bg-surface-active)] rounded-lg text-[var(--text-primary)] hover:bg-white/20"
                      title="Download receipt"
                    >
                      <Download size={13} />
                    </button>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); navigate('/customer/invoices'); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-[#35D07F] rounded-lg text-black hover:bg-[#2bb46c] shadow-[0_0_10px_rgba(53,208,127,0.3)]"
                      title="Pay now"
                    >
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
