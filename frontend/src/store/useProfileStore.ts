import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProfileState {
  profileImage: string;
  setProfileImage: (image: string) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profileImage: '',
      setProfileImage: (image) => set({ profileImage: image }),
    }),
    {
      name: 'profile-storage',
    }
  )
);

