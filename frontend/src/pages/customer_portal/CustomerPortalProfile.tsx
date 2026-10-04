import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Camera, Save, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerPortalProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('repairtrace_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore JSON parse error
      }
    }
    return {
      firstName: 'Shlok',
      lastName: 'Mehta',
      email: 'shlok@example.com',
      phone: '+91 98765 43210',
      address: '123 Premium Auto Way, Tech District',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      avatar: ''
    };
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    localStorage.setItem('repairtrace_profile', JSON.stringify(profileData));
    toast.success('Profile updated successfully', {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const newData = { ...profileData, avatar: result };
        setProfileData(newData);
        localStorage.setItem('repairtrace_profile', JSON.stringify(newData));
        toast.success('Profile photo updated', {
          style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
          iconTheme: { primary: '#35D07F', secondary: '#000' }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto pb-10 min-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <User className="text-[#35D07F]" size={28} />
            My Profile
          </h1>
          <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">
            Manage your personal information and contact details.
          </p>
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsEditing(!isEditing)}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2 border ${
            isEditing 
              ? 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)] border-[var(--border-default)] hover:bg-[var(--bg-surface-active)]' 
              : 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--bg-surface-active)]'
          }`}
        >
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Avatar & Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-4 space-y-4"
        >
          <div className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl p-8 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#35D07F]/10 to-transparent"></div>
            
            <div className="relative mb-6 mt-4 group">
              <div className="w-32 h-32 rounded-full border-2 border-[var(--border-default)] bg-[var(--bg-secondary)] flex items-center justify-center relative overflow-hidden">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-slate-600" />
                )}
                {/* Hover overlay for clicking the whole image */}
                <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-[var(--bg-input)] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                  <Camera size={24} className="text-[var(--text-primary)]" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-full shadow-[0_0_15px_rgba(53,208,127,0.3)] transition-colors z-10"
              >
                <Camera size={16} />
              </button>
            </div>
            
            <h2 className="text-2xl font-bold tracking-widest text-[var(--text-primary)] uppercase mb-1">{profileData.firstName} {profileData.lastName}</h2>
            <div className="flex items-center gap-2 text-[#35D07F] text-[10px] font-bold tracking-widest uppercase mb-6">
              <CheckCircle2 size={12} /> Premium Member
            </div>
            
            <div className="w-full space-y-4 text-left border-t border-[var(--border-subtle)] pt-6">
              <div>
                <span className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-1 block">Member Since</span>
                <span className="text-[var(--text-primary)] text-sm font-mono tracking-wider">Jan 2024</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-1 block">Account ID</span>
                <span className="text-[var(--text-primary)] text-sm font-mono tracking-wider">CST-882194</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Form */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-8 bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl p-8"
        >
          <form onSubmit={handleSave} className="space-y-8">
            {/* Personal Details */}
            <div>
              <h3 className="text-sm font-bold tracking-widest uppercase text-[var(--text-primary)] mb-6 border-b border-[var(--border-subtle)] pb-4">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-2 block">First Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                      <User size={16} />
                    </div>
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl py-3 pl-11 pr-4 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#35D07F]/50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-2 block">Last Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                      <User size={16} />
                    </div>
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl py-3 pl-11 pr-4 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#35D07F]/50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-2 block">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                      <Mail size={16} />
                    </div>
                    <input 
                      type="email" 
                      disabled={!isEditing}
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl py-3 pl-11 pr-4 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#35D07F]/50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-2 block">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                      <Phone size={16} />
                    </div>
                    <input 
                      type="tel" 
                      disabled={!isEditing}
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl py-3 pl-11 pr-4 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#35D07F]/50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-sm font-bold tracking-widest uppercase text-[var(--text-primary)] mb-6 border-b border-[var(--border-subtle)] pb-4">Home Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-2 block">Street Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 pt-3.5 pointer-events-none text-[var(--text-muted)]">
                      <MapPin size={16} />
                    </div>
                    <input 
                      type="text"
                      disabled={!isEditing}
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl py-3 pl-11 pr-4 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#35D07F]/50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-2 block">City</label>
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    value={profileData.city}
                    onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl py-3 px-4 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#35D07F]/50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-2 block">State</label>
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={profileData.state}
                      onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl py-3 px-4 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#35D07F]/50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-2 block">Zip Code</label>
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={profileData.zipCode}
                      onChange={(e) => setProfileData({...profileData, zipCode: e.target.value})}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl py-3 px-4 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#35D07F]/50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <AnimatePresence>
              {isEditing && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-4 border-t border-[var(--border-subtle)] flex justify-end"
                >
                  <button 
                    type="submit"
                    className="flex items-center gap-2 px-8 py-3 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(53,208,127,0.3)]"
                  >
                    <Save size={16} /> Save Changes
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </div>
  );
}


