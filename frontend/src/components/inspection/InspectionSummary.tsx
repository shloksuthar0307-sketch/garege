import React from 'react';
import type { DamageData } from './DamagePanel';

export function InspectionSummary({ damages }: { damages: DamageData[] }) {
  const severities = {
    Critical: damages.filter(d => d.severity === 'Critical').length,
    Severe: damages.filter(d => d.severity === 'Severe').length,
    Moderate: damages.filter(d => d.severity === 'Moderate').length,
    Minor: damages.filter(d => d.severity === 'Minor').length,
  };

  const totalCost = damages.reduce((acc, curr) => acc + (parseFloat(curr.estimated_cost) || 0), 0);
  const totalHours = damages.reduce((acc, curr) => acc + (parseFloat(curr.estimated_hours) || 0), 0);

  return (
    <div className="absolute top-4 left-4 w-64 bg-[var(--bg-secondary)]/90 backdrop-blur-xl border border-[var(--border-default)] rounded-2xl p-5 shadow-2xl z-40 pointer-events-none">
      <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4">Inspection Summary</h3>
      
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Total Damage</p>
          <p className="text-3xl font-light text-[var(--text-primary)]">{damages.length}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Total Est.</p>
          <p className="text-sm font-medium text-[#35D07F]">₹{totalCost.toLocaleString()}</p>
          <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">{totalHours.toFixed(1)} hrs labor</p>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(severities).map(([severity, count]) => {
          if (count === 0) return null;
          let color = 'bg-slate-500';
          let text = 'text-[var(--text-muted)]';
          if (severity === 'Critical') { color = 'bg-rose-500'; text = 'text-rose-400'; }
          if (severity === 'Severe') { color = 'bg-orange-500'; text = 'text-orange-400'; }
          if (severity === 'Moderate') { color = 'bg-amber-400'; text = 'text-amber-400'; }
          if (severity === 'Minor') { color = 'bg-sky-400'; text = 'text-sky-400'; }

          return (
            <div key={severity} className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-[var(--text-secondary)]">{severity}</span>
              </div>
              <span className={`font-bold ${text}`}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


