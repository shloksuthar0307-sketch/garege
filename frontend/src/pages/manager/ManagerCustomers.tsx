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

    window.addEventListener('REFRESH_CUSTOMERS', fetchCustomers);
    return () => {
      window.removeEventListener('REFRESH_CUSTOMERS', fetchCustomers);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-wide">Customers</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Manage clients associated with your branch.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg flex items-center px-3 py-2">
            <Search size={16} className="text-[var(--text-muted)] mr-2" />
            <input type="text" placeholder="Search customers..." className="bg-transparent border-none outline-none text-sm text-[var(--text-primary)] w-48 placeholder:text-slate-600" />
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-secondary)]">
            <thead className="bg-[#1A1A1B] text-[var(--text-muted)] text-xs uppercase tracking-wider border-b border-[var(--border-subtle)]">
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
                <tr><td colSpan={5} className="px-6 py-8 text-center text-[var(--text-muted)]">Loading customers...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-[var(--text-muted)]">No customers found for this branch.</td></tr>
              ) : customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-[var(--bg-surface-hover)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserCircle size={32} className="text-[var(--text-muted)]" />
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">{customer.full_name || customer.username}</div>
                        <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-0.5">VIP Member</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-[var(--text-secondary)]"><Mail size={12} className="text-[var(--text-muted)]" /> {customer.email || 'N/A'}</span>
                      <span className="flex items-center gap-2 text-[var(--text-muted)]"><Phone size={12} className="text-[var(--text-muted)]" /> {customer.phone_number || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(customer.date_joined).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-surface-hover)] rounded-full text-[var(--text-primary)] font-medium">
                      <Car size={14} className="text-[#35D07F]" /> {customer.vehicles_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] rounded-md text-[var(--text-primary)] transition-colors"><MoreVertical size={16} /></button>
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


