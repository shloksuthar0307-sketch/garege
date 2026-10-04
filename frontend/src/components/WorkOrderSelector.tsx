import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Car, ChevronRight, AlertCircle, Wrench, FileSearch } from 'lucide-react';
import { technicianApi } from '../api/technician';

export function WorkOrderSelector({ type }: { type: 'repair' | 'inspection' }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  const { data: workOrders, isLoading } = useQuery({
    queryKey: ['technicianWorkOrders'],
    queryFn: technicianApi.getWorkOrders,
  });
  
  const filteredOrders = workOrders?.filter((order: any) => 
    order.order_number?.toLowerCase().includes(search.toLowerCase()) || 
    order.vehicle?.registration_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center mb-6">
          {type === 'repair' ? <Wrench size={40} className="text-[#35D07F]" /> : <FileSearch size={40} className="text-amber-400" />}
        </div>
        <h1 className="text-2xl font-light text-[var(--text-primary)] mb-2">Select a Service Order</h1>
        <p className="text-[var(--text-muted)] text-sm max-w-md mx-auto mb-8">
          Please select an active service order from your queue to begin the {type} workflow.
        </p>
        
        <div className="w-full relative max-w-md mx-auto">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search by ID or Registration..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl pl-12 pr-4 py-4 text-sm text-[var(--text-primary)] focus:border-[#35D07F] focus:outline-none transition-colors"
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-[var(--text-muted)] text-center py-8">Loading your assignments...</div>
      ) : filteredOrders?.length === 0 ? (
        <div className="text-center py-8">
           <AlertCircle size={32} className="text-slate-600 mx-auto mb-3" />
           <p className="text-[var(--text-muted)] text-sm">No service orders found.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredOrders?.map((order: any) => (
            <div 
              key={order.id} 
              onClick={() => navigate(`/technician/${type === 'repair' ? 'repair' : 'inspections'}?id=${order.id}`)}
              className="bg-[var(--bg-secondary)] hover:bg-white/[0.02] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] flex items-center justify-center">
                  <Car size={20} className="text-[var(--text-muted)]" />
                </div>
                <div>
                  <h4 className="text-[var(--text-primary)] font-medium">{order.vehicle?.make} {order.vehicle?.model}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-[#35D07F]">{order.order_number}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">&bull;</span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">{order.vehicle?.registration_number}</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-600 group-hover:text-[var(--text-primary)] transition-colors" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


