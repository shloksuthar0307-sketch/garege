import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, Package, Clock, Box, ArrowUpRight, 
  ArrowDownRight, Plus, ExternalLink, Activity
} from 'lucide-react';

const METRICS = [
  { label: 'Total Spent', value: '$4,250.00', change: '+12.5%', trend: 'up', icon: CreditCard, color: 'indigo' },
  { label: 'Active Projects', value: '3', change: 'Stable', trend: 'neutral', icon: Box, color: 'emerald' },
  { label: 'Pending Orders', value: '2', change: '-1', trend: 'down', icon: Package, color: 'amber' },
  { label: 'Items In Progress', value: '7', change: '+2', trend: 'up', icon: Clock, color: 'blue' },
];

const ACTIVITY = [
  { id: 1, action: 'Order #123 shipped', time: '2 hours ago', icon: Package, status: 'success' },
  { id: 2, action: 'Project "Website Redesign" updated', time: '5 hours ago', icon: Box, status: 'info' },
  { id: 3, action: 'New login detected from Windows', time: '1 day ago', icon: Activity, status: 'warning' },
  { id: 4, action: 'Payment completed for Invoice #451', time: '2 days ago', icon: CreditCard, status: 'success' },
];

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate backend fetch
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-1">
            Welcome back, John 👋
          </h1>
          <p className="text-[var(--text-muted)]">
            Here's what's happening with your account today.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-3"
        >
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-[var(--text-primary)] rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Plus size={16} /> Create New Project
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-xl text-sm font-medium transition-all">
            View Pending Orders
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-xl text-sm font-medium transition-all">
            Contact Support
          </button>
        </motion.div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
            className="group p-5 bg-[var(--bg-secondary)]/60 backdrop-blur-md border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-2xl transition-all cursor-pointer relative overflow-hidden"
          >
            {/* Hover Gradient */}
            <div className={`absolute inset-0 bg-${metric.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="flex justify-between">
                  <div className="w-10 h-10 bg-[var(--bg-surface-hover)] rounded-xl"></div>
                  <div className="w-12 h-5 bg-[var(--bg-surface-hover)] rounded-full"></div>
                </div>
                <div className="h-8 bg-[var(--bg-surface-hover)] rounded-md w-1/2 mt-4"></div>
                <div className="h-4 bg-[var(--bg-surface-hover)] rounded-md w-1/3"></div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${metric.color}-500/10 text-${metric.color}-400 border border-${metric.color}-500/20`}>
                    <metric.icon size={20} />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    metric.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' :
                    metric.trend === 'down' ? 'bg-rose-500/10 text-rose-400' :
                    'bg-slate-500/10 text-[var(--text-muted)]'
                  }`}>
                    {metric.trend === 'up' && <ArrowUpRight size={14} />}
                    {metric.trend === 'down' && <ArrowDownRight size={14} />}
                    {metric.change}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-1">{metric.value}</h3>
                  <p className="text-[var(--text-muted)] text-sm">{metric.label}</p>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 p-6 bg-[var(--bg-secondary)]/60 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <button className="text-indigo-400 text-sm hover:text-indigo-300 font-medium flex items-center gap-1">
              View All <ExternalLink size={14} />
            </button>
          </div>

          <div className="space-y-6">
            {loading ? (
              [1,2,3].map(i => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-surface-hover)] shrink-0"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-[var(--bg-surface-hover)] rounded w-3/4"></div>
                    <div className="h-3 bg-[var(--bg-surface-hover)] rounded w-1/4"></div>
                  </div>
                </div>
              ))
            ) : (
              ACTIVITY.map((item, idx) => (
                <div key={item.id} className="flex gap-4 relative group">
                  {idx !== ACTIVITY.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-[var(--bg-surface-hover)] group-hover:bg-indigo-500/20 transition-colors"></div>
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border ${
                    item.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    item.status === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                    'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                  }`}>
                    <item.icon size={18} />
                  </div>
                  <div className="pt-2">
                    <p className="text-[var(--text-secondary)] text-sm font-medium">{item.action}</p>
                    <p className="text-[var(--text-muted)] text-xs mt-1">{item.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Help / Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-gradient-to-br from-indigo-900/40 to-purple-900/20 backdrop-blur-md border border-indigo-500/20 rounded-2xl flex flex-col"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/30">
            <Activity size={24} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Need assistance?</h3>
          <p className="text-[var(--text-secondary)] text-sm mb-6 flex-1">
            Our support team is online and ready to help you with your projects, billing, or any questions you might have.
          </p>
          <button className="w-full py-3 bg-[var(--bg-surface-active)] hover:bg-white/20 border border-[var(--border-strong)] text-[var(--text-primary)] rounded-xl text-sm font-medium transition-all text-center">
            Open Support Chat
          </button>
        </motion.div>
      </div>
    </div>
  );
}


