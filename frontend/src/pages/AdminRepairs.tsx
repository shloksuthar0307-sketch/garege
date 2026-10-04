import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, X } from 'lucide-react';
import { RepairKanban } from '../components/repairs/RepairKanban';
import type { RepairJob } from '../components/repairs/RepairCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { advisorApi } from '../api/advisor';
import toast from 'react-hot-toast';

export default function AdminRepairs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [jobs, setJobs] = useState<RepairJob[]>([]);
  const queryClient = useQueryClient();

  const { data: serviceOrders = [], isLoading } = useQuery({
    queryKey: ['active-repairs'],
    queryFn: () => advisorApi.getActiveServiceOrders()
  });

  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['advisor-vehicles'],
    queryFn: () => advisorApi.getVehicles(),
    enabled: showNewJobModal
  });

  useEffect(() => {
    if (serviceOrders) {
      const mappedJobs: RepairJob[] = serviceOrders.map((so: any) => ({
        id: so.id,
        vehicle: so.vehicle?.model ? `${so.vehicle.make} ${so.vehicle.model}` : (so.title || 'Unknown Vehicle'),
        reg: so.vehicle?.registration_number || 'N/A',
        service: so.type || 'General Service',
        technician: so.technician || 'Unassigned',
        labor: `${so.progress}% Done`, 
        damages: so.inspections?.length || 0,
        cost: Number(so.total_cost) || 0,
        status: so.status || 'CHECKED_IN'
      }));
      setJobs(mappedJobs);
    }
  }, [serviceOrders]);

  const filteredJobs = jobs.filter(job => {
    const search = searchTerm.toLowerCase();
    return (
      job.vehicle.toLowerCase().includes(search) ||
      job.reg.toLowerCase().includes(search) ||
      job.service.toLowerCase().includes(search) ||
      job.id.toLowerCase().includes(search)
    );
  });

  const [newJobData, setNewJobData] = useState({ title: '', vehicle_id: '', type: 'Repair' });
  
  const createJobMutation = useMutation({
    mutationFn: (data: any) => advisorApi.createServiceOrder({
      title: data.title,
      type: data.type,
      status: 'CHECKED_IN',
      vehicle_id: data.vehicle_id
    }),
    onSuccess: () => {
      setShowNewJobModal(false);
      setNewJobData({ title: '', vehicle_id: '', type: 'Repair' });
      toast.success('New job created!');
      queryClient.invalidateQueries({ queryKey: ['active-repairs'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create job');
    }
  });

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobData.title) return toast.error('Please enter a job title');
    if (!newJobData.vehicle_id) return toast.error('Please select a vehicle');
    createJobMutation.mutate(newJobData);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight">Active Repairs</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Drag and drop vehicles across the workshop pipeline.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              type="text" placeholder="Search vehicle or order..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
            />
          </div>
          <button className="p-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <Filter size={18} />
          </button>
          <button 
            onClick={() => setShowNewJobModal(true)}
            className="flex items-center gap-2 bg-[#35D07F] hover:bg-[#2EB86F] text-black px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors"
          >
            <Plus size={16} /> New Job
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-[var(--text-muted)]">Loading repairs...</div>
        ) : (
          <RepairKanban jobs={filteredJobs} setJobs={setJobs} />
        )}
      </div>

      {showNewJobModal && (
        <div className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1B] border border-[var(--border-default)] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-black/20">
              <h3 className="text-lg font-medium text-[var(--text-primary)]">Create New Job</h3>
              <button onClick={() => setShowNewJobModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateJob} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Job Title</label>
                <input 
                  type="text" 
                  value={newJobData.title}
                  onChange={e => setNewJobData({...newJobData, title: e.target.value})}
                  className="w-full bg-black border border-[var(--border-default)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                  placeholder="e.g. Brake Replacement"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Vehicle</label>
                <select 
                  value={newJobData.vehicle_id}
                  onChange={e => setNewJobData({...newJobData, vehicle_id: e.target.value})}
                  className="w-full bg-black border border-[var(--border-default)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.registration_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Type</label>
                <select 
                  value={newJobData.type}
                  onChange={e => setNewJobData({...newJobData, type: e.target.value})}
                  className="w-full bg-black border border-[var(--border-default)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[#35D07F]"
                >
                  <option value="Repair">Repair</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Warranty">Warranty</option>
                </select>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={createJobMutation.isPending}
                  className="w-full bg-[#35D07F] text-black font-bold py-2.5 rounded-lg hover:bg-[#2EB86F] transition-colors disabled:opacity-50"
                >
                  {createJobMutation.isPending ? 'Creating...' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


