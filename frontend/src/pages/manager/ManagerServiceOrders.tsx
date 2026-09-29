import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Search, Filter, MoreVertical, Eye, Plus, X, Trash2, Edit2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManagerServiceOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ title: '', status: '', bay: '' });
  const [saving, setSaving] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/manager/service-orders/');
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching service orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openViewModal = (order: any) => {
    setSelectedOrder(order);
    setFormData({
      title: order.title || '',
      status: order.status || '',
      bay: order.bay || ''
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (selectedOrder) {
        // Update existing
        await api.patch(`/manager/service-orders/${selectedOrder.id}/`, formData);
        toast.success('Order updated successfully');
      }
      await fetchOrders();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save order');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;
    if (!window.confirm('Are you sure you want to delete this service order?')) return;
    
    try {
      await api.delete(`/manager/service-orders/${selectedOrder.id}/`);
      toast.success('Order deleted successfully');
      setIsModalOpen(false);
      await fetchOrders();
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-wide">Service Orders</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and track all active and historical service orders.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-[#111112] border border-white/10 rounded-lg flex items-center px-3 py-2">
            <Search size={16} className="text-slate-400 mr-2" />
            <input type="text" placeholder="Search orders..." className="bg-transparent border-none outline-none text-sm text-white w-48 placeholder:text-slate-600" />
          </div>
          {/* <button className="flex items-center gap-2 px-4 py-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black rounded-lg text-sm font-bold transition-colors">
            <Plus size={16} /> New Order
          </button> */}
        </div>
      </div>

      <div className="bg-[#111112] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#1A1A1B] text-slate-400 text-xs uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Vehicle</th>
                <th className="px-6 py-4 font-medium">Service</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Bay</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No service orders found.</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-medium text-white">{order.order_number}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{order.vehicle_details?.make} {order.vehicle_details?.model}</div>
                    <div className="text-xs text-slate-500">{order.vehicle_details?.registration_number}</div>
                  </td>
                  <td className="px-6 py-4">{order.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                      order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                      order.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400' :
                      order.status === 'PENDING' ? 'bg-orange-500/10 text-orange-400' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{order.bay || '-'}</td>
                  <td className="px-6 py-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openViewModal(order)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-white transition-colors">
                      <Eye size={16} />
                    </button>
                    {/* Placeholder for more actions if needed */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111112] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <div>
                <h2 className="text-xl font-light text-white tracking-wide">
                  Order {selectedOrder.order_number}
                </h2>
                <div className="text-xs text-slate-500 mt-1">
                  {selectedOrder.vehicle_details?.make} {selectedOrder.vehicle_details?.model} ({selectedOrder.vehicle_details?.registration_number})
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <>
                    <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={handleDelete} className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white transition-colors ml-2">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Service Title</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#35D07F]"
                    required
                  />
                ) : (
                  <div className="text-white bg-white/5 px-4 py-3 rounded-lg">{formData.title}</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Status</label>
                  {isEditing ? (
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#35D07F]"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="ON_HOLD">On Hold</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  ) : (
                    <div className="text-white bg-white/5 px-4 py-3 rounded-lg">{formData.status.replace('_', ' ')}</div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Assigned Bay</label>
                  {isEditing ? (
                    <select 
                      value={formData.bay}
                      onChange={(e) => setFormData({...formData, bay: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#35D07F]"
                    >
                      <option value="">-- None --</option>
                      {Array.from({ length: 15 }, (_, i) => {
                        const bayName = `BAY ${String(i + 1).padStart(2, '0')}`;
                        return <option key={bayName} value={bayName}>{bayName}</option>;
                      })}
                    </select>
                  ) : (
                    <div className="text-white bg-white/5 px-4 py-3 rounded-lg font-mono">{formData.bay || 'Not assigned'}</div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#35D07F] hover:bg-[#2EB86F] disabled:opacity-50 text-black rounded-lg text-sm font-bold transition-colors"
                  >
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

