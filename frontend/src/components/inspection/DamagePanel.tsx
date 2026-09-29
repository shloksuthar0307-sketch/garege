import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2 } from 'lucide-react';

export interface DamageData {
  id?: string;
  zone: string;
  mesh_identifier: string;
  damage_type: string;
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Critical';
  description: string;
  estimated_hours: string;
  estimated_cost: string;
  world_position_x: number;
  world_position_y: number;
  world_position_z: number;
}

interface DamagePanelProps {
  damage: DamageData;
  onSave: (data: DamageData) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export function DamagePanel({ damage, onSave, onDelete, onClose }: DamagePanelProps) {
  const [formData, setFormData] = useState<DamageData>(damage);

  useEffect(() => {
    setFormData(damage);
  }, [damage]);

  const handleChange = (field: keyof DamageData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const severityOptions = ['Minor', 'Moderate', 'Severe', 'Critical'] as const;
  const damageTypes = [
    'Scratch', 'Dent', 'Crack', 'Paint Damage', 'Collision', 
    'Rust', 'Broken Component', 'Missing Component', 'Mechanical Issue', 'Other'
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="absolute top-4 right-4 w-80 bg-[#111112]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[calc(100%-2rem)]"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">{formData.zone}</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Damage Annotation</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto custom-scrollbar space-y-4 flex-1">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Severity</label>
            <div className="grid grid-cols-2 gap-2">
              {severityOptions.map(sev => (
                <button
                  key={sev}
                  onClick={() => handleChange('severity', sev)}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    formData.severity === sev 
                      ? 'bg-white/10 border-white/20 text-white' 
                      : 'bg-black/40 border-white/5 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Damage Type</label>
            <select 
              value={formData.damage_type}
              onChange={(e) => handleChange('damage_type', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#35D07F]"
            >
              {damageTypes.map(dt => <option key={dt} value={dt}>{dt}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Detailed notes..."
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#35D07F] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Est. Labor</label>
              <div className="relative">
                <input 
                  type="number" step="0.5"
                  value={formData.estimated_hours}
                  onChange={(e) => handleChange('estimated_hours', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">hrs</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Est. Cost</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">₹</span>
                <input 
                  type="number" step="100"
                  value={formData.estimated_cost}
                  onChange={(e) => handleChange('estimated_cost', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-6 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#35D07F]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-black/40 flex justify-between items-center gap-3 shrink-0">
          {formData.id && onDelete ? (
            <button 
              onClick={() => onDelete(formData.id!)}
              className="p-2 text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          ) : <div />}
          <button 
            onClick={() => onSave(formData)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <Check size={14} /> Save Annotation
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

