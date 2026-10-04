import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Building2, ShieldCheck, Key, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ManagerProfile() {
  const navigate = useNavigate();
  const [profile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'BRANCH_MANAGER',
    branch: '',
    location: '',
    joinDate: ''
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-wide">My Profile</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Manage your account settings and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Basic Info */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-[var(--border-default)] flex items-center justify-center text-3xl font-bold text-[var(--text-primary)] shadow-xl mb-4 relative">
              {profile.firstName[0]}{profile.lastName[0]}
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#35D07F] rounded-full border-2 border-[#111112]"></div>
            </div>
            <h2 className="text-xl font-medium text-[var(--text-primary)]">{profile.firstName} {profile.lastName}</h2>
            <p className="text-sm text-[#35D07F] font-medium tracking-wider uppercase mt-1">{profile.role.replace('_', ' ')}</p>
            
            <div className="w-full h-px bg-[var(--bg-surface-hover)] my-6"></div>
            
            <div className="w-full space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <Building2 size={16} />
                <span>{profile.branch}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <MapPin size={16} />
                <span>{profile.location}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <ShieldCheck size={16} />
                <span>Joined {profile.joinDate}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => {
              localStorage.removeItem('repairtrace_token');
              localStorage.removeItem('repairtrace_role');
              navigate('/auth/login');
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors font-medium border border-red-500/10"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Right Column: Details & Settings */}
        <div className="md:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-6">Contact Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">First Name</label>
                  <input type="text" defaultValue={profile.firstName} className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)] transition-colors" readOnly />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Last Name</label>
                  <input type="text" defaultValue={profile.lastName} className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)] transition-colors" readOnly />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input type="email" defaultValue={profile.email} className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)] transition-colors" readOnly />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input type="tel" defaultValue={profile.phone} className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)] transition-colors" readOnly />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="px-4 py-2 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] rounded-lg text-sm transition-colors border border-[var(--border-default)]">
                Request Update
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-6">Security Settings</h3>
            <div className="flex items-center justify-between p-4 border border-[var(--border-subtle)] rounded-xl bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Key size={18} className="text-blue-400" />
                </div>
                <div>
                  <h4 className="text-[var(--text-primary)] font-medium text-sm">Account Password</h4>
                  <p className="text-[var(--text-muted)] text-xs mt-0.5">Last changed 3 months ago</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] rounded-lg text-xs transition-colors border border-[var(--border-default)]">
                Change
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


