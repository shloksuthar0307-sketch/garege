import { API_BASE_URL, WS_BASE_URL } from '../lib/config';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../lib/auth';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Plus, Mail, Phone, Car, 
  IndianRupee, Star, MoreHorizontal, Edit2, Trash2, X
} from 'lucide-react';

const INITIAL_CUSTOMERS: any[] = [];

const STATUS_COLORS: Record<string, string> = {
  'VIP': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Active': 'bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/20',
  'Inactive': 'bg-slate-500/10 text-[var(--text-muted)] border-slate-500/20',
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>(INITIAL_CUSTOMERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_URL || API_BASE_URL + '/api/v1';
        const token = getAccessToken();
        const res = await fetch(`${apiBaseUrl}/customers/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
        }
      } catch (err) {
        console.error("Failed to fetch customers", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();

    window.addEventListener('REFRESH_CUSTOMERS', fetchCustomers);
    return () => {
      window.removeEventListener('REFRESH_CUSTOMERS', fetchCustomers);
    };
  }, []);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', vehicles: 1, ltv: 0, 
    lastVisit: '', status: 'Active', avatar: ''
  });

  const handleOpenModal = (customer: any = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({ ...customer });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '', email: '', phone: '', vehicles: 1, ltv: 0, 
        lastVisit: new Date().toISOString().split('T')[0], status: 'Active', 
        avatar: 'https://i.pravatar.cc/150?u=' + Math.random()
      });
    }
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...formData, id: c.id } : c));
    } else {
      const newId = 'CST-' + Math.floor(1000 + Math.random() * 9000);
      setCustomers([{ ...formData, id: newId }, ...customers]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer record?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
    setActiveMenuId(null);
  };

  const vipCount = customers.filter(c => c.status === 'VIP').length;

  return (
    <div className="space-y-8 relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight">Customer Management</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage client profiles, contact details, and lifetime value metrics.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
        >
          <Plus size={16} />
          Add Customer
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Total Clients</span>
            <span className="text-xl text-[var(--text-primary)] font-light">{customers.length}</span>
          </div>
          <div className="w-px h-8 bg-[var(--bg-surface-active)] mx-2"></div>
          <div className="flex flex-col">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">VIP Clients</span>
            <div className="flex items-center gap-1.5">
              <Star size={14} className="text-purple-400" />
              <span className="text-xl text-purple-400 font-light">{vipCount}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search by name, email, phone..." 
              className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border-default)] hover:border-white/30 text-[var(--text-secondary)] px-4 py-2.5 rounded-xl text-sm transition-colors">
            <Filter size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Content Area */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-visible"
      >
        <div className="overflow-visible min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Customer</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Contact Details</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase text-center">Vehicles</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase text-right">Lifetime Value</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Last Visit</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers.map((customer) => {
                return (
                  <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={customer.avatar} alt={customer.name} className="w-10 h-10 rounded-full border border-[var(--border-default)]" />
                        <div>
                          <div className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[#35D07F] transition-colors cursor-pointer">{customer.name}</div>
                          <div className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">{customer.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5 text-xs text-[var(--text-secondary)]">
                        <div className="flex items-center gap-2">
                          <Mail size={12} className="text-[var(--text-muted)]" /> {customer.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={12} className="text-[var(--text-muted)]" /> {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-1.5 bg-[var(--bg-surface-hover)] border border-[var(--border-default)] px-2.5 py-1 rounded-lg text-sm text-[var(--text-secondary)]">
                        <Car size={14} className="text-[var(--text-muted)]" />
                        <span className="font-mono">{customer.vehicles}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end text-sm text-[var(--text-primary)] font-mono font-medium">
                        <IndianRupee size={14} className="text-[var(--text-muted)] mr-0.5" />
                        {Number(customer.ltv).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[9px] text-[var(--text-muted)] mt-1 uppercase tracking-widest">Total Spend</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-secondary)]">
                        {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={'flex items-center gap-1.5 px-2.5 py-1 rounded-full border w-fit ' + (STATUS_COLORS[customer.status] || 'bg-[var(--bg-surface-hover)]')}>
                        {customer.status === 'VIP' && <Star size={10} className="fill-current" />}
                        <span className="text-[11px] font-bold uppercase tracking-widest">{customer.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap relative">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to="/customer/vehicle"
                          className="text-xs text-[#35D07F] hover:bg-[#35D07F]/10 px-3 py-1.5 rounded transition-colors uppercase tracking-widest font-bold block"
                        >
                          Profile
                        </Link>
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === customer.id ? null : customer.id)}
                          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] transition-colors focus:outline-none"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeMenuId === customer.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-8 top-10 w-40 bg-[#1A1A1B] border border-[var(--border-default)] rounded-xl shadow-2xl z-50 overflow-hidden text-left"
                          >
                            <button 
                              onClick={() => handleOpenModal(customer)}
                              className="w-full text-left px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] flex items-center gap-2 transition-colors"
                            >
                              <Edit2 size={14} /> Edit Customer
                            </button>
                            <div className="h-px bg-[var(--bg-surface-active)]"></div>
                            <button 
                              onClick={() => handleDelete(customer.id)}
                              className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-sm text-[var(--text-muted)]">
          <span>Showing {customers.length} clients</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded border border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)] transition-colors">Prev</button>
            <button className="px-3 py-1 rounded border border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)] transition-colors">Next</button>
          </div>
        </div>
      </motion.div>

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm z-[100]"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl z-[101] shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)] bg-white/[0.02]">
                <h2 className="text-xl font-light text-[var(--text-primary)]">
                  {editingCustomer ? 'Edit Customer Profile' : 'Add New Customer'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Full Name</label>
                    <input 
                      required type="text" placeholder="e.g. John Doe"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Status</label>
                    <select 
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                    >
                      <option>Active</option>
                      <option>VIP</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Email Address</label>
                    <input 
                      required type="email" placeholder="john@example.com"
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Phone Number</label>
                    <input 
                      required type="text" placeholder="+91 98765 43210"
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* Vehicles */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Registered Vehicles</label>
                    <input 
                      type="number" min="0"
                      value={formData.vehicles} onChange={e => setFormData({...formData, vehicles: parseInt(e.target.value) || 0})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                  {/* LTV */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Lifetime Value (?)</label>
                    <input 
                      type="number" min="0" step="1000"
                      value={formData.ltv} onChange={e => setFormData({...formData, ltv: parseInt(e.target.value) || 0})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-subtle)] mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#35D07F] text-black hover:bg-[#2EB86F] transition-colors uppercase tracking-widest">
                    {editingCustomer ? 'Save Changes' : 'Add Customer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


