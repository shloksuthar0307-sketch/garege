import React, { useState } from 'react';
import { IndianRupee, MessageSquare, Phone, User, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServiceCostAndAdvisor() {
  const [approvalState, setApprovalState] = useState<'pending' | 'approved' | 'declined'>('pending');

  const handleApprove = () => {
    setApprovalState('approved');
    toast.success("Additional work approved. Estimated cost updated.", {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
  };

  const handleDecline = () => {
    setApprovalState('declined');
    toast("Additional work declined.", { icon: '❌', style: { background: '#1A1A1B', color: '#fff' } });
  };

  const handleAskTechnician = () => {
    toast("Your question has been sent to the technician.", { icon: '💬', style: { background: '#1A1A1B', color: '#fff' } });
  };

  const handleCall = () => {
    toast("Initiating call to Mike Johnson...", { icon: '📞', style: { background: '#1A1A1B', color: '#fff' } });
  };

  const handleMessage = () => {
    toast("Opening message thread with Mike Johnson...", { icon: '✉️', style: { background: '#1A1A1B', color: '#fff' } });
  };

  const handleRequestUpdate = () => {
    toast.success("Update request sent to your service advisor.", {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
      <div className="xl:col-span-2 bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] hover:border-[#35D07F]/30 transition-colors rounded-2xl p-5">
        <h2 className="text-[var(--text-primary)] text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
          <IndianRupee className="text-[#35D07F]" size={16} /> Service Cost Breakdown
        </h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-secondary)]">
              <span>Parts</span>
              <span>₹4,500</span>
            </div>
            <div className="flex justify-between text-xs text-[var(--text-secondary)]">
              <span>Labour</span>
              <span>₹1,200</span>
            </div>
            <div className="flex justify-between text-xs text-[var(--text-secondary)]">
              <span>Taxes</span>
              <span>₹1,026</span>
            </div>
            {approvalState === 'approved' && (
              <div className="flex justify-between text-xs text-[#35D07F]">
                <span>Serpentine Belt</span>
                <span>₹1,500</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-[#35D07F]">
              <span>Discount</span>
              <span>-₹500</span>
            </div>
            <div className="border-t border-[var(--border-default)] pt-2 mt-2 flex justify-between text-sm text-[var(--text-primary)] font-bold">
              <span>Final Amount</span>
              <span>{approvalState === 'approved' ? '₹7,726' : '₹6,226'}</span>
            </div>
          </div>
          
          {approvalState === 'pending' && (
            <div className="flex-1 bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
              <h3 className="text-rose-500 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Additional Work Requires Approval
              </h3>
              <p className="text-[var(--text-primary)] text-xs mb-1">Replace worn serpentine belt.</p>
              <p className="text-[var(--text-muted)] text-[10px] mb-3">Cost: ₹1,500</p>
              <div className="flex gap-2">
                <button onClick={handleApprove} className="flex-1 bg-[#35D07F] text-black text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-[#2bb46c]">
                  <CheckCircle2 size={14} /> Approve
                </button>
                <button onClick={handleDecline} className="flex-1 bg-[var(--bg-surface-hover)] border border-[var(--border-default)] text-[var(--text-primary)] text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-[var(--bg-surface-active)]">
                  <XCircle size={14} /> Decline
                </button>
              </div>
              <button onClick={handleAskTechnician} className="w-full mt-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[10px] font-bold uppercase tracking-widest underline text-center block">
                Ask Technician
              </button>
            </div>
          )}

          {approvalState === 'approved' && (
            <div className="flex-1 bg-[#35D07F]/5 border border-[#35D07F]/20 rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <CheckCircle2 className="text-[#35D07F] mb-2" size={24} />
              <h3 className="text-[#35D07F] text-xs font-bold uppercase tracking-widest mb-1">Work Approved</h3>
              <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest">Serpentine belt replacement added to order.</p>
            </div>
          )}

          {approvalState === 'declined' && (
            <div className="flex-1 bg-slate-500/5 border border-slate-500/20 rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <XCircle className="text-[var(--text-muted)] mb-2" size={24} />
              <h3 className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest mb-1">Work Declined</h3>
              <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest">Serpentine belt replacement skipped.</p>
            </div>
          )}
        </div>
      </div>

      <div className="xl:col-span-1 bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] hover:border-[#35D07F]/30 transition-colors rounded-2xl p-5">
        <h2 className="text-[var(--text-primary)] text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
          <User className="text-[#35D07F]" size={16} /> Your Service Advisor
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-[var(--bg-surface-active)] rounded-full flex items-center justify-center">
            <User className="text-[var(--text-muted)]" size={24} />
          </div>
          <div>
            <h3 className="text-[var(--text-primary)] text-sm font-bold uppercase tracking-widest">Mike Johnson</h3>
            <p className="text-[var(--text-muted)] text-xs">Senior Service Advisor</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCall} className="flex-1 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] border border-[var(--border-default)] rounded-xl py-2 flex items-center justify-center gap-2 text-[var(--text-primary)] text-[10px] font-bold uppercase tracking-widest transition-colors">
            <Phone size={14} /> Call
          </button>
          <button onClick={handleMessage} className="flex-1 bg-[#35D07F] hover:bg-[#2bb46c] rounded-xl py-2 flex items-center justify-center gap-2 text-black text-[10px] font-bold uppercase tracking-widest transition-colors">
            <MessageSquare size={14} /> Message
          </button>
        </div>
        <button onClick={handleRequestUpdate} className="w-full mt-2 border border-[#35D07F]/30 text-[#35D07F] hover:bg-[#35D07F]/10 rounded-xl py-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors">
          Request Update
        </button>
      </div>
    </div>
  );
}

