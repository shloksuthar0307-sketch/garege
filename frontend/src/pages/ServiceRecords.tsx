import { motion } from 'framer-motion';
import { ArrowLeft, Search, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const majesticEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const records: any[] = [];

export default function ServiceRecords() {
  return (
    <div className="relative w-full min-h-screen bg-[var(--bg-root)] text-[var(--text-primary)] selection:bg-white/30 px-8 py-12 md:px-16 overflow-y-auto">
      
      {/* Top Nav */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: majesticEase }}
        className="flex justify-between items-center mb-24"
      >
        <Link to="/customer/vehicle" className="flex items-center gap-4 text-white/50 hover:text-[var(--text-primary)] transition-colors duration-500 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform duration-500" strokeWidth={1} />
          <span className="text-[10px] font-sans tracking-[0.2em] uppercase">Back to Garage</span>
        </Link>
        <div className="w-6 h-6 border border-[var(--border-strong)] flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-[var(--bg-surface-hover)]0" />
        </div>
      </motion.nav>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.2, ease: majesticEase }}
          >
            <h1 className="text-6xl font-light tracking-tighter mb-4">Service Records</h1>
            <p className="text-[11px] font-sans tracking-[0.2em] text-white/40 uppercase">Your Vehicle • GJ-XX-XXXX</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: majesticEase }}
            className="relative w-full md:w-72"
          >
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH RECORDS..." 
              className="w-full bg-transparent border-b border-[var(--border-strong)] pb-2 pl-8 text-[10px] font-sans tracking-[0.2em] text-[var(--text-primary)] placeholder-white/20 focus:outline-none focus:border-white transition-colors"
            />
          </motion.div>
        </div>

        {/* Records List (Vengeance UI Table alternative) */}
        <div className="flex flex-col gap-2">
          {/* Table Header */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-[var(--border-default)] text-[9px] font-sans tracking-[0.3em] text-white/40 uppercase"
          >
            <div className="col-span-2">Date</div>
            <div className="col-span-2">ID</div>
            <div className="col-span-4">Service Details</div>
            <div className="col-span-2">Facility</div>
            <div className="col-span-2 text-right">Cost</div>
          </motion.div>

          {/* Table Rows */}
          {records.map((record, i) => (
            <motion.div 
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 + (i * 0.1), ease: majesticEase }}
              className="group cursor-pointer relative"
            >
              {/* Hover effect background */}
              <div className="absolute inset-0 bg-[var(--bg-surface-hover)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-sm -z-10" />
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-6 border-b border-[var(--border-subtle)] items-center">
                <div className="col-span-2 text-sm text-white/70">{record.date}</div>
                <div className="col-span-2 text-[10px] font-sans tracking-[0.15em] text-white/30">{record.id}</div>
                <div className="col-span-4">
                  <div className="text-lg font-light tracking-wide text-[var(--text-primary)] group-hover:translate-x-2 transition-transform duration-500">{record.title}</div>
                </div>
                <div className="col-span-2 text-[11px] text-white/50">{record.facility}</div>
                <div className="col-span-2 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm">{record.cost}</span>
                    <span className="flex items-center gap-1 text-[9px] font-sans tracking-widest text-green-400 uppercase">
                      <CheckCircle2 size={10} /> {record.status}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}



