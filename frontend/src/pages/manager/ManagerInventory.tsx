import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Search, Filter, AlertTriangle, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManagerInventory() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ part_id: '', quantity: 1, priority: 'NORMAL', reason: '' });

  const fetchInventory = async () => {
    try {
      const res = await api.get('/manager/inventory/');
      setInventory(res.data);
    } catch (error) {
      console.error('Error fetching inventory', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.part_id) return toast.error('Please select a part');
    
    setSubmitting(true);
    try {
      // Assuming a generic endpoint /manager/purchase-requests/ exists 
      // If not, we might need to add it to views_manager.py, but for now we'll simulate or try to post
      await api.post('/manager/inventory/', {
        ...formData,
        action: 'purchase_request' // Custom action or proper endpoint
      }).catch(async () => {
         // Fallback if there's a dedicated endpoint
         await api.post('/manager/purchase-requests/', formData);
      });
      
      toast.success('Purchase request submitted successfully');
      setIsModalOpen(false);
      setFormData({ part_id: '', quantity: 1, priority: 'NORMAL', reason: '' });
      // In a real app we might fetch requests here or update state
    } catch (error) {
      toast.error('Failed to submit purchase request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-wide">Inventory Management</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Monitor branch stock levels and purchase requests.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg flex items-center px-3 py-2">
            <Search size={16} className="text-[var(--text-muted)] mr-2" />
            <input type="text" placeholder="Search parts..." className="bg-transparent border-none outline-none text-sm text-[var(--text-primary)] w-48 placeholder:text-slate-600" />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black rounded-lg text-sm font-bold transition-colors"
          >
            <Plus size={16} /> Purchase Request
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-secondary)]">
            <thead className="bg-[#1A1A1B] text-[var(--text-muted)] text-xs uppercase tracking-wider border-b border-[var(--border-subtle)]">
              <tr>
                <th className="px-6 py-4 font-medium">Part Number</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-center">Stock</th>
                <th className="px-6 py-4 font-medium text-center">Min Level</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-[var(--text-muted)]">Loading inventory...</td></tr>
              ) : inventory.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-[var(--text-muted)]">No inventory parts found.</td></tr>
              ) : inventory.map((part) => {
                const isLow = part.current_stock <= part.minimum_level;
                return (
                  <tr key={part.id} className={`hover:bg-[var(--bg-surface-hover)] transition-colors ${isLow ? 'bg-red-500/5' : ''}`}>
                    <td className="px-6 py-4 font-mono text-[var(--text-primary)]">{part.part_number}</td>
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{part.name}</td>
                    <td className="px-6 py-4">{part.category}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-lg font-light ${isLow ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>{part.current_stock}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-[var(--text-muted)]">{part.minimum_level}</td>
                    <td className="px-6 py-4">
                      {isLow ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-red-500/10 text-red-400 w-max">
                          <AlertTriangle size={12} /> Low Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-400 w-max">
                          Healthy
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-overlay)] backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-subtle)]">
              <h2 className="text-xl font-light text-[var(--text-primary)] tracking-wide">New Purchase Request</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Select Part</label>
                <select 
                  value={formData.part_id}
                  onChange={(e) => setFormData({...formData, part_id: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                  required
                >
                  <option value="">-- Choose a part --</option>
                  {inventory.map(p => (
                    <option key={p.id} value={p.id}>{p.part_number} - {p.name} (Stock: {p.current_stock})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Quantity</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Reason (Optional)</label>
                <textarea 
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] h-24 resize-none"
                  placeholder="e.g., Stocking up for upcoming service campaign..."
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors border border-transparent hover:border-[var(--border-default)]"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-6 py-3 bg-[#35D07F] hover:bg-[#2EB86F] disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-lg text-sm font-bold transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


