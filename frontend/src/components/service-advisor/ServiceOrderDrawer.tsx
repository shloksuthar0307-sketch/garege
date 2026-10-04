import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Wrench, CheckCircle, FileText, MessageSquare, Camera } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { advisorApi } from '../../api/advisor';
import ServiceOrder3DView from './ServiceOrder3DView';
import EstimateBuilder from './EstimateBuilder';
import CustomerCommunication from './CustomerCommunication';

export default function ServiceOrderDrawer({ serviceId, onClose }: { serviceId: string | null, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: service, isLoading } = useQuery({
    queryKey: ['advisor-service-order', serviceId],
    queryFn: () => advisorApi.getServiceOrder(serviceId as string),
    enabled: !!serviceId
  });

  return (
    <AnimatePresence>
      {serviceId && (
        <>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm z-[200]"
        onClick={onClose}
      />
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[var(--bg-primary)] border-l border-[var(--border-default)] z-[201] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-subtle)] flex items-center gap-4 shrink-0 bg-[var(--bg-secondary)]">
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-surface-hover)] rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0">
            <X size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-[#35D07F]/20 text-[#35D07F] px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest uppercase">
                {service?.order_number || serviceId}
              </span>
              <span className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">{service?.status?.replace('_', ' ')}</span>
            </div>
            <h2 className="text-2xl font-light text-[var(--text-primary)]">
              {isLoading ? 'Loading...' : `${service?.vehicle?.make || 'Unknown'} ${service?.vehicle?.model || 'Vehicle'}`.replace('Unknown Vehicle', 'Vehicle').trim()}
            </h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-[var(--border-subtle)] shrink-0 overflow-x-auto custom-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: CheckCircle },
            { id: 'inspection', label: 'Inspection', icon: Camera },
            { id: 'estimate', label: 'Estimate', icon: FileText },
            { id: 'repair', label: 'Repair Progress', icon: Wrench },
            { id: 'chat', label: 'Customer Chat', icon: MessageSquare }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-[#35D07F] text-[#35D07F]' 
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[var(--bg-primary)]">
          {isLoading ? (
            <div className="text-[var(--text-muted)] flex justify-center py-12">Loading service order details...</div>
          ) : (
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-subtle)]">
                      <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Customer</h4>
                      <p className="text-sm text-[var(--text-primary)]">{service?.customer?.first_name} {service?.customer?.last_name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{service?.customer?.email}</p>
                    </div>
                    <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-subtle)]">
                      <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Vehicle</h4>
                      <p className="text-sm text-[var(--text-primary)] font-mono">{service?.vehicle?.registration_number}</p>
                      <p className="text-xs text-[var(--text-muted)]">VIN: {service?.vehicle?.vin}</p>
                    </div>
                  </div>
                  
                  <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-subtle)]">
                    <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Customer Concern</h4>
                    <p className="text-sm text-[var(--text-secondary)]">{service?.title || 'General Maintenance and full service required.'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-subtle)]">
                      <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Technician</h4>
                      <p className="text-sm text-[var(--text-primary)]">{service?.technician || 'Not assigned yet'}</p>
                    </div>
                    <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-subtle)]">
                      <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">ETA</h4>
                      <p className="text-sm text-[var(--text-primary)]">{service?.date_completed ? new Date(service.date_completed).toLocaleString() : 'Pending'}</p>
                    </div>
                  </div>
                </>
              )}
              
              {activeTab === 'inspection' && (
                <div className="h-[400px] border border-[var(--border-default)] rounded-xl overflow-hidden bg-[var(--bg-secondary)] relative">
                  <div className="absolute top-4 left-4 z-10 bg-[var(--bg-input)] backdrop-blur px-3 py-1.5 rounded-lg border border-[var(--border-default)] flex items-center gap-2">
                    <Camera size={14} className="text-[#35D07F]" />
                    <span className="text-xs font-medium text-[var(--text-primary)] tracking-widest uppercase">3D Inspection View</span>
                  </div>
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <span className="bg-red-500/20 border border-red-500/50 text-red-500 text-[10px] uppercase tracking-widest px-2 py-1 rounded font-bold">
                      1 Issue Found
                    </span>
                  </div>
                  
                  <ServiceOrder3DView />
                </div>
              )}

              {activeTab === 'estimate' && (
                <div className="h-[500px]">
                  <EstimateBuilder serviceOrder={service} />
                </div>
              )}

              {activeTab === 'repair' && (
                <div className="text-[var(--text-muted)] border border-dashed border-[var(--border-default)] rounded-xl p-8 text-center bg-[var(--bg-secondary)]">
                  <Wrench size={32} className="mx-auto mb-4 text-slate-600" />
                  <p className="text-sm">Repair Progress</p>
                  <p className="text-xs mt-2">Track technician checklists and completion status.</p>
                </div>
              )}

              {activeTab === 'chat' && (
                <CustomerCommunication serviceOrder={service} />
              )}
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0 flex gap-4">
          <button className="flex-1 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">
            Update Status
          </button>
          <button className="flex-1 bg-[#35D07F] hover:bg-[#2EB86F] text-black py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">
            Contact Customer
          </button>
        </div>
      </motion.div>
    </>
      )}
    </AnimatePresence>
  );
}


