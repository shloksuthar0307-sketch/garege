import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Car, Wrench, FileSearch, FileSignature, 
  CheckSquare, CheckCircle2, Clock, AlertCircle, ArrowRight,
  Users, Plus, Bell, TrendingUp, Eye, MessageSquare,
  X, ChevronRight, DollarSign, Loader2, RefreshCw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { advisorApi } from '../api/advisor';
import WorkQueue from '../components/service-advisor/WorkQueue';
import ServiceOrderDrawer from '../components/service-advisor/ServiceOrderDrawer';

// Map pipeline stage IDs to specific Tailwind border color classes (JIT-safe)
const STAGE_BORDER_COLORS: Record<string, string> = {
  booked:     'border-blue-400 text-blue-400',
  received:   'border-indigo-400 text-indigo-400',
  inspection: 'border-amber-400 text-amber-400',
  estimate:   'border-orange-400 text-orange-400',
  approval:   'border-purple-400 text-purple-400',
  repair:     'border-[#35D07F] text-[#35D07F]',
  qc:         'border-emerald-400 text-emerald-400',
  completed:  'border-slate-300 text-slate-300',
  delivered:  'border-slate-500 text-slate-500',
};

// Status badge colors
const STATUS_BADGE: Record<string, string> = {
  PENDING:          'bg-slate-500/20 text-slate-300 border-slate-500/30',
  CONFIRMED:        'bg-blue-500/20 text-blue-300 border-blue-500/30',
  CHECKED_IN:       'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  DIAGNOSIS:        'bg-amber-500/20 text-amber-300 border-amber-500/30',
  AWAITING_APPROVAL:'bg-purple-500/20 text-purple-300 border-purple-500/30',
  AWAITING_PARTS:   'bg-orange-500/20 text-orange-300 border-orange-500/30',
  IN_WORKSHOP:      'bg-[#35D07F]/20 text-[#35D07F] border-[#35D07F]/30',
  QUALITY_CHECK:    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  READY_FOR_PICKUP: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  COMPLETED:        'bg-slate-600/20 text-slate-400 border-slate-600/30',
  CANCELLED:        'bg-red-500/20 text-red-400 border-red-500/30',
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_BADGE[status] || 'bg-slate-600/20 text-slate-400 border-slate-600/30';
  return (
    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 pb-8 animate-pulse">
      <div className="h-12 w-72 bg-[var(--bg-surface-hover)] rounded-xl" />
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)]" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-96 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)]" />
        <div className="lg:col-span-2 h-96 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)]" />
      </div>
    </div>
  );
}

export default function AdvisorDashboard() {
  const navigate = useNavigate();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [tab, setTab] = useState<'active' | 'approvals'>('active');

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['advisor-stats'],
    queryFn: advisorApi.getDashboardStats,
    refetchInterval: 30000,
  });

  const { data: activeServices, isLoading: servicesLoading, refetch: refetchServices } = useQuery({
    queryKey: ['advisor-active-services'],
    queryFn: advisorApi.getActiveServiceOrders,
    refetchInterval: 30000,
  });

  const kpis = statsData?.kpis || {};
  const workflowStages = statsData?.workflow_stages || [];

  const KPI_CARDS = [
    { title: "Today's Bookings",  value: kpis.todays_bookings      ?? '—', icon: Calendar,      color: 'text-blue-400',    bg: 'bg-blue-400/10',    link: '/advisor/bookings' },
    { title: 'Vehicles Received', value: kpis.vehicles_received     ?? '—', icon: Car,           color: 'text-indigo-400',  bg: 'bg-indigo-400/10',  link: '/advisor/today' },
    { title: 'Active Services',   value: kpis.active_services        ?? '—', icon: Wrench,        color: 'text-[#35D07F]',   bg: 'bg-[#35D07F]/10',   link: '/advisor/repairs' },
    { title: 'Inspections',       value: kpis.pending_inspections    ?? '—', icon: FileSearch,    color: 'text-amber-400',   bg: 'bg-amber-400/10',   link: '/advisor/inspections' },
    { title: 'Awaiting Approval', value: kpis.awaiting_approval      ?? '—', icon: CheckSquare,   color: 'text-purple-400',  bg: 'bg-purple-400/10',  link: '/advisor/approvals' },
    { title: 'In Repair',         value: kpis.approved_repairs       ?? '—', icon: AlertCircle,   color: 'text-rose-400',    bg: 'bg-rose-400/10',    link: '/advisor/repairs' },
    { title: 'Completed Today',   value: kpis.completed_today        ?? '—', icon: CheckCircle2,  color: 'text-emerald-400', bg: 'bg-emerald-400/10', link: '/advisor/history' },
  ];

  // Separate awaiting-approval services
  const pendingApprovalServices = (activeServices || []).filter(
    (s: any) => s.status === 'AWAITING_APPROVAL'
  );
  const displayedServices = tab === 'approvals' ? pendingApprovalServices : (activeServices || []);

  if (statsLoading || servicesLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-8 pb-8 max-w-[1600px] mx-auto">

      {/* ─── Page Header ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight">
            Advisor Command Centre
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Vehicle intake, estimate pipeline, approvals and repair coordination — in one view.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { refetchStats(); refetchServices(); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-bold uppercase tracking-widest transition-all"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <Link
            to="/advisor/bookings"
            className="flex items-center gap-2 px-4 py-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
          >
            <Plus size={14} /> New Booking
          </Link>
        </div>
      </div>

      {/* ─── KPI Strip ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {KPI_CARDS.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.35 }}
              onClick={() => navigate(kpi.link)}
              className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:border-[var(--border-default)] hover:bg-white/[0.02] transition-all cursor-pointer group"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-transform`}>
                <Icon size={18} />
              </div>
              <div className="text-2xl font-light text-[var(--text-primary)] mb-1">{kpi.value}</div>
              <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-tight">{kpi.title}</div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Main Grid: Work Queue + Pipeline ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Work Queue */}
        <div className="lg:col-span-1 min-h-[380px]">
          <WorkQueue />
        </div>

        {/* Visual Workflow Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 overflow-x-auto custom-scrollbar"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={14} className="text-[#35D07F]" /> Service Pipeline
            </h3>
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
              {workflowStages.reduce((acc: number, s: any) => acc + (s.count || 0), 0)} total orders
            </span>
          </div>

          {workflowStages.length > 0 ? (
            <div className="flex items-start min-w-[700px] justify-between relative px-4">
              {/* Connector line */}
              <div className="absolute top-4 left-8 right-8 h-px bg-[var(--bg-surface-active)] z-0" />
              {workflowStages.map((stage: any) => {
                const colorClass = STAGE_BORDER_COLORS[stage.id] || 'border-slate-500 text-slate-400';
                const hasJobs = stage.count > 0;
                return (
                  <div key={stage.id} className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className={`w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-xs font-mono font-bold border-2 transition-all ${hasJobs ? colorClass + ' scale-100' : 'border-[var(--border-default)] text-slate-600'} group-hover:scale-125`}>
                      {stage.count}
                    </div>
                    <div className={`text-[9px] font-bold uppercase tracking-widest text-center whitespace-nowrap transition-colors ${hasJobs ? colorClass.split(' ')[1] : 'text-slate-600'}`}>
                      {stage.label}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-24 text-[var(--text-muted)] text-sm">
              No pipeline data available.
            </div>
          )}

          {/* Quick-action pills below pipeline */}
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-[var(--border-subtle)]">
            {[
              { label: 'New Check-In', icon: Car, path: '/advisor/bookings' },
              { label: 'View Approvals', icon: CheckSquare, path: '/advisor/approvals', badge: kpis.awaiting_approval },
              { label: 'Send Invoice', icon: DollarSign, path: '/advisor/invoices' },
              { label: 'Message Customer', icon: MessageSquare, path: '/advisor/messages' },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <Link
                  key={i}
                  to={action.path}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-input)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-full text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all relative"
                >
                  <Icon size={12} />
                  {action.label}
                  {action.badge && action.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-purple-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {action.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ─── Active Services Section ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {/* Tab Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-1">
            <button
              onClick={() => setTab('active')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${tab === 'active' ? 'bg-[#35D07F]/10 text-[#35D07F]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              All Active
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[var(--bg-surface-hover)] text-[9px]">
                {activeServices?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setTab('approvals')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all relative ${tab === 'approvals' ? 'bg-purple-500/10 text-purple-400' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              Awaiting Approval
              {pendingApprovalServices.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px]">
                  {pendingApprovalServices.length}
                </span>
              )}
            </button>
          </div>
          <Link to="/advisor/repairs" className="text-xs text-[#35D07F] hover:underline uppercase tracking-widest font-bold flex items-center gap-1">
            View All <ArrowRight size={12} />
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {displayedServices.length > 0 ? displayedServices.map((vehicle: any, idx: number) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-5 hover:border-[var(--border-default)] transition-all flex flex-col relative overflow-hidden group"
            >
              {/* Subtle glow on hover */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#35D07F]/0 to-[#35D07F]/0 group-hover:from-[#35D07F]/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />

              {/* Top Meta */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)] mb-1">
                    {vehicle.vehicle?.make} {vehicle.vehicle?.model}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface-hover)] px-2 py-0.5 rounded border border-[var(--border-subtle)] inline-block">
                    {vehicle.vehicle?.registration_number}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#35D07F] font-mono">{vehicle.order_number}</div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-1">
                    {vehicle.customer ? `${vehicle.customer.first_name || ''} ${vehicle.customer.last_name || ''}`.trim() || 'Unknown' : 'Unknown'}
                  </div>
                </div>
              </div>

              {/* Status + Service Type */}
              <div className="flex items-center justify-between mb-3">
                <StatusBadge status={vehicle.status} />
                <span className="text-[10px] text-[var(--text-muted)] truncate ml-2 max-w-[100px]">{vehicle.type}</span>
              </div>

              {/* Info Row */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest block mb-0.5">Technician</span>
                  <span className="text-xs text-[var(--text-secondary)]">{vehicle.technician || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest block mb-0.5">Est. Cost</span>
                  <span className="text-xs font-mono text-amber-400">
                    ₹{vehicle.service_estimate?.total ?? vehicle.total_cost ?? '0'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-auto">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest mb-1.5">
                  <span className="text-[var(--text-muted)]">Progress</span>
                  <span className="text-[#35D07F]">{vehicle.progress ?? 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--bg-surface-hover)] rounded-full overflow-hidden mb-3">
                  <motion.div
                    className="h-full bg-[#35D07F] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${vehicle.progress ?? 0}%` }}
                    transition={{ delay: idx * 0.05 + 0.3, duration: 0.6 }}
                  />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-mono">
                  <Clock size={11} />
                  ETA: {vehicle.date_completed ? new Date(vehicle.date_completed).toLocaleDateString() : 'Pending'}
                </div>
              </div>

              {/* Hover Overlay Actions */}
              <div className="absolute inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center gap-2 p-4">
                <button
                  onClick={() => setSelectedServiceId(vehicle.id)}
                  className="w-full flex items-center justify-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-colors"
                >
                  <Eye size={14} /> Open Service
                </button>
                <Link
                  to="/advisor/messages"
                  className="w-full flex items-center justify-center gap-2 bg-[var(--bg-surface-active)] hover:bg-white/20 text-[var(--text-primary)] py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-colors"
                >
                  <MessageSquare size={14} /> Message Client
                </Link>
                {vehicle.status === 'AWAITING_APPROVAL' && (
                  <Link
                    to="/advisor/approvals"
                    className="w-full flex items-center justify-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-colors"
                  >
                    <CheckSquare size={14} /> Review Estimate
                  </Link>
                )}
              </div>
            </motion.div>
          )) : (
            <div className="col-span-4 text-center py-16 text-[var(--text-muted)] bg-[var(--bg-secondary)] rounded-2xl border border-dashed border-[var(--border-subtle)] flex flex-col items-center gap-3">
              <CheckCircle2 size={40} className="opacity-30" />
              <p className="text-sm">
                {tab === 'approvals' ? 'No estimates awaiting customer approval.' : 'No active services at the moment.'}
              </p>
              <Link to="/advisor/bookings" className="text-xs text-[#35D07F] hover:underline uppercase tracking-widest font-bold flex items-center gap-1">
                Create a Booking <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      {/* Service Order Detail Drawer */}
      <ServiceOrderDrawer
        serviceId={selectedServiceId}
        onClose={() => setSelectedServiceId(null)}
      />
    </div>
  );
}
