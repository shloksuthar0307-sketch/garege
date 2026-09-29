import { useState, useRef, useEffect } from 'react';
import { Filter } from 'lucide-react';

interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface FilterPopoverProps {
  filters: FilterOption[];
  onFilterChange: (values: Record<string, string>) => void;
  activeFilters: Record<string, string>;
}

export function FilterPopover({ filters, onFilterChange, activeFilters }: FilterPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popoverRef]);

  const hasActiveFilters = Object.values(activeFilters).some(v => v !== '');

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-3 border rounded-xl text-white transition-colors ${isOpen || hasActiveFilters ? 'bg-[#35D07F]/10 border-[#35D07F]/50 text-[#35D07F]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
      >
        <Filter size={16} />
        <span className="text-xs uppercase tracking-widest font-bold">Filter</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#1A1A1B] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold tracking-widest uppercase text-white/50">Apply Filters</h3>
            {hasActiveFilters && (
              <button 
                onClick={() => {
                  const cleared = Object.keys(activeFilters).reduce((acc, key) => ({...acc, [key]: ''}), {});
                  onFilterChange(cleared);
                }}
                className="text-[10px] text-white/30 hover:text-white uppercase tracking-wider"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="space-y-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-xs text-white/50 mb-2">{filter.label}</label>
                <select
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => onFilterChange({ ...activeFilters, [filter.key]: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                >
                  <option value="">All {filter.label}</option>
                  {filter.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

