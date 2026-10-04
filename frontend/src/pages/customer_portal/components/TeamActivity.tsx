import React from 'react';
import { Users, CheckCircle2, Upload, Calendar, Wrench } from 'lucide-react';

const ACTIVITY: any[] = [];

export default function TeamActivity({ loading }: { loading: boolean }) {
  if (loading) return <div className="h-[300px] bg-[var(--bg-primary)]/80 rounded-2xl border border-[var(--border-subtle)] animate-pulse"></div>;

  return (
    <div className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--text-primary)] mb-1">Team Activity</h2>
          <div className="flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase text-[var(--text-muted)]">
            <span>Online: 0</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {ACTIVITY.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-full text-[var(--text-muted)] text-xs font-bold tracking-widest uppercase">
            No recent activity
          </div>
        ) : (
          ACTIVITY.map(act => (
            <div key={act.id} className="flex gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-${act.color}-500/20 bg-${act.color}-500/10 text-${act.color}-400 text-xs font-bold`}>
                {act.avatar}
              </div>
              <div>
                <p className="text-[var(--text-primary)] text-xs font-medium"><span className="font-bold text-[#35D07F]">{act.name}</span> {act.action}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-widest bg-[var(--bg-surface-hover)] px-2 py-0.5 rounded">{act.target}</span>
                  <span className="text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-widest">{act.time}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


