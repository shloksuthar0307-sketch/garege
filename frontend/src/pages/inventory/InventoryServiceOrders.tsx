import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Wrench, AlertTriangle, Car, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../../lib/api';

import { FilterPopover } from '../../components/FilterPopover';

export default function InventoryServiceOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const { data: requiredParts, isLoading } = useQuery({
    queryKey: ['inventory-required-parts'],
    queryFn: async () => {
      const res = await api.get('/inventory-manager/required-parts/');
      return res.data;
    }
  });

  const filteredItems = requiredParts?.filter((item: any) => {
    const matchesSearch = item.service_order_details?.order_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.part_details?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.service_order_details?.vehicle_details?.registration_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = activeFilters.status ? item.status === activeFilters.status : true;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase text-white mb-2">Service Parts Queue</h1>
          <p className="text-white/50 tracking-wide">Monitor parts required for active service orders and workshop operations.</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="text" 
              placeholder="Search by order, part, or vehicle..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#35D07F]/50 transition-all"
            />
          </div>
          <FilterPopover 
            filters={[
              { key: 'status', label: 'Queue Status', options: [
                { label: 'Waiting', value: 'WAITING' },
                { label: 'Reserved', value: 'RESERVED' },
                { label: 'Unavailable', value: 'UNAVAILABLE' }
              ]}
            ]}
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Service Order</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Vehicle</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Required Part</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Qty</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Inventory</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Status</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-white/30 text-sm tracking-wide">Loading service parts queue...</td>
                </tr>
              ) : filteredItems?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-white/30 text-sm tracking-wide">No parts required currently.</td>
                </tr>
              ) : (
                filteredItems?.map((item: any) => {
                    const available = item.part_details?.available_stock || 0;
                    const canFulfill = available >= item.quantity_required;
                    
                    return (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-[#35D07F]/10 flex items-center justify-center">
                          <Wrench size={14} className="text-[#35D07F]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">{item.service_order_details?.order_number}</span>
                          <span className="text-[10px] text-white/50 tracking-widest uppercase">{item.technician_name || 'Unassigned'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Car size={14} className="text-white/30" />
                        <span className="text-sm text-white/70">{item.service_order_details?.vehicle_details?.registration_number || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                        <div className="text-sm font-medium text-white truncate max-w-[200px]">{item.part_details?.name}</div>
                        <div className="text-[10px] text-white/50 tracking-widest">{item.part_details?.part_number}</div>
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-white">{item.quantity_required}</td>
                    <td className="py-4 px-4">
                        <span className={`text-xs font-bold ${canFulfill ? 'text-[#35D07F]' : 'text-red-400'}`}>
                            {available} Available
                        </span>
                    </td>
                    <td className="py-4 px-4">
                        {item.status === 'WAITING' ? (
                            <span className="px-3 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center w-fit space-x-1">
                                <Clock size={10} /> <span>Waiting</span>
                            </span>
                        ) : item.status === 'RESERVED' ? (
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center w-fit space-x-1">
                                <CheckCircle2 size={10} /> <span>Reserved</span>
                            </span>
                        ) : item.status === 'UNAVAILABLE' ? (
                            <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center w-fit space-x-1">
                                <AlertTriangle size={10} /> <span>Unavailable</span>
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-white/5 text-white/50 border border-white/10 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center w-fit space-x-1">
                                <span>{item.status}</span>
                            </span>
                        )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {item.status === 'WAITING' && (
                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canFulfill ? (
                            <button 
                                className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[#35D07F] hover:bg-[#35D07F]/10 border border-[#35D07F]/20 rounded-lg transition-colors"
                            >
                                Reserve
                            </button>
                          ) : (
                            <button 
                                className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/10 border border-white/20 rounded-lg transition-colors"
                            >
                                Order Part
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

