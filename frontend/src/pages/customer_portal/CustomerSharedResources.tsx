import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Search, Filter, Upload, FileText, Shield, BookOpen, Download, MoreVertical, Folder, Clock, User, X, ChevronRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const FOLDERS = [
  { id: 1, name: 'Insurance & Compliance', category: 'Insurance', files: 12, icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { id: 2, name: 'Company Policies', category: 'Policies', files: 5, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { id: 3, name: 'Service Manuals', category: 'Manuals', files: 24, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { id: 4, name: 'Fuel Card Details', category: 'Financial', files: 3, icon: Box, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' }
];

const RECENT_FILES: any[] = [];

export default function CustomerSharedResources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Filter state
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
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

  const filteredFolders = FOLDERS.filter(folder => {
    const matchesSearch = folder.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || folder.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredFiles = RECENT_FILES.filter(file => {
    const matchesSearch = `${file.name} ${file.category} ${file.uploader}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || file.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUploadSubmit = () => {
    toast.success('File uploaded successfully!', {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
    setShowUploadModal(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <Box className="text-[#35D07F]" size={28} />
            Shared Resources
          </h1>
          <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">
            Access shared fleet documents, policies, and organization assets.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH ASSETS..." 
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
                showFilterMenu || filterCategory !== 'All' 
                  ? 'bg-[var(--bg-surface-active)] border-white/30 text-[var(--text-primary)]' 
                  : 'bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Filter size={18} />
              {filterCategory !== 'All' && (
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
                    Filter by Category
                    {filterCategory !== 'All' && (
                      <span onClick={() => setFilterCategory('All')} className="text-[#35D07F] cursor-pointer hover:underline">Reset</span>
                    )}
                  </h3>
                  <div className="space-y-3">
                    {['All', 'Policies', 'Manuals', 'Insurance'].map(cat => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer group" onClick={() => setFilterCategory(cat)}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          filterCategory === cat ? 'border-[#35D07F] bg-[#35D07F]' : 'border-[var(--border-strong)] group-hover:border-[#35D07F]/50'
                        }`}>
                          {filterCategory === cat && <Check size={12} className="text-black" />}
                        </div>
                        <span className={`text-xs tracking-wider transition-colors ${filterCategory === cat ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'}`}>
                          {cat}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(53,208,127,0.3)]"
          >
            <Upload size={16} /> Upload File
          </button>
        </motion.div>
      </div>

      {/* Folders Grid */}
      <div className="mb-8">
        <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <Folder className="text-[var(--text-muted)]" size={18} /> Categories
        </h2>
        {filteredFolders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {filteredFolders.map((folder, i) => (
              <motion.div 
                key={folder.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (i * 0.1) }}
                className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-2xl p-6 cursor-pointer group transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${folder.bg} ${folder.color} group-hover:scale-110 transition-transform duration-300`}>
                    <folder.icon size={20} />
                  </div>
                  <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
                <h3 className="text-[var(--text-primary)] font-bold tracking-widest text-sm mb-1 group-hover:text-[#35D07F] transition-colors">{folder.name}</h3>
                <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest">{folder.files} Files</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 border border-[var(--border-subtle)] rounded-2xl bg-white/[0.02] text-center text-[var(--text-muted)] text-xs font-bold tracking-widest uppercase">
            No categories match your search or filter.
          </div>
        )}
      </div>

      {/* Recent Files List */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center">
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--text-primary)] flex items-center gap-2">
            <Clock className="text-[#35D07F]" size={16} /> Recent Uploads
          </h2>
        </div>
        
        <div className="hidden lg:grid grid-cols-12 gap-4 p-4 border-b border-[var(--border-subtle)] text-[var(--text-muted)] text-[10px] font-bold tracking-[0.2em] uppercase bg-white/[0.02] px-6">
          <div className="col-span-5">File Name</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Uploaded By</div>
          <div className="col-span-2">Date / Size</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {filteredFiles.length > 0 ? (
          <div className="divide-y divide-white/5">
            {filteredFiles.map((file) => (
              <div key={file.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-6 items-center hover:bg-white/[0.02] transition-colors group">
                
                {/* File Info */}
                <div className="col-span-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--bg-surface-hover)] text-[var(--text-muted)] border border-[var(--border-default)] group-hover:bg-[#35D07F]/10 group-hover:text-[#35D07F] group-hover:border-[#35D07F]/30 transition-all">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h3 className="text-[var(--text-primary)] font-bold tracking-wider text-xs mb-1 truncate max-w-[200px] sm:max-w-xs">{file.name}</h3>
                    <p className="text-[var(--text-muted)] text-[9px] uppercase tracking-widest">{file.id}</p>
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-2 hidden lg:block">
                  <span className="px-2.5 py-1 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] text-[9px] font-bold uppercase tracking-widest">
                    {file.category}
                  </span>
                </div>

                {/* Uploaded By */}
                <div className="col-span-2 hidden lg:flex items-center gap-2 text-[var(--text-muted)] text-[10px] tracking-widest uppercase">
                  <User size={12} /> {file.uploader}
                </div>

                {/* Date & Size */}
                <div className="col-span-2 hidden lg:block space-y-1">
                  <p className="text-[var(--text-secondary)] text-[10px] tracking-widest uppercase">{file.date}</p>
                  <p className="text-[var(--text-muted)] text-[9px] tracking-widest uppercase">{file.size}</p>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2.5 bg-[var(--bg-surface-hover)] hover:bg-[#35D07F]/10 text-[var(--text-muted)] hover:text-[#35D07F] rounded-lg transition-all border border-transparent hover:border-[#35D07F]/20">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[var(--bg-surface-hover)] rounded-full flex items-center justify-center text-[var(--text-muted)] mb-4">
              <FileText size={24} />
            </div>
            <h3 className="text-[var(--text-primary)] font-bold tracking-widest uppercase mb-2">No Files Found</h3>
            <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">We couldn't find any documents matching your filter.</p>
          </div>
        )}
      </motion.div>

      {/* Upload File Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm" 
              onClick={() => setShowUploadModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-[var(--bg-primary)] border border-[var(--border-default)] p-8 rounded-2xl z-10 w-full max-w-lg shadow-2xl relative"
            >
              <button onClick={() => setShowUploadModal(false)} className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <X size={20} />
              </button>
              
              <h2 className="text-[var(--text-primary)] text-xl font-bold tracking-widest uppercase mb-2 flex items-center gap-3">
                <Upload className="text-[#35D07F]" size={24} /> Upload Resource
              </h2>
              <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest mb-8">
                Upload a document to share with your organization.
              </p>

              {/* Drag and Drop Zone */}
              <div 
                onClick={() => toast('System file dialog opened.', { style: { background: '#1A1A1B', color: '#fff' } })}
                className="border-2 border-dashed border-[var(--border-default)] hover:border-[#35D07F]/50 bg-white/[0.02] hover:bg-[#35D07F]/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer group transition-all mb-6"
              >
                <div className="w-16 h-16 bg-[var(--bg-surface-hover)] group-hover:bg-[#35D07F]/10 rounded-full flex items-center justify-center text-[var(--text-muted)] group-hover:text-[#35D07F] mb-4 transition-colors">
                  <Upload size={28} />
                </div>
                <h3 className="text-[var(--text-primary)] text-sm font-bold tracking-widest uppercase mb-2">Click or drag file here</h3>
                <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest max-w-xs leading-relaxed">
                  Maximum file size: 50MB.<br /> Supported formats: PDF, DOCX, PNG, JPG, CSV.
                </p>
              </div>

              <div className="mb-8">
                <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-2 block">Assign to Category</label>
                <div className="relative">
                  <select className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3.5 text-[var(--text-primary)] text-sm outline-none focus:border-[#35D07F] transition-colors appearance-none cursor-pointer">
                    <option value="policies" className="bg-[var(--bg-secondary)]">Company Policies</option>
                    <option value="insurance" className="bg-[var(--bg-secondary)]">Insurance & Compliance</option>
                    <option value="manuals" className="bg-[var(--bg-secondary)]">Service Manuals</option>
                    <option value="fuel" className="bg-[var(--bg-secondary)]">Fuel Card Details</option>
                  </select>
                  <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] rotate-90 pointer-events-none" />
                </div>
              </div>

              <button 
                onClick={handleUploadSubmit} 
                className="w-full py-4 bg-[#35D07F] hover:bg-[#2bb46c] text-black font-bold tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(53,208,127,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <Upload size={18} /> Upload to Organization
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


