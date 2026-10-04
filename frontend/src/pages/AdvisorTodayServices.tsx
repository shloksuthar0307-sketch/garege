import React from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, CheckCircle, Car, Settings, FileText, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { advisorApi } from '../api/advisor';

export default function AdvisorTodayServices() {
  const { data: activeServices, isLoading } = useQuery({
    queryKey: ['advisor-active-services'],
    queryFn: advisorApi.getActiveServiceOrders
  });

  const { data: statsData } = useQuery({
    queryKey: ['advisor-stats'],
    queryFn: advisorApi.getDashboardStats
  });

  if (isLoading) {
    return <div className="p-8 text-[var(--text-muted)]">Loading today's services...</div>;
  }

  // Filter or group services logically
  const pendingIntake = activeServices?.filter((s: any) => s.status === 'BOOKED') || [];
  const inWorkshop = activeServices?.filter((s: any) => !['BOOKED', 'COMPLETED', 'DELIVERED'].includes(s.status)) || [];
  const readyDelivery = activeServices?.filter((s: any) => s.status === 'COMPLETED') || [];

  const renderServiceCard = (service: any) => (
    <div key={service.id} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 rounded-xl flex items-center justify-between hover:border-[var(--border-strong)] transition-colors cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
          <Car size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[var(--text-primary)] mb-0.5">
            {service.vehicle?.make} {service.vehicle?.model}
            <span className="ml-2 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface-hover)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
              {service.vehicle?.registration_number}
            </span>
          </h4>
          <p className="text-xs text-[var(--text-muted)]">
            {service.customer?.first_name} {service.customer?.last_name} &bull; {service.type}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-right hidden md:block">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Status</div>
          <div className="text-xs text-[var(--text-primary)] bg-[var(--bg-surface-active)] px-2 py-1 rounded inline-block">
            {service.status.replace('_', ' ')}
          </div>
        </div>
        
        <div className="text-right hidden md:block">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">ETA</div>
          <div className="text-xs text-[#35D07F] font-mono flex items-center gap-1">
            <Clock size={12} />
            {service.date_completed ? new Date(service.date_completed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
          </div>
        </div>
        
        <ChevronRight size={18} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-8 h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar pr-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight">Today's Services</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage expected intakes, active repairs, and outbound deliveries for today.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search by vehicle or customer..." 
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Pending Intake Column */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
              <Clock size={16} className="text-amber-400" /> Expected Intake
            </h3>
            <span className="bg-[var(--bg-surface-active)] text-[var(--text-primary)] text-[10px] font-mono px-2 py-0.5 rounded">
              {pendingIntake.length}
            </span>
          </div>
          <div className="space-y-3">
            {pendingIntake.length > 0 ? (
              pendingIntake.map(renderServiceCard)
            ) : (
              <div className="text-center py-8 text-[var(--text-muted)] bg-[var(--bg-secondary)] rounded-xl border border-dashed border-[var(--border-subtle)] text-sm">
                No intakes scheduled.
              </div>
            )}
          </div>
        </div>

        {/* In Workshop Column */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
              <Settings size={16} className="text-[#35D07F]" /> In Workshop
            </h3>
            <span className="bg-[var(--bg-surface-active)] text-[var(--text-primary)] text-[10px] font-mono px-2 py-0.5 rounded">
              {inWorkshop.length}
            </span>
          </div>
          <div className="space-y-3">
            {inWorkshop.length > 0 ? (
              inWorkshop.map(renderServiceCard)
            ) : (
              <div className="text-center py-8 text-[var(--text-muted)] bg-[var(--bg-secondary)] rounded-xl border border-dashed border-[var(--border-subtle)] text-sm">
                No active jobs.
              </div>
            )}
          </div>
        </div>

        {/* Ready for Delivery Column */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
              <CheckCircle size={16} className="text-blue-400" /> Ready for Delivery
            </h3>
            <span className="bg-[var(--bg-surface-active)] text-[var(--text-primary)] text-[10px] font-mono px-2 py-0.5 rounded">
              {readyDelivery.length}
            </span>
          </div>
          <div className="space-y-3">
            {readyDelivery.length > 0 ? (
              readyDelivery.map(renderServiceCard)
            ) : (
              <div className="text-center py-8 text-[var(--text-muted)] bg-[var(--bg-secondary)] rounded-xl border border-dashed border-[var(--border-subtle)] text-sm">
                No deliveries ready.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


