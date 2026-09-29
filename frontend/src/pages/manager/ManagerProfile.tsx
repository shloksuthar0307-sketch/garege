import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Building2, ShieldCheck, Key, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ManagerProfile() {
  const navigate = useNavigate();
  // We'll mock the profile data for now. In a real app, this would be fetched from the API.
  const [profile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@repairtrace.com',
    phone: '+1 (555) 019-8234',
    role: 'BRANCH_MANAGER',
    branch: 'Downtown Service Center',
    location: '123 Auto Way, Metro City',
    joinDate: 'October 12, 2024'
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-wide">My Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your account settings and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Basic Info */}
        <div className="space-y-6">
          <div className="bg-[#111112] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center text-3xl font-bold text-white shadow-xl mb-4 relative">
              {profile.firstName[0]}{profile.lastName[0]}
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#35D07F] rounded-full border-2 border-[#111112]"></div>
            </div>
            <h2 className="text-xl font-medium text-white">{profile.firstName} {profile.lastName}</h2>
            <p className="text-sm text-[#35D07F] font-medium tracking-wider uppercase mt-1">{profile.role.replace('_', ' ')}</p>
            
            <div className="w-full h-px bg-white/5 my-6"></div>
            
            <div className="w-full space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Building2 size={16} />
                <span>{profile.branch}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <MapPin size={16} />
                <span>{profile.location}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
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
          <div className="bg-[#111112] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-white mb-6">Contact Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">First Name</label>
                  <input type="text" defaultValue={profile.firstName} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/20 transition-colors" readOnly />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Last Name</label>
                  <input type="text" defaultValue={profile.lastName} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/20 transition-colors" readOnly />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="email" defaultValue={profile.email} className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-white/20 transition-colors" readOnly />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="tel" defaultValue={profile.phone} className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-white/20 transition-colors" readOnly />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm transition-colors border border-white/10">
                Request Update
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="bg-[#111112] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-white mb-6">Security Settings</h3>
            <div className="flex items-center justify-between p-4 border border-white/5 rounded-xl bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Key size={18} className="text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">Account Password</h4>
                  <p className="text-slate-500 text-xs mt-0.5">Last changed 3 months ago</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs transition-colors border border-white/10">
                Change
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

