import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../../lib/auth';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Calendar, CreditCard, Car, CheckCircle2,
  Wrench, Receipt, AlertTriangle, Bell,
  Loader2, RefreshCw, TrendingUp
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import ActiveRepairTracker from './components/ActiveRepairTracker';
import UpcomingAppointments from './components/UpcomingAppointments';
import RecentInvoices from './components/RecentInvoices';
import ExpenseAnalytics from './components/ExpenseAnalytics';
import VehicleSummary from './components/VehicleSummary';
import SmartAlerts from './components/SmartAlerts';
import QuickActionsShortcuts from './components/QuickActionsShortcuts';

// Derive user name from JWT token
function getUserName(): string {
  try {
    const token = getAccessToken();
    if (token) {
      const d = JSON.parse(atob(token.split('.')[1]));
      return d.user?.first_name || d.first_name || d.user?.username || 'Customer';
    }
  } catch { }
  return 'Customer';
}

// Status → pill color map

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const userName = getUserName();

  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [serviceOrders, setServiceOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingVehicle, setBookingVehicle] = useState('');
  const [bookingType, setBookingType] = useState('General Maintenance / Oil Change');
  const [bookingDate, setBookingDate] = useState('');
  const [booking, setBooking] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [vRes, sRes, iRes] = await Promise.all([
        api.get('/customer/vehicles/'),
        api.get('/customer/service-orders/'),
        api.get('/customer/invoices/').catch(() => ({ data: [] })),
      ]);
      setVehicles(vRes.data?.results || vRes.data || []);
      setServiceOrders(sRes.data?.results || sRes.data || []);
      setInvoices(iRes.data?.results || iRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const poll = setInterval(fetchAll, 15000);
    return () => clearInterval(poll);
  }, [fetchAll]);

  // KPI computations from real data
  const activeRepairs = serviceOrders.filter(s => !['COMPLETED', 'CANCELLED', 'CLOSED'].includes(s.status));
  const pendingApprovals = serviceOrders.filter(s => s.status === 'AWAITING_APPROVAL');
  const unpaidInvoices = invoices.filter(i => i.status !== 'PAID');
  const totalSpent = invoices
    .filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const outstandingBal = unpaidInvoices
    .reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);

  const activeService = activeRepairs[0];

  const handleConfirmBooking = async () => {
    if (!bookingVehicle || !bookingDate) {
      toast.error('Please select a vehicle and date.');
      return;
    }
    setBooking(true);
    try {
      await api.post('/customer/appointments/', {
        vehicle: bookingVehicle,
        service_type: bookingType,
        date_time: `${bookingDate}T09:00:00Z`,
        status: 'REQUESTED',
      });
      toast.success('Service successfully requested!', {
        style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
        iconTheme: { primary: '#35D07F', secondary: '#000' }
      });
      setShowBookingModal(false);
      fetchAll();
    } catch {
      toast.error('Failed to submit booking. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const KPI_CARDS = [
    {
      label: 'Total Spent',
      value: totalSpent > 0 ? `₹${totalSpent.toLocaleString('en-IN')}` : '₹0',
      icon: TrendingUp,
      color: 'text-[#35D07F]',
      bg: 'bg-[#35D07F]/10',
      border: 'border-[#35D07F]/20',
      link: '/customer/billing',
    },
    {
      label: 'Active Repairs',
      value: activeRepairs.length,
      icon: Wrench,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/20',
      link: '/customer/repairs',
    },
    {
      label: 'Awaiting Approval',
      value: pendingApprovals.length,
      icon: AlertTriangle,
      color: pendingApprovals.length > 0 ? 'text-purple-400' : 'text-[var(--text-muted)]',
      bg: pendingApprovals.length > 0 ? 'bg-purple-400/10' : 'bg-[var(--bg-surface-hover)]',
      border: pendingApprovals.length > 0 ? 'border-purple-400/20' : 'border-[var(--border-subtle)]',
      link: '/customer/approvals',
    },
    {
      label: 'Outstanding Balance',
      value: outstandingBal > 0 ? `₹${outstandingBal.toLocaleString('en-IN')}` : '₹0',
      icon: Receipt,
      color: outstandingBal > 0 ? 'text-rose-400' : 'text-[var(--text-muted)]',
      bg: outstandingBal > 0 ? 'bg-rose-400/10' : 'bg-[var(--bg-surface-hover)]',
      border: outstandingBal > 0 ? 'border-rose-400/20' : 'border-[var(--border-subtle)]',
      link: '/customer/invoices',
    },
    {
      label: 'Registered Vehicles',
      value: vehicles.length,
      icon: Car,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20',
      link: '/customer/vehicles',
    },
  ];

  return (
    <div className="space-y-8 pb-10 max-w-[1500px] mx-auto relative">
      <SmartAlerts />

      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-[var(--text-primary)] mb-1">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">
            Your vehicle journey — tracked, verified, and transparent.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-3"
        >
          <button
            onClick={() => fetchAll()}
            className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
          {pendingApprovals.length > 0 && (
            <Link
              to="/customer/approvals"
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-bold tracking-widest uppercase transition-all relative"
            >
              <Bell size={14} />
              {pendingApprovals.length} Approval{pendingApprovals.length > 1 ? 's' : ''} Pending
            </Link>
          )}
          <button
            id="book_service_btn"
            onClick={() => setShowBookingModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(53,208,127,0.3)]"
          >
            <Plus size={16} /> Book Service
          </button>
          <Link
            to="/customer/invoices"
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-xl text-xs font-bold tracking-widest uppercase transition-all"
          >
            <CreditCard size={14} /> Pay Invoice
          </Link>
        </motion.div>
      </div>

      {/* ─── KPI Strip ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {KPI_CARDS.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              onClick={() => navigate(kpi.link)}
              className={`bg-[var(--bg-primary)]/80 backdrop-blur-md border ${kpi.border} rounded-2xl p-5 flex items-center gap-4 hover:scale-[1.02] transition-all cursor-pointer group`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest truncate">{kpi.label}</p>
                <p className={`text-lg font-bold tracking-wider ${kpi.color} truncate`}>{kpi.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Quick Actions ─── */}
      <QuickActionsShortcuts />

      {/* ─── Live Repair + Appointments ─── */}
      <div id="live_service" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ActiveRepairTracker loading={loading} activeService={activeService} />
        </div>
        <div className="xl:col-span-1">
          <UpcomingAppointments
            loading={loading}
            upcomingAppointment={serviceOrders.find(s => ['PENDING', 'CHECKED_IN'].includes(s.status))}
          />
        </div>
      </div>

      {/* ─── Invoices + Spending ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <RecentInvoices loading={loading} invoices={invoices} />
        </div>
        <div className="xl:col-span-2">
          <ExpenseAnalytics loading={loading} invoices={invoices} />
        </div>
      </div>

      {/* ─── Vehicle Summary ─── */}
      <VehicleSummary loading={loading} vehicles={vehicles} />

      {/* ─── Booking Modal ─── */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm"
              onClick={() => setShowBookingModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--bg-primary)] border border-[var(--border-default)] p-6 rounded-2xl z-10 w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setShowBookingModal(false)} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X size={20} />
              </button>
              <h2 className="text-[var(--text-primary)] text-lg font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
                <Calendar className="text-[#35D07F]" /> Book a Service
              </h2>
              <p className="text-[var(--text-muted)] text-xs mb-6">Request a new workshop appointment for your vehicle.</p>

              <div className="space-y-4">
                <div>
                  <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1 block">Select Vehicle *</label>
                  <select
                    value={bookingVehicle}
                    onChange={e => setBookingVehicle(e.target.value)}
                    className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3 text-[var(--text-primary)] text-sm outline-none focus:border-[#35D07F] transition-colors"
                  >
                    <option value="">— Select a vehicle —</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model} ({v.registration_number || 'No Plate'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1 block">Service Type *</label>
                  <select
                    value={bookingType}
                    onChange={e => setBookingType(e.target.value)}
                    className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3 text-[var(--text-primary)] text-sm outline-none focus:border-[#35D07F] transition-colors"
                  >
                    <option>General Maintenance / Oil Change</option>
                    <option>Brake Inspection / Repair</option>
                    <option>Engine Diagnostics</option>
                    <option>Tyre Change / Alignment</option>
                    <option>AC Service</option>
                    <option>Electrical Issues</option>
                    <option>Other Repair</option>
                  </select>
                </div>
                <div>
                  <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1 block">Preferred Date *</label>
                  <input
                    type="date"
                    value={bookingDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setBookingDate(e.target.value)}
                    className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3 text-[var(--text-primary)] text-sm outline-none focus:border-[#35D07F] transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={booking}
                className="w-full mt-8 py-3 bg-[#35D07F] text-black font-bold tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(53,208,127,0.3)] hover:bg-[#2bb46c] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {booking ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {booking ? 'Submitting…' : 'Confirm Booking'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
