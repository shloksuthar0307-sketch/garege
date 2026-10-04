import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, AlertTriangle, AlertOctagon, ArrowRight, BellRing, Settings } from 'lucide-react';
import { api } from '../../lib/api';

import { FilterPopover } from '../../components/FilterPopover';

export default function InventoryAlerts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const { data: parts, isLoading } = useQuery({
    queryKey: ['inventory-parts'],
    queryFn: async () => {
      const res = await api.get('/inventory-manager/parts/');
      return res.data;
    }
  });

  const alerts = parts?.filter((part: any) => part.current_stock <= part.minimum_level) || [];

  const filteredAlerts = alerts.filter((alert: any) => {
    const matchesSearch = alert.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          alert.part_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesSeverity = true;
    if (activeFilters.severity === 'CRITICAL') matchesSeverity = alert.current_stock === 0;
    if (activeFilters.severity === 'WARNING') matchesSeverity = alert.current_stock > 0 && alert.current_stock <= alert.minimum_level;

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase text-[var(--text-primary)] mb-2">Inventory Alerts</h1>
          <p className="text-white/50 tracking-wide">Monitor low stock conditions and auto-reorder triggers.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-6 py-3 bg-[var(--bg-surface-hover)] border border-[var(--border-default)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center space-x-2">
            <Settings size={16} />
            <span>Alert Settings</span>
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="text" 
              placeholder="Search alerts by part name or number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl py-3 pl-12 pr-4 text-sm text-[var(--text-primary)] placeholder-white/30 focus:outline-none focus:border-[#35D07F]/50 transition-all"
            />
          </div>
          <FilterPopover 
            filters={[
              { key: 'severity', label: 'Severity', options: [
                { label: 'Critical (Out of Stock)', value: 'CRITICAL' },
                { label: 'Warning (Low Stock)', value: 'WARNING' }
              ]}
            ]}
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
          />
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="py-8 text-center text-white/30 text-sm tracking-wide">Scanning inventory...</div>
          ) : filteredAlerts?.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl border-dashed">
                <BellRing size={32} className="text-[#35D07F] mb-4 opacity-50" />
                <h3 className="text-[var(--text-primary)] font-medium mb-1">No Active Alerts</h3>
                <p className="text-white/50 text-sm tracking-wide">All inventory levels are currently healthy.</p>
            </div>
          ) : (
            filteredAlerts?.map((alert: any) => {
              const isOutOfStock = alert.current_stock === 0;
              
              return (
                <div key={alert.id} className={`flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border ${isOutOfStock ? 'bg-red-500/5 border-red-500/20' : 'bg-orange-500/5 border-orange-500/20'} transition-all`}>
                  
                  <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isOutOfStock ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>
                      {isOutOfStock ? <AlertOctagon size={24} /> : <AlertTriangle size={24} />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-medium text-[var(--text-primary)]">{alert.name}</h3>
                        <span className={`px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded ${isOutOfStock ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                          {isOutOfStock ? 'CRITICAL - OUT OF STOCK' : 'WARNING - LOW STOCK'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-white/50">
                        <span className="tracking-widest uppercase">PN: {alert.part_number}</span>
                        <span>•</span>
                        <span>Minimum Required: {alert.minimum_level}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end md:space-x-8 w-full md:w-auto border-t border-[var(--border-subtle)] md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-0">
                    <div className="flex flex-col md:items-end">
                      <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Current Stock</span>
                      <span className={`text-xl font-bold ${isOutOfStock ? 'text-red-500' : 'text-orange-500'}`}>{alert.current_stock}</span>
                    </div>

                    <button className="flex items-center space-x-2 px-5 py-2.5 bg-[var(--bg-surface-active)] hover:bg-white/20 text-[var(--text-primary)] rounded-lg text-xs font-bold tracking-widest uppercase transition-colors">
                      <span>Order Restock</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}


