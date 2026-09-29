import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Car, Wrench, FileSearch, FileSignature, 
  CheckSquare, CheckCircle2, Flag, AlertCircle, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { advisorApi } from '../api/advisor';
import WorkQueue from '../components/service-advisor/WorkQueue';
import ServiceOrderDrawer from '../components/service-advisor/ServiceOrderDrawer';
import { AnimatePresence } from 'framer-motion';

export default function AdvisorDashboard() {
  const [selectedServiceId, setSelectedServiceId] = React.useState<string | null>(null);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['advisor-stats'],
    queryFn: advisorApi.getDashboardStats
  });

  const { data: activeServices, isLoading: servicesLoading } = useQuery({
    queryKey: ['advisor-active-services'],
    queryFn: advisorApi.getActiveServiceOrders
  });

  const kpis = statsData?.kpis || {};
  const workflowStages = statsData?.workflow_stages || [];
  
  const KPI_CARDS = [
    { title: 'Today\'s Bookings', value: kpis.todays_bookings || '0', icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Vehicles Received', value: kpis.vehicles_received || '0', icon: Car, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { title: 'Active Services', value: kpis.active_services || '0', icon: Wrench, color: 'text-[#35D07F]', bg: 'bg-[#35D07F]/10' },
    { title: 'Pending Inspections', value: kpis.pending_inspections || '0', icon: FileSearch, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { title: 'Pending Estimates', value: kpis.pending_estimates || '0', icon: FileSignature, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { title: 'Awaiting Approval', value: kpis.awaiting_approval || '0', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Approved Repairs', value: kpis.approved_repairs || '0', icon: CheckSquare, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { title: 'Completed Today', value: kpis.completed_today || '0', icon: CheckCircle2, color: 'text-slate-300', bg: 'bg-white/10' },
  ];

  if (statsLoading || servicesLoading) {
    return <div className="p-8 text-white flex items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">Advisor Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Daily command center for vehicle intake, estimates, and repair coordination.</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {KPI_CARDS.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-[#111112] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white/[0.02] transition-colors cursor-pointer"
            >
              <div className={'w-10 h-10 rounded-full flex items-center justify-center mb-3 ' + kpi.bg + ' ' + kpi.color}>
                <Icon size={18} />
              </div>
              <div className="text-2xl font-light text-white mb-1">{kpi.value}</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-tight">{kpi.title}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Grid: Work Queue + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 h-[400px]">
          <WorkQueue />
        </div>
        
        <div className="lg:col-span-2">
          {/* Visual Workflow Pipeline */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#111112] border border-white/5 rounded-2xl p-6 overflow-x-auto custom-scrollbar"
      >
        <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Service Pipeline</h3>
        <div className="flex items-center min-w-[900px] justify-between relative px-4">
          <div className="absolute top-4 left-8 right-8 h-px bg-white/10 z-0"></div>
          {workflowStages.map((stage: any, idx: number) => (
            <div key={stage.id} className="relative z-10 flex flex-col items-center gap-3">
              <div className={'w-8 h-8 rounded-full bg-[#111112] flex items-center justify-center text-xs font-mono font-bold border-2 ' + stage.color + (stage.count > 0 ? ' text-white' : ' text-slate-600 border-white/10')}>
                {stage.count}
              </div>
              <div className={'text-[10px] font-bold uppercase tracking-widest text-center ' + (stage.count > 0 ? 'text-slate-300' : 'text-slate-600')}>
                {stage.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      </div>
      </div>

      {/* Active Services Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest">Today's Active Services</h3>
          <Link to="/advisor/repairs" className="text-xs text-[#35D07F] hover:underline uppercase tracking-widest font-bold">View All</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeServices && activeServices.length > 0 ? activeServices.map((vehicle: any, idx: number) => (
            <div key={vehicle.id} className="bg-[#111112] border border-white/5 rounded-2xl p-5 hover:border-white/20 transition-colors flex flex-col relative overflow-hidden group">
              {/* Top Meta */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-sm font-bold text-white mb-0.5">
                    {vehicle.vehicle?.make} {vehicle.vehicle?.model}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 inline-block">
                    {vehicle.vehicle?.registration_number}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#35D07F] font-mono">{vehicle.order_number}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {vehicle.customer ? `${vehicle.customer.first_name} ${vehicle.customer.last_name}` : 'Unknown'}
                  </div>
                </div>
              </div>

              {/* Service Info */}
              <div className="flex-1 space-y-3 mb-6">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1">Service Type</span>
                  <span className="text-xs text-slate-300 line-clamp-1">{vehicle.type}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1">Technician</span>
                    <span className="text-xs text-slate-300">{vehicle.technician || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1">Est. Cost</span>
                    <span className="text-xs font-mono text-amber-400">
                      ₹ {vehicle.service_estimate?.total || vehicle.total_cost || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress & Stage */}
              <div className="mt-auto">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest mb-2">
                  <span className="text-slate-400">
                    {vehicle.status.replace('_', ' ')}
                  </span>
                  <span className="text-[#35D07F]">{vehicle.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-[#35D07F] rounded-full" style={{ width: (vehicle.progress || 0) + '%' }}></div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                  <Clock size={12} /> ETA: {vehicle.date_completed ? new Date(vehicle.date_completed).toLocaleString() : 'Pending'}
                </div>
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                <button 
                  onClick={() => setSelectedServiceId(vehicle.id)}
                  className="w-32 bg-[#35D07F] hover:bg-[#2EB86F] text-black py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-colors"
                >
                  Open Service
                </button>
                <button 
                  onClick={() => alert(`Messaging client is currently unavailable.`)}
                  className="w-32 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-colors"
                >
                  Message Client
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-4 text-center py-12 text-slate-500 bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
              No active services at the moment.
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedServiceId && (
          <ServiceOrderDrawer 
            serviceId={selectedServiceId} 
            onClose={() => setSelectedServiceId(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

