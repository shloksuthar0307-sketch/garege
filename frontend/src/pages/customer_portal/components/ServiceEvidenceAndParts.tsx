import React from 'react';
import { Camera, Settings, Maximize2, Video, Package } from 'lucide-react';

export default function ServiceEvidenceAndParts() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
      <div className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] hover:border-[#35D07F]/30 transition-colors rounded-2xl p-5">
        <h2 className="text-[var(--text-primary)] text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
          <Camera className="text-[#35D07F]" size={16} /> Service Evidence
        </h2>
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="bg-[var(--bg-surface-hover)] border border-[var(--border-default)] p-4 rounded-xl flex gap-4">
              <div className="w-24 h-24 bg-[var(--bg-surface-active)] rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                <Camera className="text-[var(--text-muted)]" size={24} />
                <div className="absolute inset-0 bg-[var(--bg-input)] opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Maximize2 className="text-[var(--text-primary)] cursor-pointer hover:text-[#35D07F]" size={16} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-[var(--text-primary)] text-sm font-bold uppercase tracking-widest">Brake Inspection</h3>
                  <span className="text-[#35D07F] text-[10px] font-bold border border-[#35D07F]/30 bg-[#35D07F]/10 px-2 py-0.5 rounded">Inspection</span>
                </div>
                <p className="text-[var(--text-muted)] text-xs mb-2">Brake pads worn down to 3mm. Replacement required.</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-widest">
                  <span>Tech: Alex</span>
                  <span>Today, 10:30 AM</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] hover:border-[#35D07F]/30 transition-colors rounded-2xl p-5">
        <h2 className="text-[var(--text-primary)] text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
          <Settings className="text-[#35D07F]" size={16} /> Removed & Replaced Parts
        </h2>
        <div className="space-y-4">
          <div className="bg-[var(--bg-surface-hover)] border border-[var(--border-default)] p-4 rounded-xl">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-[var(--text-primary)] text-sm font-bold uppercase tracking-widest mb-1">Front Brake Pads</h3>
                <p className="text-[var(--text-muted)] text-xs">Replaced due to severe wear.</p>
              </div>
              <span className="text-amber-500 text-[10px] font-bold border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded">READY FOR COLLECTION</span>
            </div>
            
            <div className="flex gap-4 mb-4">
              <div className="flex-1 bg-[var(--bg-surface-hover)] rounded-lg p-2 text-center border border-rose-500/20">
                <span className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest block mb-1">Old Part</span>
                <Package className="text-rose-400 mx-auto" size={24} />
              </div>
              <div className="flex-1 bg-[var(--bg-surface-hover)] rounded-lg p-2 text-center border border-[#35D07F]/20">
                <span className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest block mb-1">New Part</span>
                <Package className="text-[#35D07F] mx-auto" size={24} />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-primary)] font-bold">Cost: ₹2,400</span>
              <div className="flex gap-2">
                <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] uppercase tracking-widest font-bold text-[10px]">View Evidence</button>
                <button className="text-[#35D07F] uppercase tracking-widest font-bold text-[10px]">Request Old Part</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

