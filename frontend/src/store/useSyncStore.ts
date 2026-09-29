import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SyncRequest {
  id: string;
  url: string;
  method: string;
  body?: any;
  timestamp: number;
}

interface SyncState {
  isOnline: boolean;
  queue: SyncRequest[];
  setOnlineStatus: (status: boolean) => void;
  addToQueue: (request: Omit<SyncRequest, 'id' | 'timestamp'>) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      queue: [],
      setOnlineStatus: (status) => set({ isOnline: status }),
      addToQueue: (request) => set((state) => ({
        queue: [...state.queue, { ...request, id: Math.random().toString(36).substring(7), timestamp: Date.now() }]
      })),
      removeFromQueue: (id) => set((state) => ({
        queue: state.queue.filter(r => r.id !== id)
      })),
      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: 'sync-queue-storage',
    }
  )
);

