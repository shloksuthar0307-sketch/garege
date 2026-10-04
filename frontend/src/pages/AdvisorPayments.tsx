import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, DollarSign, FileText, Download, CheckCircle, CreditCard, Clock, AlertTriangle, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { advisorApi } from '../api/advisor';
import toast from 'react-hot-toast';

export default function AdvisorPayments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const queryClient = useQueryClient();

  const paymentMutation = useMutation({
    mutationFn: (data: { invoiceId: string, amount: number, method: string }) => 
      advisorApi.processPayment(data.invoiceId, data.amount, data.method),
    onSuccess: () => {
      toast.success('Payment processed successfully!');
      setPaymentModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['advisor-invoices'] });
    },
    onError: () => {
      toast.error('Failed to process payment');
    }
  });

  const { data: invoicesData = [], isLoading } = useQuery({
    queryKey: ['advisor-invoices'],
    queryFn: advisorApi.getInvoices,
  });

  const filteredInvoices = invoicesData?.filter((inv: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      inv.invoice_number?.toLowerCase().includes(term) ||
      inv.customer_name?.toLowerCase().includes(term) ||
      inv.vehicle_reg?.toLowerCase().includes(term)
    );
  }) || [];

  const handleOpenPayment = (inv: any) => {
    setSelectedInvoice(inv);
    setPaymentModalOpen(true);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight">Payments & Invoicing</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage customer payments, outstanding balances, and final invoices.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search by Invoice, Customer, Reg No..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2 text-[var(--text-muted)]">
            <DollarSign size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Collected Today</span>
          </div>
          <div className="text-3xl font-light text-[var(--text-primary)] font-mono">₹ 1,25,000</div>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2 text-rose-400">
            <AlertTriangle size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Outstanding</span>
          </div>
          <div className="text-3xl font-light text-[var(--text-primary)] font-mono">₹ 85,000</div>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2 text-[#35D07F]">
            <CheckCircle size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Completed Payments</span>
          </div>
          <div className="text-3xl font-light text-[var(--text-primary)] font-mono">12</div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1A1A1B] sticky top-0 z-10 border-b border-[var(--border-subtle)]">
              <tr>
                <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Invoice No.</th>
                <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Date</th>
                <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Customer / Vehicle</th>
                <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Total Amount</th>
                <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Balance Due</th>
                <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Status</th>
                <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">Loading invoices...</td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">No records found.</td>
                </tr>
              ) : (
                filteredInvoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <span className="text-xs font-mono text-[var(--text-primary)] bg-[var(--bg-surface-hover)] px-2 py-1 rounded">
                        {inv.invoice_number}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-[var(--text-primary)] font-medium">{inv.customer_name}</div>
                      <div className="text-[10px] font-mono text-[var(--text-muted)]">{inv.vehicle_reg}</div>
                    </td>
                    <td className="p-4 text-sm font-mono text-[var(--text-primary)]">
                      ₹ {parseFloat(inv.amount).toFixed(2)}
                    </td>
                    <td className="p-4 text-sm font-mono text-rose-400">
                      ₹ {(parseFloat(inv.amount) - parseFloat(inv.paid)).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                        inv.status === 'PAID' ? 'bg-[#35D07F]/10 text-[#35D07F]' :
                        inv.status === 'PARTIAL' ? 'bg-amber-400/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-500'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" title="View Invoice">
                        <FileText size={16} />
                      </button>
                      {inv.status !== 'PAID' && (
                        <button 
                          onClick={() => handleOpenPayment(inv)}
                          className="inline-flex items-center gap-1.5 bg-[#35D07F]/10 text-[#35D07F] hover:bg-[#35D07F]/20 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                        >
                          <CreditCard size={14} /> Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {paymentModalOpen && selectedInvoice && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm z-[100]"
              onClick={() => setPaymentModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl z-[101] shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)] bg-white/[0.02]">
                <h2 className="text-xl font-light text-[var(--text-primary)] flex items-center gap-2">
                  <DollarSign size={20} className="text-[#35D07F]" /> Process Payment
                </h2>
                <button onClick={() => setPaymentModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-[var(--bg-input)] border border-[var(--border-subtle)] p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold mb-1">Invoice</div>
                    <div className="text-lg text-[var(--text-primary)] font-mono">{selectedInvoice.invoice_number}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-rose-400 uppercase tracking-widest font-bold mb-1">Balance Due</div>
                    <div className="text-xl text-rose-400 font-mono">₹ {(selectedInvoice.amount - selectedInvoice.paid).toFixed(2)}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Payment Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">₹</span>
                      <input 
                        id="payment-amount-input"
                        type="number"
                        defaultValue={(selectedInvoice.amount - selectedInvoice.paid).toFixed(2)}
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl pl-8 pr-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] font-mono text-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Payment Method</label>
                    <select id="payment-method-select" className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]">
                      <option value="CARD">Credit / Debit Card</option>
                      <option value="UPI">UPI / Digital Wallet</option>
                      <option value="CASH">Cash</option>
                      <option value="BANK">Bank Transfer</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-6 border-t border-[var(--border-subtle)] bg-white/[0.02]">
                <button onClick={() => setPaymentModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    const amtInput = document.getElementById('payment-amount-input') as HTMLInputElement;
                    const methodSelect = document.getElementById('payment-method-select') as HTMLSelectElement;
                    const amount = parseFloat(amtInput?.value || '0');
                    if (amount > 0) {
                      paymentMutation.mutate({
                        invoiceId: selectedInvoice.id,
                        amount: amount,
                        method: methodSelect?.value || 'CARD'
                      });
                    } else {
                      toast.error('Enter a valid amount');
                    }
                  }}
                  className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-8 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors"
                >
                  <CheckCircle size={16} /> Confirm Payment
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


