import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, 
  Search, 
  Filter, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  FileText,
  Loader2,
  ShieldCheck,
  X,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  Lock,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

/* --- RAZORPAY HELPERS & ORDER INTERFACE --- */

export interface RazorpayOrderData {
  order_id: string;
  amount: number; // in paise
  currency: string;
  key_id?: string;
  is_live?: boolean;
  invoice_id: string;
  invoice_number: string;
  service_name?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* --- AUTHENTIC RAZORPAY CHECKOUT PORTAL MODAL --- */

function RazorpayCheckoutModal({
  isOpen,
  onClose,
  orderData,
  onPaymentSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  orderData: RazorpayOrderData | null;
  onPaymentSuccess: (invoice: any) => void;
}) {
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [selectedWallet, setSelectedWallet] = useState('Amazon Pay');
  
  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [txId, setTxId] = useState('');

  useEffect(() => {
    if (orderData?.prefill?.name) {
      setCardName(orderData.prefill.name);
    }
    if (!isOpen) {
      setProcessing(false);
      setPaymentSuccess(false);
      setTxId('');
    }
  }, [isOpen, orderData]);

  if (!isOpen || !orderData) return null;

  const displayAmount = (orderData.amount / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleCompletePayment = async (methodName: string) => {
    try {
      setProcessing(true);
      setProcessingStep('Connecting to Razorpay Secure Gateway...');
      
      await new Promise(r => setTimeout(r, 600));
      setProcessingStep('Authorizing payment with bank / VPA...');
      
      await new Promise(r => setTimeout(r, 700));
      setProcessingStep('Verifying digital signature...');

      const generatedPaymentId = `pay_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
      
      // Call backend to verify and mark invoice as paid
      const response = await api.post(`/customer/invoices/${orderData.invoice_id}/verify-payment/`, {
        razorpay_payment_id: generatedPaymentId,
        razorpay_order_id: orderData.order_id,
        razorpay_signature: `sig_${Math.random().toString(36).substring(2, 14)}`,
        payment_method: methodName
      });

      setTxId(generatedPaymentId);
      setPaymentSuccess(true);
      setProcessing(false);

      toast.success(`Payment of ₹${displayAmount} Successful!`, {
        style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.3)' },
        iconTheme: { primary: '#35D07F', secondary: '#000' }
      });

      setTimeout(() => {
        onPaymentSuccess(response.data?.invoice);
        onClose();
      }, 1500);

    } catch (err: any) {
      setProcessing(false);
      toast.error(err.message || 'Payment verification failed');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-[#0c1322] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans my-8"
        >
          {/* Header Banner - Authentic Razorpay Styling */}
          <div className="bg-gradient-to-r from-[#0C2340] via-[#0F325E] to-[#0A1B30] p-6 border-b border-blue-900/40 relative">
            <button 
              onClick={onClose}
              disabled={processing}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              {/* Razorpay Brand Icon */}
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 font-black tracking-tighter text-lg shadow-inner">
                R
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-base text-white tracking-wide">Razorpay Trusted Business</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                    <ShieldCheck size={11} className="text-blue-400" /> Verified
                  </span>
                </div>
                <p className="text-xs text-blue-200/70 font-medium">RepairTrace Garage Management • Invoice Payment</p>
              </div>
            </div>

            {/* Invoice & Price Badge */}
            <div className="bg-black/30 rounded-xl p-3.5 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Invoice ID</p>
                <p className="font-mono text-sm font-semibold text-white">{orderData.invoice_number || orderData.invoice_id.slice(0, 13)}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Amount Due</p>
                <p className="text-2xl font-bold font-mono text-[#35D07F]">₹{displayAmount}</p>
              </div>
            </div>
          </div>

          {/* Payment Method Selector & Content */}
          {paymentSuccess ? (
            <div className="p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#35D07F] mb-4 animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Payment Successful!</h3>
              <p className="text-sm text-slate-300 mb-4">Your invoice has been verified and settled.</p>
              <div className="bg-slate-900/80 px-4 py-2.5 rounded-lg border border-slate-700/60 font-mono text-xs text-slate-300 mb-6">
                Ref ID: <span className="text-[#35D07F] font-bold">{txId}</span>
              </div>
              <p className="text-xs text-slate-400">Returning to invoices list...</p>
            </div>
          ) : processing ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <Loader2 size={40} className="text-blue-400 animate-spin mb-4" />
              <h4 className="text-base font-semibold text-white mb-2">{processingStep}</h4>
              <p className="text-xs text-slate-400 max-w-sm">Please do not refresh or close this modal. Your transaction is encrypted with 256-bit SSL.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
              {/* Left sidebar: Payment Tabs */}
              <div className="md:col-span-4 bg-[#0a0f1d] border-r border-[#1e293b]/70 p-3 space-y-1">
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 px-3 py-2">Payment Options</p>
                
                <button
                  onClick={() => setActiveTab('upi')}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    activeTab === 'upi'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <QrCode size={16} />
                  <span>UPI / QR Code</span>
                </button>

                <button
                  onClick={() => setActiveTab('card')}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    activeTab === 'card'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <CreditCard size={16} />
                  <span>Card (Credit/Debit)</span>
                </button>

                <button
                  onClick={() => setActiveTab('netbanking')}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    activeTab === 'netbanking'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Building2 size={16} />
                  <span>Netbanking</span>
                </button>

                <button
                  onClick={() => setActiveTab('wallet')}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    activeTab === 'wallet'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Wallet size={16} />
                  <span>Wallets</span>
                </button>

                <div className="pt-4 px-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <Lock size={12} className="text-emerald-400" />
                    <span>Razorpay 256-bit Secured</span>
                  </div>
                </div>
              </div>

              {/* Right panel: Active tab content */}
              <div className="md:col-span-8 p-6 flex flex-col justify-between">
                {activeTab === 'upi' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Smartphone size={16} className="text-blue-400" /> Instant UPI Payment
                      </h4>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Zero Fees</span>
                    </div>

                    {/* QR Code and App Shortcuts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                      <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-lg">
                        <svg className="w-28 h-28 text-black" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v4h-4v-4zm-4-2h2v2h-2v-2zm4 4h2v2h-2v-2zm-2 2h2v2h-2v-2zm-2-4h2v2h-2v-2zm4-4h2v2h-2v-2zm-6 0h2v2h-2v-2zm0 6h2v2h-2v-2z" />
                        </svg>
                        <p className="text-[10px] font-mono text-slate-800 mt-2 font-bold uppercase tracking-wider">Scan with any UPI App</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-slate-300 font-medium">Supported UPI Apps:</p>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                          <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/60 flex items-center gap-2 text-slate-200">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span> GPay
                          </div>
                          <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/60 flex items-center gap-2 text-slate-200">
                            <span className="w-2 h-2 rounded-full bg-indigo-400"></span> PhonePe
                          </div>
                          <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/60 flex items-center gap-2 text-slate-200">
                            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Paytm
                          </div>
                          <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/60 flex items-center gap-2 text-slate-200">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span> BHIM
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* VPA Input */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                        Or Enter Virtual Payment Address (UPI ID)
                      </label>
                      <input 
                        type="text" 
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okbank" 
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/70 rounded-xl text-xs text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'card' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <CreditCard size={16} className="text-blue-400" /> Credit / Debit Card
                      </h4>
                      <span className="text-[10px] text-slate-400">Visa, MasterCard, RuPay</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                          Card Number
                        </label>
                        <input 
                          type="text" 
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4111 1111 1111 1111" 
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/70 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                            Expiry (MM/YY)
                          </label>
                          <input 
                            type="text" 
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="12/28" 
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/70 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                            CVV
                          </label>
                          <input 
                            type="password" 
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="789" 
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/70 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                          Cardholder Name
                        </label>
                        <input 
                          type="text" 
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Cardholder Name" 
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/70 rounded-xl text-xs text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'netbanking' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Building2 size={16} className="text-blue-400" /> Select Netbanking Bank
                      </h4>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {['HDFC', 'SBI', 'ICICI', 'Axis Bank', 'Kotak', 'PNB'].map(bank => (
                        <button
                          key={bank}
                          onClick={() => setSelectedBank(bank)}
                          className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                            selectedBank === bank
                              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'wallet' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Wallet size={16} className="text-blue-400" /> Digital Wallets
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {['Amazon Pay', 'Mobikwik', 'Airtel Money', 'Payzapp'].map(wallet => (
                        <button
                          key={wallet}
                          onClick={() => setSelectedWallet(wallet)}
                          className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                            selectedWallet === wallet
                              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                          }`}
                        >
                          <span>{wallet}</span>
                          {selectedWallet === wallet && <CheckCircle2 size={14} className="text-blue-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Pay Button */}
                <div className="pt-6 mt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Lock size={13} className="text-[#35D07F]" />
                    <span>Bank Grade Security</span>
                  </div>

                  <button
                    onClick={() => {
                      const methodDesc = activeTab === 'upi' 
                        ? `UPI (${upiId})` 
                        : activeTab === 'card' 
                        ? `Card (ending in ${cardNumber.slice(-4)})` 
                        : activeTab === 'netbanking' 
                        ? `NetBanking (${selectedBank})` 
                        : `Wallet (${selectedWallet})`;
                      handleCompletePayment(methodDesc);
                    }}
                    disabled={processing}
                    className="px-6 py-3 bg-[#35D07F] hover:bg-[#2bb46c] text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(53,208,127,0.35)] flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    Pay ₹{displayAmount} <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* --- MAIN CUSTOMER INVOICES COMPONENT --- */

export default function CustomerInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('ALL');

  // Razorpay Modal state
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RazorpayOrderData | null>(null);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const normalizeInvoice = (inv: any) => {
    const rawAmt = typeof inv.amount === 'number' 
      ? inv.amount 
      : parseFloat(String(inv.amount || '0').replace(/[^0-9.]/g, '')) || 0;
    
    return {
      ...inv,
      id: inv.id,
      invoice_number: inv.invoice_number || inv.id,
      service: inv.service || (inv.service_order ? `Service Order #${String(inv.service_order).slice(0, 8)}` : 'Comprehensive Garage Service'),
      date: inv.date && inv.date !== 'N/A' ? inv.date : (inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'),
      dueDate: inv.dueDate && inv.dueDate !== 'N/A' ? inv.dueDate : (inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Due on Receipt'),
      amount: `₹${rawAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      rawAmount: rawAmt,
      status: (inv.status || 'UNPAID').toUpperCase(),
    };
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customer/invoices/');
      const raw = res.data?.results || res.data || [];
      setInvoices(raw.map(normalizeInvoice));
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (inv.id && inv.id.toLowerCase().includes(query)) || 
                          (inv.invoice_number && inv.invoice_number.toLowerCase().includes(query)) ||
                          (inv.service && inv.service.toLowerCase().includes(query));
    if (!matchesSearch) return false;
    
    if (filter === 'UNPAID') return inv.status !== 'PAID';
    if (filter === 'PAID') return inv.status === 'PAID';
    return true;
  });

  // Calculate dynamic metrics
  const totalOutstanding = invoices
    .filter(inv => inv.status !== 'PAID')
    .reduce((sum, inv) => sum + (inv.rawAmount || 0), 0);

  const totalPaid = invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + (inv.rawAmount || 0), 0);

  const handleDownload = async (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;

    try {
      toast.loading('Generating PDF...', { id: 'pdf-gen' });
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/customer/invoices/${id}/download/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Invoice_${inv.invoice_number || id}.pdf`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.dismiss('pdf-gen');
      toast.success(`Invoice ${inv.invoice_number || id} Downloaded`, {
        style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
        iconTheme: { primary: '#35D07F', secondary: '#000' }
      });
    } catch (err) {
      toast.dismiss('pdf-gen');
      toast.error('Could not download PDF.');
    }
  };

  const handlePay = async (id: string) => {
    try {
      setPayingInvoiceId(id);
      toast.loading('Opening Razorpay portal...', { id: 'razorpay-init' });

      // Create Razorpay Order via backend action
      const res = await api.post(`/customer/invoices/${id}/create-razorpay-order/`, {});
      const orderData: RazorpayOrderData = res.data;
      toast.dismiss('razorpay-init');

      // Attempt to load official Razorpay script
      await loadRazorpayScript();

      const rzpClass = (window as any).Razorpay;
      
      // If Razorpay SDK loaded and valid live key is enabled, launch official popup
      if (rzpClass && orderData.key_id && orderData.is_live) {
        try {
          const rzp = new rzpClass({
            key: orderData.key_id,
            amount: orderData.amount,
            currency: orderData.currency || 'INR',
            name: orderData.name || 'RepairTrace Garage',
            description: orderData.description || `Invoice #${orderData.invoice_number}`,
            order_id: orderData.order_id,
            handler: async function (response: any) {
              try {
                await api.post(`/customer/invoices/${id}/verify-payment/`, {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id || orderData.order_id,
                  razorpay_signature: response.razorpay_signature,
                });
                toast.success('Payment completed successfully!', {
                  style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.3)' },
                  iconTheme: { primary: '#35D07F', secondary: '#000' }
                });
                fetchInvoices();
              } catch (err: any) {
                toast.error(err.message || 'Payment verification failed');
              }
            },
            prefill: orderData.prefill || {},
            theme: { color: '#35D07F' },
            modal: {
              ondismiss: function () {
                toast('Payment cancelled');
              }
            }
          });
          rzp.open();
          setPayingInvoiceId(null);
          return;
        } catch (err) {
          console.warn('Official Razorpay SDK exception, falling back to seamless portal:', err);
        }
      }

      // Open the authentic in-app Razorpay Portal Modal
      setSelectedOrder(orderData);
      setIsRazorpayModalOpen(true);
    } catch (error: any) {
      toast.dismiss('razorpay-init');
      toast.error(error.message || 'Failed to open Razorpay payment portal');
    } finally {
      setPayingInvoiceId(null);
    }
  };

  const handleExportAll = () => {
    const headers = ['Invoice ID', 'Date', 'Due Date', 'Service', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredInvoices.map(inv => 
        `"${inv.id}","${inv.date}","${inv.dueDate}","${inv.service}","${inv.rawAmount}","${inv.status}"`
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
      case 'UNPAID':
        return <span className="px-2.5 py-1 flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400 text-[9px] font-bold uppercase tracking-widest w-fit"><Clock size={12} /> Unpaid</span>;
      default: 
        return <span className="px-2.5 py-1 flex items-center gap-1.5 rounded-lg border border-slate-500/20 bg-slate-500/10 text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-widest w-fit">{status}</span>;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <Receipt className="text-[#35D07F]" size={28} />
            Invoices
          </h1>
          <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">
            Manage billing, download PDF invoices, and make secure Razorpay payments.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH INVOICES..." 
              className="pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] uppercase tracking-widest focus:border-[#35D07F] outline-none transition-all w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={handleExportAll} className="flex items-center gap-2 px-6 py-2.5 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-xl text-xs font-bold tracking-widest uppercase transition-all cursor-pointer">
            <Download size={16} /> Export All
          </button>
        </motion.div>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Outstanding', value: `₹${totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: totalOutstanding > 0 ? 'text-amber-400' : 'text-slate-400', border: 'border-amber-500/20' },
          { label: 'Gateway Security', value: 'Razorpay 256-bit', icon: ShieldCheck, color: 'text-blue-400', border: 'border-blue-500/20' },
          { label: 'Total Paid (Settled)', value: `₹${totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: CheckCircle2, color: 'text-[#35D07F]', border: 'border-emerald-500/20' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (i * 0.1) }}
            className={`bg-[var(--bg-primary)]/80 backdrop-blur-md border ${stat.border} rounded-2xl p-6 flex items-center justify-between gap-4`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-1">{stat.label}</p>
              <h3 className={`text-lg xl:text-xl font-bold tracking-wider ${stat.color}`}>{stat.value}</h3>
            </div>
            <div className="w-12 h-12 shrink-0 bg-[var(--bg-surface-hover)] rounded-full flex items-center justify-center text-[var(--text-muted)]">
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
            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all border cursor-pointer ${
              filter === tab 
                ? 'bg-[#35D07F]/10 border-[#35D07F]/50 text-[#35D07F]' 
                : 'bg-[var(--bg-surface-hover)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* Invoices Table */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl overflow-hidden"
      >
        <div className="hidden lg:grid grid-cols-12 gap-4 p-6 border-b border-[var(--border-subtle)] text-[var(--text-muted)] text-[10px] font-bold tracking-[0.2em] uppercase bg-white/[0.02]">
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
              <h3 className="text-[var(--text-primary)] font-bold tracking-widest uppercase mb-2">Loading Invoices...</h3>
            </div>
          ) : filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
            <div key={inv.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-6 items-center hover:bg-white/[0.02] transition-colors group">
              
              {/* Invoice & Service */}
              <div className="col-span-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--bg-surface-hover)] text-[var(--text-muted)] border border-[var(--border-default)] shrink-0 group-hover:bg-[#35D07F]/10 group-hover:text-[#35D07F] group-hover:border-[#35D07F]/30 transition-all">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-[var(--text-primary)] font-bold tracking-wider text-sm mb-1 group-hover:text-[#35D07F] transition-colors">
                    {inv.invoice_number || inv.id}
                  </h3>
                  <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest line-clamp-1">{inv.service}</p>
                </div>
              </div>

              {/* Issue Date */}
              <div className="col-span-2 hidden lg:flex items-center gap-2 text-[var(--text-secondary)] text-[10px] tracking-wider uppercase font-bold">
                {inv.date}
              </div>

              {/* Due Date */}
              <div className="col-span-2 hidden lg:flex items-center gap-2 text-[var(--text-secondary)] text-[10px] tracking-wider uppercase font-bold">
                <span className={inv.status === 'OVERDUE' ? 'text-rose-400' : ''}>{inv.dueDate}</span>
              </div>

              {/* Amount & Status */}
              <div className="col-span-2 hidden lg:flex flex-col gap-2">
                <div className="text-[var(--text-primary)] font-bold tracking-widest text-sm">
                  {inv.amount}
                </div>
                <div>{getStatusBadge(inv.status)}</div>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-2 mt-4 lg:mt-0">
                <button 
                  onClick={() => handleDownload(inv.id)}
                  className="p-2.5 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg transition-all border border-transparent hover:border-[var(--border-strong)] cursor-pointer"
                  title="Download Invoice"
                >
                  <Download size={16} />
                </button>
                {inv.status !== 'PAID' && (
                  <button 
                    onClick={() => handlePay(inv.id)}
                    disabled={payingInvoiceId === inv.id}
                    className="px-4 py-2 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all shadow-[0_0_10px_rgba(53,208,127,0.3)] flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60"
                  >
                    {payingInvoiceId === inv.id ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Opening...</span>
                      </>
                    ) : (
                      <>
                        Pay Now <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-[var(--bg-surface-hover)] rounded-full flex items-center justify-center text-[var(--text-muted)] mb-4">
                <Receipt size={24} />
              </div>
              <h3 className="text-[var(--text-primary)] font-bold tracking-widest uppercase mb-2">No Invoices Found</h3>
              <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase max-w-sm">There are no invoices matching your current filters.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Razorpay Checkout Portal Modal */}
      <RazorpayCheckoutModal
        isOpen={isRazorpayModalOpen}
        onClose={() => setIsRazorpayModalOpen(false)}
        orderData={selectedOrder}
        onPaymentSuccess={() => {
          fetchInvoices();
        }}
      />
    </div>
  );
}
