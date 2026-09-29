import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Filter, Package, Eye, Edit2, Box, X } from 'lucide-react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

export default function InventoryParts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPartData, setNewPartData] = useState({
    name: '',
    part_number: '',
    category: '',
    description: '',
    current_stock: 0,
    minimum_level: 5,
    unit_price: 0,
    location: ''
  });

  const addPartMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/inventory-manager/parts/', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Part added successfully');
      setIsAddModalOpen(false);
      setNewPartData({
        name: '', part_number: '', category: '', description: '', current_stock: 0, minimum_level: 5, unit_price: 0, location: ''
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-parts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-dashboard'] });
    },
    onError: () => {
      toast.error('Failed to add part');
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPartMutation.mutate(newPartData);
  };

  const { data: parts, isLoading } = useQuery({
    queryKey: ['inventory-parts'],
    queryFn: async () => {
      const res = await api.get('/inventory-manager/parts/');
      return res.data;
    }
  });

  const uniqueCategories = Array.from(new Set(parts?.map((p: any) => p.category).filter(Boolean)));

  const filteredParts = parts?.filter((part: any) => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          part.part_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? part.category === filterCategory : true;
    
    let matchesStatus = true;
    if (filterStatus === 'OUT_OF_STOCK') matchesStatus = part.current_stock === 0;
    if (filterStatus === 'LOW_STOCK') matchesStatus = part.current_stock <= part.minimum_level && part.current_stock > 0;
    if (filterStatus === 'IN_STOCK') matchesStatus = part.current_stock > part.minimum_level;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase text-white mb-2">Parts Catalog</h1>
          <p className="text-white/50 tracking-wide">Manage inventory items, set reorder levels, and track stock.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-[#35D07F] hover:bg-[#2bb469] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Part</span>
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="text" 
              placeholder="Search parts by name or number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#35D07F]/50 transition-all"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center space-x-2 px-4 py-3 border rounded-xl text-white transition-colors ${isFilterOpen || filterCategory || filterStatus ? 'bg-[#35D07F]/10 border-[#35D07F]/50 text-[#35D07F]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            >
              <Filter size={16} />
              <span className="text-xs uppercase tracking-widest font-bold">Filter</span>
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#1A1A1B] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-white/50">Filter Parts</h3>
                  {(filterCategory || filterStatus) && (
                    <button 
                      onClick={() => { setFilterCategory(''); setFilterStatus(''); }}
                      className="text-[10px] text-white/30 hover:text-white uppercase tracking-wider"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Category</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    >
                      <option value="">All Categories</option>
                      {uniqueCategories.map((cat: any) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-white/50 mb-2">Stock Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                    >
                      <option value="">All Statuses</option>
                      <option value="IN_STOCK">In Stock (Healthy)</option>
                      <option value="LOW_STOCK">Low Stock</option>
                      <option value="OUT_OF_STOCK">Out of Stock</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Part Info</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Category</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Stock</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Reserved</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Available</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50">Status</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest uppercase text-white/50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-white/30 text-sm tracking-wide">Loading parts...</td>
                </tr>
              ) : filteredParts?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-white/30 text-sm tracking-wide">No parts found.</td>
                </tr>
              ) : (
                filteredParts?.map((part: any) => {
                    const isLowStock = part.current_stock <= part.minimum_level && part.current_stock > 0;
                    const isOutOfStock = part.current_stock === 0;

                    return (
                  <tr key={part.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                          <Package size={18} className="text-white/50" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{part.name}</div>
                          <div className="text-xs text-white/50 tracking-widest">{part.part_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-white/70">{part.category}</td>
                    <td className="py-4 px-4 text-sm text-white">{part.current_stock}</td>
                    <td className="py-4 px-4 text-sm text-white/70">{part.reserved}</td>
                    <td className="py-4 px-4 text-sm font-bold text-white">{part.available_stock}</td>
                    <td className="py-4 px-4">
                        {isOutOfStock ? (
                            <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-bold tracking-widest uppercase">
                                Out of Stock
                            </span>
                        ) : isLowStock ? (
                            <span className="px-3 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full text-[10px] font-bold tracking-widest uppercase">
                                Low Stock
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold tracking-widest uppercase">
                                In Stock
                            </span>
                        )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 text-white/50 hover:text-[#35D07F] hover:bg-[#35D07F]/10 rounded-lg transition-colors">
                          <Box size={16} />
                        </button>
                        <button className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
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
            
            <h2 className="text-xl font-medium text-white mb-6">Add New Part</h2>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Part Name *</label>
                  <input 
                    type="text" 
                    value={newPartData.name}
                    onChange={(e) => setNewPartData({...newPartData, name: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#35D07F] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Part Number *</label>
                  <input 
                    type="text" 
                    value={newPartData.part_number}
                    onChange={(e) => setNewPartData({...newPartData, part_number: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#35D07F] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Category</label>
                  <input 
                    type="text" 
                    value={newPartData.category}
                    onChange={(e) => setNewPartData({...newPartData, category: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#35D07F] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Location</label>
                  <input 
                    type="text" 
                    value={newPartData.location}
                    onChange={(e) => setNewPartData({...newPartData, location: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#35D07F] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Initial Stock</label>
                  <input 
                    type="number" 
                    min="0"
                    value={newPartData.current_stock}
                    onChange={(e) => setNewPartData({...newPartData, current_stock: parseInt(e.target.value)})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#35D07F] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Min Level</label>
                  <input 
                    type="number" 
                    min="0"
                    value={newPartData.minimum_level}
                    onChange={(e) => setNewPartData({...newPartData, minimum_level: parseInt(e.target.value)})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#35D07F] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-white/50 mb-2">Description</label>
                <textarea 
                  value={newPartData.description}
                  onChange={(e) => setNewPartData({...newPartData, description: e.target.value})}
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
                  disabled={addPartMutation.isPending}
                  className="px-6 py-3 bg-[#35D07F] hover:bg-[#2bb469] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
                >
                  {addPartMutation.isPending ? 'Adding...' : 'Add Part'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

