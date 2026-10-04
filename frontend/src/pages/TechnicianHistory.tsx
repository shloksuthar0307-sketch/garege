import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, ChevronRight, Filter, Clock, Car, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { technicianApi } from '../api/technician';

export default function TechnicianHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL');

  const { data: workOrders = [], isLoading } = useQuery({
    queryKey: ['technician-work-orders'],
    queryFn: technicianApi.getWorkOrders,
  });

  const completedOrders = workOrders.filter((wo: any) => wo.status === 'COMPLETED' || wo.status === 'CLOSED');

  const filteredHistory = completedOrders.filter((h: any) => {
    const orderNum = h.order_number || '';
    const reg = h.vehicle?.registration_number || '';
    const make = h.vehicle?.make || '';
    const type = h.type || 'MAINTENANCE';
    
    const matchesSearch = orderNum.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          reg.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          make.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'ALL' || type.toUpperCase() === filter.toUpperCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-light text-[var(--text-primary)]">My Service History</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">View your past completed work orders and performance.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg pl-10 pr-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors text-sm"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-2 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#35D07F] appearance-none cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="REPAIR">Repair</option>
            <option value="INSPECTION">Inspection</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
          <div className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-2">Completed Jobs (This Month)</div>
          <div className="text-3xl font-light text-[var(--text-primary)]">{completedOrders.length}</div>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
          <div className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-2">Efficiency Score</div>
          <div className="text-3xl font-light text-[#35D07F]">94%</div>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
          <div className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-2">Avg Completion Time</div>
          <div className="text-3xl font-light text-[var(--text-primary)]">2.8 <span className="text-base text-[var(--text-muted)]">hrs</span></div>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
          <div className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-2">Quality Rating</div>
          <div className="text-3xl font-light text-amber-400">4.9<span className="text-base text-[var(--text-muted)]">/5</span></div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-black/20">
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[var(--text-muted)]">Order ID</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[var(--text-muted)]">Date</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[var(--text-muted)]">Vehicle</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[var(--text-muted)]">Type</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[var(--text-muted)]">Time Spent</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[var(--text-muted)] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[var(--text-muted)]">Loading history...</td>
                </tr>
              ) : filteredHistory.map((job: any) => (
                <tr key={job.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)] transition-colors group">
                  <td className="p-4">
                    <span className="text-sm font-mono text-[var(--text-primary)]">{job.order_number}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <Calendar size={14} /> {new Date(job.date_completed || job.date_created).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-[var(--text-primary)]">{job.vehicle?.make} {job.vehicle?.model}</div>
                    <div className="text-xs text-[var(--text-muted)]">{job.vehicle?.registration_number}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded bg-[var(--bg-surface-hover)] text-xs text-[var(--text-secondary)]">{job.type}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <Clock size={14} /> -
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <Link 
                      to={`/technician/vehicle/${job.id}`}
                      className="inline-flex items-center gap-1 text-[#35D07F] hover:text-[var(--text-primary)] transition-colors text-xs font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100"
                    >
                      View Report <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
              
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <FileText size={32} className="mx-auto text-slate-600 mb-2" />
                    <p className="text-[var(--text-muted)] text-sm">No history records found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



