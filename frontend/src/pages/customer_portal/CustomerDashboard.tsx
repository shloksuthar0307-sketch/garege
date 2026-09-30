import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Calendar, CreditCard, Car, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ActiveRepairTracker from './components/ActiveRepairTracker';
import UpcomingAppointments from './components/UpcomingAppointments';
import RecentInvoices from './components/RecentInvoices';
import ExpenseAnalytics from './components/ExpenseAnalytics';
import TeamActivity from './components/TeamActivity';
import RecommendedHelp from './components/RecommendedHelp';
import VehicleSummary from './components/VehicleSummary';
import SmartAlerts from './components/SmartAlerts';

// New Features Imports
import QuickActionsShortcuts from './components/QuickActionsShortcuts';
import GarageVisitSection from './components/GarageVisitSection';
import ServiceEvidenceAndParts from './components/ServiceEvidenceAndParts';
import VehicleAnalysisSection from './components/VehicleAnalysisSection';
import VehicleDocumentsAndReminders from './components/VehicleDocumentsAndReminders';
import ServiceCostAndAdvisor from './components/ServiceCostAndAdvisor';
import CustomerServiceHistory from './components/CustomerServiceHistory';

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userName, setUserName] = useState('John');
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setUserName(tokenData.user?.first_name || tokenData.user?.username || 'Customer');
      }
    } catch (e) {
      console.error(e);
    }
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleConfirmBooking = () => {
    toast.success('Service successfully requested!', {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
    setShowBookingModal(false);
  };

  const handleConfirmPayment = () => {
    toast.success('Payment processed successfully!', {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
    setShowPaymentModal(false);
  };

  return (
    <div className="space-y-8 pb-10 max-w-[1400px] mx-auto relative">
      <SmartAlerts />

      {/* TOP: Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-white mb-2">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-slate-400 text-xs tracking-widest uppercase">
            Here's what's happening with your account today.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-3"
        >
          <button id="book_service_btn" onClick={() => setShowBookingModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(53,208,127,0.3)]">
            <Plus size={16} /> Book Service
          </button>
          <button onClick={() => setShowPaymentModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all">
            Pay Invoice
          </button>
        </motion.div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => setShowBookingModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-[#0A0A0B] border border-white/10 p-6 rounded-2xl z-10 w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setShowBookingModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
              <h2 className="text-white text-lg font-bold tracking-widest uppercase mb-6 flex items-center gap-2"><Calendar className="text-[#35D07F]" /> Book a Service</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 block">Select Vehicle</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-[#35D07F]">
                    <option value="camry">2019 Toyota Camry (ABC-1234)</option>
                    <option value="f150">2021 Ford F-150 (XYZ-9876)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 block">Service Type</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-[#35D07F]">
                    <option>General Maintenance / Oil Change</option>
                    <option>Brake Inspection / Repair</option>
                    <option>Diagnostics</option>
                    <option>Other Repair</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 block">Preferred Date</label>
                  <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-[#35D07F]" />
                </div>
              </div>
              
              <button onClick={handleConfirmBooking} className="w-full mt-8 py-3 bg-[#35D07F] text-black font-bold tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(53,208,127,0.3)] hover:bg-[#2bb46c] transition-all">
                Confirm Booking
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => setShowPaymentModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-[#0A0A0B] border border-white/10 p-6 rounded-2xl z-10 w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
              <h2 className="text-white text-lg font-bold tracking-widest uppercase mb-2 flex items-center gap-2"><CreditCard className="text-[#35D07F]" /> Pay Outstanding Invoice</h2>
              <p className="text-slate-400 text-xs mb-6">INV-10470 • Wheel Alignment</p>
              
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl mb-6 flex justify-between items-center text-rose-500">
                <span className="text-xs font-bold uppercase tracking-widest">Amount Due</span>
                <span className="text-xl font-bold tracking-wider">₹4,500</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 block">Card Number</label>
                  <input type="text" placeholder="**** **** **** 4242" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-[#35D07F]" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 block">Expiry</label>
                    <input type="text" placeholder="MM/YY" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-[#35D07F]" />
                  </div>
                  <div className="flex-1">
                    <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 block">CVC</label>
                    <input type="password" placeholder="***" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-[#35D07F]" />
                  </div>
                </div>
              </div>
              
              <button onClick={handleConfirmPayment} className="w-full mt-8 py-3 bg-[#35D07F] text-black font-bold tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(53,208,127,0.3)] hover:bg-[#2bb46c] transition-all flex items-center justify-center gap-2">
                <CheckCircle2 size={18} /> Pay ₹4,500 Now
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ROW 1: Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {['Total Spent: ₹1,24,500', 'Active Repairs: 1', 'Outstanding Balance: ₹8,500'].map((metric, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
            className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 hover:border-[#35D07F]/30 transition-colors rounded-2xl p-5 flex items-center justify-between cursor-pointer"
          >
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em]">{metric.split(':')[0]}</span>
            <span className="text-white text-lg font-bold tracking-widest">{metric.split(':')[1]}</span>
          </motion.div>
        ))}
      </div>

      <QuickActionsShortcuts />

      {/* ROW 2: Repairs & Appointments */}
      <div id="live_service" className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2">
          <ActiveRepairTracker loading={loading} />
        </div>
        <div className="xl:col-span-1 flex flex-col gap-6">
          <UpcomingAppointments loading={loading} />
          <div id="garage">
            <GarageVisitSection />
          </div>
        </div>
      </div>

      <ServiceEvidenceAndParts />
      <div id="support">
        <ServiceCostAndAdvisor />
      </div>

      {/* ROW 3: Invoices & Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-1">
          <RecentInvoices loading={loading} />
        </div>
        <div className="xl:col-span-2">
          <ExpenseAnalytics loading={loading} />
        </div>
      </div>

      {/* ROW 4: Team Activity & Help */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TeamActivity loading={loading} />
        <RecommendedHelp loading={loading} />
      </div>

      <div id="analysis"><VehicleAnalysisSection /></div>
      <div id="documents" className="scroll-mt-4"><VehicleDocumentsAndReminders /></div>
      <div id="history" className="scroll-mt-4"><CustomerServiceHistory /></div>

      {/* ROW 5: Vehicle Summary */}
      <VehicleSummary loading={loading} />
    </div>
  );
}

