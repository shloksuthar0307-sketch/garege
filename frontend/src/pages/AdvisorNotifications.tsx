import React, { useState } from 'react';
import { Search, Bell, CheckCircle, Info, AlertTriangle, MessageSquare } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { advisorApi } from '../api/advisor';
import toast from 'react-hot-toast';

export default function AdvisorNotifications() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['advisor-notifications'],
    queryFn: () => advisorApi.getNotifications()
  });

  const markReadMutation = useMutation({
    mutationFn: () => advisorApi.markNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisor-notifications'] });
      toast.success('All notifications marked as read');
    }
  });

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time alerts for customer approvals, messages, and workshop events.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => markReadMutation.mutate()} 
            disabled={markReadMutation.isPending || notifications.every((n: any) => n.is_read)}
            className="text-sm font-bold uppercase tracking-widest text-[#35D07F] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark all as read
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
        {isLoading ? (
          <div className="text-center p-8 text-sm text-slate-500 animate-pulse">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-8 text-sm text-slate-500">No notifications yet.</div>
        ) : (
          notifications.map((notif: any) => (
            <div 
              key={notif.id} 
              onClick={() => {
                if (notif.action_url) {
                  navigate(notif.action_url);
                }
              }}
              className={`p-4 rounded-xl border flex items-start gap-4 transition-colors ${notif.action_url ? 'cursor-pointer hover:border-white/20' : ''} ${notif.is_read ? 'bg-[#111112] border-white/5 opacity-70' : 'bg-[#1A1A1B] border-[#35D07F]/20'}`}
            >
              <div className={`mt-1 ${notif.notification_type === 'ALERT' ? 'text-[#35D07F]' : notif.notification_type === 'MESSAGE' ? 'text-blue-400' : 'text-slate-400'}`}>
                {notif.notification_type === 'ALERT' ? <AlertTriangle size={20} /> : notif.notification_type === 'MESSAGE' ? <MessageSquare size={20} /> : <Bell size={20} />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">{formatTime(notif.created_at)}</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

