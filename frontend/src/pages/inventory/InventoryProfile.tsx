import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../../lib/auth';
import { useState } from 'react';
import { Save, User, Mail, Phone, MapPin, KeyRound, Building, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InventoryProfile() {
  const [loading, setLoading] = useState(false);

  // Retrieve user data from JWT token (mocked fallback)
  const token = getAccessToken();
  let user: any = {};
  if (token) {
    try {
      user = JSON.parse(atob(token.split('.')[1]))?.user || {};
    } catch (e) {}
  }

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Profile updated successfully');
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase text-[var(--text-primary)] mb-2">My Profile</h1>
          <p className="text-white/50 tracking-wide">Manage your personal information, security, and preferences.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-[#35D07F] hover:bg-[#2bb469] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{loading ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="col-span-1 space-y-6">
          <div className="bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-2xl p-8 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-[#1A1A1A] border-2 border-[var(--border-default)] flex items-center justify-center text-5xl font-light text-[var(--text-primary)] mb-6 relative group cursor-pointer overflow-hidden">
              {user?.full_name?.charAt(0) || 'I'}
              <div className="absolute inset-0 bg-[var(--bg-overlay)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-bold tracking-widest uppercase text-[var(--text-primary)]">Change</span>
              </div>
            </div>
            <h2 className="text-xl font-medium text-[var(--text-primary)] mb-1">{user?.full_name || 'Inventory Manager'}</h2>
            <p className="text-[#35D07F] text-xs font-bold tracking-widest uppercase mb-4">Inventory Operations</p>
            
            <div className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-[var(--bg-surface-hover)] rounded-lg border border-[var(--border-default)] mb-2">
                <Building size={14} className="text-white/50" />
                <span className="text-sm text-white/70">{user?.branch_name || 'Central Branch'}</span>
            </div>
            <div className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
                <ShieldCheck size={14} className="text-green-400" />
                <span className="text-sm text-green-400">Verified Employee</span>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          
          <div className="bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-2xl p-6">
            <h3 className="text-sm font-bold tracking-widest uppercase text-[var(--text-primary)] mb-6 border-b border-[var(--border-default)] pb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-xs font-medium text-white/50 uppercase tracking-widest mb-2">
                  <User size={14} />
                  <span>Full Name</span>
                </label>
                <input type="text" defaultValue={user?.full_name || 'Inventory Manager'} className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors" />
              </div>
              
              <div>
                <label className="flex items-center space-x-2 text-xs font-medium text-white/50 uppercase tracking-widest mb-2">
                  <Mail size={14} />
                  <span>Email Address</span>
                </label>
                <input type="email" defaultValue={user?.email || 'inventory@repairtrace.com'} className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors" />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-xs font-medium text-white/50 uppercase tracking-widest mb-2">
                  <Phone size={14} />
                  <span>Phone Number</span>
                </label>
                <input type="tel" defaultValue={user?.phone || '+1 (555) 019-8234'} className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors" />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-xs font-medium text-white/50 uppercase tracking-widest mb-2">
                  <MapPin size={14} />
                  <span>Location</span>
                </label>
                <input type="text" defaultValue="Headquarters" className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-2xl p-6">
            <h3 className="text-sm font-bold tracking-widest uppercase text-[var(--text-primary)] mb-6 border-b border-[var(--border-default)] pb-4">Security</h3>
            
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-black/20 rounded-xl border border-[var(--border-subtle)]">
                <div className="mb-4 md:mb-0">
                  <h4 className="text-sm font-medium text-[var(--text-primary)] flex items-center space-x-2">
                    <KeyRound size={16} className="text-[#35D07F]" />
                    <span>Account Password</span>
                  </h4>
                  <p className="text-xs text-white/50 mt-1">Last changed 45 days ago</p>
                </div>
                <button className="px-4 py-2 bg-[var(--bg-surface-active)] hover:bg-white/20 text-[var(--text-primary)] border border-[var(--border-default)] rounded-lg text-xs font-bold tracking-widest uppercase transition-colors">
                  Change Password
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-black/20 rounded-xl border border-[var(--border-subtle)]">
                <div className="mb-4 md:mb-0">
                  <h4 className="text-sm font-medium text-[var(--text-primary)] flex items-center space-x-2">
                    <ShieldCheck size={16} className="text-blue-400" />
                    <span>Two-Factor Authentication</span>
                  </h4>
                  <p className="text-xs text-white/50 mt-1">Add an extra layer of security to your account</p>
                </div>
                <button className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors">
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


