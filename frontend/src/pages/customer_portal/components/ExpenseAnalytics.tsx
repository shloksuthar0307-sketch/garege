import { useState, useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip as RechartsTooltip, CartesianGrid
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function buildChartData(invoices: any[], months: number) {
  const now = new Date();
  const buckets: Record<string, number> = {};

  // Initialise buckets for each month
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    buckets[key] = 0;
  }

  invoices
    .filter(inv => inv.status === 'PAID')
    .forEach(inv => {
      const d = new Date(inv.created_at || inv.date || 0);
      const key = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
      if (key in buckets) buckets[key] += parseFloat(inv.amount || 0);
    });

  return Object.entries(buckets).map(([month, amount]) => ({ month, amount }));
}

interface Props {
  loading: boolean;
  invoices?: any[];
}

export default function ExpenseAnalytics({ loading, invoices = [] }: Props) {
  const [filter, setFilter] = useState<'6 Months' | '12 Months' | 'All Time'>('6 Months');

  const months = filter === '6 Months' ? 6 : filter === '12 Months' ? 12 : 24;
  const data = useMemo(() => buildChartData(invoices, months), [invoices, months]);

  const totalVisible = data.reduce((s, d) => s + d.amount, 0);
  const hasData = data.some(d => d.amount > 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-[#1A1A1B] border border-[var(--border-default)] px-3 py-2 rounded-xl shadow-xl text-xs">
          <p className="text-[var(--text-muted)] uppercase tracking-widest mb-1">{label}</p>
          <p className="text-[#35D07F] font-bold">₹{payload[0].value.toLocaleString('en-IN')}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="h-[300px] bg-[var(--bg-primary)]/80 rounded-2xl border border-[var(--border-subtle)] animate-pulse" />;

  return (
    <div className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start mb-6 gap-4">
        <div>
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--text-primary)] mb-1">Spending Overview</h2>
          <p className="text-[var(--text-muted)] text-[10px] tracking-widest uppercase flex items-center gap-1">
            <TrendingUp size={11} />
            {filter} • ₹{totalVisible.toLocaleString('en-IN')} paid
          </p>
        </div>
        <div className="flex gap-1 bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-subtle)]">
          {(['6 Months', '12 Months', 'All Time'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all ${filter === f
                  ? 'bg-[var(--bg-surface-active)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Chart or empty state */}
      {hasData ? (
        <div className="flex-1 min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'inherit' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'inherit' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`}
                width={48}
              />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(53,208,127,0.06)' }} />
              <Bar dataKey="amount" fill="#35D07F" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center text-[var(--text-muted)] gap-3">
          <TrendingUp size={32} className="opacity-20" />
          <p className="text-xs font-bold tracking-widest uppercase">No paid invoices in this period</p>
        </div>
      )}
    </div>
  );
}
