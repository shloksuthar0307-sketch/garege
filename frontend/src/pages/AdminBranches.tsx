import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Building2, Plus, Edit2, MapPin, Phone, Mail, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBranches() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_email: '',
    contact_phone: ''
  });

  const fetchBranches = async () => {
    try {
      const res = await api.get('/admin/branches/');
      setBranches(res.data);
    } catch (error) {
      toast.error('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/branches/', formData);
      toast.success('Branch created successfully');
      fetchBranches();
      setIsModalOpen(false);
      setFormData({ name: '', address: '', contact_email: '', contact_phone: '' });
    } catch (error) {
      toast.error('Failed to create branch');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#35D07F] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-wide">Branches</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Manage garage locations and branch details.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black rounded-lg text-sm font-bold transition-colors"
        >
          <Plus size={16} /> Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map(branch => (
          <div key={branch.id} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 hover:border-[var(--border-default)] transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Building2 size={24} />
              </div>
              <button className="text-[var(--text-muted)] hover:text-[#35D07F] opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 size={16} />
              </button>
            </div>
            
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">{branch.name}</h3>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mb-4">
              {branch.organization_name || 'Organization Branch'}
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
                <span className="text-sm text-[var(--text-secondary)]">{branch.address || 'No address provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[var(--text-muted)] shrink-0" />
                <span className="text-sm text-[var(--text-secondary)]">{branch.contact_phone || 'No phone provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[var(--text-muted)] shrink-0" />
                <span className="text-sm text-[var(--text-secondary)]">{branch.contact_email || 'No email provided'}</span>
              </div>
            </div>
          </div>
        ))}
        {branches.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-[var(--border-default)] rounded-2xl text-[var(--text-muted)]">
            <Building2 size={48} className="mx-auto mb-4 opacity-50" />
            <p>No branches found. Add a branch to get started.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-overlay)] backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-subtle)]">
              <h2 className="text-xl font-light text-[var(--text-primary)] tracking-wide">Add New Branch</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateBranch} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Branch Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                  placeholder="e.g. Downtown Auto Repair"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Address</label>
                <textarea 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] resize-none"
                  rows={3}
                  placeholder="Full physical address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Contact Phone</label>
                  <input 
                    type="tel" 
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                    placeholder="+1 234..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Contact Email</label>
                  <input 
                    type="email" 
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                    placeholder="branch@example.com"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--border-subtle)]">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-[#35D07F] hover:bg-[#2EB86F] disabled:opacity-50 text-black rounded-lg text-sm font-bold transition-colors"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
