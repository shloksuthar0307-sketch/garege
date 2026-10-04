import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, ArrowUpRight, ArrowDownRight, RefreshCcw, CheckSquare, XSquare, CornerDownLeft, Package } from 'lucide-react';
import { api } from '../../lib/api';

import { FilterPopover } from '../../components/FilterPopover';

export default function InventoryMovements() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const { data: movements, isLoading } = useQuery({
    queryKey: ['inventory-movements'],
    queryFn: async () => {
      const res = await api.get('/inventory-manager/movements/');
      return res.data;
    }
  });

  const filteredMovements = movements?.filter((mov: any) => {
    const matchesSearch = mov.part_details?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          mov.part_details?.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (mov.reference_number && mov.reference_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = activeFilters.type ? mov.movement_type === activeFilters.type : true;

    return matchesSearch && matchesType;
  });

  const getMovementIcon = (type: string) => {
    switch(type) {
      case 'RECEIVED': return <ArrowDownRight size={14} className="text-[#35D07F]" />;
      case 'ISSUED': return <ArrowUpRight size={14} className="text-red-400" />;
      case 'ADJUSTED': return <RefreshCcw size={14} className="text-orange-400" />;
      case 'RESERVED': return <CheckSquare size={14} className="text-blue-400" />;
      case 'RELEASED': return <XSquare size={14} className="text-[var(--text-muted)]" />;
      case 'RETURNED': return <CornerDownLeft size={14} className="text-[#35D07F]" />;
      default: return <Package size={14} className="text-white/50" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch(type) {
      case 'RECEIVED': return 'bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/20';
      case 'ISSUED': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'ADJUSTED': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'RESERVED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'RELEASED': return 'bg-[var(--bg-surface-hover)] text-white/50 border-[var(--border-default)]';
      case 'RETURNED': return 'bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/20';
      default: return 'bg-[var(--bg-surface-hover)] text-white/50 border-[var(--border-default)]';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase text-[var(--text-primary)] mb-2">Audit Log</h1>
          <p className="text-white/50 tracking-wide">Immutable record of all inventory stock movements and adjustments.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="text" 
              placeholder="Search by part, order, or reference..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl py-3 pl-12 pr-4 text-sm text-[var(--text-primary)] placeholder-white/30 focus:outline-none focus:border-[#35D07F]/50 transition-all"
            />
          </div>
          <FilterPopover 
            filters={[
              { key: 'type', label: 'Movement Type', options: [
                { label: 'Received', value: 'RECEIVED' },
                { label: 'Issued', value: 'ISSUED' },
                { label: 'Adjusted', value: 'ADJUSTED' },
                { label: 'Reserved', value: 'RESERVED' },
                { label: 'Released', value: 'RELEASED' },
                { label: 'Returned', value: 'RETURNED' }
              ]}
            ]}
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-default)]">
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Transaction Date</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Part Info</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Movement</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Details</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Actor</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-white/30 text-sm tracking-wide">Loading stock movements...</td>
                </tr>
              ) : filteredMovements?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-white/30 text-sm tracking-wide">No stock movements recorded.</td>
                </tr>
              ) : (
                filteredMovements?.map((mov: any) => (
                  <tr key={mov.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)] transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-white/90">{new Date(mov.created_at).toLocaleDateString()}</span>
                        <span className="text-xs text-white/30">{new Date(mov.created_at).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[200px]">{mov.part_details?.name}</span>
                        <span className="text-[10px] text-white/50 tracking-widest uppercase">{mov.part_details?.part_number}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 border rounded-md text-[10px] font-bold tracking-widest uppercase flex items-center space-x-1 ${getMovementColor(mov.movement_type)}`}>
                                {getMovementIcon(mov.movement_type)}
                                <span>{mov.movement_type}</span>
                            </span>
                            <span className="text-sm font-bold text-[var(--text-primary)]">
                                {mov.movement_type === 'ISSUED' || mov.movement_type === 'RESERVED' ? '-' : '+'}{mov.quantity}
                            </span>
                        </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col space-y-1">
                        {mov.reference_number && (
                            <span className="text-xs font-bold text-[#35D07F] tracking-wider uppercase">Ref: {mov.reference_number}</span>
                        )}
                        {mov.service_order_details && (
                            <span className="text-[10px] text-white/50 truncate max-w-[200px]">Order: {mov.service_order_details.order_number}</span>
                        )}
                        {mov.notes && (
                            <span className="text-[10px] text-white/40 italic truncate max-w-[250px]">{mov.notes}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                        <span className="text-sm text-white/70">{mov.actor_name || 'System'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


