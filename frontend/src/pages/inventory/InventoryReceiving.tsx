import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Filter, Truck, CheckCircle2, Clock, AlertTriangle, PackagePlus, X } from 'lucide-react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

import { FilterPopover } from '../../components/FilterPopover';

export default function InventoryReceiving() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  
  const queryClient = useQueryClient();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [newRequestData, setNewRequestData] = useState({ part: '', quantity: 1, supplier: '' });

  const { data: parts } = useQuery({
    queryKey: ['inventory-parts'],
    queryFn: async () => {
      const res = await api.get('/inventory-manager/parts/');
      return res.data;
    }
  });

  const requestMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/inventory-manager/purchase-requests/', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Purchase request submitted');
      setIsRequestModalOpen(false);
      setNewRequestData({ part: '', quantity: 1, supplier: '' });
      queryClient.invalidateQueries({ queryKey: ['inventory-purchase-requests'] });
    },
    onError: () => {
      toast.error('Failed to submit request');
    }
  });

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestData.part) {
      toast.error('Please select a part');
      return;
    }
    requestMutation.mutate({
      part_details_id: newRequestData.part, // the backend expects `part_details_id` or `part_id` depending on serializer, let's pass `part`
      part: newRequestData.part, // Django standard for foreign key
      quantity: newRequestData.quantity,
      supplier: newRequestData.supplier,
      priority: 'NORMAL'
    });
  };

  const { data: requests, isLoading } = useQuery({
    queryKey: ['inventory-purchase-requests'],
    queryFn: async () => {
      const res = await api.get('/inventory-manager/purchase-requests/');
      return res.data;
    }
  });

  const filteredRequests = requests?.filter((req: any) => {
    const matchesSearch = req.part_details?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          req.part_details?.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (req.supplier && req.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = activeFilters.status ? req.status === activeFilters.status : true;
    return matchesSearch && matchesStatus;
  });

  const [isDirectReceiveModalOpen, setIsDirectReceiveModalOpen] = useState(false);
  const [directReceiveData, setDirectReceiveData] = useState({ part: '', quantity: 1, notes: '' });

  const receiveMutation = useMutation({
    mutationFn: async ({ partId, quantity, notes }: { partId: string, quantity: number, notes?: string }) => {
      const res = await api.post(`/inventory-manager/parts/${partId}/receive/`, {
        quantity,
        notes: notes || 'Received from purchase request'
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Stock received successfully');
      setIsDirectReceiveModalOpen(false);
      setDirectReceiveData({ part: '', quantity: 1, notes: '' });
      queryClient.invalidateQueries({ queryKey: ['inventory-purchase-requests'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-parts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
    },
    onError: () => {
      toast.error('Failed to receive stock');
    }
  });

  const handleDirectReceiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directReceiveData.part) {
      toast.error('Please select a part');
      return;
    }
    receiveMutation.mutate({
      partId: directReceiveData.part,
      quantity: directReceiveData.quantity,
      notes: directReceiveData.notes || 'Direct stock receive'
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase text-[var(--text-primary)] mb-2">Receiving</h1>
          <p className="text-white/50 tracking-wide">Manage purchase requests and receive incoming stock.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsRequestModalOpen(true)}
            className="px-6 py-3 bg-[#35D07F] hover:bg-[#2bb469] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>New Request</span>
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="text" 
              placeholder="Search by part or supplier..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl py-3 pl-12 pr-4 text-sm text-[var(--text-primary)] placeholder-white/30 focus:outline-none focus:border-[#35D07F]/50 transition-all"
            />
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsDirectReceiveModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-3 bg-[#35D07F]/10 border border-[#35D07F]/20 text-[#35D07F] rounded-xl hover:bg-[#35D07F]/20 transition-colors"
            >
                <PackagePlus size={16} />
                <span className="text-xs uppercase tracking-widest font-bold">Direct Receive</span>
            </button>
            <FilterPopover 
              filters={[
                { key: 'status', label: 'Request Status', options: [
                  { label: 'Draft', value: 'DRAFT' },
                  { label: 'Ordered', value: 'ORDERED' },
                  { label: 'Received', value: 'RECEIVED' },
                  { label: 'Cancelled', value: 'CANCELLED' }
                ]}
              ]}
              activeFilters={activeFilters}
              onFilterChange={setActiveFilters}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-default)]">
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Part Details</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Qty Requested</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Supplier</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Date</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Status</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-white/30 text-sm tracking-wide">Loading purchase requests...</td>
                </tr>
              ) : filteredRequests?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-white/30 text-sm tracking-wide">No purchase requests found.</td>
                </tr>
              ) : (
                filteredRequests?.map((req: any) => {
                    const canReceive = req.status !== 'RECEIVED' && req.status !== 'CANCELLED';
                    
                    return (
                  <tr key={req.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)] transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-hover)] flex items-center justify-center">
                          <Truck size={14} className="text-white/50" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[200px]">{req.part_details?.name}</div>
                          <div className="text-[10px] text-white/50 tracking-widest">{req.part_details?.part_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-[var(--text-primary)]">{req.quantity}</td>
                    <td className="py-4 px-4">
                        <span className="text-sm text-white/70">{req.supplier || 'Unassigned'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-white/70">{new Date(req.created_at).toLocaleDateString()}</span>
                        <span className="text-[10px] text-white/30 uppercase tracking-widest">{req.priority} Priority</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                        {req.status === 'RECEIVED' ? (
                            <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center w-fit space-x-1">
                                <CheckCircle2 size={10} /> <span>Received</span>
                            </span>
                        ) : req.status === 'ORDERED' ? (
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center w-fit space-x-1">
                                <Truck size={10} /> <span>In Transit</span>
                            </span>
                        ) : req.status === 'CANCELLED' ? (
                            <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center w-fit space-x-1">
                                <AlertTriangle size={10} /> <span>Cancelled</span>
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center w-fit space-x-1">
                                <Clock size={10} /> <span>{req.status}</span>
                            </span>
                        )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {canReceive && (
                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => receiveMutation.mutate({ partId: req.part_details.id, quantity: req.quantity })}
                            className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[#35D07F] hover:bg-[#35D07F]/10 border border-[#35D07F]/20 rounded-lg transition-colors flex items-center space-x-1"
                          >
                            <PackagePlus size={14} />
                            <span>Receive</span>
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

      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1B] border border-[var(--border-default)] rounded-2xl p-6 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsRequestModalOpen(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-medium text-[var(--text-primary)] mb-6">New Purchase Request</h2>
            
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Part</label>
                <select 
                  value={newRequestData.part}
                  onChange={(e) => setNewRequestData({...newRequestData, part: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
                  required
                >
                  <option value="">Select a part...</option>
                  {parts?.map((part: any) => (
                    <option key={part.id} value={part.id}>{part.name} ({part.part_number})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  value={newRequestData.quantity}
                  onChange={(e) => setNewRequestData({...newRequestData, quantity: parseInt(e.target.value)})}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Supplier (Optional)</label>
                <input 
                  type="text" 
                  value={newRequestData.supplier}
                  onChange={(e) => setNewRequestData({...newRequestData, supplier: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
                  placeholder="Leave blank for unassigned"
                />
              </div>

              <div className="pt-4 flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={requestMutation.isPending}
                  className="flex-1 px-4 py-3 bg-[#35D07F] hover:bg-[#2bb469] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
                >
                  {requestMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDirectReceiveModalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1B] border border-[var(--border-default)] rounded-2xl p-6 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsDirectReceiveModalOpen(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-medium text-[var(--text-primary)] mb-2">Direct Receive</h2>
            <p className="text-white/50 text-sm mb-6">Instantly add stock to inventory without a prior purchase request.</p>
            
            <form onSubmit={handleDirectReceiveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Select Part</label>
                <select 
                  value={directReceiveData.part}
                  onChange={(e) => setDirectReceiveData({...directReceiveData, part: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
                  required
                >
                  <option value="">Select a part...</option>
                  {parts?.map((part: any) => (
                    <option key={part.id} value={part.id}>{part.name} ({part.part_number})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Quantity Received</label>
                <input 
                  type="number" 
                  min="1"
                  value={directReceiveData.quantity}
                  onChange={(e) => setDirectReceiveData({...directReceiveData, quantity: parseInt(e.target.value)})}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Notes / Reference</label>
                <input 
                  type="text" 
                  value={directReceiveData.notes}
                  onChange={(e) => setDirectReceiveData({...directReceiveData, notes: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
                  placeholder="e.g. Received from Supplier X (Invoice #1234)"
                />
              </div>

              <div className="pt-4 flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsDirectReceiveModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={receiveMutation.isPending}
                  className="flex-1 px-4 py-3 bg-[#35D07F] hover:bg-[#2bb469] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
                >
                  {receiveMutation.isPending ? 'Receiving...' : 'Add to Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


