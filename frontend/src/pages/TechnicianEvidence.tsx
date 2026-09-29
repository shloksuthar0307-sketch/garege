import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Image as ImageIcon, Video, Calendar, ShieldCheck, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_EVIDENCE = [
  {
    id: 'EVD-901', url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    type: 'Image', category: 'Pre-Inspection', tags: ['Exterior', 'Scratch'],
    orderId: 'WO-2023-0891', date: '2026-09-22T09:15:00', size: '2.4 MB'
  },
  {
    id: 'EVD-902', url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    type: 'Image', category: 'Issue', tags: ['Engine', 'Oil Leak'],
    orderId: 'WO-2023-0892', date: '2026-09-22T09:30:00', size: '3.1 MB'
  },
  {
    id: 'EVD-903', url: 'https://images.unsplash.com/photo-1530053969600-caed2596d242?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    type: 'Image', category: 'Post-Repair', tags: ['Interior', 'Clean'],
    orderId: 'WO-2023-0895', date: '2026-09-21T14:20:00', size: '1.8 MB'
  }
];

export default function TechnicianEvidence() {
  const [searchTerm, setSearchTerm] = useState('');
  const [evidence, setEvidence] = useState(MOCK_EVIDENCE);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);

  const filteredEvidence = evidence.filter(item => 
    item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newEv = {
        id: 'EVD-' + Math.floor(Math.random() * 10000),
        url: URL.createObjectURL(e.target.files[0]),
        type: 'Image',
        category: 'Newly Uploaded',
        tags: ['Uncategorized'],
        orderId: 'WO-2023-NEW',
        date: new Date().toISOString(),
        size: '1.2 MB'
      };
      setEvidence([newEv, ...evidence]);
      setShowUploadModal(false);
      toast.success('Evidence securely uploaded!');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111112] border border-white/5 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-light text-white">My Evidence Gallery</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage photos/videos you've uploaded for service orders.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID or Tag..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#35D07F] transition-colors text-sm"
            />
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="bg-[#35D07F] hover:bg-[#2EB86F] text-black px-4 py-2 rounded-lg text-sm font-bold tracking-widest uppercase transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Upload size={16} /> Upload New
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredEvidence.map((item) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111112] border border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-colors cursor-pointer"
            onClick={() => setSelectedEvidence(item)}
          >
            <div className="relative aspect-square overflow-hidden bg-black/50">
              <img src={item.url} alt="Evidence" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-widest">
                {item.type}
              </div>
              <div className="absolute bottom-3 left-3 bg-[#35D07F]/90 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-black uppercase tracking-widest">
                {item.category}
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-mono text-[#35D07F]">{item.orderId}</div>
                  <div className="text-sm text-white font-medium mt-1">{item.id}</div>
                </div>
                <div className="flex gap-1">
                  {item.tags.map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 bg-white/5 text-slate-400 text-[9px] uppercase tracking-wider rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-white/5 pt-3">
                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(item.date).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-[#35D07F]" /> Secured</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredEvidence.length === 0 && (
        <div className="bg-[#111112] border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <ImageIcon size={48} className="text-slate-600 mb-4" />
          <h3 className="text-white text-lg font-medium mb-2">No Evidence Found</h3>
          <p className="text-slate-500 text-sm max-w-md">You haven't uploaded any photos or videos matching this search.</p>
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedEvidence && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md px-4" onClick={() => setSelectedEvidence(null)}>
            <button className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full z-10">
              <X size={24} />
            </button>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-5xl w-full flex flex-col items-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={selectedEvidence.url} alt="Evidence Fullscreen" className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl" />
              <div className="mt-6 bg-[#111112] border border-white/10 p-6 rounded-2xl w-full max-w-2xl flex justify-between items-center shadow-2xl">
                <div>
                  <h3 className="text-white font-medium text-lg">{selectedEvidence.id}</h3>
                  <p className="text-slate-400 text-sm mt-1">Order: <span className="text-[#35D07F] font-mono">{selectedEvidence.orderId}</span></p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 bg-white/5 text-white text-xs font-bold rounded uppercase tracking-widest">{selectedEvidence.category}</span>
                  <span className="px-3 py-1.5 bg-white/5 text-slate-400 text-xs font-bold rounded uppercase tracking-widest">{selectedEvidence.size}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111112] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-white font-medium">Upload Evidence</h2>
                <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <label className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#35D07F]/50 transition-colors bg-white/5">
                  <Upload size={32} className="text-slate-400 mb-3" />
                  <p className="text-white text-sm font-medium mb-1">Click to select files</p>
                  <p className="text-slate-500 text-xs">JPEG, PNG, MP4 up to 50MB</p>
                  <input type="file" className="hidden" accept="image/*,video/*" onChange={handleUpload} />
                </label>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

