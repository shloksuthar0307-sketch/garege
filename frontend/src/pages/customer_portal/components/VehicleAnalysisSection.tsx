import React from 'react';
import { Activity, CheckCircle, Wrench, Clock } from 'lucide-react';

export default function VehicleAnalysisSection() {
  return (
    <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 hover:border-[#35D07F]/30 transition-colors rounded-2xl p-5 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white text-sm font-bold tracking-widest uppercase flex items-center gap-2">
          <Activity className="text-[#35D07F]" size={16} /> Car Analysis Overview
        </h2>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block">Vehicle Health</span>
            <span className="text-[#35D07F] font-bold text-lg">82/100</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Engine', status: 'GOOD', color: 'text-[#35D07F]' },
          { label: 'Brakes', status: 'URGENT', color: 'text-rose-500' },
          { label: 'Battery', status: 'GOOD', color: 'text-[#35D07F]' },
          { label: 'Tyres', status: 'ATTENTION NEEDED', color: 'text-amber-500' },
        ].map((item, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-white text-xs font-bold uppercase tracking-widest mb-2">{item.label}</span>
            <span className={`${item.color} text-[10px] font-bold uppercase tracking-widest border border-current px-2 py-0.5 rounded opacity-80`}>{item.status}</span>
          </div>
        ))}
      </div>

      <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">Verified Finding</span>
            <h3 className="text-white text-sm font-bold uppercase tracking-widest">Brake Pads Worn</h3>
          </div>
          <p className="text-slate-400 text-xs">Brake pads are below safe limit (3mm). Immediate replacement recommended.</p>
        </div>
        <div className="flex gap-3 items-center w-full md:w-auto">
          <span className="text-white font-bold whitespace-nowrap">Est: ₹2,400</span>
          <button className="bg-[#35D07F] text-black text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-[#2bb46c] transition-colors w-full md:w-auto">
            Book Service
          </button>
        </div>
      </div>
      
      <p className="text-slate-500 text-[10px] mt-4 uppercase tracking-widest font-bold text-center">
        Note: AI-generated recommendations are for guidance only. Verified findings are confirmed by our mechanics.
      </p>
    </div>
  );
}
