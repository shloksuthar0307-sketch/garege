import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Trash2, Star, CheckCircle2, MapPin, Mail, Edit2, ShieldCheck, ToggleRight, Building } from 'lucide-react';
import toast from 'react-hot-toast';

const SAVED_CARDS: any[] = [];

export default function CustomerPaymentMethods() {
  const [cards, setCards] = useState(SAVED_CARDS);
  const [paperless, setPaperless] = useState(true);

  const handleSetDefault = (id: string) => {
    setCards(cards.map(c => ({ ...c, isDefault: c.id === id })));
    toast.success('Default payment method updated.', {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
  };

  const handleDelete = (id: string) => {
    toast.error('Card removed securely.', {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(244,63,94,0.2)' }
    });
  };

  const handleAddNew = () => {
    toast.success('Secure Add Card portal opened.', {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <CreditCard className="text-[#35D07F]" size={28} />
            Payment Methods
          </h1>
          <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">
            Manage your saved cards, billing addresses, and invoice preferences.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <button onClick={handleAddNew} className="flex items-center gap-2 px-6 py-2.5 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(53,208,127,0.3)]">
            <Plus size={16} /> Add New Card
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Saved Cards */}
        <div className="xl:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <ShieldCheck className="text-[var(--text-muted)]" size={18} /> Secure Wallets
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cards.map((card, i) => (
                <div key={card.id} className="relative group">
                  {/* Card Visual */}
                  <div className={`h-48 rounded-2xl p-6 bg-gradient-to-br ${card.gradient} flex flex-col justify-between shadow-xl relative overflow-hidden transition-transform duration-300 group-hover:-translate-y-1`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                    
                    <div className="flex justify-between items-start z-10">
                      <CreditCard size={28} className={card.iconColor} />
                      {card.isDefault && (
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[var(--text-primary)] text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm border border-[var(--border-strong)]">
                          <CheckCircle2 size={12} /> Default
                        </span>
                      )}
                    </div>

                    <div className="z-10">
                      <p className="text-white/60 text-[10px] uppercase tracking-widest mb-1">{card.type}</p>
                      <p className="text-[var(--text-primary)] font-mono text-xl tracking-widest mb-4">
                        **** **** **** {card.last4}
                      </p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-white/60 text-[8px] uppercase tracking-widest mb-1">Cardholder</p>
                          <p className="text-[var(--text-primary)] text-xs font-bold tracking-widest uppercase">{card.name}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-[8px] uppercase tracking-widest mb-1">Expires</p>
                          <p className="text-[var(--text-primary)] text-xs font-bold tracking-widest">{card.expiry}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center gap-2 mt-4 px-1">
                    {!card.isDefault && (
                      <button onClick={() => handleSetDefault(card.id)} className="flex-1 py-2.5 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] rounded-xl text-[9px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 border border-[var(--border-subtle)]">
                        <Star size={14} /> Set Default
                      </button>
                    )}
                    <button onClick={() => handleDelete(card.id)} className="flex-1 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-[var(--text-primary)] rounded-xl text-[9px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 border border-rose-500/20 hover:border-rose-500">
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Card Placeholder */}
              <div 
                onClick={handleAddNew}
                className="h-48 rounded-2xl border-2 border-dashed border-[var(--border-default)] hover:border-[#35D07F]/50 bg-white/[0.02] hover:bg-[#35D07F]/5 flex flex-col items-center justify-center text-[var(--text-muted)] hover:text-[#35D07F] transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-[var(--bg-surface-hover)] group-hover:bg-[#35D07F]/10 rounded-full flex items-center justify-center mb-4 transition-colors">
                  <Plus size={24} />
                </div>
                <h3 className="font-bold tracking-widest uppercase text-sm">Add New Card</h3>
                <p className="text-[10px] tracking-widest uppercase mt-2 opacity-60">Secure SSL Encrypted</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Billing Info & Preferences */}
        <div className="xl:col-span-1 space-y-6">
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl p-6 relative overflow-hidden h-full">
              
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--text-primary)] flex items-center gap-2">
                  <Building className="text-[#35D07F]" size={18} /> Billing Details
                </h2>
                <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <Edit2 size={16} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <MapPin size={12} /> Primary Billing Address
                  </p>
                  <div className="bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-xl p-4 text-sm text-[var(--text-secondary)] leading-relaxed tracking-wider">
                    <strong className="text-[var(--text-primary)] block mb-1">User Name</strong>
                    Address Line 1<br />
                    Address Line 2<br />
                    City, Zip<br />
                    Country
                  </div>
                </div>

                <div>
                  <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Mail size={12} /> Invoice Email
                  </p>
                  <div className="bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-xl p-4 text-sm text-[var(--text-primary)] font-bold tracking-wider">
                    user@example.com
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--border-subtle)] mt-6">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-[var(--text-primary)] mb-4">Billing Preferences</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-surface-hover)] rounded-xl border border-[var(--border-subtle)] cursor-pointer hover:bg-[var(--bg-surface-active)] transition-colors" onClick={() => setPaperless(!paperless)}>
                    <div>
                      <p className="text-[var(--text-primary)] font-bold tracking-widest text-xs mb-1">Paperless Billing</p>
                      <p className="text-[var(--text-muted)] text-[10px] tracking-widest uppercase">Receive invoices via email only.</p>
                    </div>
                    <div className={paperless ? 'text-[#35D07F]' : 'text-slate-600'}>
                      <ToggleRight size={32} />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}


