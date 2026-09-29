import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Filter, Users, Mail, Phone, MapPin, ExternalLink, Activity, X } from 'lucide-react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

import { FilterPopover } from '../../components/FilterPopover';

export default function InventorySuppliers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSupplierData, setNewSupplierData] = useState({
    name: '',
    code: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    status: 'ACTIVE'
  });

  const addSupplierMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/inventory-manager/suppliers/', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Supplier added successfully');
      setIsAddModalOpen(false);
      setNewSupplierData({
        name: '', code: '', contact_name: '', email: '', phone: '', address: '', status: 'ACTIVE'
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-suppliers'] });
    },
    onError: () => {
      toast.error('Failed to add supplier');
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSupplierMutation.mutate(newSupplierData);
  };

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['inventory-suppliers'],
    queryFn: async () => {
      const res = await api.get('/inventory-manager/suppliers/');
      return res.data;
    }
  });

  const filteredSuppliers = suppliers?.filter((sup: any) => {
    const matchesSearch = sup.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (sup.code && sup.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (sup.contact_name && sup.contact_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = activeFilters.status ? sup.status === activeFilters.status : true;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase text-white mb-2">Suppliers</h1>
          <p className="text-white/50 tracking-wide">Manage vendor relationships, contact information, and status.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-[#35D07F] hover:bg-[#2bb469] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, code, or contact..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#35D07F]/50 transition-all"
            />
          </div>
          <FilterPopover 
            filters={[
              { key: 'status', label: 'Supplier Status', options: [
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Inactive', value: 'INACTIVE' }
              ]}
            ]}
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-8 text-center text-white/30 text-sm tracking-wide">Loading suppliers...</div>
          ) : filteredSuppliers?.length === 0 ? (
            <div className="col-span-full py-8 text-center text-white/30 text-sm tracking-wide">No suppliers found.</div>
          ) : (
            filteredSuppliers?.map((sup: any) => (
              <div key={sup.id} className="bg-[#111112] border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all group relative overflow-hidden">
                
                {/* Status Indicator */}
                <div className="absolute top-4 right-4">
                    {sup.status === 'ACTIVE' ? (
                        <div className="flex items-center space-x-1 bg-green-500/10 text-green-400 px-2 py-1 rounded-md border border-green-500/20 text-[10px] font-bold tracking-widest uppercase">
                            <Activity size={10} /> <span>Active</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-1 bg-white/5 text-white/50 px-2 py-1 rounded-md border border-white/10 text-[10px] font-bold tracking-widest uppercase">
                            <span>{sup.status}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Users size={20} className="text-white/50" />
                  </div>
                  <div className="pr-16">
                    <h3 className="text-lg font-medium text-white truncate">{sup.name}</h3>
                    <p className="text-xs text-[#35D07F] font-bold tracking-widest uppercase">{sup.code || 'NO-CODE'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-6 flex justify-center text-white/30"><Users size={14} /></div>
                    <span className="text-white/70 truncate">{sup.contact_name || 'No Contact Person'}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-6 flex justify-center text-white/30"><Mail size={14} /></div>
                    <span className="text-white/70 truncate">{sup.email || 'No Email'}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-6 flex justify-center text-white/30"><Phone size={14} /></div>
                    <span className="text-white/70">{sup.phone || 'No Phone'}</span>
                  </div>
                  <div className="flex items-start space-x-3 text-sm">
                    <div className="w-6 flex justify-center text-white/30 mt-1"><MapPin size={14} /></div>
                    <span className="text-white/70 line-clamp-2">{sup.address || 'No Address Provided'}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-xs font-bold tracking-widest uppercase text-white/50 hover:text-white transition-colors">
                    Edit Details
                  </button>
                  <button className="flex items-center space-x-1 text-xs font-bold tracking-widest uppercase text-[#35D07F] hover:text-[#2bb469] transition-colors">
                    <span>View Orders</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1B] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-medium text-white mb-6">Add New Supplier</h2>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Company Name *</label>
                  <input 
                    type="text" 
                    value={newSupplierData.name}
                    onChange={(e) => setNewSupplierData({...newSupplierData, name: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#35D07F] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Supplier Code *</label>
                  <input 
                    type="text" 
                    value={newSupplierData.code}
                    onChange={(e) => setNewSupplierData({...newSupplierData, code: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#35D07F] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Contact Person</label>
                  <input 
                    type="text" 
                    value={newSupplierData.contact_name}
                    onChange={(e) => setNewSupplierData({...newSupplierData, contact_name: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#35D07F] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={newSupplierData.email}
                    onChange={(e) => setNewSupplierData({...newSupplierData, email: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#35D07F] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Phone Number</label>
                  <input 
                    type="text" 
                    value={newSupplierData.phone}
                    onChange={(e) => setNewSupplierData({...newSupplierData, phone: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#35D07F] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Status</label>
                  <select 
                    value={newSupplierData.status}
                    onChange={(e) => setNewSupplierData({...newSupplierData, status: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#35D07F] transition-colors"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Physical Address</label>
                <textarea 
                  value={newSupplierData.address}
                  onChange={(e) => setNewSupplierData({...newSupplierData, address: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#35D07F] transition-colors h-24 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={addSupplierMutation.isPending}
                  className="px-6 py-3 bg-[#35D07F] hover:bg-[#2bb469] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
                >
                  {addSupplierMutation.isPending ? 'Saving...' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

