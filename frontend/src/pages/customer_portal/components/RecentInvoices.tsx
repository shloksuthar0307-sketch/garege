import React from 'react';
import { Receipt, Download, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const INVOICES = [];

export default function RecentInvoices({ loading }: { loading: boolean }) {
  const navigate = useNavigate();

  if (loading) return <div className="h-[300px] bg-[#0A0A0B]/80 rounded-2xl border border-white/5 animate-pulse"></div>;

  const handleDownload = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    const inv = INVOICES.find(i => i.id === id);
    if (!inv) return;

    const receiptContent = `
========================================
             REPAIRTRACE
          OFFICIAL INVOICE
========================================
Invoice ID: ${inv.id}
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

  const handlePay = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Routes to a hypothetical checkout/payment page
    navigate(`/customer/invoices`);
  };

  return (
    <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white">Recent Invoices</h2>
        <button onClick={() => navigate('/customer/invoices')} className="text-[#35D07F] text-[10px] font-bold uppercase tracking-widest hover:underline hover:text-[#2bb46c] transition-colors">View All</button>
      </div>

      <div className="space-y-3 flex-1">
        {INVOICES.map(inv => (
          <div 
            key={inv.id} 
            onClick={() => navigate(`/customer/invoices`)}
            className="p-4 bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                inv.status === 'PAID' ? 'bg-[#35D07F]/10 text-[#35D07F]' :
                inv.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-400' :
                'bg-amber-500/10 text-amber-400'
              }`}>
                <Receipt size={14} />
              </div>
              <div>
                <p className="text-white text-xs font-bold tracking-widest group-hover:text-[#35D07F] transition-colors">{inv.id}</p>
                <p className="text-slate-500 text-[9px] uppercase tracking-wider">{inv.service}</p>
              </div>
            </div>
            <div className="text-right flex items-center gap-4">
              <div>
                <p className="text-white text-sm font-bold tracking-widest">{inv.amount}</p>
                <p className={`text-[9px] font-bold uppercase tracking-widest ${
                  inv.status === 'PAID' ? 'text-[#35D07F]' :
                  inv.status === 'OVERDUE' ? 'text-rose-400' : 'text-amber-400'
                }`}>{inv.status}</p>
              </div>
              {inv.status === 'PAID' ? (
                <button 
                  onClick={(e) => handleDownload(e, inv.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white/10 rounded-lg text-white hover:bg-white/20"
                >
                  <Download size={14} />
                </button>
              ) : (
                <button 
                  onClick={(e) => handlePay(e, inv.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-[#35D07F] rounded-lg text-black hover:bg-[#2bb46c] shadow-[0_0_10px_rgba(53,208,127,0.3)]"
                >
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

