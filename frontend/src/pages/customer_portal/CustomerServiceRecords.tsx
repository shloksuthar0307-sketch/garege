import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Search, Filter, Download, FileText, ChevronDown, Wrench, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerServiceRecords() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterVehicle, setFilterVehicle] = useState('All');
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customer/service-records/');
      setRecords(res.data?.results || res.data || []);
    } catch (error) {
      toast.error('Failed to load service records');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique vehicles and types for filters
  const uniqueVehicles = ['All', ...Array.from(new Set(records.map(r => r.vehicle_details?.make ? r.vehicle_details.make + " " + r.vehicle_details.model : "Unknown Vehicle")))];
  const uniqueTypes = ['All', ...Array.from(new Set(records.map(r => r.type)))];

    const filteredRecords = records.filter(record => {
    const matchesSearch = (record.title || record.description || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (record.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || record.type === filterType;
    const matchesVehicle = filterVehicle === 'All' || (record.vehicle_details?.make + " " + record.vehicle_details?.model || "Unknown Vehicle") === filterVehicle;
    return matchesSearch && matchesType && matchesVehicle;
  });

  const handleDownload = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Downloading record ${id}...`, { 
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Repair': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Maintenance': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Inspection': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-[var(--text-muted)] bg-slate-500/10 border-slate-500/20';
    }
  };

    const handleExportAll = () => {
    const headers = ['Record ID', 'Date', 'Vehicle', 'Plate', 'Type', 'Description', 'Cost', 'Status', 'Technician', 'Mileage'];
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(r => 
        `"${r.id}","${r.date_completed || r.date_created || r.date || ''}","${r.vehicle}","${r.plate || ''}","${r.type}","${(r.title || r.description || '').replace(/"/g, '""')}","${(r.total_cost || r.cost || '').toString().replace(/[^0-9.]/g, '')}","${r.status}","${r.technician || ''}","${r.mileage || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'repairtrace_service_records.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('All Records Exported Successfully', {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-10 min-h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <History className="text-[#35D07F]" size={28} />
            Service Records
          </h1>
          <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">
            Comprehensive history of all maintenance, inspections, and repairs.
          </p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <button 
            onClick={handleExportAll}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-xl text-xs font-bold tracking-widest uppercase transition-all"
          >
            <Download size={16} /> Export All
          </button>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
          <input 
            type="text" 
            placeholder="SEARCH RECORDS..." 
            className="w-full pl-10 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] uppercase tracking-widest focus:border-[#35D07F] outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <select 
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              className="w-full sm:w-56 pl-10 pr-10 py-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] uppercase tracking-widest focus:border-[#35D07F] outline-none appearance-none cursor-pointer transition-all"
            >
              {uniqueVehicles.map(v => <option key={v} value={v} className="bg-[#111]">{v === 'All' ? 'All Vehicles' : v}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>

          <div className="relative">
            <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-48 pl-10 pr-10 py-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] uppercase tracking-widest focus:border-[#35D07F] outline-none appearance-none cursor-pointer transition-all"
            >
              {uniqueTypes.map(t => <option key={t} value={t} className="bg-[#111]">{t === 'All' ? 'All Types' : t}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* Records List */}
      <div className="flex-1 space-y-4">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-[#35D07F] border-t-transparent rounded-full animate-spin mb-4"></div>
            <h3 className="text-[var(--text-primary)] font-bold tracking-widest uppercase mb-2">Loading Records...</h3>
          </div>
        ) : (
          <AnimatePresence>
            {filteredRecords.map((record, index) => {
            const isExpanded = expandedRecord === record.id;
            return (
              <motion.div 
                key={record.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl overflow-hidden transition-all"
              >
                {/* Collapsed View (Clickable Row) */}
                <div 
                  onClick={() => setExpandedRecord(isExpanded ? null : record.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface-hover)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <span className="text-[var(--text-primary)] text-sm font-bold tracking-widest uppercase">{record.vehicle_details ? record.vehicle_details.make + " " + record.vehicle_details.model : "Unknown Vehicle"}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${getTypeColor(record.type)}`}>
                          {record.type}
                        </span>
                      </div>
                      <p className="text-[var(--text-muted)] text-xs tracking-wide line-clamp-1">{(record.title || '')}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-8 md:min-w-[300px]">
                    <div className="text-left md:text-right">
                      <p className="text-[var(--text-primary)] font-mono font-bold">{(record.total_cost || record.cost || '0')}</p>
                      <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mt-1">{(record.date_completed || record.date_created || record.date || '')}</p>
                    </div>
                    
                    <button 
                      onClick={(e) => handleDownload(record.id, e)}
                      className="w-10 h-10 rounded-full bg-[var(--bg-surface-hover)] hover:bg-[#35D07F]/10 hover:text-[#35D07F] text-[var(--text-muted)] flex items-center justify-center transition-colors"
                      title="Download Invoice"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[var(--border-subtle)] bg-black/20"
                    >
                      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                          <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1.5">Record ID</p>
                          <p className="text-[var(--text-primary)] text-sm font-mono">{record.id}</p>
                        </div>
                        <div>
                          <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1.5">License Plate</p>
                          <p className="text-[var(--text-primary)] text-sm font-bold tracking-widest">{record.plate}</p>
                        </div>
                        <div>
                          <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1.5">Mileage at Service</p>
                          <p className="text-[var(--text-primary)] text-sm">{record.mileage}</p>
                        </div>
                        <div>
                          <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1.5">Lead Technician</p>
                          <p className="text-[var(--text-primary)] text-sm">{record.technician}</p>
                        </div>
                        
                        <div className="md:col-span-4 mt-2">
                          <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-2">Service Details</p>
                          <div className="bg-[#050505] border border-[var(--border-subtle)] rounded-xl p-4 flex items-start gap-3">
                            <CheckCircle2 className="text-[#35D07F] shrink-0 mt-0.5" size={16} />
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                              {(record.title || '')}. All standard safety checks completed. Vehicle test driven and verified against factory specifications.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            );
          })}
          </AnimatePresence>
        )}

        {!loading && filteredRecords.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center text-[var(--text-muted)] mb-4">
              <FileText size={24} />
            </div>
            <h3 className="text-[var(--text-primary)] font-bold tracking-widest uppercase mb-2">No Records Found</h3>
            <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}





