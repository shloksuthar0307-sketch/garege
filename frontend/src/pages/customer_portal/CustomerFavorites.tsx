import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Search, Filter, Clock, FileSignature, ArrowRight, Settings, Trash2, Heart, Car, CalendarClock, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DRAFTS: any[] = [];

const FAVORITES: any[] = [];

export default function CustomerFavorites() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Filter state
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterType, setFilterType] = useState('All'); // 'All', 'Drafts', 'Favorites'
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredDrafts = DRAFTS.filter(draft => 
    (filterType === 'All' || filterType === 'Drafts') &&
    `${draft.title} ${draft.vehicle} ${draft.type}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFavorites = FAVORITES.filter(fav => 
    (filterType === 'All' || filterType === 'Favorites') &&
    `${fav.title} ${fav.description}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <Bookmark className="text-[#35D07F]" size={28} />
            Favorites & Drafts
          </h1>
          <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">
            Resume saved configurations and quickly book your favorite services.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH SAVED ITEMS..." 
              className="pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] uppercase tracking-widest focus:border-[#35D07F] outline-none transition-all w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative" ref={filterMenuRef}>
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center justify-center p-2.5 border rounded-xl transition-all ${
                showFilterMenu || filterType !== 'All' 
                  ? 'bg-[var(--bg-surface-active)] border-white/30 text-[var(--text-primary)]' 
                  : 'bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Filter size={18} />
              {filterType !== 'All' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#35D07F]"></span>
              )}
            </button>

            <AnimatePresence>
              {showFilterMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-3 w-56 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl shadow-2xl p-5 z-20"
                >
                  <h3 className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-4 flex items-center justify-between">
                    Filter by Type
                    {filterType !== 'All' && (
                      <span onClick={() => setFilterType('All')} className="text-[#35D07F] cursor-pointer hover:underline">Reset</span>
                    )}
                  </h3>
                  <div className="space-y-3">
                    {['All', 'Drafts', 'Favorites'].map(type => (
                      <label key={type} className="flex items-center gap-3 cursor-pointer group" onClick={() => setFilterType(type)}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          filterType === type ? 'border-[#35D07F] bg-[#35D07F]' : 'border-[var(--border-strong)] group-hover:border-[#35D07F]/50'
                        }`}>
                          {filterType === type && <Check size={12} className="text-black" />}
                        </div>
                        <span className={`text-xs tracking-wider transition-colors ${filterType === type ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'}`}>
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {(filteredDrafts.length === 0 && filteredFavorites.length === 0) ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[var(--bg-surface-hover)] rounded-full flex items-center justify-center text-[var(--text-muted)] mb-4">
            <Bookmark size={24} />
          </div>
          <h3 className="text-[var(--text-primary)] font-bold tracking-widest uppercase mb-2">No Items Found</h3>
          <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">We couldn't find any items matching your search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* DRAFTS SECTION */}
          {filteredDrafts.length > 0 && (
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--text-primary)] mb-6 flex items-center gap-2">
                  <FileSignature className="text-[var(--text-muted)]" size={18} /> Recent Drafts
                </h2>
                
                <div className="space-y-4">
                  {filteredDrafts.map((draft) => (
                    <div key={draft.id} className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-2xl p-6 transition-all group relative overflow-hidden">
                      {draft.status === 'Action Required' && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
                      )}
                      
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest mb-3 inline-block ${
                            draft.status === 'Action Required' ? 'bg-amber-500/10 text-amber-400' : 'bg-[var(--bg-surface-active)] text-[var(--text-secondary)]'
                          }`}>
                            {draft.type}
                          </span>
                          <h3 className="text-lg font-bold tracking-widest text-[var(--text-primary)] mb-1 group-hover:text-[#35D07F] transition-colors">{draft.title}</h3>
                          <p className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase">{draft.vehicle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-6">
                        <Clock size={12} /> Last edited {draft.lastEdited}
                      </div>

                      <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/customer/support')} className="flex-1 py-2.5 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 border border-[var(--border-default)]">
                          Resume <ArrowRight size={14} />
                        </button>
                        <button className="p-2.5 bg-[var(--bg-surface-hover)] hover:bg-rose-500/10 hover:text-rose-400 text-[var(--text-muted)] rounded-xl transition-all border border-[var(--border-default)]">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* FAVORITES SECTION */}
          {filteredFavorites.length > 0 && (
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--text-primary)] mb-6 flex items-center gap-2">
                  <Heart className="text-rose-500" size={18} /> Favorite Services
                </h2>
                
                <div className="space-y-4">
                  {filteredFavorites.map((fav) => (
                    <div key={fav.id} className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-2xl p-6 transition-all group relative overflow-hidden">
                      
                      <div className="flex gap-5">
                        <div className="w-14 h-14 bg-[var(--bg-surface-hover)] rounded-2xl flex items-center justify-center text-[#35D07F] border border-[var(--border-default)] shrink-0 group-hover:bg-[#35D07F] group-hover:text-black transition-colors">
                          <fav.icon size={24} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-md font-bold tracking-widest text-[var(--text-primary)]">{fav.title}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-[var(--text-primary)] font-bold tracking-widest bg-[var(--bg-surface-hover)] px-3 py-1 rounded-lg border border-[var(--border-default)]">{fav.price}</span>
                            </div>
                          </div>
                          
                          <p className="text-[var(--text-muted)] text-xs leading-relaxed mb-4">{fav.description}</p>
                          
                          <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/customer/support')} className="flex-1 py-2.5 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(53,208,127,0.2)] flex items-center justify-center gap-2">
                              <CalendarClock size={14} /> Quick Book
                            </button>
                            <button className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-[var(--text-primary)] rounded-xl transition-all border border-rose-500/20">
                              <Heart size={16} fill="currentColor" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}



