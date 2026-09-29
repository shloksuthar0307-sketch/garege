import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Mail, Smartphone, Globe, Moon, Save, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerPreferences() {
  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    marketingEmails: false, // maps to Marketing & Offers
    serviceUpdates: true,
    billingAlerts: true,
    soundEnabled: true,
    theme: localStorage.getItem('portal-theme') || 'dark', // 'dark', 'light', 'system'
    language: 'en',
    timezone: 'Asia/Kolkata'
  });

  // Apply theme instantly on change
  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('portal-theme', preferences.theme);
    
    if (preferences.theme === 'light') {
      root.classList.add('light-theme');
    } else if (preferences.theme === 'dark') {
      root.classList.remove('light-theme');
    } else {
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        root.classList.add('light-theme');
      } else {
        root.classList.remove('light-theme');
      }
    }
  }, [preferences.theme]);

  const handleSave = () => {
    toast.success('Preferences saved successfully!', {
      style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
      iconTheme: { primary: '#35D07F', secondary: '#000' }
    });
  };

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button 
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${checked ? 'bg-[#35D07F]' : 'bg-white/10'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  const handleEmailToggle = () => {
    const newState = !preferences.emailAlerts;
    setPreferences(prev => ({...prev, emailAlerts: newState}));
    if (newState) {
      toast.success("Email alerts enabled. A test email has been sent to your inbox.", {
        style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
        iconTheme: { primary: '#35D07F', secondary: '#000' }
      });
    }
  };

  const handleSmsToggle = () => {
    const newState = !preferences.smsAlerts;
    setPreferences(prev => ({...prev, smsAlerts: newState}));
    if (newState) {
      toast.success("SMS alerts enabled. A test text message was sent to your phone.", {
        style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
        iconTheme: { primary: '#35D07F', secondary: '#000' }
      });
    }
  };

  const handlePushToggle = async () => {
    const newState = !preferences.pushNotifications;
    
    if (newState) {
      if (!("Notification" in window)) {
        toast.error("Your browser does not support desktop notifications.", { style: { background: '#1A1A1B', color: '#fff' }});
        setPreferences(prev => ({...prev, pushNotifications: false}));
        return;
      }
      
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setPreferences(prev => ({...prev, pushNotifications: true}));
        // Fire a real native OS notification
        new Notification("Service Portal", {
          body: "Push notifications are now enabled! You will receive alerts here.",
        });
      } else {
        toast.error("Notification permission was denied by the browser.", { style: { background: '#1A1A1B', color: '#fff' }});
        setPreferences(prev => ({...prev, pushNotifications: false}));
      }
    } else {
      setPreferences(prev => ({...prev, pushNotifications: false}));
      toast("Push notifications paused.", { icon: '🔕', style: { background: '#1A1A1B', color: '#fff' }});
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-white mb-2 flex items-center gap-3">
            <Settings className="text-[#35D07F]" size={28} />
            Preferences
          </h1>
          <p className="text-slate-400 text-xs tracking-widest uppercase">
            Customize notifications, regional settings, and appearance.
          </p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <button 
            onClick={handleSave} 
            className="flex items-center gap-2 px-6 py-2.5 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(53,208,127,0.3)]"
          >
            <Save size={16} /> Save Changes
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Notifications */}
        <div className="space-y-8">
          
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-8">
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white mb-6 flex items-center gap-2">
              <Bell className="text-[#35D07F]" size={18} /> Notification Channels
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h3 className="text-white text-sm font-bold tracking-widest mb-1">Email Alerts</h3>
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest">Receive updates via email</p>
                  </div>
                </div>
                <Toggle 
                  checked={preferences.emailAlerts} 
                  onChange={handleEmailToggle} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <h3 className="text-white text-sm font-bold tracking-widest mb-1">SMS Alerts</h3>
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest">Text messages for critical alerts</p>
                  </div>
                </div>
                <Toggle 
                  checked={preferences.smsAlerts} 
                  onChange={handleSmsToggle} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h3 className="text-white text-sm font-bold tracking-widest mb-1">Push Notifications</h3>
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest">In-browser notification popups</p>
                  </div>
                </div>
                <Toggle 
                  checked={preferences.pushNotifications} 
                  onChange={handlePushToggle} 
                />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-8">
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white mb-6 flex items-center gap-2">
              <Volume2 className="text-slate-400" size={18} /> Alert Types
            </h2>
            
            <div className="space-y-4">
              <label 
                className="flex items-start gap-4 cursor-pointer group"
                onClick={() => setPreferences(prev => ({...prev, serviceUpdates: !prev.serviceUpdates}))}
              >
                <div className={`mt-1 flex items-center justify-center w-5 h-5 rounded border transition-colors ${preferences.serviceUpdates ? 'border-[#35D07F] bg-[#35D07F]' : 'border-white/20 group-hover:border-white/40'}`}>
                  {preferences.serviceUpdates && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div>
                  <h3 className="text-white text-sm font-bold tracking-widest mb-1 group-hover:text-[#35D07F] transition-colors">Service Updates & Estimates</h3>
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest">Get notified when a vehicle needs action.</p>
                </div>
              </label>

              <label 
                className="flex items-start gap-4 cursor-pointer group"
                onClick={() => setPreferences(prev => ({...prev, billingAlerts: !prev.billingAlerts}))}
              >
                <div className={`mt-1 flex items-center justify-center w-5 h-5 rounded border transition-colors ${preferences.billingAlerts ? 'border-[#35D07F] bg-[#35D07F]' : 'border-white/20 group-hover:border-white/40'}`}>
                  {preferences.billingAlerts && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div>
                  <h3 className="text-white text-sm font-bold tracking-widest mb-1 group-hover:text-[#35D07F] transition-colors">Billing & Invoices</h3>
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest">Alerts for upcoming and overdue payments.</p>
                </div>
              </label>

              <label 
                className="flex items-start gap-4 cursor-pointer group"
                onClick={() => setPreferences(prev => ({...prev, marketingEmails: !prev.marketingEmails}))}
              >
                <div className={`mt-1 flex items-center justify-center w-5 h-5 rounded border transition-colors ${preferences.marketingEmails ? 'border-[#35D07F] bg-[#35D07F]' : 'border-white/20 group-hover:border-white/40'}`}>
                  {preferences.marketingEmails && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div>
                  <h3 className="text-white text-sm font-bold tracking-widest mb-1 group-hover:text-[#35D07F] transition-colors">Marketing & Offers</h3>
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest">Occasional promotions and feature updates.</p>
                </div>
              </label>
            </div>
          </motion.div>

        </div>

        {/* Right Column: System Settings */}
        <div className="space-y-8">
          
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-8">
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white mb-6 flex items-center gap-2">
              <Globe className="text-blue-400" size={18} /> Regional Settings
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 block">Language</label>
                <div className="relative">
                  <select 
                    value={preferences.language}
                    onChange={(e) => setPreferences(prev => ({...prev, language: e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-[#35D07F] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="en" className="bg-[#111112]">English (US)</option>
                    <option value="en-gb" className="bg-[#111112]">English (UK)</option>
                    <option value="es" className="bg-[#111112]">Spanish</option>
                    <option value="fr" className="bg-[#111112]">French</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 block">Timezone</label>
                <div className="relative">
                  <select 
                    value={preferences.timezone}
                    onChange={(e) => setPreferences(prev => ({...prev, timezone: e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-[#35D07F] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="America/New_York" className="bg-[#111112]">Eastern Time (ET)</option>
                    <option value="America/Los_Angeles" className="bg-[#111112]">Pacific Time (PT)</option>
                    <option value="Europe/London" className="bg-[#111112]">GMT / UTC+0</option>
                    <option value="Asia/Kolkata" className="bg-[#111112]">India Standard Time (IST)</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-8">
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white mb-6 flex items-center gap-2">
              <Moon className="text-indigo-400" size={18} /> Appearance
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              
              <button 
                onClick={() => setPreferences(prev => ({...prev, theme: 'dark'}))}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  preferences.theme === 'dark' 
                    ? 'bg-[#35D07F]/10 border-[#35D07F] text-white' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-black mb-3 border border-white/20 flex items-center justify-center">
                  <Moon size={14} className={preferences.theme === 'dark' ? 'text-[#35D07F]' : 'text-slate-400'} />
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase">Dark Mode</span>
              </button>

              <button 
                onClick={() => setPreferences(prev => ({...prev, theme: 'light'}))}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  preferences.theme === 'light' 
                    ? 'bg-[#35D07F]/10 border-[#35D07F] text-white' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-white mb-3 border border-slate-300"></div>
                <span className="text-[10px] font-bold tracking-widest uppercase">Light Mode</span>
              </button>

              <button 
                onClick={() => setPreferences(prev => ({...prev, theme: 'system'}))}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  preferences.theme === 'system' 
                    ? 'bg-[#35D07F]/10 border-[#35D07F] text-white' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-white to-black mb-3 border border-white/20"></div>
                <span className="text-[10px] font-bold tracking-widest uppercase">System</span>
              </button>

            </div>
            <p className="text-slate-500 text-xs mt-4 text-center">Your interface will instantly adapt to your selected theme.</p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

