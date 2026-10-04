import React from 'react';
import { History, FileText, ChevronRight } from 'lucide-react';

export default function CustomerServiceHistory() {
  const history: any[] = [];

  return (
    <div className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] hover:border-[#35D07F]/30 transition-colors rounded-2xl p-5 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[var(--text-primary)] text-sm font-bold tracking-widest uppercase flex items-center gap-2">
          <History className="text-[#35D07F]" size={16} /> Service History
        </h2>
        <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs uppercase tracking-widest font-bold underline flex items-center gap-1">
          View All <ChevronRight size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {history.length === 0 ? <div className="text-[var(--text-muted)] text-xs font-bold tracking-widest uppercase p-4 text-center">No service history found.</div> : history.map((record, i) => (<div key={i}></div>))}
      </div>
    </div>
  );
}


