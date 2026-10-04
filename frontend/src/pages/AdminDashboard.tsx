import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Car, Wrench, AlertCircle, Calendar, 
  CheckSquare, FileText, Receipt, DollarSign,
  TrendingUp, TrendingDown, ArrowRight, MoreHorizontal, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/admin-dashboard/kpis/');
        setData(response.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-[50vh]"><Loader2 className="animate-spin text-[#35D07F]" size={48} /></div>;
  }

  const kpiPrimary = data?.kpi_primary || {};
  const kpiSecondary = data?.kpi_secondary || {};
  const REPAIR_PIPELINE = data?.repair_pipeline || [];

  const KPI_DATA = [
    { title: 'Total Vehicles', value: kpiPrimary.total_vehicles || 0, trend: '+0%', isUp: true, icon: Car, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Active Services', value: kpiPrimary.active_services || 0, trend: '+0%', isUp: true, icon: Wrench, color: 'text-[#35D07F]', bg: 'bg-[#35D07F]/10' },
    { title: 'Pending Approvals', value: kpiPrimary.pending_approvals || 0, trend: '-0', isUp: false, icon: CheckSquare, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { title: 'Today\'s Bookings', value: kpiPrimary.todays_bookings || 0, trend: '+0', isUp: true, icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val/100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val/1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const SECONDARY_KPI_DATA = [
    { title: 'Active Inspections', value: kpiSecondary.active_inspections || 0, icon: FileText, color: 'text-indigo-400' },
    { title: 'Open Repair Issues', value: kpiSecondary.open_issues || 0, icon: AlertCircle, color: 'text-rose-400' },
    { title: 'Pending Invoices', value: formatCurrency(kpiSecondary.pending_invoices || 0), icon: Receipt, color: 'text-orange-400' },
    { title: 'Monthly Revenue', value: formatCurrency(kpiSecondary.monthly_revenue || 0), icon: DollarSign, color: 'text-emerald-400' },
  ];

  // Map pipeline colors based on index
  const getColumnColor = (idx: number) => {
    const colors = ['bg-blue-400', 'bg-amber-400', 'bg-[#35D07F]', 'bg-purple-400'];
    return colors[idx % colors.length];
  };
  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight">Operations Overview</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Monitor real-time repair status and workshop metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[var(--text-muted)]">LAST UPDATED: JUST NOW</span>
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
              className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 relative overflow-hidden group hover:border-[var(--border-default)] transition-colors"
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
              <h3 className="text-4xl font-light text-[var(--text-primary)] mb-1">{kpi.value}</h3>
              <p className="text-xs font-sans tracking-wider text-[var(--text-muted)] uppercase">{kpi.title}</p>
              
              {/* Subtle decorative gradient */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[var(--bg-surface-hover)] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </motion.div>
          );
        })}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {SECONDARY_KPI_DATA.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-[var(--bg-secondary)]/50 border border-[var(--border-subtle)] rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] flex items-center justify-center">
                <Icon size={18} className={kpi.color} />
              </div>
              <div>
                <p className="text-xl font-light text-[var(--text-primary)]">{kpi.value}</p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{kpi.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Repair Status Kanban */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-light text-[var(--text-primary)]">Live Repair Status</h2>
          <Link to="/admin/repairs" className="text-sm text-[#35D07F] hover:text-[#2EB86F] flex items-center gap-1 transition-colors">
            View All Repairs <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {REPAIR_PIPELINE.map((column: any, idx: number) => (
            <div key={idx} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-4 flex flex-col h-[500px]">
              
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <span className={'w-2 h-2 rounded-full ' + getColumnColor(idx)}></span>
                  <h3 className="text-sm font-medium text-[var(--text-secondary)]">{column.stage}</h3>
                </div>
                <span className="text-xs font-mono bg-[var(--bg-surface-hover)] px-2 py-1 rounded text-[var(--text-muted)]">{column.count}</span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                {column.jobs.map((job: any, jIdx: number) => (
                  <motion.div 
                    key={jIdx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 + jIdx * 0.1 }}
                    className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl p-4 hover:border-[var(--border-strong)] transition-colors cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-mono text-[#35D07F]">{job.id}</span>
                      <button className="text-slate-600 hover:text-[var(--text-primary)] transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                    
                    <h4 className="text-[var(--text-primary)] font-medium text-sm mb-1">{job.vehicle}</h4>
                    <p className="text-xs text-[var(--text-muted)] mb-4">{job.customer}</p>
                    
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider mb-2">
                      <span className={job.priority === 'High' ? 'text-rose-400' : 'text-[var(--text-muted)]'}>
                        {job.priority} Priority
                      </span>
                      <span className="text-[var(--text-muted)]">{job.progress}%</span>
                    </div>
                    
                    {/* Progress bar */}
                    {job.progress > 0 && (
                      <div className="h-1 w-full bg-[var(--bg-surface-hover)] rounded-full overflow-hidden">
                        <div 
                          className={'h-full rounded-full ' + getColumnColor(idx)}
                          style={{ width: job.progress + '%' }}
                        ></div>
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {column.jobs.length === 0 && (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-[var(--border-subtle)] rounded-xl">
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



