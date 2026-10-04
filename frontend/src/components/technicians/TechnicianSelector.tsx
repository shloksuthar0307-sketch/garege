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

  if (isLoading) return <div className="text-xs text-[var(--text-muted)] animate-pulse">Loading technicians...</div>;

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] cursor-pointer flex justify-between items-center hover:border-[var(--border-strong)] transition-colors"
      >
        {selectedTech ? (
          <span className="font-medium text-[var(--text-primary)]">{selectedTech.first_name} {selectedTech.last_name}</span>
        ) : (
          <span className="text-[var(--text-muted)]">Auto-assign based on load</span>
        )}
        <ChevronDown size={16} className={`text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-[#1A1A1B] border border-[var(--border-default)] rounded-xl shadow-2xl overflow-hidden z-50">
          <div 
            onClick={() => { onChange(''); setIsOpen(false); }}
            className={`p-3 border-b border-[var(--border-subtle)] cursor-pointer hover:bg-[var(--bg-surface-hover)] transition-colors ${!value ? 'bg-[var(--bg-surface-hover)]' : ''}`}
          >
            <span className="text-sm font-medium text-[var(--text-primary)]">Auto-assign based on load</span>
          </div>
          {technicians.map((tech: Tech) => {
            const isHeavy = tech.workload_percentage > 75;
            return (
              <div 
                key={tech.id}
                onClick={() => { onChange(tech.id); setIsOpen(false); }}
                className={`p-3 border-b border-[var(--border-subtle)] cursor-pointer hover:bg-[var(--bg-surface-hover)] transition-colors flex flex-col gap-1 ${value === tech.id ? 'bg-[#35D07F]/10' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${tech.available ? 'bg-[#35D07F]' : 'bg-orange-500'}`} />
                    <span className="text-sm font-bold text-[var(--text-primary)]">{tech.first_name} {tech.last_name}</span>
                  </div>
                  {value === tech.id && <CheckCircle2 size={16} className="text-[#35D07F]" />}
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] pl-4">
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


