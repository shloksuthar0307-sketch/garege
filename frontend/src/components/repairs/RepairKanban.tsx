import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { RepairColumn } from './RepairColumn';
import { RepairCard } from './RepairCard';
import type { RepairJob } from './RepairCard';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { advisorApi } from '../../api/advisor';

const STAGES = [
  'CHECKED_IN',
  'DIAGNOSIS',
  'AWAITING_APPROVAL',
  'AWAITING_PARTS',
  'IN_WORKSHOP',
  'QUALITY_CHECK',
  'READY_FOR_PICKUP',
  'COMPLETED'
];

const STAGE_LABELS: Record<string, string> = {
  'CHECKED_IN': 'Checked In',
  'DIAGNOSIS': 'Diagnosis',
  'AWAITING_APPROVAL': 'Awaiting Approval',
  'AWAITING_PARTS': 'Parts Pending',
  'IN_WORKSHOP': 'In Workshop',
  'QUALITY_CHECK': 'Quality Check',
  'READY_FOR_PICKUP': 'Ready for Pickup',
  'COMPLETED': 'Completed'
};

export function RepairKanban({ jobs, setJobs }: { jobs: RepairJob[], setJobs: React.Dispatch<React.SetStateAction<RepairJob[]>> }) {
  const [activeJob, setActiveJob] = useState<RepairJob | null>(null);
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => advisorApi.updateServiceOrder(id, { status }),
    onError: () => {
      toast.error('Failed to update status. Rolled back.');
      queryClient.invalidateQueries({ queryKey: ['active-repairs'] });
    }
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveJob(jobs.find(job => job.id === active.id) || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJob(null);

    if (!over) return;

    const jobId = active.id as string;
    const newStatus = over.id as string;

    const job = jobs.find(j => j.id === jobId);
    if (!job || job.status === newStatus) return;

    if (job.status === 'COMPLETED' && newStatus === 'IN_WORKSHOP') {
      toast.error('Cannot move a completed vehicle back to workshop without authorization.');
      return;
    }

    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    
    updateStatusMutation.mutate({ id: jobId, status: newStatus });
    
    toast.success(`Moved to ${STAGE_LABELS[newStatus]}`, {
      style: { background: '#111112', color: '#fff', border: '1px solid #35D07F' }
    });
  };

  return (
    <DndContext 
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto custom-scrollbar pb-4">
        {STAGES.map(stage => (
          <RepairColumn 
            key={stage}
            id={stage}
            title={STAGE_LABELS[stage]}
            jobs={jobs.filter(j => j.status === stage)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeJob ? <RepairCard job={activeJob} /> : null}
      </DragOverlay>
    </DndContext>
  );
}


