import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Search, MessageSquare, AlertCircle, Clock, CheckCircle2, MoreVertical, Filter } from 'lucide-react';

export default function ManagerCustomerIssues() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await api.get('/manager/customer-issues/');
        setIssues(res.data);
      } catch (error) {
        console.error('Error fetching issues', error);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-wide">Customer Issues</h1>
          <p className="text-slate-400 text-sm mt-1">Track and resolve complaints, feedback, and service escalations.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-[#111112] border border-white/10 rounded-lg flex items-center px-3 py-2">
            <Search size={16} className="text-slate-400 mr-2" />
            <input type="text" placeholder="Search issues..." className="bg-transparent border-none outline-none text-sm text-white w-48 placeholder:text-slate-600" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#111112] border border-white/10 hover:bg-white/5 text-white rounded-lg text-sm transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="bg-[#111112] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#1A1A1B] text-slate-400 text-xs uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Ticket ID</th>
                <th className="px-6 py-4 font-medium">Customer & Details</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading issues...</td></tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <CheckCircle2 size={48} className="text-emerald-500/20 mb-4" />
                      <div className="text-white font-medium mb-1">No Active Issues</div>
                      <div className="text-slate-500">All customer concerns have been resolved.</div>
                    </div>
                  </td>
                </tr>
              ) : issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-mono text-white">{issue.ticket_number}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white mb-1">{issue.description.length > 50 ? issue.description.substring(0, 50) + '...' : issue.description}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <Clock size={12} /> {new Date(issue.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">{issue.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                      issue.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400' :
                      issue.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-400' :
                      issue.priority === 'LOW' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase w-max ${
                      issue.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {issue.status === 'RESOLVED' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-white transition-colors"><MessageSquare size={16} /></button>
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

