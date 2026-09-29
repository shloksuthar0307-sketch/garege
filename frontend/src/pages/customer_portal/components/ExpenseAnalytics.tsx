import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';

const DATA = [];

export default function ExpenseAnalytics({ loading }: { loading: boolean }) {
  const [filter, setFilter] = useState('6 Months');

  if (loading) return <div className="h-[300px] bg-[#0A0A0B]/80 rounded-2xl border border-white/5 animate-pulse"></div>;

  return (
    <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex flex-wrap justify-between items-start mb-8 gap-4">
        <div>
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white mb-1">Spending Overview</h2>
          <p className="text-slate-500 text-[10px] tracking-widest uppercase">Your vehicle service spending.</p>
        </div>
        <div className="flex gap-2 bg-[#111112] p-1 rounded-xl border border-white/5">
          {['6 Months', '12 Months', 'All Time'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                filter === f ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
              tickFormatter={(value) => `₹${value.toLocaleString()}`}
            />
            <RechartsTooltip 
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#111112] border border-[#35D07F]/30 p-3 rounded-xl shadow-xl">
                      <p className="text-white text-xs font-bold tracking-widest uppercase mb-2">{data.month} 2026</p>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-[10px] uppercase tracking-widest">Total: <span className="text-[#35D07F] font-bold">₹{data.total.toLocaleString()}</span></p>
                        <p className="text-slate-400 text-[10px] uppercase tracking-widest">Invoices: <span className="text-white font-bold">{data.invoices}</span></p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="total" 
              fill="#35D07F" 
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

