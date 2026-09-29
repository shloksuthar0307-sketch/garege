import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Search, Car, Clock, ChevronRight, AlertTriangle, FileText, Upload, Save, CheckSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { technicianApi } from '../api/technician';
import { VoiceNoteButton } from '../components/VoiceNoteButton';
import { useTechnicianStore } from '../store/useTechnicianStore';

export default function TechnicianCompletion() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const { greasyHandsMode } = useTechnicianStore();

  // Mock data for completion queue since backend might not be fully wired
  const MOCK_COMPLETION_QUEUE = [
    { id: '1', order_number: 'WO-2023-0891', vehicle: { make: 'Porsche', model: '911 Carrera', registration_number: 'CA-1234' }, status: 'READY_FOR_QC', technician: 'Shlok M.', repair_time: '4.5 hrs' },
    { id: '2', order_number: 'WO-2023-0895', vehicle: { make: 'BMW', model: 'M4', registration_number: 'NY-5678' }, status: 'READY_FOR_QC', technician: 'Shlok M.', repair_time: '2.1 hrs' },
  ];

  const QA_ITEMS = [
    { id: 'qc1', label: 'All requested repairs completed successfully' },
    { id: 'qc2', label: 'No warning lights on dashboard' },
    { id: 'qc3', label: 'Fluids topped up and checked' },
    { id: 'qc4', label: 'Tire pressure verified' },
    { id: 'qc5', label: 'Interior protected and cleaned post-repair' },
    { id: 'qc6', label: 'Final road test passed' }
  ];

  const filteredQueue = MOCK_COMPLETION_QUEUE.filter(o => 
    o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.vehicle.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCheck = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const allChecked = QA_ITEMS.every(item => checklist[item.id]);

  const handleSignOff = () => {
    alert('Quality Check passed and Service Order marked as COMPLETED.');
    setSelectedOrder(null);
    setChecklist({});
    setNotes('');
  };

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111112] border border-white/5 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-light text-white">Quality & Completion</h1>
          <p className="text-sm text-slate-500 mt-1">Perform final QA checks and sign off on completed repairs.</p>
        </div>
        <div className="relative flex-1 md:w-64 md:flex-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID or Reg..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#35D07F] transition-colors text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xs font-bold tracking-widest uppercase text-slate-500 px-2">Ready for Sign-off ({filteredQueue.length})</h2>
          
          {filteredQueue.map(order => (
            <div 
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className={`p-4 rounded-xl border cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-[#35D07F]/10 border-[#35D07F]/30' : 'bg-[#111112] border-white/5 hover:border-white/20'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-[#35D07F]">{order.order_number}</span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">{order.repair_time}</span>
              </div>
              <h3 className="text-white font-medium">{order.vehicle.make} {order.vehicle.model}</h3>
              <p className="text-sm text-slate-400">{order.vehicle.registration_number}</p>
            </div>
          ))}
          
          {filteredQueue.length === 0 && (
            <div className="p-8 text-center border border-dashed border-white/10 rounded-xl">
              <CheckCircle2 size={32} className="mx-auto text-slate-600 mb-2" />
              <p className="text-slate-500 text-sm">No orders waiting for completion.</p>
            </div>
          )}
        </div>

        {/* QA Form */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedOrder ? (
              <motion.div
                key={selectedOrder.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-[#111112] border border-white/5 rounded-2xl p-6 md:p-8"
              >
                <div className="flex justify-between items-start mb-8 pb-6 border-b border-white/5">
                  <div>
                    <h2 className="text-2xl font-light text-white mb-1">Quality Assurance Check</h2>
                    <p className="text-sm text-slate-400">Finalizing {selectedOrder.order_number} &bull; {selectedOrder.vehicle.make} {selectedOrder.vehicle.model}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#35D07F]/10 flex items-center justify-center text-[#35D07F]">
                    <CheckSquare size={24} />
                  </div>
                </div>

                {/* Checklist (CRUD: Update) */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-sm font-bold tracking-widest uppercase text-white mb-4">Mandatory Checks</h3>
                  {QA_ITEMS.map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-black/30 hover:border-white/10 transition-colors text-left group"
                    >
                      <div className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${checklist[item.id] ? 'bg-[#35D07F] border-[#35D07F] text-black' : 'border-white/20 text-transparent group-hover:border-white/40'}`}>
                        <CheckCircle2 size={16} />
                      </div>
                      <span className={`text-sm transition-colors ${checklist[item.id] ? 'text-white' : 'text-slate-400'}`}>{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Notes (CRUD: Create/Update) */}
                <div className="mb-8">
                  <h3 className="text-sm font-bold tracking-widest uppercase text-white mb-4">Final Notes & Recommendations</h3>
                  <div className={greasyHandsMode ? "flex flex-col gap-2" : "flex gap-2 items-start"}>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter any final observations, recommendations for the customer, or internal notes..."
                      className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#35D07F] transition-colors resize-none flex-1"
                    ></textarea>
                    <VoiceNoteButton onTranscript={(t) => setNotes(prev => (prev ? prev + ' ' : '') + t)} />
                  </div>
                </div>

                {/* Evidence (CRUD: Create) */}
                <div className="mb-8">
                  <h3 className="text-sm font-bold tracking-widest uppercase text-white mb-4">Completion Evidence</h3>
                  <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-white/20 transition-colors cursor-pointer bg-black/20">
                    <Upload size={24} className="text-slate-500 mb-2" />
                    <p className="text-white text-sm mb-1">Upload final repair photos</p>
                    <p className="text-xs text-slate-500">Drag & drop or click to browse</p>
                  </div>
                </div>

                {/* Action */}
                <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="px-6 py-3 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={!allChecked}
                    onClick={handleSignOff}
                    className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] disabled:bg-[#35D07F]/30 disabled:text-black/50 text-black px-8 py-3 rounded-lg text-sm font-bold tracking-widest uppercase transition-colors"
                  >
                    <Save size={18} /> Sign Off & Complete
                  </button>
                </div>
                
                {!allChecked && (
                  <p className="text-right text-xs text-amber-500 mt-3">All QA checks must be passed before signing off.</p>
                )}
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center border border-white/5 rounded-2xl bg-[#111112]/50">
                <CheckSquare size={48} className="text-slate-700 mb-4" />
                <h3 className="text-lg text-white font-medium mb-1">Select an Order</h3>
                <p className="text-sm text-slate-500 max-w-sm">Choose a service order from the queue to perform final quality checks and completion sign-off.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

