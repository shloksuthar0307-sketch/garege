import React from 'react';
import { History, FileText, ChevronRight } from 'lucide-react';

export default function CustomerServiceHistory() {
  const history = [
    { id: 'SO-1029', date: 'Oct 12, 2025', service: 'Full Synthetic Oil Change', vehicle: '2019 Toyota Camry', cost: '₹3,500' },
    { id: 'SO-0842', date: 'Aug 05, 2025', service: 'Brake Pad Replacement', vehicle: '2019 Toyota Camry', cost: '₹8,200' },
  ];

  return (
    <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 hover:border-[#35D07F]/30 transition-colors rounded-2xl p-5 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-sm font-bold tracking-widest uppercase flex items-center gap-2">
          <History className="text-[#35D07F]" size={16} /> Service History
        </h2>
        <button className="text-slate-400 hover:text-white text-xs uppercase tracking-widest font-bold underline flex items-center gap-1">
          View All <ChevronRight size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {history.map((record, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white text-sm font-bold uppercase tracking-widest">{record.service}</span>
                <span className="bg-white/10 text-slate-300 text-[10px] px-2 py-0.5 rounded font-bold">{record.id}</span>
              </div>
              <p className="text-slate-400 text-xs">{record.date} • {record.vehicle}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white font-bold">{record.cost}</span>
              <div className="flex gap-2">
                <button className="bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded hover:bg-white/10">
                  Details
                </button>
                <button className="bg-white/5 border border-white/10 text-[#35D07F] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded hover:bg-white/10 flex items-center gap-1">
                  <FileText size={12} /> Invoice
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
