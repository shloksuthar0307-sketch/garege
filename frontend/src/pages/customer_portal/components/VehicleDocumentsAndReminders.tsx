import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Shield, FileCheck, AlertTriangle, Clock, X, Upload, Download, Eye, RefreshCw } from 'lucide-react';

export default function VehicleDocumentsAndReminders() {
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const documents = [
    { id: 'license', name: 'Driving License', icon: FileText, status: 'VALID', expiry: 'in 2 years', date: '2028-10-15', number: 'DL-987654321' },
    { id: 'insurance', name: 'Insurance', icon: Shield, status: 'EXPIRING SOON', expiry: 'in 12 days', date: '2026-10-12', number: 'POL-12345678', alert: true },
    { id: 'puc', name: 'PUC', icon: FileCheck, status: 'EXPIRED', expiry: '2 days ago', date: '2026-09-28', number: 'PUC-9876', expired: true },
    { id: 'registration', name: 'Registration', icon: FileText, status: 'VALID', expiry: 'in 5 years', date: '2031-01-01', number: 'ABC-1234' },
  ];

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setSelectedDoc(null);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
      <div className="xl:col-span-2 bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 hover:border-[#35D07F]/30 transition-colors rounded-2xl p-5">
        <h2 className="text-white text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
          <FileText className="text-[#35D07F]" size={16} /> My Documents & PUC
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc, i) => (
            <div key={i} className={`bg-white/5 border ${doc.expired ? 'border-rose-500/30' : doc.alert ? 'border-amber-500/30' : 'border-white/10'} p-4 rounded-xl flex justify-between items-center`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${doc.expired ? 'bg-rose-500/10 text-rose-500' : doc.alert ? 'bg-amber-500/10 text-amber-500' : 'bg-white/10 text-slate-300'}`}>
                  <doc.icon size={20} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-bold uppercase tracking-widest">{doc.name}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${doc.expired ? 'text-rose-500' : doc.alert ? 'text-amber-500' : 'text-[#35D07F]'}`}>
                    {doc.status}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedDoc(doc)} className="text-slate-400 hover:text-white uppercase tracking-widest font-bold text-[10px] underline">
                View
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="xl:col-span-1 bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 hover:border-[#35D07F]/30 transition-colors rounded-2xl p-5">
        <h2 className="text-white text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
          <Clock className="text-[#35D07F]" size={16} /> Expiry Reminders
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-rose-500/5 border border-rose-500/20 p-3 rounded-xl">
            <AlertTriangle className="text-rose-500 flex-shrink-0" size={16} />
            <div className="flex-1">
              <p className="text-white text-xs font-bold">PUC expired 2 days ago.</p>
            </div>
            <button onClick={() => setSelectedDoc(documents[2])} className="text-rose-500 text-[10px] font-bold uppercase tracking-widest hover:underline">Renew</button>
          </div>
          <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl">
            <AlertTriangle className="text-amber-500 flex-shrink-0" size={16} />
            <div className="flex-1">
              <p className="text-white text-xs font-bold">Insurance expires in 12 days.</p>
            </div>
            <button onClick={() => setSelectedDoc(documents[1])} className="text-amber-500 text-[10px] font-bold uppercase tracking-widest hover:underline">Renew</button>
          </div>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl">
            <Clock className="text-slate-400 flex-shrink-0" size={16} />
            <div className="flex-1">
              <p className="text-slate-300 text-xs font-bold">Service due in 15 days.</p>
            </div>
            <button className="text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-widest hover:underline">Book</button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isUploading && setSelectedDoc(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0A0A0B] border border-white/10 p-6 rounded-2xl z-10 w-full max-w-md shadow-2xl relative">
              <button disabled={isUploading} onClick={() => setSelectedDoc(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white disabled:opacity-50"><X size={20} /></button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl ${selectedDoc.expired ? 'bg-rose-500/10 text-rose-500' : selectedDoc.alert ? 'bg-amber-500/10 text-amber-500' : 'bg-[#35D07F]/10 text-[#35D07F]'}`}>
                  <selectedDoc.icon size={24} />
                </div>
                <div>
                  <h2 className="text-white text-lg font-bold tracking-widest uppercase">{selectedDoc.name}</h2>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedDoc.expired ? 'text-rose-500' : selectedDoc.alert ? 'text-amber-500' : 'text-[#35D07F]'}`}>
                    {selectedDoc.status}
                  </span>
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Document No.</span>
                  <span className="text-white text-sm font-bold">{selectedDoc.number}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Expiry Date</span>
                  <span className="text-white text-sm font-bold">{selectedDoc.date}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Document File</span>
                  <div className="flex gap-2">
                    <button className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                      <Eye size={14} /> View
                    </button>
                    <button className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                      <Download size={14} /> DL
                    </button>
                  </div>
                </div>
              </div>

              {selectedDoc.expired || selectedDoc.alert ? (
                <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-amber-500 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle size={14} /> Needs Renewal
                  </p>
                  <p className="text-slate-400 text-xs mt-1">Please renew your {selectedDoc.name.toLowerCase()} and upload the new document.</p>
                </div>
              ) : null}

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleSimulatedUpload}
                  disabled={isUploading}
                  className="w-full py-3 bg-[#35D07F] text-black font-bold tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(53,208,127,0.3)] hover:bg-[#2bb46c] transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <><RefreshCw size={18} className="animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload size={18} /> Upload New Document</>
                  )}
                </button>
                <input type="file" className="hidden" id={`upload-${selectedDoc.id}`} onChange={handleSimulatedUpload} />
                <button 
                  onClick={() => document.getElementById(`upload-${selectedDoc.id}`)?.click()} 
                  disabled={isUploading}
                  className="w-full py-3 bg-white/5 border border-white/10 text-white font-bold tracking-widest uppercase rounded-xl hover:bg-white/10 transition-all text-xs disabled:opacity-50"
                >
                  Select File
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
