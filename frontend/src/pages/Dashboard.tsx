import { AnimatedCard, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Activity, CarFront, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer } from '../animations/variants';

const metrics = [
  { title: 'Vehicles Today', value: '24', icon: CarFront, trend: '+12%', trendUp: true },
  { title: 'Active Repairs', value: '18', icon: Activity, trend: '+4%', trendUp: true },
  { title: 'Pending Approvals', value: '5', icon: AlertTriangle, trend: '-2%', trendUp: false },
  { title: 'Completed', value: '12', icon: CheckCircle2, trend: '+18%', trendUp: true },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-navy-900)]">Good morning, Workshop Team</h1>
          <p className="text-slate-500 mt-1">Here is the overview of today's service operations.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {metrics.map((metric, i) => (
          <AnimatedCard key={i} custom={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{metric.title}</CardTitle>
                <metric.icon className="h-5 w-5 text-slate-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-[var(--color-navy-950)]">{metric.value}</div>
                <span className={`text-xs font-medium ${metric.trendUp ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {metric.trend}
                </span>
              </div>
            </CardContent>
          </AnimatedCard>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Placeholder (Vengeance Style) */}
        <AnimatedCard className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Revenue & Volume Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center border-t border-[var(--color-border)] bg-slate-50/50 min-h-[300px]">
            <div className="text-center text-slate-400">
              <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Revenue Chart (Recharts) will load here</p>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Timeline Placeholder (AnimasterLib Style) */}
        <AnimatedCard className="flex flex-col">
          <CardHeader>
            <CardTitle>Recent Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 border-t border-[var(--color-border)] pt-6 space-y-6">
            {[
              { time: '09:42 AM', action: 'Inspection Started', vehicle: 'BMW 3 Series' },
              { time: '10:15 AM', action: 'Evidence Uploaded', vehicle: 'Audi A4' },
              { time: '11:02 AM', action: 'Customer Approved', vehicle: 'Tesla Model 3' },
            ].map((event, i) => (
              <div key={i} className="flex gap-4 relative">
                {i !== 2 && <div className="absolute left-2 top-8 bottom-[-24px] w-px bg-slate-200"></div>}
                <div className="w-4 h-4 rounded-full bg-[var(--color-electric-blue)] mt-1 border-4 border-white flex-shrink-0 relative z-10 shadow-sm" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-navy-900)]">{event.action}</p>
                  <p className="text-xs text-slate-500">{event.vehicle} • {event.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </AnimatedCard>
      </div>
    </div>
  );
}

