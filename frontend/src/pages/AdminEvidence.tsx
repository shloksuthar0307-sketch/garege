import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Plus, Image as ImageIcon, Video, 
  Download, Share2, Tag, Calendar, ShieldAlert, ShieldCheck, Eye, EyeOff, X, Trash2
} from 'lucide-react';

const INITIAL_EVIDENCE = [
  {
    id: 'EVD-901', url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    type: 'Image', category: 'Pre-Inspection', tags: ['Exterior', 'Scratch'],
    bookingId: 'BK-10042', uploader: 'Rahul Sharma', date: '2026-09-22T09:15:00',
    size: '2.4 MB', visibility: 'Public'
  },
  {
    id: 'EVD-902', url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    type: 'Image', category: 'Issue', tags: ['Engine', 'Oil Leak'],
    bookingId: 'BK-10042', uploader: 'Rahul Sharma', date: '2026-09-22T09:30:00',
    size: '3.1 MB', visibility: 'Internal'
  },
  {
    id: 'EVD-903', url: 'https://images.unsplash.com/photo-1503375894314-760775d78701?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    type: 'Video', category: 'Repair Progress', tags: ['Suspension', 'Noise'],
    bookingId: 'BK-10039', uploader: 'Suresh Kumar', date: '2026-09-21T14:20:00',
    size: '18.5 MB', duration: '0:45', visibility: 'Public'
  },
  {
    id: 'EVD-904', url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    type: 'Image', category: 'Post-Repair', tags: ['Exterior', 'Clean'],
    bookingId: 'BK-10024', uploader: 'Amit Patel', date: '2026-09-20T16:00:00',
    size: '4.2 MB', visibility: 'Public'
  },
  {
    id: 'EVD-905', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    type: 'Image', category: 'Pre-Inspection', tags: ['Interior', 'Dashboard'],
    bookingId: 'BK-10044', uploader: 'Vikram Singh', date: '2026-09-23T08:45:00',
    size: '1.8 MB', visibility: 'Public'
  },
  {
    id: 'EVD-906', url: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    type: 'Image', category: 'Issue', tags: ['Electrical', 'Wiring'],
    bookingId: 'BK-10035', uploader: 'Karan Desai', date: '2026-09-21T11:10:00',
    size: '2.9 MB', visibility: 'Confidential'
  }
];

export default function AdminEvidence() {
  const [evidence, setEvidence] = useState(INITIAL_EVIDENCE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Security Simulator
  const [currentRole, setCurrentRole] = useState('Admin (All Access)');

  const [formData, setFormData] = useState({
    url: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?q=80&w=800&auto=format&fit=crop',
    type: 'Image', category: 'Issue', tags: 'Engine, Broken',
    bookingId: '', visibility: 'Public'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = 'EVD-' + Math.floor(100 + Math.random() * 900);
    setEvidence([{ 
      ...formData, 
      id: newId, 
      tags: formData.tags.split(',').map(t => t.trim()),
      uploader: 'Current User',
      date: new Date().toISOString(),
      size: (Math.random() * 5 + 1).toFixed(1) + ' MB'
    }, ...evidence]);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this evidence record permanently?')) {
      setEvidence(evidence.filter(e => e.id !== id));
    }
  };

  // RBAC Filtering Logic
  const visibleEvidence = evidence.filter(item => {
    if (currentRole === 'Admin (All Access)') return true;
    if (currentRole === 'Technician (Internal)') return item.visibility === 'Public' || item.visibility === 'Internal';
    if (currentRole === 'Customer (External)') return item.visibility === 'Public';
    return false;
  });

  return (
    <div className="space-y-8 relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">Evidence Library</h1>
          <p className="text-sm text-slate-500 mt-1">Global repository of all inspection photos, videos, and repair documentation.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
        >
          <Plus size={16} />
          Upload Media
        </button>
      </div>

      {/* Toolbar & Security Simulator */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#111112] border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Visible Items</span>
            <span className="text-xl text-white font-light">{visibleEvidence.length}</span>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2"></div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck size={12} className="text-[#35D07F]" /> Security Scope
            </span>
            <select 
              value={currentRole} onChange={e => setCurrentRole(e.target.value)}
              className="mt-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-[#35D07F]"
            >
              <option>Admin (All Access)</option>
              <option>Technician (Internal)</option>
              <option>Customer (External)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by ID, tag, or booking..." 
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F] transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 bg-black/50 border border-white/10 hover:border-white/30 text-slate-300 px-4 py-2.5 rounded-xl text-sm transition-colors">
            <Filter size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Content Area - Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {visibleEvidence.map((item, idx) => (
            <motion.div 
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              className="group bg-[#111112] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-colors relative"
            >
              {/* Thumbnail */}
              <div className="relative h-48 w-full bg-black overflow-hidden">
                <img 
                  src={item.url} 
                  alt={item.category} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
                
                {/* Overlays */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-black/70 backdrop-blur-md text-white px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase border border-white/10">
                    {item.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  {/* Visibility Indicator */}
                  {item.visibility === 'Confidential' && (
                    <div title="Confidential" className="bg-rose-500/80 backdrop-blur-md text-white p-1.5 rounded-lg border border-rose-500/20">
                      <ShieldAlert size={14} />
                    </div>
                  )}
                  {item.visibility === 'Internal' && (
                    <div title="Internal Only" className="bg-amber-500/80 backdrop-blur-md text-white p-1.5 rounded-lg border border-amber-500/20">
                      <EyeOff size={14} />
                    </div>
                  )}
                  {item.visibility === 'Public' && (
                    <div title="Public / Customer Visible" className="bg-[#35D07F]/80 backdrop-blur-md text-black p-1.5 rounded-lg border border-[#35D07F]/20">
                      <Eye size={14} />
                    </div>
                  )}

                  <div className="bg-black/70 backdrop-blur-md text-white p-1.5 rounded-lg border border-white/10">
                    {item.type === 'Video' ? <Video size={14} /> : <ImageIcon size={14} />}
                  </div>
                </div>

                {item.type === 'Video' && item.duration && (
                  <div className="absolute bottom-3 right-3">
                    <span className="bg-black/70 backdrop-blur-md text-white px-2 py-1 rounded text-[10px] font-mono border border-white/10">
                      {item.duration}
                    </span>
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                  <div className="flex items-center gap-3">
                    <button className="bg-white text-black p-2 rounded-full hover:scale-110 transition-transform">
                      <Download size={16} />
                    </button>
                    <button className="bg-white text-black p-2 rounded-full hover:scale-110 transition-transform">
                      <Share2 size={16} />
                    </button>
                  </div>
                  {currentRole === 'Admin (All Access)' && (
                    <button onClick={() => handleDelete(item.id)} className="bg-rose-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-1.5">
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Meta Data */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-[#35D07F]">{item.id}</span>
                  <span className="text-[10px] text-slate-500">{item.size}</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-slate-300 mb-3">
                  <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/10">{item.bookingId}</span>
                  <span className="text-slate-500">&bull;</span>
                  <span>{item.uploader}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {item.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-slate-400 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                      <Tag size={8} /> {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <Calendar size={12} />
                    {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                    {item.visibility}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#111112] border border-white/10 rounded-2xl z-[101] shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                <h2 className="text-xl font-light text-white flex items-center gap-2">
                  <ShieldCheck size={20} className="text-[#35D07F]" /> Secure Media Upload
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* URL */}
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Image/Video URL</label>
                    <input 
                      required type="text"
                      value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
                    <select 
                      value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    >
                      <option>Pre-Inspection</option>
                      <option>Issue</option>
                      <option>Repair Progress</option>
                      <option>Post-Repair</option>
                    </select>
                  </div>
                  {/* Booking ID */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Booking ID</label>
                    <input 
                      required type="text" placeholder="e.g. BK-10042"
                      value={formData.bookingId} onChange={e => setFormData({...formData, bookingId: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Tags */}
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tags (comma separated)</label>
                    <input 
                      required type="text" placeholder="Engine, Oil Leak, Broken"
                      value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  
                  {/* Security/Visibility */}
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1">
                      <ShieldAlert size={14} /> Access Control Level
                    </label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <label className={'border rounded-xl p-4 cursor-pointer transition-colors ' + (formData.visibility === 'Public' ? 'bg-[#35D07F]/10 border-[#35D07F]' : 'bg-black/50 border-white/10 hover:border-white/30')}>
                        <input type="radio" name="vis" value="Public" className="hidden" checked={formData.visibility === 'Public'} onChange={() => setFormData({...formData, visibility: 'Public'})} />
                        <Eye size={20} className={formData.visibility === 'Public' ? 'text-[#35D07F]' : 'text-slate-500'} />
                        <div className="font-bold mt-2 text-sm text-white">Public</div>
                        <div className="text-[10px] text-slate-500 mt-1">Visible to customer on portal</div>
                      </label>
                      <label className={'border rounded-xl p-4 cursor-pointer transition-colors ' + (formData.visibility === 'Internal' ? 'bg-amber-500/10 border-amber-500' : 'bg-black/50 border-white/10 hover:border-white/30')}>
                        <input type="radio" name="vis" value="Internal" className="hidden" checked={formData.visibility === 'Internal'} onChange={() => setFormData({...formData, visibility: 'Internal'})} />
                        <EyeOff size={20} className={formData.visibility === 'Internal' ? 'text-amber-500' : 'text-slate-500'} />
                        <div className="font-bold mt-2 text-sm text-white">Internal Only</div>
                        <div className="text-[10px] text-slate-500 mt-1">Techs & Advisors only</div>
                      </label>
                      <label className={'border rounded-xl p-4 cursor-pointer transition-colors ' + (formData.visibility === 'Confidential' ? 'bg-rose-500/10 border-rose-500' : 'bg-black/50 border-white/10 hover:border-white/30')}>
                        <input type="radio" name="vis" value="Confidential" className="hidden" checked={formData.visibility === 'Confidential'} onChange={() => setFormData({...formData, visibility: 'Confidential'})} />
                        <ShieldAlert size={20} className={formData.visibility === 'Confidential' ? 'text-rose-500' : 'text-slate-500'} />
                        <div className="font-bold mt-2 text-sm text-white">Confidential</div>
                        <div className="text-[10px] text-slate-500 mt-1">Admins / Managers only</div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#35D07F] text-black hover:bg-[#2EB86F] transition-colors uppercase tracking-widest">
                    Upload & Secure
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

