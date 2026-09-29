import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronRight, Wrench, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

export function ServiceHistory() {
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const history = [
    { id: 1, date: '12 AUG 2026', type: 'General Service', cost: '?4,850', mileage: '41,200 KM', tech: 'Alex Morgan', status: 'Completed' },
    { id: 2, date: '04 MAY 2026', type: 'Brake Fluid Flush', cost: '?2,100', mileage: '38,500 KM', tech: 'Sarah Chen', status: 'Completed' },
    { id: 3, date: '19 DEC 2025', type: 'Tire Replacement', cost: '?32,000', mileage: '32,100 KM', tech: 'Mike Ross', status: 'Completed' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight mb-2">Service History</h1>
          <p className="text-gray-400">Complete digital record of your Porsche 718 Cayman.</p>
        </div>
      </div>

      <div className="space-y-4">
        {history.map((record) => (
          <div 
            key={record.id}
            onClick={() => setSelectedService(record.id)}
            className="bg-[#111] border border-white/5 hover:border-white/10 rounded-2xl p-6 cursor-pointer transition-all hover:bg-[#151515] group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex flex-col items-center justify-center w-20 h-20 rounded-xl bg-black border border-white/5 flex-shrink-0">
                  <span className="text-xs text-gray-500 font-medium">{record.date.split(' ')[1]}</span>
                  <span className="text-2xl font-light text-white">{record.date.split(' ')[0]}</span>
                  <span className="text-xs text-gray-500">{record.date.split(' ')[2]}</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">{record.type}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><Wrench className="w-3.5 h-3.5" /> {record.tech}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {record.mileage}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-48">
                <div className="text-left sm:text-right">
                  <p className="text-white font-mono text-lg">{record.cost}</p>
                  <p className="text-emerald-500 text-xs font-medium flex items-center justify-start sm:justify-end gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {record.status}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedService && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-medium text-white">Service Detail</h2>
                <button onClick={() => setSelectedService(null)} className="text-gray-400 hover:text-white">?</button>
              </div>
              <div className="p-6 bg-[#0a0a0a]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white">AM</div>
                  <div>
                    <p className="text-sm text-gray-400">Lead Technician</p>
                    <p className="text-white font-medium">Alex Morgan</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-white/5 bg-[#111]">
                    <h4 className="text-sm font-medium text-white mb-2">Work Performed</h4>
                    <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                      <li>Multi-point digital inspection</li>
                      <li>Synthetic oil and filter change</li>
                      <li>Cabin air filter replacement</li>
                      <li>Tire rotation and pressure check</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                <button onClick={() => setSelectedService(null)} className="px-6 py-2.5 rounded-xl border border-white/10 text-white font-medium text-sm hover:bg-white/5 transition-colors">Close</button>
                <button className="px-6 py-2.5 rounded-xl bg-white text-black font-medium text-sm hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Download PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

