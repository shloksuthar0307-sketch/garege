import React from 'react';
import { Users, CheckCircle2, Upload, Calendar, Wrench } from 'lucide-react';

const ACTIVITY = [
  { id: 1, name: 'Sarah', action: 'Approved brake repair estimate', target: '2019 Toyota Camry', time: '12 minutes ago', avatar: 'S', color: 'emerald' },
  { id: 2, name: 'Mike', action: 'Uploaded inspection photos', target: '2019 Toyota Camry', time: '2 hours ago', avatar: 'M', color: 'blue' },
  { id: 3, name: 'Alex', action: 'Scheduled next service appointment', target: '2021 Ford F-150', time: '1 day ago', avatar: 'A', color: 'indigo' },
];

export default function TeamActivity({ loading }: { loading: boolean }) {
  if (loading) return <div className="h-[300px] bg-[#0A0A0B]/80 rounded-2xl border border-white/5 animate-pulse"></div>;

  return (
    <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white mb-1">Team Activity</h2>
          <div className="flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase text-slate-500">
            <span>Online:</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Sarah</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Mike</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span> Alex</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {ACTIVITY.map(act => (
          <div key={act.id} className="flex gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-${act.color}-500/20 bg-${act.color}-500/10 text-${act.color}-400 text-xs font-bold`}>
              {act.avatar}
            </div>
            <div>
              <p className="text-white text-xs font-medium"><span className="font-bold text-[#35D07F]">{act.name}</span> {act.action}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">{act.target}</span>
                <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">{act.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

