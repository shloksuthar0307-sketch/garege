import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronRight, Wrench, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '../../api/customer';

export function ServiceHistory() {
  const [selectedService, setSelectedService] = useState<any | null>(null);

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['vehicle-service-history'],
    queryFn: customerApi.getServiceHistory,
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight mb-2">Service History</h1>
          <p className="text-gray-400">Complete digital record of your vehicles.</p>
        </div>
      </div>

      <div className="space-y-4">
        {historyData?.length === 0 ? (
          <div className="text-gray-400 text-center py-12 border border-dashed border-[var(--border-subtle)] rounded-3xl">
            No service history available.
          </div>
        ) : (
          historyData?.map((record: any) => (
            <div 
              key={record.id}
              onClick={() => setSelectedService(record)}
              className="bg-[#111] border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-2xl p-6 cursor-pointer transition-all hover:bg-[#151515] group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex flex-col items-center justify-center w-20 h-20 rounded-xl bg-black border border-[var(--border-subtle)] flex-shrink-0">
                    <span className="text-xs text-gray-500 font-medium">{new Date(record.created_at).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                    <span className="text-2xl font-light text-[var(--text-primary)]">{new Date(record.created_at).getDate()}</span>
                    <span className="text-xs text-gray-500">{new Date(record.created_at).getFullYear()}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">{record.title || record.type}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1"><Wrench className="w-3.5 h-3.5" /> {record.advisor || 'Unassigned'}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {record.order_number}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-48">
                  <div className="text-left sm:text-right">
                    <p className="text-[var(--text-primary)] font-mono text-lg">{record.total_cost ? `₹${record.total_cost}` : 'TBD'}</p>
                    <p className="text-emerald-500 text-xs font-medium flex items-center justify-start sm:justify-end gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {record.status}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[var(--text-primary)] transition-colors" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedService && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[var(--bg-overlay)] backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="bg-[#111] border border-[var(--border-default)] rounded-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center">
                <h2 className="text-xl font-medium text-[var(--text-primary)]">Service Detail - {selectedService.order_number}</h2>
                <button onClick={() => setSelectedService(null)} className="text-gray-400 hover:text-[var(--text-primary)]">✕</button>
              </div>
              <div className="p-6 bg-[#0a0a0a]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center text-[var(--text-primary)]">
                    {selectedService.advisor ? selectedService.advisor.substring(0,2).toUpperCase() : 'NA'}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Assigned Advisor</p>
                    <p className="text-[var(--text-primary)] font-medium">{selectedService.advisor || 'Pending Assignment'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[#111]">
                    <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">Work Performed / Status</h4>
                    <p className="text-sm text-gray-400">{selectedService.title}</p>
                    <p className="text-sm text-gray-400 mt-2 font-mono">Current Status: {selectedService.status}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-[var(--border-subtle)] flex justify-end gap-3">
                <button onClick={() => setSelectedService(null)} className="px-6 py-2.5 rounded-xl border border-[var(--border-default)] text-[var(--text-primary)] font-medium text-sm hover:bg-[var(--bg-surface-hover)] transition-colors">Close</button>
                <button className="px-6 py-2.5 rounded-xl bg-white text-black font-medium text-sm hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Download PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
