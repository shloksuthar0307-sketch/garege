import React from 'react';
import { IndianRupee, MessageSquare, Phone, User, CheckCircle2, XCircle } from 'lucide-react';

export default function ServiceCostAndAdvisor() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
      <div className="xl:col-span-2 bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 hover:border-[#35D07F]/30 transition-colors rounded-2xl p-5">
        <h2 className="text-white text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
          <IndianRupee className="text-[#35D07F]" size={16} /> Service Cost Breakdown
        </h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Parts</span>
              <span>₹4,500</span>
            </div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Labour</span>
              <span>₹1,200</span>
            </div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Taxes</span>
              <span>₹1,026</span>
            </div>
            <div className="flex justify-between text-xs text-[#35D07F]">
              <span>Discount</span>
              <span>-₹500</span>
            </div>
            <div className="border-t border-white/10 pt-2 mt-2 flex justify-between text-sm text-white font-bold">
              <span>Final Amount</span>
              <span>₹6,226</span>
            </div>
          </div>
          
          <div className="flex-1 bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
            <h3 className="text-rose-500 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Additional Work Requires Approval
            </h3>
            <p className="text-white text-xs mb-1">Replace worn serpentine belt.</p>
            <p className="text-slate-400 text-[10px] mb-3">Cost: ₹1,500</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-[#35D07F] text-black text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-[#2bb46c]">
                <CheckCircle2 size={14} /> Approve
              </button>
              <button className="flex-1 bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-white/10">
                <XCircle size={14} /> Decline
              </button>
            </div>
            <button className="w-full mt-2 text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-widest underline text-center block">
              Ask Technician
            </button>
          </div>
        </div>
      </div>

      <div className="xl:col-span-1 bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 hover:border-[#35D07F]/30 transition-colors rounded-2xl p-5">
        <h2 className="text-white text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
          <User className="text-[#35D07F]" size={16} /> Your Service Advisor
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
            <User className="text-slate-400" size={24} />
          </div>
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-widest">Mike Johnson</h3>
            <p className="text-slate-400 text-xs">Senior Service Advisor</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2 flex items-center justify-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest transition-colors">
            <Phone size={14} /> Call
          </button>
          <button className="flex-1 bg-[#35D07F] hover:bg-[#2bb46c] rounded-xl py-2 flex items-center justify-center gap-2 text-black text-[10px] font-bold uppercase tracking-widest transition-colors">
            <MessageSquare size={14} /> Message
          </button>
        </div>
        <button className="w-full mt-2 border border-[#35D07F]/30 text-[#35D07F] hover:bg-[#35D07F]/10 rounded-xl py-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors">
          Request Update
        </button>
      </div>
    </div>
  );
}
