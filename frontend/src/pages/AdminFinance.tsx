import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, IndianRupee, 
  ArrowUpRight, ArrowDownRight, Users, Car, Download
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const REVENUE_DATA = [
  { name: 'Jan', revenue: 420000, expenses: 280000 },
  { name: 'Feb', revenue: 580000, expenses: 310000 },
  { name: 'Mar', revenue: 850000, expenses: 420000 },
  { name: 'Apr', revenue: 690000, expenses: 380000 },
  { name: 'May', revenue: 1100000, expenses: 490000 },
  { name: 'Jun', revenue: 950000, expenses: 440000 },
  { name: 'Jul', revenue: 1250000, expenses: 510000 },
];

const CATEGORY_DATA = [
  { name: 'Engine Repair', value: 45 },
  { name: 'Suspension', value: 25 },
  { name: 'Body Work', value: 15 },
  { name: 'Electrical', value: 10 },
  { name: 'General', value: 5 },
];

const EFFICIENCY_DATA = [
  { name: 'Rahul S.', eff: 94 },
  { name: 'Vikram S.', eff: 91 },
  { name: 'Karan D.', eff: 89 },
  { name: 'Suresh K.', eff: 88 },
  { name: 'Amit P.', eff: 82 },
];

const PIE_COLORS = ['#35D07F', '#1e8a51', '#4aa4ff', '#8b5cf6', '#f59e0b'];

export default function AdminFinance() {
  const handleExport = () => {
    // Generate CSV data from the constants
    let csvContent = 'FINANCE & ANALYTICS REPORT\n\n--- REVENUE DATA ---\nMonth,Revenue,Expenses\n';
    REVENUE_DATA.forEach(d => {
      csvContent += d.name + ',' + d.revenue + ',' + d.expenses + '\n';
    });
    
    csvContent += '\n--- CATEGORY BREAKDOWN ---\nCategory,Percentage\n';
    CATEGORY_DATA.forEach(c => {
      csvContent += c.name + ',' + c.value + '%\n';
    });

    csvContent += '\n--- EFFICIENCY LEADERBOARD ---\nTechnician,Efficiency\n';
    EFFICIENCY_DATA.forEach(e => {
      csvContent += e.name + ',' + e.eff + '%\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Financial_Report_YTD.csv';
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
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight">Finance & Analytics</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Global business insights, revenue tracking, and operational efficiency.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] hover:border-white/30 text-[var(--text-primary)] px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
        >
          <Download size={16} />
          Export Report
        </button>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Total Revenue (YTD)</span>
            <div className="p-2 bg-[#35D07F]/10 rounded-lg"><IndianRupee size={20} className="text-[#35D07F]" /></div>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-light text-[var(--text-primary)]">?58.4L</h3>
            <span className="flex items-center text-sm text-[#35D07F] font-medium mb-1"><ArrowUpRight size={16} /> 24%</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Net Profit Margin</span>
            <div className="p-2 bg-blue-500/10 rounded-lg"><TrendingUp size={20} className="text-blue-400" /></div>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-light text-[var(--text-primary)]">32.8%</h3>
            <span className="flex items-center text-sm text-blue-400 font-medium mb-1"><ArrowUpRight size={16} /> 4.2%</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Avg Ticket Size</span>
            <div className="p-2 bg-purple-500/10 rounded-lg"><Car size={20} className="text-purple-400" /></div>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-light text-[var(--text-primary)]">?42.5K</h3>
            <span className="flex items-center text-sm text-rose-400 font-medium mb-1"><ArrowDownRight size={16} /> 1.5%</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Active Customers</span>
            <div className="p-2 bg-amber-500/10 rounded-lg"><Users size={20} className="text-amber-400" /></div>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-light text-[var(--text-primary)]">892</h3>
            <span className="flex items-center text-sm text-[#35D07F] font-medium mb-1"><ArrowUpRight size={16} /> 12%</span>
          </div>
        </motion.div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-2xl"
        >
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">Revenue vs Expenses (Trailing 7 Mo)</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#35D07F" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#35D07F" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => '?' + (val/100000) + 'L'} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111112', borderColor: '#ffffff20', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: any) => ['?' + value.toLocaleString('en-IN'), '']}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#35D07F" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-2xl"
        >
          <div className="mb-2">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">Revenue by Category</h3>
          </div>
          <div className="h-[240px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={'cell-' + index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111112', borderColor: '#ffffff20', borderRadius: '8px' }}
                  formatter={(value: any) => [value + '%', 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {CATEGORY_DATA.map((cat, i) => (
              <div key={cat.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }}></div>
                  <span className="text-[var(--text-secondary)]">{cat.name}</span>
                </div>
                <span className="font-mono text-[var(--text-primary)]">{cat.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tech Efficiency */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-2xl"
        >
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">Technician Efficiency Leaderboard</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={EFFICIENCY_DATA} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{fill: '#cbd5e1', fontSize: 12}} tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                  cursor={{fill: '#ffffff05'}}
                  contentStyle={{ backgroundColor: '#111112', borderColor: '#ffffff20', borderRadius: '8px' }}
                  formatter={(value: any) => [value + '%', 'Efficiency']}
                />
                <Bar dataKey="eff" fill="#35D07F" radius={[0, 4, 4, 0]} barSize={24}>
                  {EFFICIENCY_DATA.map((entry, index) => (
                    <Cell key={'cell-' + index} fill={entry.eff > 90 ? '#35D07F' : entry.eff > 85 ? '#fbbf24' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Customers */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-2xl"
        >
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">Top Customers by Revenue</h3>
            <button className="text-xs text-[#35D07F] hover:underline uppercase tracking-widest">View All</button>
          </div>
          
          <div className="space-y-4">
            {[
              { name: 'Vikram Singh', spend: 345000, visits: 8 },
              { name: 'Shlok Mehta', spend: 145000, visits: 3 },
              { name: 'Suresh Raina', spend: 85000, visits: 2 },
              { name: 'Rahul Dravid', spend: 68000, visits: 2 },
              { name: 'Priya Kumar', spend: 18000, visits: 1 },
            ].map((cust, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border-default)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-black border border-[var(--border-default)] flex items-center justify-center font-mono text-xs text-[var(--text-muted)]">
                    #{i + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{cust.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{cust.visits} Lifetime Visits</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-[#35D07F]">?{cust.spend.toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}


