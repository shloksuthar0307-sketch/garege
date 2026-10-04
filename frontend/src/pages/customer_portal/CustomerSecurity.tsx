import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, Smartphone, Laptop, Clock, AlertTriangle, CheckCircle2, MonitorSmartphone, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerSecurity() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.current || !passwordForm.new) {
      toast.error('Please fill in all password fields.', { style: { background: '#1A1A1B', color: '#fff' }});
      return;
    }
    toast.success('Password successfully updated!', {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const toggle2FA = () => {
    const newState = !twoFactorEnabled;
    setTwoFactorEnabled(newState);
    if (newState) {
      toast.success('Two-Factor Authentication enabled.', {
        style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
        iconTheme: { primary: '#35D07F', secondary: '#000' }
      });
    } else {
      toast('Two-Factor Authentication disabled.', { icon: '⚠️', style: { background: '#1A1A1B', color: '#fff' } });
    }
  };
  const handleDownloadLog = () => {
    const logContent = `TIMESTAMP,EVENT,DEVICE,IP,LOCATION,STATUS
2026-10-01 09:30:00,Login,Windows PC,192.168.1.1,India,Success
2026-09-30 14:15:00,Login,iPhone 14,104.28.192.1,India,Success
2025-10-12 03:00:00,Login Attempt,Unknown Device,45.33.22.1,Unknown,Failed - Incorrect Password
`;
    const blob = new Blob([logContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security_log_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Security log downloaded successfully.', {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <Shield className="text-[#35D07F]" size={28} />
            Security Settings
          </h1>
          <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">
            Manage your password, authentication methods, and active sessions.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Password & 2FA */}
        <div className="space-y-8">
          
          {/* Change Password */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl p-8">
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <Key className="text-[var(--text-muted)]" size={18} /> Change Password
            </h2>
            
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-2 block">Current Password</label>
                <input 
                  type="password" 
                  value={passwordForm.current}
                  onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                  className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3.5 text-[var(--text-primary)] text-sm outline-none focus:border-[#35D07F] transition-colors" 
                />
              </div>
              <div>
                <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-2 block">New Password</label>
                <input 
                  type="password" 
                  value={passwordForm.new}
                  onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                  className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3.5 text-[var(--text-primary)] text-sm outline-none focus:border-[#35D07F] transition-colors" 
                />
              </div>
              <div className="mb-6">
                <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-2 block">Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordForm.confirm}
                  onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                  className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3.5 text-[var(--text-primary)] text-sm outline-none focus:border-[#35D07F] transition-colors" 
                />
              </div>
              
              <button type="submit" className="px-6 py-3 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all border border-[var(--border-default)] w-full sm:w-auto">
                Update Password
              </button>
            </form>
          </motion.div>

          {/* Two-Factor Authentication */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl p-8 relative overflow-hidden">
            {twoFactorEnabled && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#35D07F] to-transparent opacity-50"></div>
            )}
            
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <Smartphone className={twoFactorEnabled ? "text-[#35D07F]" : "text-[var(--text-muted)]"} size={18} /> 
              Two-Factor Authentication
            </h2>
            
            <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6">
              Add an extra layer of security to your account. Once enabled, you'll be prompted to enter a unique code sent to your device whenever you log in.
            </p>

            <div className="flex items-center justify-between p-4 bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-xl">
              <div>
                <p className="text-[var(--text-primary)] font-bold tracking-widest text-sm mb-1">Authenticator App</p>
                <p className={`text-[10px] uppercase tracking-widest font-bold ${twoFactorEnabled ? 'text-[#35D07F]' : 'text-[var(--text-muted)]'}`}>
                  {twoFactorEnabled ? 'Currently Enabled' : 'Not Configured'}
                </p>
              </div>
              <button 
                onClick={toggle2FA}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${twoFactorEnabled ? 'bg-[#35D07F]' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </motion.div>

        </div>

        {/* Right Column: Active Sessions & Activity */}
        <div className="space-y-8">
          
          {/* Active Sessions */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--text-primary)] flex items-center gap-2">
                <MonitorSmartphone className="text-blue-400" size={18} /> Active Sessions
              </h2>
              <button 
                onClick={() => toast('Logged out of all other devices.', { icon: '🔒', style: { background: '#1A1A1B', color: '#fff' }})}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest transition-colors"
              >
                Log Out All
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Current Session */}
              <div className="flex items-center justify-between p-4 border border-[#35D07F]/20 bg-[#35D07F]/5 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#35D07F]/10 flex items-center justify-center text-[#35D07F]">
                    <Laptop size={18} />
                  </div>
                  <div>
                    <h3 className="text-[var(--text-primary)] text-sm font-bold tracking-widest mb-1">Windows PC • Chrome</h3>
                    <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-[#35D07F]" /> Current Session
                    </p>
                  </div>
                </div>
                <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest text-right">
                  India<br/>192.168.1.1
                </div>
              </div>

              {/* Other Session */}
              <div className="flex items-center justify-between p-4 border border-[var(--border-subtle)] bg-white/[0.02] rounded-xl group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface-hover)] flex items-center justify-center text-[var(--text-muted)]">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <h3 className="text-[var(--text-primary)] text-sm font-bold tracking-widest mb-1">iPhone 14 • Safari</h3>
                    <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest">
                      Last active: 2 hours ago
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => toast('Session revoked.', { style: { background: '#1A1A1B', color: '#fff' }})}
                  className="opacity-0 group-hover:opacity-100 p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                  title="Revoke Session"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Security Logs */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl p-8">
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <Clock className="text-[var(--text-muted)]" size={18} /> Recent Login Activity
            </h2>
            
            <div className="relative border-l-2 border-[var(--border-default)] ml-3 space-y-6">
              
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-[#111112] bg-[#35D07F]"></div>
                <h3 className="text-[var(--text-primary)] text-sm font-bold tracking-widest mb-1">Successful Login</h3>
                <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest mb-2">Today, 09:30 AM • Windows PC</p>
                <p className="text-[var(--text-muted)] text-xs">IP: 192.168.1.1 • Location: India</p>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-[#111112] bg-white/20"></div>
                <h3 className="text-[var(--text-primary)] text-sm font-bold tracking-widest mb-1">Successful Login</h3>
                <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest mb-2">Yesterday, 14:15 PM • iPhone 14</p>
                <p className="text-[var(--text-muted)] text-xs">IP: 104.28.192.1 • Location: India</p>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-[#111112] bg-rose-500"></div>
                <h3 className="text-[var(--text-primary)] text-sm font-bold tracking-widest mb-1">Failed Login Attempt</h3>
                <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest mb-2">Oct 12, 2025, 03:00 AM • Unknown Device</p>
                <p className="text-rose-400/80 text-xs flex items-center gap-1.5"><AlertTriangle size={12} /> Incorrect password entered</p>
              </div>

            </div>
            
            <button 
              onClick={handleDownloadLog}
              className="w-full mt-8 py-3 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all"
            >
              Download Complete Security Log
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}


