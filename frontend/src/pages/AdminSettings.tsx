import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Building2, Wrench, Bell, DollarSign, 
  Shield, HardDrive, Save, Upload
} from 'lucide-react';

const TABS = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'service', label: 'Service', icon: Wrench },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [storageData, setStorageData] = useState({ usage: 45 * 1024 * 1024 * 1024, quota: 100 * 1024 * 1024 * 1024, supported: false });

  React.useEffect(() => {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        setStorageData({
          usage: estimate.usage || 0,
          quota: estimate.quota || 100 * 1024 * 1024 * 1024,
          supported: true
        });
      });
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight">System Settings</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Configure global preferences and platform rules.</p>
        </div>
        <button 
          onClick={() => toast.success("Settings saved successfully!")}
          className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
        >
          <Save size={16} />
          Save Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Settings Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ' + (isActive ? 'bg-[#35D07F]/10 text-[#35D07F]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]')}
              >
                <Icon size={18} className={isActive ? 'text-[#35D07F]' : 'text-[var(--text-muted)]'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 md:p-8"
          >
            
            {activeTab === 'general' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Garage Profile</h2>
                  <div className="flex items-center gap-6 mb-6">
                    <div 
                      onClick={() => {
                        // Simulate file input click
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/png, image/svg+xml';
                        input.onchange = () => toast("Logo upload is disabled in this demo.", { icon: "??" });
                        input.click();
                      }}
                      className="w-24 h-24 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-default)] flex items-center justify-center flex-col gap-2 cursor-pointer hover:border-[#35D07F]/50 transition-colors"
                    >
                      <Upload size={20} className="text-[var(--text-muted)]" />
                      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Logo</span>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-secondary)] mb-2">Upload your company logo.</p>
                      <p className="text-xs text-[var(--text-muted)]">Recommended size: 512x512px (PNG, SVG)</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-[var(--text-muted)] mb-2">Company Name</label>
                      <input type="text" defaultValue="RepairTrace Motors" className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]" />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-[var(--text-muted)] mb-2">Contact Email</label>
                      <input type="email" defaultValue="support@repairtrace.com" className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]" />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-[var(--text-muted)] mb-2">Phone Number</label>
                      <input type="text" defaultValue="+91 98765 43210" className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]" />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-[var(--text-muted)] mb-2">GST / Tax ID</label>
                      <input type="text" defaultValue="22AAAAA0000A1Z5" className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] tracking-widest uppercase text-[var(--text-muted)] mb-2">Business Address</label>
                      <textarea rows={3} defaultValue="123 Automotive Park, Industrial Area\nMumbai, Maharashtra 400001" className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] resize-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-[var(--border-subtle)]">
                  <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Business Hours</h2>
                  <div className="space-y-3">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                      <div key={day} className="flex items-center gap-4">
                        <div className="w-32 text-sm text-[var(--text-muted)]">{day}</div>
                        <input type="time" defaultValue="09:00" className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-1.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#35D07F]" />
                        <span className="text-[var(--text-muted)]">to</span>
                        <input type="time" defaultValue="19:00" className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-1.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#35D07F]" />
                      </div>
                    ))}
                    <div className="flex items-center gap-4">
                      <div className="w-32 text-sm text-rose-400">Sunday</div>
                      <div className="text-sm text-[var(--text-muted)] bg-[var(--bg-surface-hover)] px-4 py-1.5 rounded-lg">Closed</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'finance' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Currency & Taxes</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-[var(--text-muted)] mb-2">Default Currency</label>
                      <select className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] appearance-none">
                        <option value="INR">? Indian Rupee (INR)</option>
                        <option value="USD">$ US Dollar (USD)</option>
                        <option value="EUR"> Euro (EUR)</option>
                        <option value="GBP"> British Pound (GBP)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-[var(--text-muted)] mb-2">Default Tax Rate (%)</label>
                      <input type="number" defaultValue="18" className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]" />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-[var(--border-subtle)]">
                  <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Invoice Configuration</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-[var(--text-muted)] mb-2">Invoice Prefix</label>
                      <input type="text" defaultValue="RT-INV-" className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]" />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-[var(--text-muted)] mb-2">Estimate Prefix</label>
                      <input type="text" defaultValue="RT-EST-" className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] tracking-widest uppercase text-[var(--text-muted)] mb-2">Invoice Footer Notes</label>
                      <textarea rows={2} defaultValue="Thank you for trusting RepairTrace. All repairs come with a 6-month warranty." className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] resize-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'service' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Service & Workflow</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-[var(--text-muted)] mb-2">Automated Inspections</label>
                      <div className="flex items-center gap-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-2.5">
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#35D07F]" />
                        <span className="text-sm text-[var(--text-primary)]">Enable AI-assisted damage detection</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-[var(--text-muted)] mb-2">Default Warranty Period</label>
                      <select className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] appearance-none">
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">12 Months</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Communication Channels</h2>
                  <div className="space-y-4">
                    {[
                      { title: 'Email Notifications', desc: 'Send estimates and invoices via email', on: true },
                      { title: 'SMS Alerts', desc: 'Send real-time repair updates to customers', on: true },
                      { title: 'WhatsApp Integration', desc: 'Use WhatsApp Business API for messaging', on: false },
                      { title: 'Push Notifications', desc: 'App notifications for staff and technicians', on: true }
                    ].map(item => (
                      <div key={item.title} className="flex items-center justify-between bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl p-4">
                        <div>
                          <h4 className="text-sm font-medium text-[var(--text-primary)]">{item.title}</h4>
                          <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={item.on} />
                          <div className="w-11 h-6 bg-[var(--bg-surface-active)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#35D07F]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Access & Security</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-[var(--text-muted)] mb-2">Two-Factor Authentication (2FA)</label>
                      <select className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] appearance-none">
                        <option value="optional">Optional for all users</option>
                        <option value="admin">Required for Admins & Managers</option>
                        <option value="all">Required for all staff</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-[var(--text-muted)] mb-2">Session Timeout</label>
                      <select className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] appearance-none">
                        <option value="15">15 Minutes of inactivity</option>
                        <option value="30">30 Minutes of inactivity</option>
                        <option value="60">1 Hour of inactivity</option>
                        <option value="never">Never timeout</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'storage' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Device Local Storage</h2>
                  
                  <div className="mb-6 p-4 bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl flex items-center justify-between">
                    <div>
                      <span className="block text-xs text-[var(--text-muted)] mb-1">Local Browser Storage Used</span>
                      <span className="text-2xl font-light text-[var(--text-primary)]">
                        {(storageData.usage / (1024 * 1024)).toFixed(2)} MB 
                        <span className="text-sm text-[var(--text-muted)]"> / {(storageData.quota / (1024 * 1024 * 1024)).toFixed(2)} GB</span>
                      </span>
                      {!storageData.supported && <span className="block text-[10px] text-amber-500 mt-1">Storage API not supported on this browser.</span>}
                    </div>
                    <div className="w-1/2 h-2 bg-black rounded-full overflow-hidden border border-[var(--border-subtle)] hidden md:block">
                      <div className="h-full bg-[#35D07F]" style={{ width: `${Math.min(100, (storageData.usage / storageData.quota) * 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-[var(--text-muted)] mb-2">Request Persistent Storage</label>
                      <button 
                        onClick={() => setShowStorageModal(true)}
                        className="w-full flex justify-center bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/20 hover:bg-[#35D07F]/20 rounded-lg px-4 py-2.5 font-bold tracking-widest uppercase text-xs transition-colors"
                      >
                        Request Permission
                      </button>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-[var(--text-muted)] mb-2">Clear Local Cache</label>
                      <button 
                        onClick={() => toast.success("Local cache cleared successfully.")}
                        className="w-full flex justify-center bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 rounded-lg px-4 py-2.5 font-bold tracking-widest uppercase text-xs transition-colors"
                      >
                        Clear Cache
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </motion.div>
        </div>
      </div>

      {/* Storage Permission Modal */}
      {showStorageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-overlay)] backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1A1A1B] border border-[var(--border-default)] p-6 rounded-2xl shadow-2xl max-w-sm w-full relative"
          >
            <div className="w-12 h-12 bg-[#35D07F]/10 rounded-full flex items-center justify-center mb-4 border border-[#35D07F]/20">
              <HardDrive size={20} className="text-[#35D07F]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Request Persistent Storage</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              To ensure your offline data and cached files are not automatically cleared by the browser, RepairTrace requires persistent storage permission.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowStorageModal(false)}
                className="flex-1 px-4 py-2 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowStorageModal(false);
                  if (navigator.storage && navigator.storage.persist) {
                    navigator.storage.persist().then(granted => {
                      if (granted) {
                        toast.success("Persistent storage permission granted!");
                      } else {
                        // For demo purposes, mock success if browser blocks silent request on localhost
                        toast.success("Storage secured! (Simulated for localhost development)");
                      }
                    });
                  } else {
                    toast.error("Storage Persistence API not supported.");
                  }
                }}
                className="flex-1 px-4 py-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black rounded-xl text-sm font-medium transition-colors"
              >
                Allow Access
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}


