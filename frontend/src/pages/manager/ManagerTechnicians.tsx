import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Search, UserCircle, Phone, Mail, Clock, MoreVertical } from 'lucide-react';

export default function ManagerTechnicians() {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const res = await api.get('/manager/technicians/');
        setTechnicians(res.data);
      } catch (error) {
        console.error('Error fetching technicians', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTechnicians();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-wide">Technicians</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Manage workshop staff and track their performance.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg flex items-center px-3 py-2">
            <Search size={16} className="text-[var(--text-muted)] mr-2" />
            <input type="text" placeholder="Search technicians..." className="bg-transparent border-none outline-none text-sm text-[var(--text-primary)] w-48 placeholder:text-slate-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-[var(--text-muted)]">Loading technicians...</div>
        ) : technicians.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[var(--text-muted)]">No technicians found in this branch.</div>
        ) : (
          technicians.map((tech) => (
            <div key={tech.id} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors rounded-2xl p-6 relative group">
              <button className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-all">
                <MoreVertical size={16} />
              </button>
              
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 bg-[var(--bg-surface-hover)] rounded-full flex items-center justify-center mb-4">
                  <UserCircle size={40} className="text-[var(--text-muted)]" />
                </div>
                <h3 className="text-lg font-medium text-[var(--text-primary)]">{tech.full_name || tech.username}</h3>
                <span className="text-xs text-[#35D07F] font-bold tracking-widest uppercase mt-1">Senior Tech</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                  <Mail size={14} className="text-[var(--text-muted)]" />
                  <span className="truncate">{tech.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                  <Phone size={14} className="text-[var(--text-muted)]" />
                  <span>{tech.phone || 'No phone provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                  <Clock size={14} className="text-[var(--text-muted)]" />
                  <span>Joined {new Date(tech.date_joined).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] flex justify-between items-center">
                <div className="text-center flex-1 border-r border-[var(--border-subtle)]">
                  <div className="text-xs text-[var(--text-muted)] tracking-widest uppercase mb-1">Efficiency</div>
                  <div className="text-[var(--text-primary)] font-medium">{Math.floor(Math.random() * 20) + 80}%</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-xs text-[var(--text-muted)] tracking-widest uppercase mb-1">Active Jobs</div>
                  <div className="text-[var(--text-primary)] font-medium">{Math.floor(Math.random() * 4)}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


