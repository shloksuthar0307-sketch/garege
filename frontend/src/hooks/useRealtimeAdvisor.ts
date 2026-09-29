import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export function useRealtimeAdvisor() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // In a production app, the WebSocket URL would depend on env vars and wss://
    const getWsUrl = () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const url = new URL(apiUrl.replace('/api/v1', '/ws/advisor/'));
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      return url.toString();
    };
    const token = localStorage.getItem('accessToken');
    const ws = new WebSocket(`${getWsUrl()}?token=${token}`);

    ws.onopen = () => {
      console.log('✅ Connected to Real-time Advisor Updates');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Always show a toast for real-time events
        if (data.message) {
          toast(data.message, {
            icon: '🔔',
            style: { background: '#111112', color: '#fff', border: '1px solid #35D07F' }
          });
        }

        // Invalidate queries to refresh data across the dashboard
        if (data.type?.startsWith('SERVICE_ORDER_') || data.type === 'DAMAGE_ADDED') {
          queryClient.invalidateQueries({ queryKey: ['advisor-active-services'] });
          queryClient.invalidateQueries({ queryKey: ['advisor-stats'] });
        }
        
        if (data.type === 'NEW_MESSAGE') {
          queryClient.invalidateQueries({ queryKey: ['advisor-conversations'] });
          queryClient.invalidateQueries({ queryKey: ['advisor-messages'] });
        }
      } catch (err) {
        console.error('Error parsing WebSocket message', err);
      }
    };

    ws.onclose = () => {
      console.log('❌ Disconnected from Real-time Updates');
      // Could implement a reconnect mechanism here
    };

    return () => {
      ws.close();
    };
  }, [queryClient]);
}

