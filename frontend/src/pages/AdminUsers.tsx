import React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Search, Filter, Plus, Shield, 
  MoreHorizontal, Mail, Lock, ShieldAlert, Key, Fingerprint
} from 'lucide-react';

const USERS = [
  {
    id: 'USR-001', name: 'Shlok Mehta', email: 'shlok@admin.com', role: 'Super Admin',
    status: 'Active', lastLogin: '2026-09-22T10:15:00', mfa: true,
    avatar: 'https://ui-avatars.com/api/?name=Shlok+Mehta&background=35D07F&color=000'
  },
  {
    id: 'USR-002', name: 'Amit Patel', email: 'amit@repairtrace.com', role: 'Service Advisor',
    status: 'Active', lastLogin: '2026-09-22T08:30:00', mfa: true,
    avatar: 'https://ui-avatars.com/api/?name=Amit+Patel&background=111112&color=fff'
  },
  {
    id: 'USR-003', name: 'Rahul Sharma', email: 'rahul@repairtrace.com', role: 'Technician',
    status: 'Active', lastLogin: '2026-09-21T09:00:00', mfa: false,
    avatar: 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=111112&color=fff'
  },
  {
    id: 'USR-004', name: 'Vikram Singh', email: 'vikram.singh@enterprise.com', role: 'Customer',
    status: 'Active', lastLogin: '2026-09-15T14:20:00', mfa: false,
    avatar: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=111112&color=fff'
  },
  {
    id: 'USR-005', name: 'System Service', email: 'api@repairtrace.com', role: 'API Access',
    status: 'Suspended', lastLogin: '2026-01-01T00:00:00', mfa: false,
    avatar: 'https://ui-avatars.com/api/?name=API+Key&background=ef4444&color=fff'
  }
];

const ROLE_COLORS: Record<string, { bg: string, text: string, icon: React.ElementType }> = {
  'Super Admin': { bg: 'bg-[#35D07F]/10 border-[#35D07F]/20', text: 'text-[#35D07F]', icon: ShieldAlert },
  'Service Advisor': { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', icon: Shield },
  'Technician': { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', icon: Key },
  'Customer': { bg: 'bg-slate-500/10 border-slate-500/20', text: 'text-slate-400', icon: Fingerprint },
  'API Access': { bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-400', icon: Lock },
};

export default function AdminUsers() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">Users & Roles</h1>
          <p className="text-sm text-slate-500 mt-1">Manage system access, RBAC permissions, and security policies.</p>
        </div>
          <button 
            onClick={() => {
              const email = window.prompt("Enter email address to invite to the platform:");
              if (email) {
                toast.success(`Invite successfully sent to ${email}`);
              }
            }}
            className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
          >
            <Plus size={16} />
            Invite User
          </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#111112] border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Total Accounts</span>
            <span className="text-xl text-white font-light">1,204</span>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2"></div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Admins</span>
            <div className="flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-[#35D07F]" />
              <span className="text-xl text-[#35D07F] font-light">4</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by name, email, role..." 
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D07F] transition-colors"
            />
          </div>
            <button 
              onClick={() => toast("Role filters will be populated from the backend.", { icon: "??" })}
              className="flex items-center gap-2 bg-black/50 border border-white/10 hover:border-white/30 text-slate-300 px-4 py-2.5 rounded-xl text-sm transition-colors"
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
        className="bg-[#111112] border border-white/5 rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">User Identity</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Contact</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Role / Access Level</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase text-center">Security</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Last Login</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {USERS.map((user) => {
                const RoleIcon = ROLE_COLORS[user.role].icon;
                return (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-white/10" />
                        <div>
                          <div className="text-sm font-medium text-white group-hover:text-[#35D07F] transition-colors cursor-pointer">{user.name}</div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <Mail size={12} className="text-slate-500" /> {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={'flex items-center gap-1.5 px-2.5 py-1 rounded-full border w-fit ' + ROLE_COLORS[user.role].bg + ' ' + ROLE_COLORS[user.role].text}>
                        <RoleIcon size={12} />
                        <span className="text-[11px] font-bold uppercase tracking-widest">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {user.mfa ? (
                        <div className="inline-flex items-center gap-1 text-[10px] text-[#35D07F] bg-[#35D07F]/10 px-2 py-1 rounded border border-[#35D07F]/20 font-bold uppercase tracking-widest">
                          <Lock size={10} /> MFA ON
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/10 uppercase tracking-widest">
                          MFA OFF
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">
                        {new Date(user.lastLogin).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(user.lastLogin).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm">
                        <div className={'w-2 h-2 rounded-full ' + (user.status === 'Active' ? 'bg-[#35D07F]' : 'bg-rose-500')}></div>
                        <span className={user.status === 'Active' ? 'text-slate-300' : 'text-rose-400'}>{user.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toast.error(`Settings for user ${user.name} are locked.`)}
                          className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
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
        
        <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-slate-500">
          <span>Showing {USERS.length} accounts</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => toast("You are on the first page.")}
                className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors"
              >
                Prev
              </button>
              <button 
                onClick={() => toast("You are on the last page.")}
                className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors"
              >
                Next
              </button>
            </div>
        </div>
      </motion.div>

    </div>
  );
}

