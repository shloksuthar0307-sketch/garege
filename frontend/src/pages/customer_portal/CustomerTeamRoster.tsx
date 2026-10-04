import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Filter, UserPlus, Shield, Mail, Phone, Car, CheckCircle2, Clock, Edit2, Trash2, X, ChevronRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const ROSTER: any[] = [];

export default function CustomerTeamRoster() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Filter state
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterRole, setFilterRole] = useState('All');
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredRoster = ROSTER.filter(member => {
    const matchesSearch = `${member.name} ${member.email} ${member.role}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'All' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Owner': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Fleet Manager': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] border-[var(--border-default)]';
    }
  };

  const handleSendInvite = () => {
    toast.success('Invitation email sent successfully!', {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
    setShowInviteModal(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <Users className="text-[#35D07F]" size={28} />
            Team Roster
          </h1>
          <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">
            Manage organization members, drivers, and access roles.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH MEMBERS..." 
              className="pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] uppercase tracking-widest focus:border-[#35D07F] outline-none transition-all w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative" ref={filterMenuRef}>
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center justify-center p-2.5 border rounded-xl transition-all ${
                showFilterMenu || filterRole !== 'All' 
                  ? 'bg-[var(--bg-surface-active)] border-white/30 text-[var(--text-primary)]' 
                  : 'bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Filter size={18} />
              {filterRole !== 'All' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#35D07F]"></span>
              )}
            </button>

            <AnimatePresence>
              {showFilterMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-3 w-56 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl shadow-2xl p-5 z-20"
                >
                  <h3 className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-4 flex items-center justify-between">
                    Filter by Role
                    {filterRole !== 'All' && (
                      <span onClick={() => setFilterRole('All')} className="text-[#35D07F] cursor-pointer hover:underline">Reset</span>
                    )}
                  </h3>
                  <div className="space-y-3">
                    {['All', 'Owner', 'Fleet Manager', 'Driver'].map(role => (
                      <label key={role} className="flex items-center gap-3 cursor-pointer group" onClick={() => setFilterRole(role)}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          filterRole === role ? 'border-[#35D07F] bg-[#35D07F]' : 'border-[var(--border-strong)] group-hover:border-[#35D07F]/50'
                        }`}>
                          {filterRole === role && <Check size={12} className="text-black" />}
                        </div>
                        <span className={`text-xs tracking-wider transition-colors ${filterRole === role ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'}`}>
                          {role}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(53,208,127,0.3)]"
          >
            <UserPlus size={16} /> Invite Member
          </button>
        </motion.div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Members', value: '4', icon: Users, color: 'text-[var(--text-primary)]' },
          { label: 'Active Drivers', value: '3', icon: Car, color: 'text-[#35D07F]' },
          { label: 'Pending Invites', value: '1', icon: Mail, color: 'text-amber-400' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (i * 0.1) }}
            className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-1">{stat.label}</p>
              <h3 className={`text-2xl font-bold tracking-widest ${stat.color}`}>{stat.value}</h3>
            </div>
            <div className="w-12 h-12 bg-[var(--bg-surface-hover)] rounded-full flex items-center justify-center text-[var(--text-muted)]">
              <stat.icon size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Roster List */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl overflow-hidden"
      >
        <div className="hidden lg:grid grid-cols-12 gap-4 p-6 border-b border-[var(--border-subtle)] text-[var(--text-muted)] text-[10px] font-bold tracking-[0.2em] uppercase bg-white/[0.02]">
          <div className="col-span-4">Member</div>
          <div className="col-span-3">Contact</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Access</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {filteredRoster.length > 0 ? (
          <div className="divide-y divide-white/5">
            {filteredRoster.map((member) => (
              <div key={member.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-6 items-center hover:bg-white/[0.02] transition-colors group">
                
                {/* Member Info */}
                <div className="col-span-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-[var(--text-primary)] font-bold tracking-wider shadow-lg bg-gradient-to-br ${member.gradient}`}>
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="text-[var(--text-primary)] font-bold tracking-widest text-sm mb-1">{member.name}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                      {member.status === 'Active' ? (
                        <span className="text-[#35D07F] flex items-center gap-1"><CheckCircle2 size={12} /> Active</span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1"><Clock size={12} /> Pending</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs tracking-wider">
                    <Mail size={14} className="text-[var(--text-muted)]" /> {member.email}
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] tracking-widest uppercase">
                    <Phone size={14} className="text-[var(--text-muted)]" /> {member.phone}
                  </div>
                </div>

                {/* Role */}
                <div className="col-span-2">
                  <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5 ${getRoleBadge(member.role)}`}>
                    <Shield size={12} /> {member.role}
                  </span>
                </div>

                {/* Access */}
                <div className="col-span-2 flex items-center gap-2 text-[var(--text-secondary)] text-xs tracking-widest">
                  <Car size={16} className="text-[#35D07F]" /> 
                  {member.assignedVehicles} {member.assignedVehicles === 1 ? 'Vehicle' : 'Vehicles'}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 bg-[var(--bg-surface-hover)] hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-400 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[var(--bg-surface-hover)] rounded-full flex items-center justify-center text-[var(--text-muted)] mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-[var(--text-primary)] font-bold tracking-widest uppercase mb-2">No Members Found</h3>
            <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">We couldn't find any members matching your filter.</p>
          </div>
        )}
      </motion.div>

      {/* Invite Member Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm" 
              onClick={() => setShowInviteModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-[var(--bg-primary)] border border-[var(--border-default)] p-8 rounded-2xl z-10 w-full max-w-lg shadow-2xl relative"
            >
              <button onClick={() => setShowInviteModal(false)} className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <X size={20} />
              </button>
              
              <h2 className="text-[var(--text-primary)] text-xl font-bold tracking-widest uppercase mb-2 flex items-center gap-3">
                <UserPlus className="text-[#35D07F]" size={24} /> Invite Team Member
              </h2>
              <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest mb-8">
                Send an email invitation to grant platform access.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-2 block">First Name</label>
                  <input type="text" placeholder="e.g. Jane" className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3.5 text-[var(--text-primary)] text-sm outline-none focus:border-[#35D07F] transition-colors" />
                </div>
                <div>
                  <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-2 block">Last Name</label>
                  <input type="text" placeholder="e.g. Doe" className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3.5 text-[var(--text-primary)] text-sm outline-none focus:border-[#35D07F] transition-colors" />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-2 block">Email Address</label>
                <input 
                  type="email" 
                  placeholder="jane.doe@example.com" 
                  className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3.5 text-[var(--text-primary)] text-sm outline-none focus:border-[#35D07F] transition-colors placeholder:text-slate-600"
                />
              </div>

              <div className="mb-8">
                <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-2 block">Assign Role</label>
                <div className="relative">
                  <select className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3.5 text-[var(--text-primary)] text-sm outline-none focus:border-[#35D07F] transition-colors appearance-none cursor-pointer">
                    <option value="driver" className="bg-[var(--bg-secondary)]">Driver (Basic Access)</option>
                    <option value="manager" className="bg-[var(--bg-secondary)]">Fleet Manager (Moderate Access)</option>
                    <option value="owner" className="bg-[var(--bg-secondary)]">Owner (Full Access)</option>
                  </select>
                  <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] rotate-90 pointer-events-none" />
                </div>
              </div>

              <button 
                onClick={handleSendInvite} 
                className="w-full py-4 bg-[#35D07F] hover:bg-[#2bb46c] text-black font-bold tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(53,208,127,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <Mail size={18} /> Send Invitation
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


