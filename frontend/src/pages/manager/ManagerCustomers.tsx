import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Search, UserCircle, Phone, Mail, Car, MoreVertical } from 'lucide-react';

export default function ManagerCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/manager/customers/');
        setCustomers(res.data);
      } catch (error) {
        console.error('Error fetching customers', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-wide">Customers</h1>
          <p className="text-slate-400 text-sm mt-1">Manage clients associated with your branch.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-[#111112] border border-white/10 rounded-lg flex items-center px-3 py-2">
            <Search size={16} className="text-slate-400 mr-2" />
            <input type="text" placeholder="Search customers..." className="bg-transparent border-none outline-none text-sm text-white w-48 placeholder:text-slate-600" />
          </div>
        </div>
      </div>

      <div className="bg-[#111112] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#1A1A1B] text-slate-400 text-xs uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-center">Vehicles</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading customers...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No customers found for this branch.</td></tr>
              ) : customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserCircle size={32} className="text-slate-500" />
                      <div>
                        <div className="font-medium text-white">{customer.full_name || customer.username}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">VIP Member</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-slate-300"><Mail size={12} className="text-slate-500" /> {customer.email || 'N/A'}</span>
                      <span className="flex items-center gap-2 text-slate-400"><Phone size={12} className="text-slate-500" /> {customer.phone_number || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(customer.date_joined).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-white font-medium">
                      <Car size={14} className="text-[#35D07F]" /> {customer.vehicles_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-white transition-colors"><MoreVertical size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

