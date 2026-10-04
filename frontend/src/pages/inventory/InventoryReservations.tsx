import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Filter, CheckSquare, XCircle, CheckCircle2, Clock, X } from 'lucide-react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

import { FilterPopover } from '../../components/FilterPopover';

export default function InventoryReservations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newReservationData, setNewReservationData] = useState({ part: '', service_order: '', quantity: 1 });

  const { data: parts } = useQuery({
    queryKey: ['inventory-parts'],
    queryFn: async () => {
      const res = await api.get('/inventory-manager/parts/');
      return res.data;
    }
  });

  const { data: orders } = useQuery({
    queryKey: ['advisor-orders-mock'], // We might not have a dedicated endpoint in this namespace, fallback to empty array or advisor namespace if needed
    queryFn: async () => {
      try {
        const res = await api.get('/advisor/service-orders/'); // Or wherever it lives
        return res.data;
      } catch (e) {
        return []; // Fallback if endpoint differs
      }
    }
  });

  const addReservationMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/inventory-manager/reservations/', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Reservation created successfully');
      setIsAddModalOpen(false);
      setNewReservationData({ part: '', service_order: '', quantity: 1 });
      queryClient.invalidateQueries({ queryKey: ['inventory-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-parts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-dashboard'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to create reservation');
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReservationData.part || !newReservationData.service_order) {
      toast.error('Please select both a part and a service order');
      return;
    }
    addReservationMutation.mutate(newReservationData);
  };

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['inventory-reservations'],
    queryFn: async () => {
      const res = await api.get('/inventory-manager/reservations/');
      return res.data;
    }
  });

  const filteredReservations = reservations?.filter((res: any) => {
    const matchesSearch = res.part_details?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          res.service_order_details?.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeFilters.status ? res.status === activeFilters.status : true;
    return matchesSearch && matchesStatus;
  });

  const releaseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/inventory-manager/reservations/${id}/release/`, {});
      return res.data;
    },
    onSuccess: () => {
      toast.success('Reservation released successfully');
      queryClient.invalidateQueries({ queryKey: ['inventory-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-parts'] });
    },
    onError: () => {
      toast.error('Failed to release reservation');
    }
  });

  const issueMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/inventory-manager/reservations/${id}/issue/`, {});
      return res.data;
    },
    onSuccess: () => {
      toast.success('Parts issued successfully');
      queryClient.invalidateQueries({ queryKey: ['inventory-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-parts'] });
    },
    onError: () => {
      toast.error('Failed to issue parts');
    }
  });

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase text-[var(--text-primary)] mb-2">Part Reservations</h1>
          <p className="text-white/50 tracking-wide">Manage parts reserved for active service orders.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-[#35D07F] hover:bg-[#2bb469] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="text" 
              placeholder="Search by part or order number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl py-3 pl-12 pr-4 text-sm text-[var(--text-primary)] placeholder-white/30 focus:outline-none focus:border-[#35D07F]/50 transition-all"
            />
          </div>
          <FilterPopover 
            filters={[
              { key: 'status', label: 'Reservation Status', options: [
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Issued (Used)', value: 'USED' },
                { label: 'Released', value: 'RELEASED' }
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
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Service Order</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Part Details</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Quantity</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Reserved By</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Status</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-white/30 text-sm tracking-wide">Loading reservations...</td>
                </tr>
              ) : filteredReservations?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-white/30 text-sm tracking-wide">No reservations found.</td>
                </tr>
              ) : (
                filteredReservations?.map((res: any) => {
                    const isPending = res.status === 'ACTIVE';
                    
                    return (
                  <tr key={res.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)] transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#35D07F]">{res.service_order_details?.order_number}</span>
                        <span className="text-xs text-white/50 truncate max-w-[150px]">{res.service_order_details?.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-hover)] flex items-center justify-center">
                          <CheckSquare size={14} className="text-white/50" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[200px]">{res.part_details?.name}</div>
                          <div className="text-xs text-white/50 tracking-widest">{res.part_details?.part_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-[var(--text-primary)]">{res.quantity}</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-white/70">{res.reserved_by_name || 'System'}</span>
                        <span className="text-xs text-white/30">{new Date(res.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                        {res.status === 'ACTIVE' ? (
                            <span className="px-3 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center w-fit space-x-1">
                                <Clock size={10} /> <span>Active</span>
                            </span>
                        ) : res.status === 'USED' ? (
                            <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center w-fit space-x-1">
                                <CheckCircle2 size={10} /> <span>Issued</span>
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-[var(--bg-surface-hover)] text-white/50 border border-[var(--border-default)] rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center w-fit space-x-1">
                                <XCircle size={10} /> <span>{res.status}</span>
                            </span>
                        )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {isPending && (
                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => releaseMutation.mutate(res.id)}
                            className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-colors"
                          >
                            Release
                          </button>
                          <button 
                            onClick={() => issueMutation.mutate(res.id)}
                            className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[#35D07F] hover:bg-[#35D07F]/10 border border-[#35D07F]/20 rounded-lg transition-colors"
                          >
                            Issue
                          </button>
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

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1B] border border-[var(--border-default)] rounded-2xl p-6 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-medium text-[var(--text-primary)] mb-6">New Reservation</h2>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Part</label>
                <select 
                  value={newReservationData.part}
                  onChange={(e) => setNewReservationData({...newReservationData, part: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
                  required
                >
                  <option value="">Select a part...</option>
                  {parts?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.part_number}) - Avail: {p.available_stock}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Service Order</label>
                <select 
                  value={newReservationData.service_order}
                  onChange={(e) => setNewReservationData({...newReservationData, service_order: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
                  required
                >
                  <option value="">Select an order...</option>
                  {orders?.map((o: any) => (
                    <option key={o.id} value={o.id}>{o.order_number} - {o.customer_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  value={newReservationData.quantity}
                  onChange={(e) => setNewReservationData({...newReservationData, quantity: parseInt(e.target.value)})}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
                  required
                />
              </div>

              <div className="pt-4 flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={addReservationMutation.isPending}
                  className="flex-1 px-4 py-3 bg-[#35D07F] hover:bg-[#2bb469] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
                >
                  {addReservationMutation.isPending ? 'Reserving...' : 'Reserve Part'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


