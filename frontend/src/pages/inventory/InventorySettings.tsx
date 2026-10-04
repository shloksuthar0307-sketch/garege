import { useState } from 'react';
import { Save, Bell, Shield, Database, Wrench, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { useQueryClient } from '@tanstack/react-query';

const Toggle = ({ checked, onChange, label }: { checked: boolean, onChange: (val: boolean) => void, label?: string }) => (
  <label className="flex items-center space-x-3 cursor-pointer group">
    <div className="relative">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <div className={`w-10 h-5 rounded-full border transition-colors ${checked ? 'bg-[#35D07F]/20 border-[#35D07F]/50' : 'bg-[var(--bg-surface-active)] border-[var(--border-strong)]'}`}></div>
      <div className={`absolute left-1 top-1 w-3 h-3 rounded-full transition-transform transform ${checked ? 'bg-[#35D07F] translate-x-5' : 'bg-[var(--bg-surface-hover)]0'}`}></div>
    </div>
    {label && <span className="text-sm text-white/70 group-hover:text-[var(--text-primary)] transition-colors">{label}</span>}
  </label>
);

export default function InventorySettings() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  const [settings, setSettings] = useState({
    defaultMinimumStock: 5,
    autoReorderMultiplier: 2,
    requireApproval: true,
    autoReserve: true,
    strictSerial: false,
    emailAlerts: true,
    pushNotifications: true,
    smsAlerts: false,
    technicianIssuing: false,
    advisorReservations: true
  });

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Settings saved successfully');
    }, 800);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await api.get('/inventory-manager/parts/');
      const parts = res.data;
      
      const headers = ['Part Name', 'Part Number', 'Category', 'Current Stock', 'Reserved', 'Available', 'Location'];
      const csvContent = [
        headers.join(','),
        ...parts.map((p: any) => [
          `"${p.name}"`, 
          `"${p.part_number}"`, 
          `"${p.category}"`, 
          p.current_stock, 
          p.reserved, 
          p.available_stock, 
          `"${p.location || 'N/A'}"`
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Export completed successfully');
    } catch (err) {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePurge = () => {
    setIsPurging(true);
    // Simulate API call to purge logs
    setTimeout(() => {
      setIsPurging(false);
      setIsPurgeModalOpen(false);
      toast.success('Audit logs purged successfully');
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
    }, 1500);
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'notifications':
        return (
          <div className="bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-2xl p-6">
            <h3 className="text-sm font-bold tracking-widest uppercase text-[var(--text-primary)] mb-6 border-b border-[var(--border-default)] pb-4">Notification Channels</h3>
            
            <div className="space-y-4">
              <Toggle checked={settings.emailAlerts} onChange={(v) => updateSetting('emailAlerts', v)} label="Email Alerts for Low Stock" />
              <Toggle checked={settings.pushNotifications} onChange={(v) => updateSetting('pushNotifications', v)} label="Push Notifications for Order Approvals" />
              <Toggle checked={settings.smsAlerts} onChange={(v) => updateSetting('smsAlerts', v)} label="SMS Alerts for Critical Outages" />
            </div>
          </div>
        );
      case 'permissions':
        return (
          <div className="bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-2xl p-6">
            <h3 className="text-sm font-bold tracking-widest uppercase text-[var(--text-primary)] mb-6 border-b border-[var(--border-default)] pb-4">Role Permissions</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border border-[var(--border-default)] rounded-xl bg-black/20">
                <div>
                  <h4 className="text-sm font-medium text-[var(--text-primary)] mb-1">Technician Issuing</h4>
                  <p className="text-xs text-white/50">Allow technicians to issue parts directly without manager approval.</p>
                </div>
                <Toggle checked={settings.technicianIssuing} onChange={(v) => updateSetting('technicianIssuing', v)} />
              </div>

              <div className="flex justify-between items-center p-4 border border-[var(--border-default)] rounded-xl bg-black/20">
                <div>
                  <h4 className="text-sm font-medium text-[var(--text-primary)] mb-1">Service Advisor Reservations</h4>
                  <p className="text-xs text-white/50">Allow advisors to reserve inventory during estimate creation.</p>
                </div>
                <Toggle checked={settings.advisorReservations} onChange={(v) => updateSetting('advisorReservations', v)} />
              </div>
            </div>
          </div>
        );
      case 'data':
        return (
          <div className="bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-2xl p-6">
            <h3 className="text-sm font-bold tracking-widest uppercase text-[var(--text-primary)] mb-6 border-b border-[var(--border-default)] pb-4">Data Management</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">Export Inventory Data</h4>
                <p className="text-xs text-white/50 mb-3">Download a complete CSV snapshot of all parts, stock levels, and historical movements.</p>
                <button 
                  onClick={handleExport}
                  disabled={isExporting}
                  className="px-4 py-2 bg-[var(--bg-surface-active)] hover:bg-white/20 text-[var(--text-primary)] rounded-lg text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
                >
                  {isExporting ? 'Exporting...' : 'Export CSV'}
                </button>
              </div>

              <div className="pt-6 border-t border-[var(--border-default)]">
                <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2 text-red-400">Danger Zone</h4>
                <p className="text-xs text-white/50 mb-3">Clear all historical audit logs. This action cannot be undone and will permanently remove movement history.</p>
                <button 
                  onClick={() => setIsPurgeModalOpen(true)}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  Purge Audit Logs
                </button>
              </div>
            </div>
          </div>
        );
      case 'general':
      default:
        return (
          <>
            <div className="bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-2xl p-6">
              <h3 className="text-sm font-bold tracking-widest uppercase text-[var(--text-primary)] mb-6 border-b border-[var(--border-default)] pb-4">Threshold Defaults</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-white/50 uppercase tracking-widest mb-2">Default Minimum Stock Level</label>
                  <input 
                    type="number" 
                    value={settings.defaultMinimumStock} 
                    onChange={(e) => updateSetting('defaultMinimumStock', parseInt(e.target.value) || 0)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors" 
                  />
                  <p className="text-[10px] text-white/30 mt-2">Applied to new parts if no specific minimum is set.</p>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-white/50 uppercase tracking-widest mb-2">Auto-Reorder Multiplier</label>
                  <input 
                    type="number" 
                    value={settings.autoReorderMultiplier} 
                    onChange={(e) => updateSetting('autoReorderMultiplier', parseInt(e.target.value) || 0)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F] transition-colors" 
                  />
                  <p className="text-[10px] text-white/30 mt-2">When auto-reordering, request this multiple of the minimum stock level.</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-2xl p-6">
              <h3 className="text-sm font-bold tracking-widest uppercase text-[var(--text-primary)] mb-6 border-b border-[var(--border-default)] pb-4">Workflow Preferences</h3>
              
              <div className="space-y-4">
                <Toggle checked={settings.requireApproval} onChange={(v) => updateSetting('requireApproval', v)} label="Require Approval for Purchase Requests" />
                <Toggle checked={settings.autoReserve} onChange={(v) => updateSetting('autoReserve', v)} label="Auto-reserve parts for new Service Orders" />
                <Toggle checked={settings.strictSerial} onChange={(v) => updateSetting('strictSerial', v)} label="Strict serial number tracking on all receiving" />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase text-[var(--text-primary)] mb-2">Settings</h1>
          <p className="text-white/50 tracking-wide">Configure inventory thresholds, notifications, and system preferences.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-[#35D07F] hover:bg-[#2bb469] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'general' ? 'bg-[var(--bg-surface-active)] border border-[var(--border-strong)] text-[var(--text-primary)]' : 'bg-transparent hover:bg-[var(--bg-surface-hover)] text-white/50 hover:text-[var(--text-primary)]'}`}
          >
            <Wrench size={18} className={activeTab === 'general' ? 'text-[#35D07F]' : ''} />
            <span className="text-sm font-bold tracking-widest uppercase">General</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'notifications' ? 'bg-[var(--bg-surface-active)] border border-[var(--border-strong)] text-[var(--text-primary)]' : 'bg-transparent hover:bg-[var(--bg-surface-hover)] text-white/50 hover:text-[var(--text-primary)]'}`}
          >
            <Bell size={18} className={activeTab === 'notifications' ? 'text-[#35D07F]' : ''} />
            <span className="text-sm font-bold tracking-widest uppercase">Notifications</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('permissions')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'permissions' ? 'bg-[var(--bg-surface-active)] border border-[var(--border-strong)] text-[var(--text-primary)]' : 'bg-transparent hover:bg-[var(--bg-surface-hover)] text-white/50 hover:text-[var(--text-primary)]'}`}
          >
            <Shield size={18} className={activeTab === 'permissions' ? 'text-[#35D07F]' : ''} />
            <span className="text-sm font-bold tracking-widest uppercase">Permissions</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('data')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'data' ? 'bg-[var(--bg-surface-active)] border border-[var(--border-strong)] text-[var(--text-primary)]' : 'bg-transparent hover:bg-[var(--bg-surface-hover)] text-white/50 hover:text-[var(--text-primary)]'}`}
          >
            <Database size={18} className={activeTab === 'data' ? 'text-[#35D07F]' : ''} />
            <span className="text-sm font-bold tracking-widest uppercase">Data Management</span>
          </button>
        </div>

        <div className="col-span-1 lg:col-span-2 space-y-6">
          {renderTabContent()}
        </div>
      </div>

      {isPurgeModalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1B] border border-red-500/20 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsPurgeModalOpen(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-medium text-red-400 mb-2">Purge Audit Logs?</h2>
            <p className="text-white/70 text-sm mb-6">
              This action is permanent and cannot be undone. All historical movement logs, adjustments, and receipts will be permanently deleted from the database. Current stock levels will not be affected.
            </p>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => setIsPurgeModalOpen(false)}
                className="flex-1 px-4 py-3 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePurge}
                disabled={isPurging}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-[var(--text-primary)] rounded-xl text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
              >
                {isPurging ? 'Purging...' : 'Yes, Purge Logs'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


