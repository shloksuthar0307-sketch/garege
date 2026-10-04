import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/admin';
import { 
  Search, Filter, Plus, Shield, 
  MoreHorizontal, Mail, Lock, ShieldAlert, Key, Fingerprint, Loader2
} from 'lucide-react';

const ROLE_COLORS: Record<string, { bg: string, text: string, icon: any }> = {
  'SUPER_ADMIN': { bg: 'bg-[#35D07F]/10 border-[#35D07F]/20', text: 'text-[#35D07F]', icon: ShieldAlert },
  'ORG_ADMIN': { bg: 'bg-[#35D07F]/10 border-[#35D07F]/20', text: 'text-[#35D07F]', icon: ShieldAlert },
  'SERVICE_ADVISOR': { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', icon: Shield },
  'BRANCH_MANAGER': { bg: 'bg-indigo-500/10 border-indigo-500/20', text: 'text-indigo-400', icon: Shield },
  'TECHNICIAN': { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', icon: Key },
  'CUSTOMER': { bg: 'bg-slate-500/10 border-slate-500/20', text: 'text-[var(--text-muted)]', icon: Fingerprint },
  'API Access': { bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-400', icon: Lock },
};

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
  });

  const { data: stats = { total: 0, admins: 0 }, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: adminApi.getUserStats,
  });

  const filteredUsers = users.filter((user: any) => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight">Users & Roles</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage system access, RBAC permissions, and security policies.</p>
        </div>
          <button 
            onClick={() => {
              const email = window.prompt("Enter email address to invite to the platform:");
              if (email) {
                adminApi.inviteUser(email).then(res => {
                  toast.success(res.message || `Invite successfully sent to ${email}`);
                }).catch(() => {
                  toast.error('Failed to send invite');
                });
              }
            }}
            className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
          >
            <Plus size={16} />
            Invite User
          </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Total Accounts</span>
            <span className="text-xl text-[var(--text-primary)] font-light">{statsLoading ? <Loader2 size={16} className="animate-spin inline" /> : stats.total}</span>
          </div>
          <div className="w-px h-8 bg-[var(--bg-surface-active)] mx-2"></div>
          <div className="flex flex-col">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Admins</span>
            <div className="flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-[#35D07F]" />
              <span className="text-xl text-[#35D07F] font-light">{statsLoading ? <Loader2 size={16} className="animate-spin inline" /> : stats.admins}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, role..." 
              className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors"
            />
          </div>
            <button 
              onClick={() => toast("Role filters will be populated from the backend.", { icon: "??" })}
              className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border-default)] hover:border-white/30 text-[var(--text-secondary)] px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              <Filter size={16} />
              Roles
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
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">User Identity</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Contact</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Role / Access Level</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase text-center">Security</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Last Login</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {usersLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--text-muted)]">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--text-muted)]">
                    No users found matching your search.
                  </td>
                </tr>
              ) : filteredUsers.map((user: any) => {
                const roleConfig = ROLE_COLORS[user.role] || ROLE_COLORS['CUSTOMER'];
                const RoleIcon = roleConfig.icon;
                return (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-[var(--border-default)]" />
                        <div>
                          <div className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[#35D07F] transition-colors cursor-pointer">{user.name}</div>
                          <div className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">{user.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <Mail size={12} className="text-[var(--text-muted)]" /> {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={'flex items-center gap-1.5 px-2.5 py-1 rounded-full border w-fit ' + roleConfig.bg + ' ' + roleConfig.text}>
                        <RoleIcon size={12} />
                        <span className="text-[11px] font-bold uppercase tracking-widest">{user.role_display}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {user.mfa ? (
                        <div className="inline-flex items-center gap-1 text-[10px] text-[#35D07F] bg-[#35D07F]/10 px-2 py-1 rounded border border-[#35D07F]/20 font-bold uppercase tracking-widest">
                          <Lock size={10} /> MFA ON
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)] bg-[var(--bg-surface-hover)] px-2 py-1 rounded border border-[var(--border-default)] uppercase tracking-widest">
                          MFA OFF
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-secondary)]">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        {user.last_login ? new Date(user.last_login).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm">
                        <div className={'w-2 h-2 rounded-full ' + (user.status === 'Active' ? 'bg-[#35D07F]' : 'bg-rose-500')}></div>
                        <span className={user.status === 'Active' ? 'text-[var(--text-secondary)]' : 'text-rose-400'}>{user.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toast.error(`Settings for user ${user.name} are locked.`)}
                          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] transition-colors"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-sm text-[var(--text-muted)]">
          <span>Showing {filteredUsers.length} accounts</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => toast("You are on the first page.")}
                className="px-3 py-1 rounded border border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)] transition-colors"
              >
                Prev
              </button>
              <button 
                onClick={() => toast("You are on the last page.")}
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


