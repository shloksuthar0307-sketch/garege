import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/admin';
import {
  Car, Clock, Wrench, AlertTriangle,
  Calendar, Download, Activity, Target, Loader2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell
} from 'recharts';

const ISSUE_RADAR_DATA = [
  { subject: 'Engine', A: 120, fullMark: 150 },
  { subject: 'Brakes', A: 98, fullMark: 150 },
  { subject: 'Suspension', A: 86, fullMark: 150 },
  { subject: 'Electrical', A: 99, fullMark: 150 },
  { subject: 'Bodywork', A: 85, fullMark: 150 },
  { subject: 'AC/HVAC', A: 65, fullMark: 150 },
];

const VEHICLE_MAKES = [
  { name: 'Vehicle', value: 30 },
  { name: 'BMW', value: 25 },
  { name: 'Audi', value: 20 },
  { name: 'Mercedes', value: 15 },
  { name: 'Others', value: 10 },
];
const PIE_COLORS = ['#35D07F', '#1e8a51', '#4aa4ff', '#8b5cf6', '#475569'];

export default function AdminAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: adminApi.getAnalyticsDashboard,
  });

  const VOLUME_DATA = analytics?.volume_data || [];
  const TAT_DATA = analytics?.tat_data || [];

  const handleExport = () => {
    let csvContent = 'OPERATIONAL ANALYTICS REPORT\n\n--- SERVICE VOLUME (By Day) ---\nDay,Vehicles\n';
    VOLUME_DATA.forEach((d: any) => {
      csvContent += d.name + ',' + d.vehicles + '\n';
    });

    csvContent += '\n--- TURNAROUND TIME (By Week) ---\nWeek,Avg Hours\n';
    TAT_DATA.forEach((t: any) => {
      csvContent += t.name + ',' + t.avgHours + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Operations_Report_30Days.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight">Operational Analytics</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Deep dive into workshop throughput, turnaround times, and service trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] px-4 py-2.5 rounded-xl text-sm text-[var(--text-secondary)]">
            <Calendar size={16} /> Last 30 Days
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Vehicles Serviced</span>
            <div className="p-2 bg-[#35D07F]/10 rounded-lg"><Car size={20} className="text-[#35D07F]" /></div>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-light text-[var(--text-primary)]">
              {isLoading ? <Loader2 size={24} className="animate-spin text-[var(--text-muted)]" /> : analytics?.vehicles_serviced}
            </h3>
            <span className="flex items-center text-sm text-[#35D07F] font-medium mb-1">+14%</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Avg Turnaround</span>
            <div className="p-2 bg-blue-500/10 rounded-lg"><Clock size={20} className="text-blue-400" /></div>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-light text-[var(--text-primary)]">
              {isLoading ? <Loader2 size={24} className="animate-spin text-[var(--text-muted)]" /> : analytics?.avg_turnaround}<span className="text-lg text-[var(--text-muted)]">h</span>
            </h3>
            <span className="flex items-center text-sm text-[#35D07F] font-medium mb-1">-2.1h</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Issues Logged</span>
            <div className="p-2 bg-rose-500/10 rounded-lg"><AlertTriangle size={20} className="text-rose-400" /></div>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-light text-[var(--text-primary)]">
              {isLoading ? <Loader2 size={24} className="animate-spin text-[var(--text-muted)]" /> : analytics?.issues_logged}
            </h3>
            <span className="flex items-center text-sm text-rose-400 font-medium mb-1">+5%</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Bay Utilization</span>
            <div className="p-2 bg-purple-500/10 rounded-lg"><Target size={20} className="text-purple-400" /></div>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-light text-[var(--text-primary)]">
              {isLoading ? <Loader2 size={24} className="animate-spin text-[var(--text-muted)]" /> : analytics?.bay_utilization}%
            </h3>
            <span className="flex items-center text-sm text-[#35D07F] font-medium mb-1">+2%</span>
          </div>
        </motion.div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Weekly Volume */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-2xl"
        >
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">Daily Intake Volume</h3>
            <Activity size={16} className="text-[var(--text-muted)]" />
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VOLUME_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#111112', borderColor: '#ffffff20', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: any) => [value, 'Vehicles']}
                />
                <Bar dataKey="vehicles" fill="#35D07F" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Issue Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-2xl"
        >
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">Issue Frequency Matrix</h3>
            <Wrench size={16} className="text-[var(--text-muted)]" />
          </div>
          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={ISSUE_RADAR_DATA}>
                <PolarGrid stroke="#ffffff20" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Issues" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111112', borderColor: '#ffffff20', borderRadius: '8px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Turnaround Time Trends */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-2xl"
        >
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">Avg Turnaround Time (Weekly)</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TAT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111112', borderColor: '#ffffff20', borderRadius: '8px' }}
                  formatter={(value: any) => [value + ' Hours', 'TAT']}
                />
                <Line type="monotone" dataKey="avgHours" stroke="#f59e0b" strokeWidth={3} dot={{ r: 6, fill: '#111112', strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Vehicle Makes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6"
        >
          <div className="flex-1 w-full">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">Popular Vehicle Brands</h3>
            </div>
            <div className="space-y-4">
              {VEHICLE_MAKES.map((make, i) => (
                <div key={make.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i] }}></div>
                    <span className="text-[var(--text-secondary)]">{make.name}</span>
                  </div>
                  <span className="font-mono text-[var(--text-primary)]">{make.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={VEHICLE_MAKES}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {VEHICLE_MAKES.map((_, index) => (
                    <Cell key={'cell-' + index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111112', borderColor: '#ffffff20', borderRadius: '8px' }}
                  formatter={(value: any) => [value + '%', 'Market Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
}


