import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

interface TechnicianState {
  greasyHandsMode: boolean;
  toggleGreasyHandsMode: () => void;
}

export const useTechnicianStore = create<TechnicianState>()(
  persist(
    (set) => ({
      greasyHandsMode: false,
      toggleGreasyHandsMode: () => set((state) => {
        const nextState = !state.greasyHandsMode;
        if (nextState) {
          toast.success('Greasy Hands Mode Enabled (Large UI & Voice Dictation active)');
        } else {
          toast('Greasy Hands Mode Disabled', { icon: '👋' });
        }
        return { greasyHandsMode: nextState };
      }),
    }),
    { name: 'technician-settings' }
  )
);

