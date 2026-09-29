import React, { useState } from 'react';
import { Settings as SettingsIcon, Building, Shield, Bell, Key, Globe, Check, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManagerSettings() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Branch Profile', icon: Building },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'localization', label: 'Localization', icon: Globe },
    { id: 'api', label: 'API Access', icon: Key },
  ];

  const handleCopyApi = () => {
    navigator.clipboard.writeText('rt_live_8f92j3n8f9n238f9n283f9n2');
    toast.success('API Key copied to clipboard');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-wide">Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Configure branch preferences and system parameters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
        {/* Settings Navigation */}
        <div className="space-y-1">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-[#35D07F]/10 text-[#35D07F]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <>
              <div className="bg-[#111112] border border-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-medium text-white mb-6">Branch Details</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Branch Name</label>
                      <input type="text" defaultValue="Ahmedabad — Porsche Service Center" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#35D07F]" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Branch Code</label>
                      <input type="text" defaultValue="BR-AHM-001" disabled className="w-full bg-black/30 border border-white/5 rounded-lg px-4 py-3 text-slate-500 cursor-not-allowed" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Address</label>
                    <textarea rows={3} defaultValue="SG Highway, Bodakdev, Ahmedabad, Gujarat 380054" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#35D07F] resize-none"></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Contact Email</label>
                      <input type="email" defaultValue="service.ahmedabad@porsche.in" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#35D07F]" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Phone Number</label>
                      <input type="text" defaultValue="+91 79 1234 5678" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#35D07F]" />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                  <button onClick={() => toast.success('Branch details updated')} className="px-6 py-3 bg-[#35D07F] hover:bg-[#2EB86F] text-black rounded-lg text-sm font-bold transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="bg-[#111112] border border-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-medium text-white mb-2">Operational Hours</h2>
                <p className="text-sm text-slate-400 mb-6">Set the default working hours for the workshop floor and appointment scheduling.</p>
                
                <div className="space-y-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <div key={day} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div className="w-32 text-sm text-white">{day}</div>
                      <div className="flex items-center gap-4">
                        <input type="time" defaultValue="09:00" className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#35D07F]" />
                        <span className="text-slate-500">to</span>
                        <input type="time" defaultValue="18:00" className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#35D07F]" />
                      </div>
                      <div className="w-24 text-right">
                        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full font-bold tracking-widest uppercase">Open</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between">
                    <div className="w-32 text-sm text-white">Sunday</div>
                    <div className="flex-1 text-center text-sm text-slate-500 italic">Closed</div>
                    <div className="w-24 text-right">
                      <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full font-bold tracking-widest uppercase">Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'roles' && (
            <div className="bg-[#111112] border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-medium text-white mb-6">Roles & Permissions</h2>
              <p className="text-sm text-slate-400 mb-6">Manage what actions staff can perform within this branch.</p>
              
              <div className="space-y-4">
                {[
                  { role: 'Service Advisor', desc: 'Can create service orders and appointments. Cannot approve high-value parts.', users: 3 },
                  { role: 'Technician', desc: 'Can update order status and request parts. Cannot create invoices.', users: 12 },
                  { role: 'Inventory Manager', desc: 'Can approve purchase requests and manage stock levels.', users: 2 }
                ].map((r, i) => (
                  <div key={i} className="p-4 border border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">{r.role}</h3>
                      <p className="text-xs text-slate-500 mt-1">{r.desc}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-400 bg-white/5 px-3 py-1 rounded-full">{r.users} Users</span>
                      <button className="text-sm text-[#35D07F] hover:text-white transition-colors">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">
                Create Custom Role
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-[#111112] border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-medium text-white mb-6">Notification Preferences</h2>
              
              <div className="space-y-6">
                {[
                  { title: 'New Service Orders', desc: 'Receive alerts when a new order is logged.', email: true, app: true },
                  { title: 'Inventory Alerts', desc: 'Notify when parts drop below minimum stock level.', email: true, app: true },
                  { title: 'Customer Complaints', desc: 'Critical alerts for high-priority customer issues.', email: true, app: true },
                  { title: 'Daily Digest', desc: 'A summary of the day\'s performance and KPIs.', email: true, app: false },
                ].map((notif, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <div>
                      <h3 className="text-white text-sm font-medium">{notif.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{notif.desc}</p>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs text-slate-400">
                        <input type="checkbox" defaultChecked={notif.email} className="accent-[#35D07F]" /> Email
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-400">
                        <input type="checkbox" defaultChecked={notif.app} className="accent-[#35D07F]" /> In-App
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                <button onClick={() => toast.success('Preferences saved')} className="px-6 py-3 bg-[#35D07F] hover:bg-[#2EB86F] text-black rounded-lg text-sm font-bold transition-colors">
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === 'localization' && (
            <div className="bg-[#111112] border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-medium text-white mb-6">Localization Options</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Timezone</label>
                    <select className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#35D07F]">
                      <option>Asia/Kolkata (IST)</option>
                      <option>America/New_York (EST)</option>
                      <option>Europe/London (GMT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Currency</label>
                    <select className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#35D07F]">
                      <option>INR (₹)</option>
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Date Format</label>
                  <select className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#35D07F]">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                <button onClick={() => toast.success('Localization updated')} className="px-6 py-3 bg-[#35D07F] hover:bg-[#2EB86F] text-black rounded-lg text-sm font-bold transition-colors">
                  Update Format
                </button>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="bg-[#111112] border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-medium text-white mb-6">API & Integrations</h2>
              <p className="text-sm text-slate-400 mb-6">Manage API keys for integrating RepairTrace with your external tools.</p>
              
              <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Live Secret Key</label>
                <div className="flex gap-3">
                  <input 
                    type="password" 
                    value="rt_live_8f92j3n8f9n238f9n283f9n2" 
                    readOnly
                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none font-mono" 
                  />
                  <button onClick={handleCopyApi} className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg flex items-center gap-2 border border-white/10 transition-colors">
                    <Copy size={16} /> Copy
                  </button>
                </div>
                <p className="text-xs text-red-400 mt-2">Do not share this key. It provides full write access to your branch data.</p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <button className="px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors">
                  Revoke & Roll Key
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

