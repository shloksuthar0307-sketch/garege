import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, Wrench, FileSearch, Camera, Clock, AlertTriangle, 
  CheckCircle2, Box, PenTool, Image as ImageIcon, Play, Terminal
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { technicianApi } from '../api/technician';
import { useLaborStore } from '../store/useLaborStore';
import { DiagnosticConsole } from '../components/vehicle/DiagnosticConsole';

export default function TechnicianVehicleDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['workOrder', id],
    queryFn: () => technicianApi.getWorkOrder(id!),
    enabled: !!id,
  });

  const handleSaveDiagnostic = (dtcCodes: string[]) => {
    // Ideally this would make an API call to save to the order's issues
    console.log('Saving DTC codes to order:', dtcCodes);
    alert(`Saved DTC codes: ${dtcCodes.join(', ')}`);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Car },
    { id: 'inspection', label: 'Inspection', icon: FileSearch },
    { id: 'issues', label: 'Issues', icon: AlertTriangle },
    { id: 'evidence', label: 'Evidence', icon: Camera },
    { id: 'repair', label: 'Repair', icon: Wrench },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ];

  const TIMELINE_EVENTS = [
    { time: '09:30', title: 'Vehicle Received', desc: 'Bay 4', type: 'system', icon: Car },
    { time: '09:45', title: 'Inspection Started', desc: 'Technician', type: 'action', icon: FileSearch },
    { time: '10:42', title: 'Brake Issue Found', desc: 'Critical severity', type: 'issue', icon: AlertTriangle },
    { time: '10:45', title: 'Photos Uploaded', desc: 'Evidence captured', type: 'evidence', icon: Camera },
  ];

  if (!id) return <div className="p-8 text-[var(--text-primary)]">No Service Order ID provided</div>;
  if (isLoading) return <div className="p-8 text-[var(--text-primary)]">Loading vehicle details...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
      
      {/* Vehicle Header */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[var(--bg-surface-hover)] flex items-center justify-center">
              <Car size={32} className="text-[#35D07F]" />
            </div>
            <div>
              <h1 className="text-2xl font-light text-[var(--text-primary)]">{order?.vehicle?.make} {order?.vehicle?.model}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-surface-hover)] px-2 py-1 rounded border border-[var(--border-default)]">{order?.vehicle?.registration_number}</span>
                <span className="text-xs font-mono text-[#35D07F]">ID: {order?.order_number}</span>
              </div>
            </div>
          </div>
          <div className="bg-[#35D07F]/10 border border-[#35D07F]/20 px-4 py-2 rounded-xl text-[#35D07F] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#35D07F] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#35D07F]"></span>
            </span>
            {order?.status}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-subtle)]">
          <div>
            <span className="block text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Customer ID</span>
            <span className="text-sm text-[var(--text-primary)] font-medium">{order?.vehicle?.owner || '-'}</span>
          </div>
          <div>
            <span className="block text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Service</span>
            <span className="text-sm text-[var(--text-primary)] font-medium">{order?.title}</span>
          </div>
          <div>
            <span className="block text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Advisor</span>
            <span className="text-sm text-[var(--text-primary)] font-medium">{order?.advisor || 'Unassigned'}</span>
          </div>
          <div>
            <span className="block text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Priority</span>
            <span className="text-sm text-amber-400 font-medium">Normal</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar gap-2 p-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={'whitespace-nowrap px-6 py-3 text-xs font-bold tracking-widest uppercase rounded-lg transition-colors flex items-center gap-2 ' + (isActive ? 'bg-[#35D07F] text-black' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]')}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
                 <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6">Customer Concerns</h3>
                 <p className="text-sm text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-surface-hover)] p-4 rounded-xl border border-[var(--border-subtle)]">
                   No specific concerns documented yet.
                 </p>
              </div>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
                 <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6">Quick Actions</h3>
                 <div className="grid grid-cols-2 gap-3">
                   <Link to={`/technician/inspections?id=${id}`} className="bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors border border-[var(--border-default)]">
                     <FileSearch size={20} className="text-amber-400" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Inspection</span>
                   </Link>
                   <Link to={`/technician/repair?id=${id}`} className="bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors border border-[var(--border-default)]">
                     <Wrench size={20} className="text-[#35D07F]" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Repair workflow</span>
                   </Link>
                   <button 
                     onClick={() => setIsDiagnosticOpen(true)}
                     className="bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors border border-[var(--border-default)] col-span-2 md:col-span-1">
                     <Terminal size={20} className="text-purple-400" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">RUN DIAGNOSTICS</span>
                   </button>
                   <button 
                     onClick={() => {
                       const { startJob } = useLaborStore.getState();
                       startJob(id, 60); // Assuming 60 mins estimate
                     }}
                     className="bg-blue-500/10 hover:bg-blue-500/20 text-[var(--text-primary)] p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors border border-blue-500/20 col-span-2 md:col-span-1">
                     <Clock size={20} className="text-blue-400" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Clock Into Job</span>
                   </button>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-8">Service Activity Timeline</h3>
                
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                  {TIMELINE_EVENTS.map((event, idx) => {
                    const EventIcon = event.icon;
                    let iconColor = 'text-[var(--text-muted)]';
                    let bgColor = 'bg-slate-800';
                    let borderColor = 'border-slate-700';

                    if (event.type === 'issue') { iconColor = 'text-rose-400'; bgColor = 'bg-rose-500/10'; borderColor = 'border-rose-500/20'; }
                    if (event.type === 'success') { iconColor = 'text-[#35D07F]'; bgColor = 'bg-[#35D07F]/10'; borderColor = 'border-[#35D07F]/20'; }
                    if (event.type === 'action') { iconColor = 'text-blue-400'; bgColor = 'bg-blue-500/10'; borderColor = 'border-blue-500/20'; }
                    if (event.type === 'evidence') { iconColor = 'text-purple-400'; bgColor = 'bg-purple-500/10'; borderColor = 'border-purple-500/20'; }

                    return (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className={'flex items-center justify-center w-10 h-10 rounded-full border shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl ' + bgColor + ' ' + borderColor}>
                          <EventIcon size={16} className={iconColor} />
                        </div>
                        
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-xl border border-[var(--border-subtle)] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                          <div className="flex items-center justify-between space-x-2 mb-2">
                            <div className="font-bold text-sm text-[var(--text-primary)]">{event.title}</div>
                            <time className="font-mono text-xs text-[var(--text-muted)] bg-[var(--bg-input)] px-2 py-1 rounded border border-[var(--border-subtle)]">{event.time}</time>
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">{event.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'evidence' && (
            <motion.div key="evidence" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="bg-[var(--bg-surface-hover)] border border-dashed border-[var(--border-strong)] hover:border-[#35D07F] hover:bg-[#35D07F]/5 rounded-2xl aspect-square flex flex-col items-center justify-center gap-3 transition-colors text-[var(--text-muted)] hover:text-[#35D07F]">
                  <Camera size={32} />
                  <span className="text-xs font-bold uppercase tracking-widest">Upload Media</span>
                </button>
              </div>
            </motion.div>
          )}

          {['inspection', 'issues', 'repair'].includes(activeTab) && (
            <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                <Box size={48} className="text-slate-600 mb-4" />
                <h3 className="text-lg text-[var(--text-primary)] font-medium mb-2">Dedicated Workspace Required</h3>
                <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto mb-6">This section contains complex interactive workflows. Please use the dedicated full-screen modules.</p>
                <Link to={`/technician/${activeTab === 'repair' ? 'repair' : 'inspections'}?id=${id}`} className="bg-[#35D07F] text-black px-6 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors hover:bg-[#2EB86F]">
                  Launch Workspace
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Diagnostic Console Modal */}
      <DiagnosticConsole
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        onSaveToOrder={handleSaveDiagnostic}
        vehicleMake={order?.vehicle?.make || 'UNKNOWN'}
      />
    </div>
  );
}


