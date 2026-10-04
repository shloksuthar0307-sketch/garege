import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, FileText, ChevronRight, CreditCard, Wrench, Shield, Zap, ChevronDown, MessageSquare, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'start', title: 'Getting Started', description: 'Platform basics and setup', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'billing', title: 'Billing & Payments', description: 'Invoices, cards, and plans', icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'service', title: 'Service & Maintenance', description: 'Repair tracking and history', icon: Wrench, color: 'text-[#35D07F]', bg: 'bg-[#35D07F]/10' },
  { id: 'security', title: 'Security & Access', description: 'Roles and permissions', icon: Shield, color: 'text-purple-400', bg: 'bg-purple-500/10' }
];

const POPULAR_ARTICLES = [
  { id: 1, title: 'How to add a new vehicle to your fleet', category: 'Getting Started', readTime: '3 min read' },
  { id: 2, title: 'Understanding your monthly billing cycle', category: 'Billing & Payments', readTime: '5 min read' },
  { id: 3, title: 'Approving estimates and repair orders', category: 'Service & Maintenance', readTime: '4 min read' },
  { id: 4, title: 'Exporting your complete service history', category: 'Getting Started', readTime: '2 min read' },
  { id: 5, title: 'Managing Team Roster permissions', category: 'Security & Access', readTime: '6 min read' },
];

const FAQS = [
  { 
    id: 1, 
    question: 'How do I reset my password?', 
    answer: 'To reset your password, log out of your current session and click the "Forgot Password" link on the login screen. You will receive an email with a secure reset link.'
  },
  { 
    id: 2, 
    question: 'Can I change my subscription plan mid-cycle?', 
    answer: 'Yes. When you upgrade, the prorated difference will be charged immediately. If you downgrade, the new rate will apply at the start of your next billing cycle.'
  },
  { 
    id: 3, 
    question: 'How long does a standard diagnostic take?', 
    answer: 'Standard digital diagnostics usually take between 1 to 2 hours. Once completed, a detailed estimate will appear in your "Active Repairs" module for approval.'
  },
  { 
    id: 4, 
    question: 'What forms of payment are accepted?', 
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, and direct ACH transfers for Enterprise fleet accounts.'
  }
];

export default function CustomerKnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(1);
  const navigate = useNavigate();

  const handleReadArticle = (title: string) => {
    toast.success(`Opening article: ${title}`, {
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
            <BookOpen className="text-[#35D07F]" size={28} />
            Knowledge Base
          </h1>
          <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">
            Find guides, FAQs, and service manuals to get the most out of your platform.
          </p>
        </motion.div>
      </div>

      {/* Large Hero Search */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-[#111112] to-[#0A0A0B] border border-[var(--border-subtle)] rounded-3xl p-10 mb-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#35D07F] opacity-[0.02] rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none"></div>
        
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-2xl font-bold tracking-widest text-[var(--text-primary)] mb-6 uppercase">How can we help you today?</h2>
          
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[#35D07F] transition-colors" size={24} />
            <input 
              type="text" 
              placeholder="SEARCH FOR ARTICLES, GUIDES, OR KEYWORDS..." 
              className="w-full pl-16 pr-6 py-5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-2xl text-sm text-[var(--text-primary)] placeholder:uppercase placeholder:tracking-widest focus:border-[#35D07F] outline-none transition-all shadow-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[10px] uppercase tracking-widest font-bold">
            <span className="text-[var(--text-muted)]">Popular Searches:</span>
            <button className="px-3 py-1 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-secondary)] rounded-full transition-colors border border-[var(--border-subtle)]">Billing Cycle</button>
            <button className="px-3 py-1 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-secondary)] rounded-full transition-colors border border-[var(--border-subtle)]">Add Vehicle</button>
            <button className="px-3 py-1 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-secondary)] rounded-full transition-colors border border-[var(--border-subtle)]">API Docs</button>
          </div>
        </div>
      </motion.div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {CATEGORIES.map((category, i) => (
          <motion.div 
            key={category.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (i * 0.1) }}
            className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] hover:border-[var(--border-strong)] rounded-2xl p-6 cursor-pointer group transition-all"
            onClick={() => toast(`Browsing category: ${category.title}`, { style: { background: '#1A1A1B', color: '#fff' } })}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-[var(--border-subtle)] ${category.bg} ${category.color} group-hover:scale-110 transition-transform duration-300`}>
              <category.icon size={24} />
            </div>
            <h3 className="text-[var(--text-primary)] font-bold tracking-widest text-sm mb-2 group-hover:text-[#35D07F] transition-colors">{category.title}</h3>
            <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest leading-relaxed mb-6">{category.description}</p>
            
            <div className="flex items-center text-[#35D07F] text-[10px] font-bold uppercase tracking-widest gap-1 group-hover:gap-2 transition-all">
              View Articles <ChevronRight size={14} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Popular Articles */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <FileText className="text-[#35D07F]" size={18} /> Popular Articles
          </h2>
          
          <div className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl overflow-hidden divide-y divide-white/5">
            {POPULAR_ARTICLES.map((article) => (
              <div 
                key={article.id} 
                onClick={() => handleReadArticle(article.title)}
                className="p-5 hover:bg-white/[0.02] cursor-pointer transition-colors group flex items-start justify-between gap-4"
              >
                <div>
                  <h3 className="text-[var(--text-secondary)] font-bold tracking-wider text-sm mb-2 group-hover:text-[var(--text-primary)] transition-colors">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[9px] uppercase tracking-widest font-bold">
                    <span className="text-[#35D07F]">{article.category}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[var(--text-muted)]">{article.readTime}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center text-[var(--text-muted)] group-hover:bg-[#35D07F]/10 group-hover:text-[#35D07F] transition-colors shrink-0">
                  <ExternalLink size={14} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQs */}
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <MessageSquare className="text-blue-400" size={18} /> Frequently Asked Questions
          </h2>
          
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <div 
                key={faq.id}
                className={`bg-[var(--bg-primary)]/80 backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-300 ${
                  activeFaq === faq.id ? 'border-[var(--border-strong)]' : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                }`}
              >
                <button 
                  className="w-full text-left p-6 flex justify-between items-center gap-4 focus:outline-none"
                  onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                >
                  <span className={`font-bold tracking-wider text-sm transition-colors ${activeFaq === faq.id ? 'text-[#35D07F]' : 'text-[var(--text-secondary)]'}`}>
                    {faq.question}
                  </span>
                  <ChevronDown 
                    size={18} 
                    className={`text-[var(--text-muted)] shrink-0 transition-transform duration-300 ${activeFaq === faq.id ? 'rotate-180 text-[#35D07F]' : ''}`}
                  />
                </button>
                
                <AnimatePresence>
                  {activeFaq === faq.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-[var(--text-muted)] text-sm leading-relaxed border-t border-[var(--border-subtle)] mt-2">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-6 border border-[var(--border-subtle)] bg-white/[0.02] rounded-2xl flex items-center justify-between gap-4">
            <div>
              <h4 className="text-[var(--text-primary)] font-bold tracking-widest text-sm mb-1">Still need help?</h4>
              <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest">Our support team is available 24/7.</p>
            </div>
            <button onClick={() => navigate('/customer/support')} className="px-5 py-2.5 bg-[var(--bg-surface-active)] hover:bg-white/20 text-[var(--text-primary)] rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all whitespace-nowrap">
              Contact Support
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}


