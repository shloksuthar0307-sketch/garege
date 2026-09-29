import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Clock, AlertTriangle, IndianRupee } from 'lucide-react';

export interface RepairJob {
  id: string;
  vehicle: string;
  reg: string;
  service: string;
  technician: string;
  labor: string;
  damages: number;
  cost: number;
  status: string;
}

export function RepairCard({ job }: { job: RepairJob }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: job.id,
    data: { job }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-[#1A1A1B] border rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-white/20 transition-colors ${
        isDragging ? 'border-[#35D07F] opacity-90 shadow-2xl scale-105 rotate-2' : 'border-white/5'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-bold text-white">{job.vehicle}</h4>
        <span className="text-[10px] text-slate-500 font-mono bg-black/40 px-2 py-0.5 rounded">{job.reg}</span>
      </div>
      
      <p className="text-xs text-[#35D07F] mb-3 flex items-center gap-1.5 font-medium">
        🔧 {job.service}
      </p>

      <div className="space-y-1.5 mb-4">
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Tech:</span>
          <span className="text-white">{job.technician}</span>
        </div>
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Labor:</span>
          <span className="text-white">{job.labor}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
          {job.damages > 0 && (
            <>
              <AlertTriangle size={12} /> {job.damages} Damages
            </>
          )}
        </div>
        <div className="text-xs font-bold text-white flex items-center gap-0.5">
          <IndianRupee size={12} className="text-slate-500" />
          {job.cost.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

