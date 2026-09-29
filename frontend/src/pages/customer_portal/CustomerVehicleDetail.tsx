import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Car, Calendar, FileText, Wrench, AlertTriangle, ShieldCheck, Activity, Edit3, Trash2, ChevronRight, PenTool, QrCode, Download, RefreshCw, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

// Mock data (would fetch based on ID in real app)
const MOCK_VEHICLE = {
  id: '1',
  make: 'Ford',
  model: 'F-150 Raptor',
  year: 2022,
  plate: 'TEX-8821',
  vin: '1FTFW1RG4LFxxxxxx',
  color: 'Velocity Blue',
  mileage: '24,500',
  nextService: 'Dec 15, 2025',
  status: 'In Shop', // 'Active', 'In Shop', 'Needs Attention'
  engine: '3.5L EcoBoost V6',
  transmission: '10-Speed Automatic',
  drive: '4x4',
  fuel: 'Gasoline',
  insuranceExpiry: 'Aug 20, 2026',
  registrationExpiry: 'Sep 01, 2026'
};

const SERVICE_HISTORY = [];

export default function CustomerVehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'documents' | 'qr'>('overview');
  
  const [qrData, setQrData] = useState<{ token: string, qr_url: string } | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'qr') {
      fetchQrData();
    }
  }, [activeTab]);

  const fetchQrData = async () => {
    try {
      setQrLoading(true);
      const res = await api.get(`/vehicles/${id}/qr/`);
      setQrData(res.data);
    } catch (err: any) {
      console.error('Error fetching QR data', err);
      if (err.message?.includes('404')) {
        // Not found, might need generation? Or just null
        setQrData(null);
      }
    } finally {
      setQrLoading(false);
    }
  };

  const handleRegenerateQr = async () => {
    try {
      setQrLoading(true);
      const res = await api.post(`/vehicles/${id}/qr/regenerate/`, {});
      setQrData(res.data);
      toast.success('QR Code regenerated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to regenerate QR code');
    } finally {
      setQrLoading(false);
    }
  };

  const handleRevokeQr = async () => {
    try {
      setQrLoading(true);
      await api.post(`/vehicles/${id}/qr/revoke/`, {});
      setQrData(null);
      toast.success('QR Code revoked successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to revoke QR code');
    } finally {
      setQrLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    toast.success('Downloading QR Code PDF...', { style: { background: '#1A1A1B', color: '#fff' } });
  };

  // Handlers
  const handleEdit = () => toast('Edit mode activated.', { style: { background: '#1A1A1B', color: '#fff' }});
  const handleRequestService = () => {
    toast.success('Navigating to Service Request...', { style: { background: '#1A1A1B', color: '#fff' }, iconTheme: { primary: '#35D07F', secondary: '#000' }});
    navigate('/customer/repairs');
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/customer/vehicles')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-[10px] font-bold tracking-widest uppercase"
        >
          <ArrowLeft size={14} /> Back to Vehicles
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                MOCK_VEHICLE.status === 'Active' ? 'bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/20' : 
                MOCK_VEHICLE.status === 'In Shop' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {MOCK_VEHICLE.status}
              </span>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{MOCK_VEHICLE.plate}</span>
            </div>
            <h1 className="text-4xl font-bold tracking-widest uppercase text-white">
              {MOCK_VEHICLE.year} {MOCK_VEHICLE.make} {MOCK_VEHICLE.model}
            </h1>
            <p className="text-slate-400 text-sm mt-2 font-mono">VIN: {MOCK_VEHICLE.vin}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex gap-3">
            <button onClick={handleEdit} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2">
              <Edit3 size={16} /> Edit
            </button>
            <button onClick={handleRequestService} className="px-6 py-2.5 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(53,208,127,0.3)] flex items-center gap-2">
              <Wrench size={16} /> Request Service
            </button>
          </motion.div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Current Mileage</p>
            <p className="text-white font-bold text-lg">{MOCK_VEHICLE.mileage} mi</p>
          </div>
        </div>
        
        <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Next Service Due</p>
            <p className="text-white font-bold text-lg">{MOCK_VEHICLE.nextService}</p>
          </div>
        </div>

        <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Insurance Expires</p>
            <p className="text-white font-bold text-lg">{MOCK_VEHICLE.insuranceExpiry}</p>
          </div>
        </div>

        <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Registration</p>
            <p className="text-white font-bold text-lg">{MOCK_VEHICLE.registrationExpiry}</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content Tabs */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          {[
            { id: 'overview', label: 'Vehicle Overview', icon: Car },
            { id: 'history', label: 'Service History', icon: Wrench },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'qr', label: 'Vehicle QR Code', icon: QrCode }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#35D07F]/10 text-[#35D07F] shadow-[inset_2px_0_0_#35D07F]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                
                {MOCK_VEHICLE.status === 'In Shop' && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                        <PenTool size={20} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold tracking-widest uppercase mb-1">Currently In Shop</h3>
                        <p className="text-blue-200/60 text-xs uppercase tracking-widest">Diagnostic service in progress. Estimated completion: Tomorrow 5 PM.</p>
                      </div>
                    </div>
                    <button onClick={() => navigate('/customer/repairs')} className="px-5 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all shrink-0">
                      Track Status
                    </button>
                  </div>
                )}

                <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                    <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white">Technical Specifications</h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Engine</p>
                      <p className="text-white text-sm">{MOCK_VEHICLE.engine}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Transmission</p>
                      <p className="text-white text-sm">{MOCK_VEHICLE.transmission}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Drivetrain</p>
                      <p className="text-white text-sm">{MOCK_VEHICLE.drive}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Fuel Type</p>
                      <p className="text-white text-sm">{MOCK_VEHICLE.fuel}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Exterior Color</p>
                      <p className="text-white text-sm flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-600 border border-white/20"></span>
                        {MOCK_VEHICLE.color}
                      </p>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                {SERVICE_HISTORY.map(record => (
                  <div key={record.id} className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-[#35D07F] group-hover:bg-[#35D07F]/10 transition-colors">
                        <Wrench size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{record.date}</span>
                          <span className="text-slate-600 text-[10px] uppercase font-bold tracking-widest">•</span>
                          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{record.id}</span>
                        </div>
                        <h3 className="text-white font-bold tracking-widest">{record.desc}</h3>
                        <p className="text-slate-400 text-xs mt-1">{record.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-[#35D07F] font-mono font-bold">{record.cost}</span>
                      <ChevronRight size={18} className="text-slate-600 group-hover:text-[#35D07F] transition-colors" />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'documents' && (
              <motion.div key="documents" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 group">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-[#35D07F]/10 group-hover:text-[#35D07F] transition-colors">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-widest text-sm mb-1">Vehicle Registration</h3>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest">PDF • 1.2 MB</p>
                  </div>
                </div>

                <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 group">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-[#35D07F]/10 group-hover:text-[#35D07F] transition-colors">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-widest text-sm mb-1">Insurance Policy</h3>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest">PDF • 3.4 MB</p>
                  </div>
                </div>

              </motion.div>
            )}
            
            {activeTab === 'qr' && (
              <motion.div key="qr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden p-6 md:p-10 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-[#35D07F]/10 text-[#35D07F] rounded-full flex items-center justify-center mx-auto mb-6">
                    <QrCode size={32} />
                  </div>
                  <h2 className="text-2xl font-light text-white mb-2">Public Vehicle History</h2>
                  <p className="text-white/50 text-sm mb-8">
                    Scan this QR code or share the link to provide temporary access to this vehicle's service history timeline. Ideal for potential buyers or mechanics.
                  </p>

                  {qrLoading && !qrData ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#35D07F]"></div>
                    </div>
                  ) : qrData ? (
                    <div className="space-y-6">
                      <div className="bg-white p-4 rounded-2xl inline-block">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData.qr_url || `${window.location.origin}/v/${qrData.token}`)}`} 
                          alt="Vehicle QR Code" 
                          className="w-48 h-48"
                        />
                      </div>
                      
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between text-left">
                        <div className="overflow-hidden pr-4">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Public Link</p>
                          <p className="text-white text-sm truncate">{qrData.qr_url || `${window.location.origin}/v/${qrData.token}`}</p>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(qrData.qr_url || `${window.location.origin}/v/${qrData.token}`);
                            toast.success('Copied to clipboard');
                          }}
                          className="text-[#35D07F] text-xs font-bold uppercase hover:text-white transition-colors whitespace-nowrap"
                        >
                          Copy
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10">
                        <button 
                          onClick={handleRegenerateQr}
                          disabled={qrLoading}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold tracking-widest uppercase transition-colors"
                        >
                          <RefreshCw size={14} className={qrLoading ? 'animate-spin' : ''} />
                          Regenerate
                        </button>
                        <button 
                          onClick={handleDownloadPdf}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#35D07F]/10 hover:bg-[#35D07F]/20 text-[#35D07F] rounded-xl text-[10px] font-bold tracking-widest uppercase transition-colors"
                        >
                          <Download size={14} />
                          Print PDF
                        </button>
                        <button 
                          onClick={handleRevokeQr}
                          disabled={qrLoading}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-colors"
                        >
                          <XCircle size={14} />
                          Revoke
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 bg-white/5 border border-white/10 rounded-2xl">
                      <QrCode className="mx-auto text-white/20 mb-4" size={48} />
                      <h3 className="text-white font-medium mb-2">No Active QR Code</h3>
                      <p className="text-white/50 text-sm mb-6 max-w-xs mx-auto">Generate a new QR code to share your vehicle's history.</p>
                      <button 
                        onClick={handleRegenerateQr}
                        disabled={qrLoading}
                        className="px-6 py-3 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(53,208,127,0.3)] flex items-center gap-2 mx-auto"
                      >
                        {qrLoading ? <RefreshCw className="animate-spin" size={16} /> : <QrCode size={16} />}
                        Generate QR Code
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

