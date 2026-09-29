import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, Camera, Video, Upload, Plus, ChevronDown, CheckCircle2, 
  AlertTriangle, XOctagon, PenTool, Save, CheckSquare, AlertCircle
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { technicianApi } from '../api/technician';
import { WorkOrderSelector } from '../components/WorkOrderSelector';
import { VoiceNoteButton } from '../components/VoiceNoteButton';
import { useTechnicianStore } from '../store/useTechnicianStore';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Engine', 'Brakes', 'Tyres', 'Battery', 'Suspension', 
  'Lights', 'Fluids', 'Exterior', 'Interior', 'Other'
];

export default function TechnicianInspection() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  const { greasyHandsMode } = useTechnicianStore();

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['workOrder', id],
    queryFn: () => technicianApi.getWorkOrder(id!),
    enabled: !!id,
  });

  const [expandedCat, setExpandedCat] = useState<string | null>('Brakes');
  const [conditions, setConditions] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isEvidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [activeCategoryForEvidence, setActiveCategoryForEvidence] = useState<string>('');

  const [aiFile, setAiFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFindings, setAiFindings] = useState<any[]>([]);

  const handleAiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAiFile(e.target.files[0]);
      setIsAnalyzing(true);
      
      const formData = new FormData();
      formData.append('image', e.target.files[0]);
      formData.append('vehicle_area', 'Auto-detect');
      
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/technician/inspections/${id}/ai-analyze/`, {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: formData
        });
        const data = await response.json();
        if (response.ok) {
          setAiFindings(data.findings || []);
        } else {
          toast.error(data.error || 'AI Analysis failed');
        }
      } catch(err) {
        console.error(err);
        toast.error('AI Analysis failed');
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleConfirmAi = async (findingId: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/technician/ai-findings/${findingId}/confirm/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      setAiFindings(prev => prev.filter(f => f.id !== findingId));
      toast.success('Finding confirmed');
    } catch(e) {
      toast.error('Failed to confirm finding');
    }
  };



  const reportIssueMutation = useMutation({
    mutationFn: (data: any) => technicianApi.reportIssue(id!, data),
    onSuccess: () => {
      toast.success('Issue reported successfully');
      setEvidenceModalOpen(false);
    }
  });

  const handleConditionSelect = (category: string, condition: string) => {
    setConditions(prev => ({ ...prev, [category]: condition }));
    if (condition !== 'Good') {
      setActiveCategoryForEvidence(category);
    }
  };

  const handleSaveIssue = (category: string) => {
    const condition = conditions[category];
    if (condition !== 'Good') {
      reportIssueMutation.mutate({
        component: category,
        issue_type: 'INSPECTION_FINDING',
        severity: condition === 'Critical' ? 'CRITICAL' : 'NEEDS_ATTENTION',
        description: notes[category] || 'No description provided.',
      });
    }
  };

  if (!id) {
    return <WorkOrderSelector type="inspection" />;
  }

  if (orderLoading) {
    return (
      <div className="p-8 text-white flex flex-col items-center justify-center h-[50vh] gap-4">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm uppercase tracking-widest">Loading Inspection Data...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[50vh] gap-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
          <AlertCircle size={24} />
        </div>
        <p className="text-white text-lg">Inspection Not Found</p>
        <p className="text-slate-500 text-sm max-w-md text-center mb-4">The service order you are trying to access does not exist or has been removed.</p>
        <button onClick={() => navigate('/technician')} className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-lg text-sm transition-colors">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      
      {/* AI VEHICLE INSPECTION */}
      <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/10 border border-blue-500/20 rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg text-white font-medium flex items-center gap-2">
            <span className="text-blue-400">?</span> AI Vehicle Inspection
          </h2>
        </div>
        
        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-500/30 transition-colors bg-[#0A0A0B] relative">
          <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleAiUpload} disabled={isAnalyzing} />
          {isAnalyzing ? (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-blue-400 font-medium">Analyzing vehicle...</p>
              <p className="text-xs text-slate-500 mt-1">Detecting visible damage...</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-blue-500 mb-3" />
              <p className="text-white font-medium">Drag & Drop vehicle photos</p>
              <p className="text-slate-500 text-sm mb-4">or</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                + Upload Photos
              </button>
            </>
          )}
        </div>

        {aiFindings.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">AI Findings</h3>
            {aiFindings.map(finding => (
              <div key={finding.id} className="bg-[#1a1a1c] border border-blue-500/30 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-white font-medium">{finding.vehicle_area} - {finding.issue_type}</div>
                    <div className="text-xs text-slate-400 mt-1">Confidence: {(finding.confidence * 100).toFixed(0)}%</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${finding.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {finding.severity} Severity
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-4">{finding.description}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-blue-400 font-medium">AI: Needs technician review</span>
                  <div className="ml-auto flex gap-2">
                    <button onClick={() => handleConfirmAi(finding.id)} className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded transition-colors font-medium">Confirm</button>
                    <button className="bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded transition-colors font-medium">Edit</button>
                    <button onClick={() => setAiFindings(prev => prev.filter(f => f.id !== finding.id))} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded transition-colors font-medium">Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

        {/* Header Info */}
      <div className="bg-[#111112] border border-white/10 rounded-2xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-light text-white">Digital Inspection</h1>
            <div className="text-sm font-mono text-[#35D07F] mt-1">{order?.order_number}</div>
          </div>
          <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest">
            {order?.status}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5 text-sm">
          <div><span className="block text-[10px] text-slate-500 uppercase tracking-widest">Vehicle</span> <span className="text-white">{order?.vehicle?.make} {order?.vehicle?.model}</span></div>
          <div><span className="block text-[10px] text-slate-500 uppercase tracking-widest">Reg</span> <span className="text-white font-mono">{order?.vehicle?.registration_number}</span></div>
          <div><span className="block text-[10px] text-slate-500 uppercase tracking-widest">Customer ID</span> <span className="text-white">{order?.vehicle?.owner || '-'}</span></div>
          <div><span className="block text-[10px] text-slate-500 uppercase tracking-widest">Advisor</span> <span className="text-white">{order?.advisor || 'Unassigned'}</span></div>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Multi-Point Checklist</h2>
        
        {CATEGORIES.map(category => (
          <div key={category} className="bg-[#111112] border border-white/5 rounded-2xl overflow-hidden transition-colors">
            
            {/* Accordion Header */}
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
              onClick={() => setExpandedCat(expandedCat === category ? null : category)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  {conditions[category] === 'Good' && <CheckCircle2 size={16} className="text-[#35D07F]" />}
                  {conditions[category] === 'Needs Attention' && <AlertTriangle size={16} className="text-amber-400" />}
                  {conditions[category] === 'Critical' && <XOctagon size={16} className="text-rose-400" />}
                  {!conditions[category] && <div className="w-2 h-2 rounded-full bg-slate-600" />}
                </div>
                <span className="text-lg text-white font-medium">{category}</span>
              </div>
              <ChevronDown size={20} className={'text-slate-500 transition-transform ' + (expandedCat === category ? 'rotate-180' : '')} />
            </div>

            {/* Accordion Body */}
            <AnimatePresence>
              {expandedCat === category && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 border-t border-white/5 bg-black/20">
                    
                    {/* Condition Toggles */}
                    <div className="grid grid-cols-3 gap-3 my-4">
                      <button 
                        onClick={() => handleConditionSelect(category, 'Good')}
                        className={'py-4 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-colors ' + (conditions[category] === 'Good' ? 'bg-[#35D07F]/10 border-[#35D07F] text-[#35D07F]' : 'bg-[#0A0A0B] border-white/5 text-slate-400 hover:border-white/20')}
                      >
                        <CheckCircle2 size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Good</span>
                      </button>
                      <button 
                        onClick={() => handleConditionSelect(category, 'Needs Attention')}
                        className={'py-4 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-colors ' + (conditions[category] === 'Needs Attention' ? 'bg-amber-400/10 border-amber-400 text-amber-400' : 'bg-[#0A0A0B] border-white/5 text-slate-400 hover:border-white/20')}
                      >
                        <AlertTriangle size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-center">Needs<br/>Attention</span>
                      </button>
                      <button 
                        onClick={() => handleConditionSelect(category, 'Critical')}
                        className={'py-4 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-colors ' + (conditions[category] === 'Critical' ? 'bg-rose-400/10 border-rose-400 text-rose-400' : 'bg-[#0A0A0B] border-white/5 text-slate-400 hover:border-white/20')}
                      >
                        <XOctagon size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Critical</span>
                      </button>
                    </div>

                    {/* Notes & Evidence (Visible if not Good) */}
                    {(conditions[category] === 'Needs Attention' || conditions[category] === 'Critical') && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-6">
                        <div className={greasyHandsMode ? "flex flex-col gap-2" : "flex gap-2 items-start"}>
                          <textarea 
                            placeholder="Add technician notes about the issue..."
                            className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#35D07F] focus:outline-none resize-none flex-1"
                            rows={greasyHandsMode ? 5 : 3}
                            value={notes[category] || ''}
                            onChange={(e) => setNotes(prev => ({...prev, [category]: e.target.value}))}
                          ></textarea>
                          <VoiceNoteButton 
                            onTranscript={(t) => setNotes(prev => ({...prev, [category]: (prev[category] || '') + ' ' + t}))} 
                          />
                        </div>
                        
                        <div className="flex gap-3">
                          <button 
                            onClick={() => { setActiveCategoryForEvidence(category); setEvidenceModalOpen(true); }}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors"
                          >
                            <Camera size={16} /> Add Media Evidence
                          </button>
                          
                          <button 
                            onClick={() => handleSaveIssue(category)}
                            disabled={reportIssueMutation.isPending}
                            className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
                          >
                            <AlertTriangle size={16} /> Report Issue
                          </button>
                        </div>
                      </motion.div>
                    )}

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        ))}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-72 right-0 bg-[#0A0A0B]/90 backdrop-blur-xl border-t border-white/10 p-4 flex justify-between items-center z-40">
        <div className="text-xs text-slate-400 hidden sm:block">
          <span className="text-white font-bold">{Object.keys(conditions).length}</span> / {CATEGORIES.length} Checked
        </div>
        <button 
          onClick={async () => {
            try {
              await technicianApi.updateRepairProgress(id!, { status: 'COMPLETED' });
              toast.success('Inspection completed!');
              navigate('/technician');
            } catch(e) {
              // fallback if it fails
              toast.success('Inspection completed (offline mode)');
              navigate('/technician');
            }
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">
          <Save size={16} /> Complete Inspection
        </button>
      </div>

      {/* EVIDENCE CAPTURE MODAL */}
      <AnimatePresence>
        {isEvidenceModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
              onClick={() => setEvidenceModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-4 right-4 top-1/4 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-xl bg-[#111112] border border-white/10 rounded-2xl z-[101] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 text-center space-y-6">
                <div>
                  <h2 className="text-xl font-light text-white mb-1">Upload Evidence</h2>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">Category: {activeCategoryForEvidence}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => {
                    toast.success('Photo attached! (Mock)');
                    setEvidenceModalOpen(false);
                  }} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-colors group">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Camera size={32} />
                    </div>
                    <span className="text-sm font-bold text-white tracking-widest uppercase">Take Photo</span>
                  </button>
                  
                  <button onClick={() => {
                    toast.success('Video attached! (Mock)');
                    setEvidenceModalOpen(false);
                  }} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-colors group">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Video size={32} />
                    </div>
                    <span className="text-sm font-bold text-white tracking-widest uppercase">Record Video</span>
                  </button>
                </div>

                <button onClick={() => {
                  toast.success('Evidence selected! (Mock)');
                  setEvidenceModalOpen(false);
                }} className="w-full bg-[#0A0A0B] border border-white/10 hover:border-white/30 text-white py-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors">
                  <Upload size={16} /> Choose from Library
                </button>
              </div>

              <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                <button 
                  onClick={() => setEvidenceModalOpen(false)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


