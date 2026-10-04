import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Car, Search, Wrench, Camera, PenTool, UserCircle, AlertCircle } from 'lucide-react';
import { technicianApi } from '../api/technician';

export default function TechnicianWorkList() {
  const location = useLocation();
  
  // Determine title and filter based on path
  let title = 'My Assigned Vehicles';
  let filterStatus = 'ALL';
  
  if (location.pathname.includes('/today')) {
    title = 'Today\'s Jobs';
    filterStatus = 'TODAY';
  } else if (location.pathname.includes('/repairs')) {
    title = 'Active Repairs';
    filterStatus = 'IN_PROGRESS';
  } else if (location.pathname.includes('/completed')) {
    title = 'Completed Jobs';
    filterStatus = 'COMPLETED';
  } else if (location.pathname.includes('/issues')) {
    title = 'Repair Issues';
    filterStatus = 'ISSUES';
  } else if (location.pathname.includes('/assigned')) {
    title = 'Assigned Vehicles';
    filterStatus = 'ALL';
  } else if (location.pathname.includes('/evidence')) {
    title = 'Evidence Required';
    filterStatus = 'EVIDENCE';
  } else if (location.pathname.includes('/progress')) {
    title = 'Repair Progress';
    filterStatus = 'IN_PROGRESS';
  } else if (location.pathname.includes('/parts')) {
    title = 'Parts Management';
    filterStatus = 'PARTS';
  } else if (location.pathname.includes('/completion')) {
    title = 'Quality & Completion';
    filterStatus = 'COMPLETED';
  } else if (location.pathname.includes('/history')) {
    title = 'My Service History';
    filterStatus = 'ALL';
  }

  const { data: workOrders, isLoading, isError } = useQuery({
    queryKey: ['technicianWorkOrders'],
    queryFn: technicianApi.getWorkOrders,
  });

  // Basic client-side filtering based on path
  const filteredOrders = workOrders?.filter((order: any) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'IN_PROGRESS') return order.status === 'IN_PROGRESS';
    if (filterStatus === 'COMPLETED') return order.status === 'COMPLETED';
    if (filterStatus === 'TODAY') return true; 
    if (filterStatus === 'ISSUES') return order.status === 'NEEDS_ATTENTION' || order.status === 'CRITICAL';
    if (filterStatus === 'EVIDENCE') return order.status === 'EVIDENCE_REQUIRED';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-light text-[var(--text-primary)]">{title}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage your service orders</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search by ID or Reg..." 
            className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] focus:border-[#35D07F] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl">
          <div className="w-8 h-8 border-2 border-[#35D07F] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--text-muted)] text-sm uppercase tracking-widest">Loading Assignments...</p>
        </div>
      ) : isError ? (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
           <AlertCircle size={48} className="text-red-500 mb-4" />
           <h3 className="text-[var(--text-primary)] text-lg font-medium mb-2">Connection Error</h3>
           <p className="text-[var(--text-muted)] text-sm max-w-md">Failed to load assignments from the server. Ensure the backend is running.</p>
        </div>
      ) : filteredOrders?.length === 0 ? (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
           <AlertCircle size={48} className="text-slate-600 mb-4" />
           <h3 className="text-lg text-[var(--text-primary)] font-medium mb-2">No Service Orders Found</h3>
           <p className="text-[var(--text-muted)] text-sm">There are no work orders matching this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders?.map((order: any) => {
            const action = order.status === 'PENDING' ? 'START INSPECTION' : 'VIEW JOB';
            const actionLink = order.status === 'PENDING' ? `/technician/inspections?id=${order.id}` : `/technician/repair?id=${order.id}`;

            return (
              <div key={order.id} className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl overflow-hidden hover:border-white/30 transition-all shadow-xl flex flex-col">
                <div className="p-6 border-b border-[var(--border-subtle)] bg-white/[0.02] relative">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xl font-light text-[var(--text-primary)]">{order.vehicle?.make} {order.vehicle?.model}</div>
                    <div className="text-sm font-mono text-[#35D07F]">{order.order_number}</div>
                  </div>
                  <div className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-surface-hover)] inline-block px-2 py-1 rounded border border-[var(--border-default)]">
                    {order.vehicle?.registration_number}
                  </div>
                </div>

                <div className="p-6 flex-1 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <PenTool size={16} className="text-[var(--text-muted)]" /> 
                    <span>{order.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <UserCircle size={16} className="text-[var(--text-muted)]" /> 
                    <span>Advisor: <span className="font-medium">{order.advisor || 'Unassigned'}</span></span>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-subtle)] mt-4">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest mb-2">
                      <span className="text-amber-400">{order.status}</span>
                      <span className="text-[#35D07F]">{order.progress || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-surface-hover)] rounded-full overflow-hidden">
                      <div className="h-full bg-[#35D07F] rounded-full" style={{ width: (order.progress || 0) + '%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[var(--bg-input)] border-t border-[var(--border-subtle)] grid grid-cols-2 gap-3">
                  <div className="col-span-1 h-full w-full">
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      className="hidden" 
                      id={`upload-ev-${order.id}`} 
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          toast.success('Evidence securely uploaded!');
                        }
                      }} 
                    />
                    <label 
                      htmlFor={`upload-ev-${order.id}`} 
                      className="bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-secondary)] h-full w-full py-4 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer"
                    >
                      <Camera size={18} />
                      Upload
                    </label>
                  </div>
                  <Link to={actionLink} className="col-span-1 bg-[#35D07F] hover:bg-[#2EB86F] text-black py-4 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex flex-col items-center justify-center gap-1 text-center">
                    <Wrench size={18} />
                    {action}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


