import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Award, Shield, Settings, Camera, Clock, CheckCircle2, Star, Lock, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProfileStore } from '../store/useProfileStore';

export default function TechnicianProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const { profileImage, setProfileImage } = useProfileStore();
  const [profile, setProfile] = useState({
    name: 'Vikram Singh',
    role: 'Senior Diagnostic Technician',
    email: 'vikram.singh@repairtrace.com',
    phone: '+91 98765 43210',
    location: 'Mumbai Workshop - Bay 4',
    specialty: 'European Vehicles & Electronics'
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
      {/* Header Profile Card */}
      <div className="bg-[#111112] border border-white/5 rounded-2xl overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#35D07F]/20 to-black relative">
          <div className="absolute -bottom-12 left-8 flex items-end gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#111112] bg-zinc-800">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-slate-500">
                    <User size={32} />
                  </div>
                )}
              </div>
              <button onClick={() => setShowPhotoModal(true)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                <Camera size={20} className="text-white" />
              </button>
            </div>
            <div className="mb-2">
              <h1 className="text-2xl font-light text-white">{profile.name}</h1>
              <p className="text-[#35D07F] text-sm font-medium">{profile.role}</p>
            </div>
          </div>
        </div>
        
        <div className="pt-16 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5">
          <div className="flex gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">Jobs Completed</span>
              <span className="text-xl text-white">1,245</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">Efficiency</span>
              <span className="text-xl text-white">96%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">Rating</span>
              <span className="text-xl text-amber-400 flex items-center gap-1">4.9 <Star size={14} className="fill-amber-400" /></span>
            </div>
          </div>
          
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`px-6 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors ${
              isEditing ? 'bg-[#35D07F] text-black hover:bg-[#2EB86F]' : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#111112] border border-white/5 rounded-2xl p-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-widest uppercase text-slate-500 flex items-center gap-2"><Mail size={12} /> Email Address</label>
                {isEditing ? (
                  <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#35D07F]" />
                ) : (
                  <div className="text-slate-300 text-sm">{profile.email}</div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-widest uppercase text-slate-500 flex items-center gap-2"><Phone size={12} /> Phone Number</label>
                {isEditing ? (
                  <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#35D07F]" />
                ) : (
                  <div className="text-slate-300 text-sm">{profile.phone}</div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-widest uppercase text-slate-500 flex items-center gap-2"><MapPin size={12} /> Work Location</label>
                {isEditing ? (
                  <input type="text" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#35D07F]" />
                ) : (
                  <div className="text-slate-300 text-sm">{profile.location}</div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-widest uppercase text-slate-500 flex items-center gap-2"><Award size={12} /> Primary Specialty</label>
                {isEditing ? (
                  <input type="text" value={profile.specialty} onChange={e => setProfile({...profile, specialty: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#35D07F]" />
                ) : (
                  <div className="text-slate-300 text-sm">{profile.specialty}</div>
                )}
              </div>

            </div>
          </div>

          <div className="bg-[#111112] border border-white/5 rounded-2xl p-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Account Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/50 border border-white/5 rounded-xl">
                <div>
                  <div className="text-sm text-white font-medium">Two-Factor Authentication</div>
                  <div className="text-xs text-slate-500">{is2FAEnabled ? 'Your account is secured with 2FA' : 'Secure your account with 2FA'}</div>
                </div>
                <button 
                  onClick={() => {
                    setIs2FAEnabled(!is2FAEnabled);
                    toast.success(is2FAEnabled ? '2FA disabled.' : '2FA enabled successfully!');
                  }}
                  className={`text-xs font-bold tracking-widest uppercase transition-colors ${is2FAEnabled ? 'text-amber-500' : 'text-[#35D07F]'}`}
                >
                  {is2FAEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-black/50 border border-white/5 rounded-xl">
                <div>
                  <div className="text-sm text-white font-medium">Change Password</div>
                  <div className="text-xs text-slate-500">Update your login password</div>
                </div>
                <button onClick={() => setShowPasswordModal(true)} className="text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-white">Update</button>
              </div>
            </div>
          </div>
        </div>

        {/* Certifications Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#111112] border border-white/5 rounded-2xl p-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2"><Shield size={14} className="text-[#35D07F]" /> Certifications</h3>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded bg-[#35D07F]/10 flex items-center justify-center text-[#35D07F] shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div className="text-sm text-white font-medium">ASE Master Technician</div>
                  <div className="text-xs text-slate-500">Issued: Jan 2024 &bull; Valid</div>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded bg-[#35D07F]/10 flex items-center justify-center text-[#35D07F] shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div className="text-sm text-white font-medium">EV Safety Level 3</div>
                  <div className="text-xs text-slate-500">Issued: Mar 2025 &bull; Valid</div>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-slate-500 shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <div className="text-sm text-white font-medium">Advanced Diagnostics</div>
                  <div className="text-xs text-amber-500">Expiring Soon</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPhotoModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111112] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-white font-medium flex items-center gap-2"><Camera size={16} className="text-[#35D07F]" /> Update Profile Photo</h2>
                <button onClick={() => setShowPhotoModal(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                
                <label className="flex items-center justify-center gap-3 w-full bg-black border border-white/10 hover:border-[#35D07F]/50 hover:bg-white/5 text-white py-3 rounded-xl font-bold uppercase tracking-widest transition-colors cursor-pointer text-sm">
                  <Camera size={16} />
                  Upload New Photo
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setProfileImage(event.target.result as string);
                          setShowPhotoModal(false);
                          toast.success('Profile photo updated!');
                        }
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }} />
                </label>

                <button 
                  onClick={() => {
                    setProfileImage('');
                    setShowPhotoModal(false);
                    toast.success('Profile photo removed.');
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl font-bold uppercase tracking-widest transition-colors text-sm"
                >
                  <X size={16} />
                  Remove Photo
                </button>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111112] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-white font-medium flex items-center gap-2"><Lock size={16} className="text-[#35D07F]" /> Change Password</h2>
                <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 mb-2">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#35D07F]" />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 mb-2">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#35D07F]" />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 mb-2">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#35D07F]" />
                </div>

                <button 
                  onClick={() => {
                    setShowPasswordModal(false);
                    toast.success('Password updated successfully!');
                  }}
                  className="w-full mt-4 bg-[#35D07F] hover:bg-[#2EB86F] text-black py-3 rounded-xl font-bold uppercase tracking-widest transition-colors"
                >
                  Save Password
                </button>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

