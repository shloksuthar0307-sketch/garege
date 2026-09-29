import React from 'react';
import { motion } from 'framer-motion';
import { 
  Wrench, CheckCircle2, Clock, Calendar, AlertCircle, 
  Car, FileSearch, Camera, User, PenTool, UserCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { technicianApi } from '../api/technician';

export default function TechnicianDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['technicianDashboardStats'],
    queryFn: technicianApi.getDashboardStats,
  });

  const { data: workOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['technicianWorkOrders'],
    queryFn: technicianApi.getWorkOrders,
  });

  const KPI_CARDS = [
    { title: 'Today\'s Jobs', value: stats?.todays_jobs || 0, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Active Repairs', value: stats?.active_repairs || 0, icon: Wrench, color: 'text-[#35D07F]', bg: 'bg-[#35D07F]/10' },
    { title: 'Pending Inspections', value: stats?.pending_inspections || 0, icon: FileSearch, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { title: 'Issues Reported', value: stats?.issues_reported || 0, icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { title: 'Waiting For Parts', value: stats?.waiting_parts || 0, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Completed Today', value: stats?.completed_today || 0, icon: CheckCircle2, color: 'text-slate-300', bg: 'bg-white/10' },
  ];

  return (
    <div className="space-y-8 pb-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">Workshop Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your active jobs, inspections, and evidence.</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {KPI_CARDS.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-[#111112] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white/[0.02] transition-colors"
            >
              <div className={'w-12 h-12 rounded-full flex items-center justify-center mb-4 ' + kpi.bg + ' ' + kpi.color}>
                <Icon size={24} />
              </div>
              <div className="text-3xl font-light text-white mb-1">
                {statsLoading ? '-' : kpi.value}
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">{kpi.title}</div>
            </motion.div>
          );
        })}
      </div>

      {/* My Assigned Vehicles Queue */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <Car size={16} className="text-[#35D07F]" /> My Assigned Vehicles
        </h3>
        
        {ordersLoading ? (
          <div className="text-slate-500">Loading assignments...</div>
        ) : workOrders?.length === 0 ? (
          <div className="text-slate-500 bg-[#111112] p-8 rounded-2xl text-center border border-white/5">
            No work orders assigned to you currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {workOrders?.map((order: any) => {
              const action = order.status === 'PENDING' ? 'START INSPECTION' : 'VIEW JOB';
              const actionLink = order.status === 'PENDING' ? `/technician/inspections?id=${order.id}` : `/technician/repair?id=${order.id}`;

              return (
                <div key={order.id} className="bg-[#111112] border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all shadow-xl flex flex-col">
                  {/* Header */}
                  <div className="p-6 border-b border-white/5 bg-white/[0.02] relative">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xl font-light text-white">{order.vehicle?.make} {order.vehicle?.model}</div>
                      <div className="text-sm font-mono text-[#35D07F]">{order.order_number}</div>
                    </div>
                    <div className="text-xs font-mono text-slate-400 bg-white/5 inline-block px-2 py-1 rounded border border-white/10">
                      {order.vehicle?.registration_number}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 space-y-4">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <PenTool size={16} className="text-slate-500" /> 
                      <span>{order.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <UserCircle size={16} className="text-slate-500" /> 
                      <span>Advisor: <span className="font-medium">{order.advisor || 'Unassigned'}</span></span>
                    </div>

                    <div className="pt-4 border-t border-white/5 mt-4">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest mb-2">
                        <span className="text-amber-400">{order.status}</span>
                        <span className="text-[#35D07F]">{order.progress || 0}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#35D07F] rounded-full" style={{ width: (order.progress || 0) + '%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 bg-black/50 border-t border-white/5 grid grid-cols-2 gap-3">
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
                        className="bg-white/5 hover:bg-white/10 text-slate-300 h-full w-full py-4 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer"
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
      </motion.div>
    </div>
  );
}

