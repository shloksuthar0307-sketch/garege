import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Check, Zap, CreditCard, Shield, Star, Crown, ArrowRight, Activity, AlertCircle, X, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PLANS: any[] = [];

export default function CustomerSubscription() {
  const navigate = useNavigate();
  const [activePlanId, setActivePlanId] = useState('pro');
  const [planToChange, setPlanToChange] = useState<typeof PLANS[0] | null>(null);

  const activePlan = PLANS.find(p => p.id === activePlanId) || PLANS[1];

  const handleConfirmChange = () => {
    if (!planToChange) return;
    
    setActivePlanId(planToChange.id);
    setPlanToChange(null);
    
    toast.success(`Successfully switched to ${planToChange.name}!`, {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
  };

  const renderPlanButton = (plan: typeof PLANS[0]) => {
    if (plan.id === activePlanId) {
      return (
        <button disabled className="w-full py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center justify-center gap-2 bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/30 cursor-default">
          Current Active Plan
        </button>
      );
    }

    const currentIndex = PLANS.findIndex(p => p.id === activePlanId);
    const targetIndex = PLANS.findIndex(p => p.id === plan.id);
    const isUpgrade = targetIndex > currentIndex;

    const style = isUpgrade 
      ? "bg-[#35D07F] hover:bg-[#2bb46c] text-black shadow-[0_0_15px_rgba(53,208,127,0.3)] border-transparent"
      : "bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] border-[var(--border-default)]";
    
    const text = isUpgrade ? `Upgrade to ${plan.name.split(' ')[0]}` : `Downgrade to ${plan.name.split(' ')[0]}`;

    return (
      <button 
        onClick={() => setPlanToChange(plan)} 
        className={`w-full py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${style}`}
      >
        {text} {isUpgrade && <ArrowRight size={14} />}
      </button>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <Calendar className="text-[#35D07F]" size={28} />
            Subscription
          </h1>
          <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">
            View your active plans, manage billing cycles, and explore upgrades.
          </p>
        </motion.div>
      </div>

      {/* Current Active Plan Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-[#0A0A0B] to-[#111112] backdrop-blur-md border border-[#35D07F]/30 rounded-2xl p-8 mb-12 shadow-[0_0_30px_rgba(53,208,127,0.05)] relative overflow-hidden transition-all duration-500"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#35D07F] opacity-[0.03] rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-[#35D07F]/20 text-[#35D07F] border border-[#35D07F]/30 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Activity size={12} /> Active Subscription
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-widest text-[var(--text-primary)] mb-2 flex items-center gap-3">
              {activePlan.name} Plan
            </h2>
            <p className="text-[var(--text-muted)] text-sm max-w-md leading-relaxed">
              You are currently utilizing the features of the <strong className="text-[var(--text-primary)]">{activePlan.name}</strong> tier. Your fleet is performing optimally with your current limits.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full lg:w-auto">
            <div>
              <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Calendar size={12} /> Next Billing Date
              </p>
              <p className="text-[var(--text-primary)] font-bold tracking-widest text-lg">Nov 12, 2026</p>
              <p className="text-[#35D07F] text-[10px] uppercase tracking-widest mt-1">{activePlan.price} {activePlan.interval}</p>
            </div>
            <div className="hidden sm:block w-px bg-[var(--bg-surface-active)]"></div>
            <div>
              <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <CreditCard size={12} /> Payment Method
              </p>
              <p className="text-[var(--text-primary)] font-bold tracking-widest text-lg flex items-center gap-2">
                Visa <span className="text-[var(--text-muted)] text-sm">****4242</span>
              </p>
              <button onClick={() => navigate('/customer/payments')} className="text-[#35D07F] hover:text-[var(--text-primary)] transition-colors text-[10px] uppercase tracking-widest mt-1 underline underline-offset-4">
                Update Billing
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pricing / Plan Options */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Crown className="text-amber-400" size={20} />
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--text-primary)]">Available Plans</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => {
            const isCurrent = plan.id === activePlanId;
            const isPopular = plan.id === 'pro';

            return (
              <motion.div 
                key={plan.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (i * 0.1) }}
                className={`bg-[var(--bg-primary)]/80 backdrop-blur-md rounded-2xl p-8 flex flex-col relative transition-all duration-300 group ${
                  isCurrent ? 'border-2 border-[#35D07F]/30 scale-100 md:scale-105 z-10 shadow-[0_0_30px_rgba(53,208,127,0.1)]' : 'border border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                }`}
              >
                {isPopular && !isCurrent && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#35D07F] text-black px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(53,208,127,0.4)]">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-xl font-bold tracking-widest text-[var(--text-primary)] mb-2">{plan.name}</h3>
                  <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest h-10 leading-relaxed">{plan.description}</p>
                </div>

                <div className="mb-8 flex items-end gap-1">
                  <span className="text-4xl font-bold tracking-widest text-[var(--text-primary)]">{plan.price}</span>
                  <span className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest mb-1">{plan.interval}</span>
                </div>

                <div className="flex-1">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className={`shrink-0 mt-0.5 ${isCurrent ? 'text-[#35D07F]' : 'text-[var(--text-muted)]'}`} size={16} />
                        <span className="text-[var(--text-secondary)] text-xs tracking-wider leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {renderPlanButton(plan)}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Cancellation Footer */}
      <div className="mt-12 text-center">
        <button className="text-[var(--text-muted)] hover:text-rose-400 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
          <AlertCircle size={14} /> Cancel My Subscription
        </button>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {planToChange && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm" 
              onClick={() => setPlanToChange(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-[var(--bg-primary)] border border-[var(--border-default)] p-8 rounded-2xl z-10 w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setPlanToChange(null)} className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <X size={20} />
              </button>
              
              <div className="w-12 h-12 rounded-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-primary)] mb-6">
                <Info size={24} />
              </div>

              <h2 className="text-[var(--text-primary)] text-xl font-bold tracking-widest uppercase mb-2">
                Confirm Plan Change
              </h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-8">
                You are about to switch from the <strong className="text-[var(--text-primary)]">{activePlan.name}</strong> to the <strong className="text-[var(--text-primary)]">{planToChange.name}</strong>. 
                Your new billing cycle will be updated to <strong className="text-[var(--text-primary)]">{planToChange.price} {planToChange.interval}</strong>.
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setPlanToChange(null)} 
                  className="flex-1 py-3 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all border border-[var(--border-default)]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmChange} 
                  className="flex-1 py-3 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(53,208,127,0.3)]"
                >
                  Confirm Change
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


