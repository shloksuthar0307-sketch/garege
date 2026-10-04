import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, X, QrCode, Check } from 'lucide-react';
import { Settings, FileText, Share2, Calendar, Shield, Activity, Droplets } from 'lucide-react';

export function MyVehicle2D() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState('https://repairtrace.app/v/Vehicle-718');
  
  useEffect(() => {
    const fetchQr = async () => {
      try {
        const response = await fetch('/api/v1/vehicles/1/qr/');
        if (response.ok) {
          const data = await response.json();
          setQrUrl(data.qr_url);
        }
      } catch (e) {
        console.error('Failed to fetch QR', e);
      }
    };
    fetchQr();
  }, []);

  const handleCopy = () => { navigator.clipboard.writeText(qrUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Left Column: Vehicle Visual & Specs */}
        <div className="w-full md:w-1/3">
          <div className="aspect-square bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-3xl border border-[var(--border-subtle)] flex items-center justify-center p-8 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0%,#ffffff_0%,transparent_60%)]" />
            <img src="/vehicle.png" alt="Vehicle" className="w-full object-contain drop-shadow-2xl z-10" />
          </div>
          
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight mb-2">Your Vehicle</h1>
          <p className="text-gray-400 font-mono text-sm mb-8">GJ &bull; XX &bull; XXXX</p>
          
          <div className="space-y-4">
            <div onClick={() => setIsEditOpen(true)} className="bg-[#111] p-5 rounded-2xl border border-[var(--border-subtle)] flex justify-between items-center hover:bg-[#1a1a1a] cursor-pointer transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center">
                  <Settings className="w-4 h-4 text-[var(--text-primary)]" />
                </div>
                <span className="text-[var(--text-primary)] font-medium text-sm">Edit Specifications</span>
              </div>
            </div>
            <div onClick={() => setIsShareOpen(true)} className="bg-[#111] p-5 rounded-2xl border border-[var(--border-subtle)] flex justify-between items-center hover:bg-[#1a1a1a] cursor-pointer transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-[var(--text-primary)]" />
                </div>
                <span className="text-[var(--text-primary)] font-medium text-sm">Share Vehicle Profile</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Health & History */}
        <div className="w-full md:w-2/3 space-y-12">
          
          {/* Specification Grid */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Specifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#111] border border-[var(--border-subtle)] rounded-2xl p-5">
                <p className="text-xs text-gray-500 mb-1">Year</p>
                <p className="text-[var(--text-primary)] font-medium">2022</p>
              </div>
              <div className="bg-[#111] border border-[var(--border-subtle)] rounded-2xl p-5">
                <p className="text-xs text-gray-500 mb-1">Fuel Type</p>
                <p className="text-[var(--text-primary)] font-medium">Petrol</p>
              </div>
              <div className="bg-[#111] border border-[var(--border-subtle)] rounded-2xl p-5">
                <p className="text-xs text-gray-500 mb-1">Transmission</p>
                <p className="text-[var(--text-primary)] font-medium">PDK Auto</p>
              </div>
              <div className="bg-[#111] border border-[var(--border-subtle)] rounded-2xl p-5">
                <p className="text-xs text-gray-500 mb-1">Mileage</p>
                <p className="text-[var(--text-primary)] font-medium font-mono">42,850 KM</p>
              </div>
            </div>
          </div>

          {/* Vehicle Health Overview */}
          <div>
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Health Overview</h3>
              <span className="text-xs text-emerald-500 font-medium px-3 py-1 bg-emerald-500/10 rounded-full">Good Condition</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#111] border border-emerald-500/20 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-[var(--text-primary)] font-medium text-sm mb-1">Engine & Transmission</h4>
                  <p className="text-xs text-gray-400">Operating within optimal parameters. No faults detected.</p>
                </div>
              </div>
              
              <div className="bg-[#111] border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4 shadow-[0_0_15px_rgba(245,158,11,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full" />
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-[var(--text-primary)] font-medium text-sm mb-1">Braking System</h4>
                  <p className="text-xs text-gray-400">Action Required: Front brake pads worn below 3mm threshold.</p>
                </div>
              </div>
              
              <div className="bg-[#111] border border-[var(--border-subtle)] rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center flex-shrink-0">
                  <Droplets className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h4 className="text-[var(--text-primary)] font-medium text-sm mb-1">Fluids & Filters</h4>
                  <p className="text-xs text-gray-400">Oil change recommended in 2,000 KM.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {isEditOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[var(--bg-overlay)] backdrop-blur-sm flex items-center justify-center p-4 md:p-0"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="bg-[#111] border border-[var(--border-default)] rounded-3xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center">
                <h2 className="text-xl font-medium text-[var(--text-primary)]">Edit Specifications</h2>
                <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-[var(--text-primary)] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 uppercase tracking-wider">Make</label>
                    <input type="text" defaultValue="" className="w-full bg-[#1a1a1a] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 uppercase tracking-wider">Model</label>
                    <input type="text" defaultValue="" className="w-full bg-[#1a1a1a] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 uppercase tracking-wider">License Plate</label>
                  <input type="text" defaultValue="GJ-XX-XXXX" className="w-full bg-[#1a1a1a] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--border-strong)]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 uppercase tracking-wider">Year</label>
                    <input type="text" defaultValue="2024" className="w-full bg-[#1a1a1a] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 uppercase tracking-wider">Color</label>
                    <input type="text" defaultValue="Deep Graphite Metallic" className="w-full bg-[#1a1a1a] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 uppercase tracking-wider">VIN Number</label>
                  <input type="text" defaultValue="WP0AA298ZMS2XXXXX" className="w-full bg-[#1a1a1a] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:border-[var(--border-strong)]" />
                </div>
              </div>
              <div className="p-6 border-t border-[var(--border-subtle)] bg-[#0a0a0a] flex justify-end gap-3">
                <button onClick={() => setIsEditOpen(false)} className="px-6 py-3 rounded-xl text-[var(--text-primary)] font-medium text-sm hover:bg-[var(--bg-surface-hover)] transition-colors">Cancel</button>
                <button onClick={() => setIsEditOpen(false)} className="px-6 py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-gray-200 transition-colors">Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isShareOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[var(--bg-overlay)] backdrop-blur-sm flex items-center justify-center p-4 md:p-0"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="bg-[#111] border border-[var(--border-default)] rounded-3xl w-full max-w-sm overflow-hidden text-center"
            >
              <div className="p-6 border-b border-[var(--border-subtle)] relative">
                <h2 className="text-xl font-medium text-[var(--text-primary)]">Share Vehicle</h2>
                <button onClick={() => setIsShareOpen(false)} className="absolute right-6 top-6 text-gray-400 hover:text-[var(--text-primary)] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 flex flex-col items-center">
                <div className="w-32 h-32 bg-white rounded-2xl p-2 mb-6 flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                  <QrCode className="w-full h-full text-black" strokeWidth={1} />
                </div>
                <h3 className="text-[var(--text-primary)] font-medium text-lg mb-1">Your Vehicle</h3>
                <p className="text-gray-400 text-sm mb-8">Scan to view complete service history</p>
                
                <div className="w-full bg-[#1a1a1a] rounded-xl p-2 flex items-center border border-[var(--border-subtle)]">
                  <input type="text" readOnly value={qrUrl} className="bg-transparent border-none outline-none text-gray-400 text-sm font-mono flex-1 px-3" />
                  <button onClick={handleCopy} className="bg-[var(--bg-surface-active)] hover:bg-white/20 text-[var(--text-primary)] p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



