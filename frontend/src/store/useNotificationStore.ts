import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: number;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: '1',
      title: 'Customer Approved',
      message: 'John Doe approved the repair estimate for Brake Pad Replacement.',
      type: 'success',
      read: false,
      timestamp: Date.now() - 1000 * 60 * 5, // 5 mins ago
    },
    {
      id: '2',
      title: 'Parts Ready',
      message: 'Parts for Honda Civic (KA19X1234) are ready for pickup.',
      type: 'info',
      read: false,
      timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
    }
  ],
  addNotification: (notification) => set((state) => ({
    notifications: [
      {
        ...notification,
        id: Math.random().toString(36).substring(7),
        read: false,
        timestamp: Date.now(),
      },
      ...state.notifications
    ]
  })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),
  clearAll: () => set({ notifications: [] })
}));

