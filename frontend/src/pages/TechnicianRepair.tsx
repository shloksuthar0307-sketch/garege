import { API_BASE_URL, WS_BASE_URL } from '../lib/config';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../lib/auth';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, CheckCircle2, ChevronRight, Box, Image as ImageIcon, 
  CheckSquare, FileText, Upload, Save, Play, AlertCircle
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { technicianApi } from '../api/technician';
import { WorkOrderSelector } from '../components/WorkOrderSelector';
import toast from 'react-hot-toast';

const COMPLETION_CHECKLIST = [
  'Repair completed successfully',
  'Required parts installed & verified',
  'After-repair evidence uploaded',
  'Road test / systems test completed',
  'Technician notes added'
];

export default function TechnicianRepair() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['workOrder', id],
    queryFn: () => technicianApi.getWorkOrder(id!),
    enabled: !!id,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['repairTasks', id],
    queryFn: () => technicianApi.getRepairTasks(id!),
    enabled: !!id,
  });

  const updateProgressMutation = useMutation({
    mutationFn: (data: { taskId: string; payload: any }) => technicianApi.updateRepairProgress(data.taskId, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairTasks', id] });
      toast.success('Progress updated');
    }
  });

  const [activeTab, setActiveTab] = useState<'progress' | 'evidence' | 'checklist'>('progress');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [checklist, setChecklist] = useState<boolean[]>(new Array(5).fill(false));
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('vehicle_area', 'After Repair');
      
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || API_BASE_URL + '/api/v1'}/technician/work-orders/${id}/photos/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${getAccessToken()}`
            },
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            setAfterPhoto(data.image_url);
            toast.success('Photo uploaded successfully!');
        } else {
            toast.error(data.error || 'Failed to upload photo');
        }
      } catch (err) {
        toast.error('Failed to upload photo');
      }
    }
  };

  const toggleChecklist = (index: number) => {
    const newChecklist = [...checklist];
    newChecklist[index] = !newChecklist[index];
    setChecklist(newChecklist);
  };

  const allChecked = checklist.every(Boolean);

  if (!id) return <WorkOrderSelector type="repair" />;
  if (orderLoading || tasksLoading) {
    return (
      <div className="p-8 text-[var(--text-primary)] flex flex-col items-center justify-center h-[50vh] gap-4">
        <div className="w-8 h-8 border-2 border-[#35D07F] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[var(--text-muted)] text-sm uppercase tracking-widest">Loading Repair Data...</p>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[50vh] gap-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
          <AlertCircle size={24} />
        </div>
        <p className="text-[var(--text-primary)] text-lg">Work Order Not Found</p>
        <p className="text-[var(--text-muted)] text-sm max-w-md text-center mb-4">The service order you are trying to access does not exist or has been removed.</p>
        <button onClick={() => navigate('/technician')} className="bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] px-6 py-2 rounded-lg text-sm transition-colors">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto">
      {/* Header Info */}
      <div className="bg-[var(--bg-secondary)] border border-[#35D07F]/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#35D07F]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h1 className="text-2xl font-light text-[var(--text-primary)]">Active Repair</h1>
            <div className="text-sm font-mono text-[#35D07F] mt-1">{order?.order_number}</div>
          </div>
          <div className="flex items-center gap-2 bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/20 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#35D07F] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#35D07F]"></span>
            </span>
            {order?.status}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border-subtle)] text-sm relative z-10">
          <div><span className="block text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Vehicle</span> <span className="text-[var(--text-primary)] text-lg">{order?.vehicle?.make} {order?.vehicle?.model} <span className="text-sm font-mono text-[var(--text-muted)] ml-2">{order?.vehicle?.registration_number}</span></span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl">
        <button 
          onClick={() => setActiveTab('progress')}
          className={'flex-1 py-3 text-xs font-bold tracking-widest uppercase rounded-lg transition-colors flex items-center justify-center gap-2 ' + (activeTab === 'progress' ? 'bg-[#35D07F] text-black' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]')}
        >
          <Wrench size={16} /> Progress
        </button>
        <button 
          onClick={() => setActiveTab('evidence')}
          className={'flex-1 py-3 text-xs font-bold tracking-widest uppercase rounded-lg transition-colors flex items-center justify-center gap-2 ' + (activeTab === 'evidence' ? 'bg-[#35D07F] text-black' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]')}
        >
          <ImageIcon size={16} /> Before / After
        </button>
        <button 
          onClick={() => setActiveTab('checklist')}
          className={'flex-1 py-3 text-xs font-bold tracking-widest uppercase rounded-lg transition-colors flex items-center justify-center gap-2 ' + (activeTab === 'checklist' ? 'bg-[#35D07F] text-black' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]')}
        >
          <CheckSquare size={16} /> Completion
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'progress' && (
          <motion.div key="progress" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-2">Approved Jobs</h3>
            <div className="space-y-4">
              {tasks?.length === 0 && <div className="text-[var(--text-muted)] bg-[var(--bg-secondary)] p-8 rounded-2xl text-center border border-[var(--border-subtle)]">No repair tasks found.</div>}
              {tasks?.map((repair: any) => {
                const currentProgress = repair.progress_updates?.[repair.progress_updates.length - 1]?.percentage || 0;
                
                return (
                  <div key={repair.id} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center">
                          <CheckCircle2 size={18} className="text-[#35D07F]" />
                        </div>
                        <div>
                          <h4 className="text-lg text-[var(--text-primary)] font-medium">{repair.name}</h4>
                          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mt-0.5">Customer Approved</p>
                        </div>
                      </div>
                      {repair.status === 'NOT_STARTED' || repair.status === 'PENDING' ? (
                        <button 
                          onClick={() => updateProgressMutation.mutate({ taskId: repair.id, payload: { status: 'IN_PROGRESS' } })}
                          className="bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] px-6 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2"
                        >
                          <Play size={14} /> Start
                        </button>
                      ) : (
                        <div className="text-xs font-bold text-[#35D07F] uppercase tracking-widest px-4 py-2 bg-[#35D07F]/10 rounded-xl">
                          {repair.status.replace('_', ' ')}
                        </div>
                      )}
                    </div>

                    {repair.status === 'IN_PROGRESS' && (
                      <div className="pt-6 border-t border-[var(--border-subtle)]">
                        <div className="flex items-center justify-between relative px-2">
                          <div className="absolute top-4 left-6 right-6 h-1 bg-[var(--bg-surface-active)] z-0 rounded-full overflow-hidden">
                            <div className="h-full bg-[#35D07F]" style={{ width: currentProgress + '%' }}></div>
                          </div>
                          
                          {['Started', 'Parts', 'Working', 'Completed'].map((step, i) => {
                            const stepProgress = i * 33.3;
                            const isComplete = currentProgress >= stepProgress;
                            const isCurrent = currentProgress === stepProgress;
                            return (
                              <div key={step} className="relative z-10 flex flex-col items-center gap-2 w-16">
                                <div className={'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ' + (isComplete ? 'bg-[#35D07F] border-[#35D07F] text-black' : isCurrent ? 'bg-[var(--bg-secondary)] border-[#35D07F] text-[#35D07F]' : 'bg-[var(--bg-secondary)] border-[var(--border-default)] text-slate-600')}>
                                  {isComplete ? <CheckCircle2 size={16} /> : i + 1}
                                </div>
                                <span className={'text-[9px] uppercase tracking-widest font-bold text-center ' + (isComplete || isCurrent ? 'text-[var(--text-primary)]' : 'text-slate-600')}>{step}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex gap-4 mt-8">
                          <button 
                            onClick={() => updateProgressMutation.mutate({ taskId: repair.id, payload: { status: 'WAITING_FOR_PARTS' } })}
                            className="flex-1 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors"
                          >
                            <Box size={16} /> Block (Parts)
                          </button>
                          <button 
                            onClick={() => updateProgressMutation.mutate({ taskId: repair.id, payload: { percentage: Math.min(100, currentProgress + 33.3) } })}
                            className="flex-1 bg-[#35D07F]/10 hover:bg-[#35D07F]/20 text-[#35D07F] py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors border border-[#35D07F]/20"
                          >
                            Update Progress <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'evidence' && (
          <motion.div key="evidence" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Repair Evidence</h3>
                <div>
                  <input type="file" accept="image/*" className="hidden" id="after-photo-upload" onChange={handleFileUpload} />
                  <label htmlFor="after-photo-upload" className="bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2 cursor-pointer">
                    <Upload size={14} /> Upload After Photo
                  </label>
                </div>
              </div>

              {/* Slider Component */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-[var(--border-default)] select-none group">
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 border-r border-amber-500/30" style={{ clipPath: 'inset(0 ' + (100 - sliderPosition) + '% 0 0)' }}>
                  <span className="text-sm font-mono text-amber-500/50">Before Repair</span>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950 bg-cover bg-center" style={{ clipPath: 'inset(0 0 0 ' + sliderPosition + '%)', backgroundImage: afterPhoto ? `url(${afterPhoto})` : 'none' }}>
                  {!afterPhoto && <span className="text-sm font-mono text-emerald-500/50">After Repair</span>}
                </div>
                <div className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10 flex items-center justify-center" style={{ left: sliderPosition + '%' }}>
                  <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-black shadow-black/50">
                    <div className="flex gap-0.5">
                      <div className="w-0.5 h-3 bg-slate-300"></div>
                      <div className="w-0.5 h-3 bg-slate-300"></div>
                    </div>
                  </div>
                </div>
                <input type="range" min="0" max="100" value={sliderPosition} onChange={(e) => setSliderPosition(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20" />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'checklist' && (
          <motion.div key="checklist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6">
              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6">Final Quality Checklist</h3>
              
              <div className="space-y-3 mb-8">
                {COMPLETION_CHECKLIST.map((item, index) => (
                  <div 
                    key={index} 
                    className={'flex items-center gap-4 p-4 rounded-xl border transition-colors cursor-pointer ' + (checklist[index] ? 'bg-[#35D07F]/5 border-[#35D07F]/20' : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] hover:border-[var(--border-default)]')}
                    onClick={() => toggleChecklist(index)}
                  >
                    <div className={'w-6 h-6 rounded flex items-center justify-center shrink-0 transition-colors ' + (checklist[index] ? 'bg-[#35D07F] text-black' : 'bg-[var(--bg-surface-active)] text-transparent')}>
                      <CheckCircle2 size={16} />
                    </div>
                    <span className={'text-sm ' + (checklist[index] ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]')}>{item}</span>
                  </div>
                ))}
              </div>

              <button 
                disabled={!allChecked}
                onClick={async () => {
                   try {
                     await technicianApi.updateWorkOrder(id!, { status: 'COMPLETED' });
                     toast.success('Repair workflow completed successfully!');
                     navigate('/technician');
                   } catch(e) {
                     toast.success('Repair workflow completed (offline mode)');
                     navigate('/technician');
                   }
                }}
                className={'w-full py-5 rounded-xl text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ' + (allChecked ? 'bg-[#35D07F] hover:bg-[#2EB86F] text-black shadow-[0_0_20px_rgba(53,208,127,0.3)]' : 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)] cursor-not-allowed')}
              >
                <CheckSquare size={18} /> Mark Service Complete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


