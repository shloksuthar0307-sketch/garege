import React, { useState } from 'react';
import { Search, Filter, Calendar, Car, Download, Eye, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { advisorApi } from '../api/advisor';
import ServiceOrderDrawer from '../components/service-advisor/ServiceOrderDrawer';
import { FilterPopover } from '../components/FilterPopover';
import toast from 'react-hot-toast';

export default function AdvisorHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const { data: allServices, isLoading } = useQuery({
    queryKey: ['advisor-service-history'],
    queryFn: advisorApi.getServiceHistory
  });

  const filteredHistory = allServices?.filter((service: any) => {
    // Check status filter
    if (activeFilters.status && service.status !== activeFilters.status) {
      return false;
    }
    
    // Check search term
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      service.vehicle?.registration_number?.toLowerCase().includes(term) ||
      service.vehicle?.make?.toLowerCase().includes(term) ||
      service.customer?.first_name?.toLowerCase().includes(term) ||
      service.customer?.last_name?.toLowerCase().includes(term) ||
      service.order_number?.toLowerCase().includes(term)
    );
  }) || [];

  const handleExport = () => {
    if (filteredHistory.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Order ID', 'Date', 'Vehicle', 'Customer', 'Service Type', 'Status', 'Total Cost'];
    const csvContent = filteredHistory.map((service: any) => {
      return [
        service.order_number || service.id,
        new Date(service.date_created).toLocaleDateString(),
        `${service.vehicle?.make || ''} ${service.vehicle?.model || ''}`,
        `${service.customer?.first_name || ''} ${service.customer?.last_name || ''}`,
        service.type || 'N/A',
        service.status || 'N/A',
        service.total_cost || 0
      ].map(val => `"${val}"`).join(',');
    });
    csvContent.unshift(headers.join(','));
    const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Export completed successfully');
  };

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Ready for Pickup', value: 'READY_FOR_PICKUP' },
        { label: 'In Workshop', value: 'IN_WORKSHOP' },
        { label: 'Awaiting Parts', value: 'AWAITING_PARTS' },
        { label: 'Awaiting Approval', value: 'AWAITING_APPROVAL' },
        { label: 'Diagnosis', value: 'DIAGNOSIS' },
        { label: 'Checked In', value: 'CHECKED_IN' },
        { label: 'Cancelled', value: 'CANCELLED' },
      ]
    }
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6 relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight">Service History</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Search and view past service records, invoices, and detailed reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search by Reg No, Customer, Order ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
            />
          </div>
          <FilterPopover 
            filters={filterOptions}
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
          />
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-4 py-3 border border-[#35D07F] rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* History Data Table */}
      <div className="flex-1 overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1A1A1B] sticky top-0 z-10 border-b border-[var(--border-subtle)]">
              <tr>
                <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Order ID</th>
                <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Date</th>
                <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Vehicle</th>
                <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Customer</th>
                <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Service Type</th>
                <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Status</th>
                <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">Loading history...</td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">No records found matching your search.</td>
                </tr>
              ) : (
                filteredHistory.map((service: any) => (
                  <tr key={service.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <span className="text-xs font-mono text-[var(--text-primary)] bg-[var(--bg-surface-hover)] px-2 py-1 rounded">
                        {service.order_number || (typeof service.id === 'string' ? service.id.substring(0, 8) : service.id)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <Calendar size={14} className="text-[var(--text-muted)]" />
                        {new Date(service.date_created).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Car size={14} className="text-[var(--text-muted)]" />
                        <div>
                          <p className="text-sm text-[var(--text-primary)] font-medium">{service.vehicle?.make} {service.vehicle?.model}</p>
                          <p className="text-[10px] font-mono text-[var(--text-muted)]">{service.vehicle?.registration_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-[var(--text-primary)] font-medium">
                        {service.customer?.first_name || service.customer?.username || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-1 bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] rounded border border-[var(--border-default)]">
                        {service.type || 'Service'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        service.status === 'COMPLETED' ? 'bg-[#35D07F]/10 text-[#35D07F]' :
                        service.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {service.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedServiceId(service.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#35D07F] hover:text-[#2EB86F] transition-colors bg-[#35D07F]/10 hover:bg-[#35D07F]/20 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100"
                      >
                        <Eye size={14} /> View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ServiceOrderDrawer 
        serviceId={selectedServiceId} 
        onClose={() => setSelectedServiceId(null)} 
      />
    </div>
  );
}


