import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { advisorApi } from '../../api/advisor';

export default function WorkQueue() {
  const { data: activeServices, isLoading } = useQuery({
    queryKey: ['advisor-active-services'],
    queryFn: advisorApi.getActiveServiceOrders
  });

  if (isLoading) return <div className="text-white">Loading Work Queue...</div>;

  // Derive work queue items from active services
  // This logic ideally should be in the backend (AdvisorWorkQueueView)
  // but we can infer it here from active services for now
  const queue = [];
  
  if (activeServices) {
    activeServices.forEach(service => {
      if (service.status === 'INSPECTION') {
        queue.push({
          id: service.id,
          type: 'INSPECTION_REQUIRED',
          title: `Needs Inspection: ${service.vehicle?.registration_number}`,
          desc: 'Vehicle has been checked in and is awaiting digital inspection.',
          priority: 'HIGH',
          time: service.date_created,
          order: service
        });
      } else if (service.status === 'QUALITY_CHECK') {
        queue.push({
          id: service.id,
          type: 'DELIVERY_PREP',
          title: `Ready for Quality Check: ${service.vehicle?.registration_number}`,
          desc: 'Repair completed, requires advisor quality check and delivery prep.',
          priority: 'NORMAL',
          time: service.date_completed || service.date_created,
          order: service
        });
      }
      // Add other conditions based on business rules
    });
  }

  return (
    <div className="bg-[#111112] border border-white/5 rounded-2xl p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">My Work Queue</h3>
        <span className="bg-[#35D07F]/20 text-[#35D07F] text-xs font-bold px-2 py-1 rounded">
          {queue.length} Action{queue.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
        {queue.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-slate-500 border border-dashed border-white/10 rounded-xl">
            You are all caught up!
          </div>
        ) : (
          queue.map((item, idx) => (
            <div key={idx} className="bg-black/50 border border-white/5 p-4 rounded-xl flex items-start gap-4 hover:border-white/20 transition-colors cursor-pointer group">
              <div className={`mt-1 flex-shrink-0 ${item.priority === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}`}>
                {item.priority === 'HIGH' ? <AlertTriangle size={18} /> : <Clock size={18} />}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white mb-1 group-hover:text-[#35D07F] transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {item.desc}
                </p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {item.order.order_number}
                  </span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1 group-hover:text-[#35D07F] transition-colors">
                    Action <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

