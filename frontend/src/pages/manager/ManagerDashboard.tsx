import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Wrench, Clock, AlertTriangle, CheckCircle, Car, Calendar, DollarSign, Activity, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [kpiRes, alertRes, orderRes] = await Promise.all([
        api.get('/manager/dashboard/kpis/'),
        api.get('/manager/dashboard/alerts/'),
        api.get('/manager/service-orders/')
      ]);
      setKpis(kpiRes.data);
      setAlerts(alertRes.data);
      // Get orders that are actually assigned to a bay and in progress/pending
      const active = orderRes.data.filter((o: any) => o.bay && (o.status === 'IN_PROGRESS' || o.status === 'PENDING'));
      setActiveOrders(active);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-[#35D07F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-wide">Branch Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time operational view of your service center.</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500 font-mono">Last updated: {new Date().toLocaleTimeString()}</span>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="Vehicles in Workshop" value={kpis?.vehiclesInWorkshop || 0} icon={Car} color="text-blue-400" />
        <KPICard title="Today's Appointments" value={kpis?.appointmentsToday || 0} icon={Calendar} color="text-purple-400" />
        <KPICard title="Active Service Orders" value={kpis?.activeOrders || 0} icon={Wrench} color="text-[#35D07F]" />
        <KPICard title="Awaiting Approval" value={kpis?.awaitingApproval || 0} icon={Clock} color="text-orange-400" highlight />
        <KPICard title="Ready for Delivery" value={kpis?.readyForDelivery || 0} icon={CheckCircle} color="text-emerald-400" />
        <KPICard title="Revenue (This Month)" value={`₹${(kpis?.revenue || 0).toLocaleString()}`} icon={DollarSign} color="text-white" />
        <KPICard title="Outstanding Payments" value={`₹${(kpis?.outstanding || 0).toLocaleString()}`} icon={Activity} color="text-red-400" />
      </div>

      {/* Requires Attention */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            Requires Attention
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                key={alert.id} 
                className="bg-[#111112] border border-red-500/20 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded">
                      {alert.priority}
                    </span>
                    <span className="text-sm font-medium text-white">{alert.title}</span>
                  </div>
                  <p className="text-sm text-slate-400">{alert.description}</p>
                </div>
                <button className="whitespace-nowrap px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-colors">
                  {alert.action}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Workshop Floor Preview */}
      <div className="bg-[#111112] border border-white/5 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium text-white">Workshop Floor</h2>
            <div className="flex gap-4 text-xs font-mono">
              <span className="text-slate-400">TOTAL BAYS: 15</span>
              <span className="text-[#35D07F]">OCCUPIED: {activeOrders.length}</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/manager/workshop')}
            className="flex items-center gap-2 text-xs font-bold text-[#35D07F] hover:text-white transition-colors uppercase tracking-widest"
          >
            Manage Bays <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }, (_, i) => {
            const bayName = `BAY ${String(i + 1).padStart(2, '0')}`;
            const order = activeOrders.find((o) => o.bay === bayName);
            
            return (
              <button 
                key={bayName} 
                onClick={() => navigate('/manager/workshop')}
                className={`p-4 rounded-xl border ${order ? 'bg-white/5 border-[#35D07F]/30 hover:border-[#35D07F]' : 'bg-transparent border-white/5 border-dashed hover:border-white/20'} flex flex-col justify-center items-center h-32 transition-all cursor-pointer group`}
              >
                <span className="text-xs font-bold text-slate-500 mb-2 group-hover:text-slate-300 transition-colors">{bayName}</span>
                {order ? (
                  <>
                    <Car size={24} className="text-[#35D07F] mb-1" />
                    <span className="text-[10px] text-white font-medium truncate w-full px-2 text-center">{order.vehicle_details?.registration_number || 'In Progress'}</span>
                  </>
                ) : (
                  <span className="text-[10px] text-slate-600 group-hover:text-slate-400 transition-colors">Available</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color, highlight = false }: any) {
  return (
    <div className={`bg-[#111112] border ${highlight ? 'border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'border-white/5'} rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-all`}>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="text-3xl font-light text-white relative z-10">{value}</div>
      {highlight && <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>}
    </div>
  );
}

