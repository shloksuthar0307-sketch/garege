import React from 'react';
import { motion } from 'framer-motion';
import { 
  Car, Wrench, AlertCircle, Calendar, 
  CheckSquare, FileText, Receipt, DollarSign,
  TrendingUp, TrendingDown, ArrowRight, MoreHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';

const KPI_DATA = [
  { title: 'Total Vehicles', value: '1,248', trend: '+12%', isUp: true, icon: Car, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { title: 'Active Services', value: '24', trend: '+4%', isUp: true, icon: Wrench, color: 'text-[#35D07F]', bg: 'bg-[#35D07F]/10' },
  { title: 'Pending Approvals', value: '7', trend: '-2', isUp: false, icon: CheckSquare, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { title: 'Today\'s Bookings', value: '12', trend: '+3', isUp: true, icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-400/10' },
];

const SECONDARY_KPI_DATA = [
  { title: 'Active Inspections', value: '5', icon: FileText, color: 'text-indigo-400' },
  { title: 'Open Repair Issues', value: '18', icon: AlertCircle, color: 'text-rose-400' },
  { title: 'Pending Invoices', value: '?4.2L', icon: Receipt, color: 'text-orange-400' },
  { title: 'Monthly Revenue', value: '?28.5L', icon: DollarSign, color: 'text-emerald-400' },
];

const REPAIR_PIPELINE = [
  { 
    stage: 'Inspection', 
    count: 3,
    color: 'bg-indigo-500',
    jobs: [
      { id: 'RT-1042', vehicle: 'Porsche 718', customer: 'Shlok M.', priority: 'High', progress: 40 }
    ]
  },
  { 
    stage: 'Estimate Pending', 
    count: 2,
    color: 'bg-amber-500',
    jobs: [
      { id: 'RT-1039', vehicle: 'BMW M4', customer: 'Rahul D.', priority: 'Medium', progress: 0 }
    ]
  },
  { 
    stage: 'Repairing', 
    count: 5,
    color: 'bg-[#35D07F]',
    jobs: [
      { id: 'RT-1024', vehicle: 'Honda City', customer: 'Amit P.', priority: 'High', progress: 70 },
      { id: 'RT-1025', vehicle: 'Audi A6', customer: 'Priya K.', priority: 'Normal', progress: 35 }
    ]
  },
  { 
    stage: 'Quality Check', 
    count: 1,
    color: 'bg-blue-500',
    jobs: [
      { id: 'RT-1018', vehicle: 'Ford Endeavour', customer: 'Vikram S.', priority: 'Normal', progress: 95 }
    ]
  }
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">Operations Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor real-time repair status and workshop metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-500">LAST UPDATED: JUST NOW</span>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPI_DATA.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#111112] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={'w-12 h-12 rounded-xl flex items-center justify-center ' + kpi.bg}>
                  <Icon size={24} className={kpi.color} />
                </div>
                <div className={'flex items-center gap-1 text-xs font-bold ' + (kpi.isUp ? 'text-emerald-400' : 'text-rose-400')}>
                  {kpi.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {kpi.trend}
                </div>
              </div>
              <h3 className="text-4xl font-light text-white mb-1">{kpi.value}</h3>
              <p className="text-xs font-sans tracking-wider text-slate-500 uppercase">{kpi.title}</p>
              
              {/* Subtle decorative gradient */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </motion.div>
          );
        })}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {SECONDARY_KPI_DATA.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-[#111112]/50 border border-white/5 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-black/50 border border-white/5 flex items-center justify-center">
                <Icon size={18} className={kpi.color} />
              </div>
              <div>
                <p className="text-xl font-light text-white">{kpi.value}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{kpi.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Repair Status Kanban */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-light text-white">Live Repair Status</h2>
          <Link to="/admin/repairs" className="text-sm text-[#35D07F] hover:text-[#2EB86F] flex items-center gap-1 transition-colors">
            View All Repairs <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {REPAIR_PIPELINE.map((column, idx) => (
            <div key={idx} className="bg-[#111112] border border-white/5 rounded-2xl p-4 flex flex-col h-[500px]">
              
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <span className={'w-2 h-2 rounded-full ' + column.color}></span>
                  <h3 className="text-sm font-medium text-slate-300">{column.stage}</h3>
                </div>
                <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-slate-400">{column.count}</span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                {column.jobs.map((job, jIdx) => (
                  <motion.div 
                    key={jIdx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 + jIdx * 0.1 }}
                    className="bg-black/40 border border-white/5 rounded-xl p-4 hover:border-white/20 transition-colors cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-mono text-[#35D07F]">{job.id}</span>
                      <button className="text-slate-600 hover:text-white transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                    
                    <h4 className="text-white font-medium text-sm mb-1">{job.vehicle}</h4>
                    <p className="text-xs text-slate-500 mb-4">{job.customer}</p>
                    
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider mb-2">
                      <span className={job.priority === 'High' ? 'text-rose-400' : 'text-slate-400'}>
                        {job.priority} Priority
                      </span>
                      <span className="text-slate-400">{job.progress}%</span>
                    </div>
                    
                    {/* Progress bar */}
                    {job.progress > 0 && (
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={'h-full rounded-full ' + column.color}
                          style={{ width: job.progress + '%' }}
                        ></div>
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {column.jobs.length === 0 && (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl">
                    <span className="text-xs text-slate-600">No jobs in this stage</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

