import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { advisorApi } from '../../api/advisor';
import { CheckCircle2, AlertTriangle, ChevronDown } from 'lucide-react';

interface Tech {
  id: string;
  first_name: string;
  last_name: string;
  active_jobs: number;
  workload_percentage: number;
  available: boolean;
}

export function TechnicianSelector({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const { data: technicians = [], isLoading } = useQuery({
    queryKey: ['technicians'],
    queryFn: advisorApi.getTechnicians
  });
  
  const [isOpen, setIsOpen] = useState(false);

  const selectedTech = technicians.find((t: Tech) => t.id === value);

  if (isLoading) return <div className="text-xs text-slate-500 animate-pulse">Loading technicians...</div>;

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white cursor-pointer flex justify-between items-center hover:border-white/20 transition-colors"
      >
        {selectedTech ? (
          <span className="font-medium text-white">{selectedTech.first_name} {selectedTech.last_name}</span>
        ) : (
          <span className="text-slate-400">Auto-assign based on load</span>
        )}
        <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-[#1A1A1B] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          <div 
            onClick={() => { onChange(''); setIsOpen(false); }}
            className={`p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!value ? 'bg-white/5' : ''}`}
          >
            <span className="text-sm font-medium text-white">Auto-assign based on load</span>
          </div>
          {technicians.map((tech: Tech) => {
            const isHeavy = tech.workload_percentage > 75;
            return (
              <div 
                key={tech.id}
                onClick={() => { onChange(tech.id); setIsOpen(false); }}
                className={`p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors flex flex-col gap-1 ${value === tech.id ? 'bg-[#35D07F]/10' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${tech.available ? 'bg-[#35D07F]' : 'bg-orange-500'}`} />
                    <span className="text-sm font-bold text-white">{tech.first_name} {tech.last_name}</span>
                  </div>
                  {value === tech.id && <CheckCircle2 size={16} className="text-[#35D07F]" />}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 pl-4">
                  <span>{tech.active_jobs} active vehicle{tech.active_jobs !== 1 ? 's' : ''}</span>
                  <span className="flex items-center gap-1">
                    {isHeavy && <AlertTriangle size={12} className="text-orange-400" />}
                    Workload: {tech.workload_percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

