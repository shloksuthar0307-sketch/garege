import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { RepairCard } from './RepairCard';
import type { RepairJob } from './RepairCard';

interface RepairColumnProps {
  id: string;
  title: string;
  jobs: RepairJob[];
}

export function RepairColumn({ id, title, jobs }: RepairColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col min-w-[300px] w-[300px] bg-black/20 rounded-2xl border border-[var(--border-subtle)] overflow-hidden shrink-0">
      <div className="p-4 border-b border-[var(--border-subtle)] bg-white/[0.02] flex justify-between items-center shrink-0">
        <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">{title}</h3>
        <span className="bg-[var(--bg-surface-active)] text-[var(--text-primary)] text-[10px] px-2 py-0.5 rounded-full font-mono">{jobs.length}</span>
      </div>
      
      <div 
        ref={setNodeRef}
        className={`flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar transition-colors ${isOver ? 'bg-[var(--bg-surface-hover)]' : ''}`}
      >
        {jobs.map(job => (
          <RepairCard key={job.id} job={job} />
        ))}
        {jobs.length === 0 && (
          <div className="h-24 border-2 border-dashed border-[var(--border-subtle)] rounded-xl flex items-center justify-center text-[10px] text-slate-600 uppercase tracking-widest font-bold">
            Drop Here
          </div>
        )}
      </div>
    </div>
  );
}


