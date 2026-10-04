import React from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export interface DamageMarkerProps {
  id: string;
  position: [number, number, number];
  zone: string;
  damageType: string;
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Critical';
  isSelected: boolean;
  onClick: () => void;
}

export function DamageMarker({ position, zone, damageType, severity, isSelected, onClick }: DamageMarkerProps) {
  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'Critical': return 'bg-rose-500 border-rose-400';
      case 'Severe': return 'bg-orange-500 border-orange-400';
      case 'Moderate': return 'bg-amber-400 border-amber-300';
      case 'Minor': return 'bg-sky-400 border-sky-300';
      default: return 'bg-slate-400 border-slate-300';
    }
  };

  const getTextColor = (sev: string) => {
    switch (sev) {
      case 'Critical': return 'text-rose-400';
      case 'Severe': return 'text-orange-400';
      case 'Moderate': return 'text-amber-400';
      case 'Minor': return 'text-sky-400';
      default: return 'text-[var(--text-muted)]';
    }
  };

  return (
    <Html
      position={new THREE.Vector3(...position)}
      center
      distanceFactor={12}
      zIndexRange={[100, 0]}
    >
      <div 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`cursor-pointer group flex flex-col items-center transition-transform ${isSelected ? 'scale-125' : 'hover:scale-110'}`}
      >
        <div className="relative">
          <div className={`w-4 h-4 rounded-full border-2 shadow-lg ${getSeverityColor(severity)} ${isSelected ? 'animate-pulse' : ''}`} />
          <div className={`absolute inset-0 rounded-full bg-white/20 blur-sm`} />
        </div>
        
        <div className={`mt-2 p-2 bg-[var(--bg-overlay)] backdrop-blur-md rounded-xl border transition-all origin-top whitespace-nowrap shadow-2xl
          ${isSelected ? 'opacity-100 scale-100 border-[var(--border-strong)]' : 'opacity-0 scale-95 border-[var(--border-subtle)] group-hover:opacity-100 group-hover:scale-100'}`}
        >
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">{zone}</span>
            <span className={`text-xs font-bold leading-none ${getTextColor(severity)}`}>{damageType}</span>
          </div>
        </div>
      </div>
    </Html>
  );
}


