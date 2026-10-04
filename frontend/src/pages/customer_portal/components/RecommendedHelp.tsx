import React from 'react';
import { BookOpen, FileText, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';

const HELP_ARTICLES: any[] = [];

export default function RecommendedHelp({ loading }: { loading: boolean }) {
  if (loading) return <div className="h-[300px] bg-[var(--bg-primary)]/80 rounded-2xl border border-[var(--border-subtle)] animate-pulse"></div>;

  return (
    <div className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--text-primary)]">Recommended For You</h2>
        <BookOpen size={16} className="text-[var(--text-muted)]" />
      </div>

      <div className="space-y-4 flex-1 flex flex-col justify-center">
        {HELP_ARTICLES.length === 0 ? (
          <div className="text-center text-[var(--text-muted)] text-xs font-bold tracking-widest uppercase">
            No articles recommended.
          </div>
        ) : (
          HELP_ARTICLES.map(article => (
          <div key={article.id} className="p-4 bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] hover:border-[#35D07F]/30 rounded-xl transition-all group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight size={16} className="text-[#35D07F]" />
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[#35D07F]/10 text-[#35D07F] rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#35D07F] group-hover:text-black transition-colors">
                <article.icon size={18} />
              </div>
              <div className="pr-6">
                <p className="text-[#35D07F] text-[9px] font-bold uppercase tracking-[0.2em] mb-1">{article.category}</p>
                <h3 className="text-[var(--text-primary)] text-sm font-bold mb-1 group-hover:text-[#35D07F] transition-colors">{article.title}</h3>
                <p className="text-[var(--text-muted)] text-xs mb-2 line-clamp-1">{article.desc}</p>
                <p className="text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-widest">{article.time}</p>
              </div>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}


