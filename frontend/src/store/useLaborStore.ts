import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { technicianApi } from '../api/technician';

interface LaborState {
  jobId: string | null;
  isRunning: boolean;
  accumulatedMs: number;
  lastStartTime: number | null;
  estimatedMinutes: number;
  
  startJob: (jobId: string, estimatedMinutes: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopJob: () => Promise<void>;
}

export const useLaborStore = create<LaborState>()(
  persist(
    (set, get) => ({
      jobId: null,
      isRunning: false,
      accumulatedMs: 0,
      lastStartTime: null,
      estimatedMinutes: 0,
      
      startJob: (jobId, estimatedMinutes) => set({
        jobId,
        estimatedMinutes,
        isRunning: true,
        accumulatedMs: 0,
        lastStartTime: Date.now()
      }),
      pauseTimer: () => {
        const { isRunning, lastStartTime, accumulatedMs } = get();
        if (isRunning && lastStartTime) {
          set({
            isRunning: false,
            accumulatedMs: accumulatedMs + (Date.now() - lastStartTime),
            lastStartTime: null
          });
        }
      },
      resumeTimer: () => {
        const { isRunning, jobId } = get();
        if (!isRunning && jobId) {
          set({
            isRunning: true,
            lastStartTime: Date.now()
          });
        }
      },
      stopJob: async () => {
        const { jobId, isRunning, lastStartTime, accumulatedMs } = get();
        if (!jobId) return;
        
        let finalMs = accumulatedMs;
        if (isRunning && lastStartTime) {
          finalMs += (Date.now() - lastStartTime);
        }
        
        // Log to backend
        try {
          await technicianApi.logLaborTime(jobId, finalMs);
        } catch (error) {
          console.error("Failed to log labor time:", error);
        }
        
        set({
          jobId: null,
          isRunning: false,
          accumulatedMs: 0,
          lastStartTime: null,
          estimatedMinutes: 0
        });
      }
    }),
    { name: 'labor-timer-storage' }
  )
);

