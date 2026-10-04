import React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Search, Filter, Activity, Server, 
  ShieldAlert, UserCheck, AlertOctagon, Download, Eye, FileText
} from 'lucide-react';

const AUDIT_LOGS = [
  {
    id: 'LOG-88402', timestamp: '2026-09-22T14:32:15', actor: 'Shlok Mehta', role: 'Super Admin',
    action: 'Settings Modified', resource: 'Global Security Policy', status: 'Success',
    ip: '192.168.1.45', type: 'System'
  },
  {
    id: 'LOG-88401', timestamp: '2026-09-22T14:15:00', actor: 'Rahul Sharma', role: 'Technician',
    action: 'Status Updated', resource: 'Repair JOB-1045 (In Progress)', status: 'Success',
    ip: '10.0.0.12', type: 'Operation'
  },
  {
    id: 'LOG-88400', timestamp: '2026-09-22T13:45:22', actor: 'System', role: 'API Access',
    action: 'Failed Login', resource: 'Authentication Gateway', status: 'Failed',
    ip: '45.22.11.99', type: 'Security'
  },
  {
    id: 'LOG-88399', timestamp: '2026-09-22T11:20:05', actor: 'Amit Patel', role: 'Service Advisor',
    action: 'Invoice Generated', resource: 'INV-2601 (?57,500)', status: 'Success',
    ip: '192.168.1.104', type: 'Finance'
  },
  {
    id: 'LOG-88398', timestamp: '2026-09-22T10:15:00', actor: 'Shlok Mehta', role: 'Super Admin',
    action: 'User Login', resource: 'Dashboard App', status: 'Success',
    ip: '192.168.1.45', type: 'Security'
  },
  {
    id: 'LOG-88397', timestamp: '2026-09-21T18:30:00', actor: 'System Backup', role: 'Cron Job',
    action: 'Database Snapshot', resource: 'db_dump_20260921.sql', status: 'Success',
    ip: 'localhost', type: 'System'
  },
  {
    id: 'LOG-88396', timestamp: '2026-09-21T16:45:12', actor: 'Vikram Singh', role: 'Customer',
    action: 'Estimate Rejected', resource: 'EST-4001', status: 'Success',
    ip: '188.14.99.2', type: 'Operation'
  }
];

const TYPE_CONFIG: Record<string, { icon: any, color: string }> = {
  'System': { icon: Server, color: 'text-purple-400' },
  'Operation': { icon: Activity, color: 'text-blue-400' },
  'Security': { icon: ShieldAlert, color: 'text-rose-400' },
  'Finance': { icon: FileText, color: 'text-[#35D07F]' },
};

export default function AdminAuditLogs() {
  const downloadLogsAsCSV = () => {
    const headers = ['ID', 'Timestamp', 'Actor', 'Role', 'Action', 'Resource', 'Status', 'IP', 'Type'];
    const csvRows = [headers.join(',')];

    for (const log of AUDIT_LOGS) {
      const row = [
        log.id,
        log.timestamp,
        `"${log.actor}"`,
        `"${log.role}"`,
        `"${log.action}"`,
        `"${log.resource}"`,
        log.status,
        log.ip,
        log.type
      ];
      csvRows.push(row.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight">System Audit Logs</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Immutable ledger of all system events, authentication attempts, and data modifications.</p>
        </div>
        <button 
          onClick={downloadLogsAsCSV}
          className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] hover:border-white/30 text-[var(--text-primary)] px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
        >
          <Download size={16} />
          Export Logs
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Events (24h)</span>
            <span className="text-xl text-[var(--text-primary)] font-light">4,192</span>
          </div>
          <div className="w-px h-8 bg-[var(--bg-surface-active)] mx-2"></div>
          <div className="flex flex-col">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Security Alerts</span>
            <div className="flex items-center gap-1.5">
              <AlertOctagon size={14} className="text-rose-400" />
              <span className="text-xl text-rose-400 font-light">12</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search by ID, IP, or Actor..." 
              className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
            />
          </div>
          <button 
            onClick={() => toast("Advanced filtering options will be loaded.", { icon: "??" })}
            className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border-default)] hover:border-white/30 text-[var(--text-secondary)] px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Filter size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Content Area */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Actor</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Event Action</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Resource / Target</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">IP Address</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-sm">
              {AUDIT_LOGS.map((log) => {
                const TypeIcon = TYPE_CONFIG[log.type].icon;
                return (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[var(--text-secondary)]">
                        {new Date(log.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-sans font-medium text-[var(--text-primary)] group-hover:text-[#35D07F] transition-colors cursor-pointer">{log.actor}</div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-0.5 uppercase tracking-widest font-sans">{log.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <TypeIcon size={14} className={TYPE_CONFIG[log.type].color} />
                        <span className="text-[var(--text-secondary)] font-sans">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-[var(--bg-surface-hover)] border border-[var(--border-default)] px-2 py-1 rounded text-xs text-[var(--text-secondary)]">
                        {log.resource}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[var(--text-muted)] text-xs">{log.ip}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.status === 'Success' ? (
                        <div className="flex items-center gap-1.5 text-[#35D07F]">
                          <UserCheck size={14} />
                          <span className="text-[10px] font-bold font-sans uppercase tracking-widest">Success</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-500">
                          <AlertOctagon size={14} />
                          <span className="text-[10px] font-bold font-sans uppercase tracking-widest">Failed</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button 
                        onClick={() => toast(`Showing JSON payload for Event ID: ${log.id}`)}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-[var(--border-subtle)] flex items-center justify-between font-sans text-sm text-[var(--text-muted)]">
          <span>Showing latest 50 events</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => toast("You are on the first page.")}
                className="px-3 py-1 rounded border border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)] transition-colors"
              >
                Prev
              </button>
              <button 
                onClick={() => toast("Loading older events from S3 cold storage...")}
                className="px-3 py-1 rounded border border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)] transition-colors"
              >
                Next
              </button>
            </div>
        </div>
      </motion.div>

    </div>
  );
}


