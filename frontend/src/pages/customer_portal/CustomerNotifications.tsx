import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, FileText, Wrench, Camera, CheckCircle2, ChevronRight, CheckSquare, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../../api/customer';

export default function CustomerNotifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['customer-notifications'],
    queryFn: customerApi.getNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => customerApi.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer-notifications'] })
  });

  const markAllReadMutation = useMutation({
    mutationFn: customerApi.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-notifications'] });
      toast.success('All notifications marked as read', {
        style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
        iconTheme: { primary: '#35D07F', secondary: '#000' }
      });
    }
  });

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleNotificationClick = (notif: any) => {
    // Mark as read
    if (!notif.is_read) {
      markReadMutation.mutate(notif.id);
    }
    // Navigate to link
    if (notif.action_url) {
      navigate(notif.action_url);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto pb-10 min-h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <Bell className="text-[#35D07F]" size={28} />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-[#35D07F] text-black text-sm px-3 py-1 rounded-full ml-2">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">
            Stay updated on your vehicle's repair progress and approvals.
          </p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <button 
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text-primary)] border border-[var(--border-default)] rounded-xl text-xs font-bold tracking-widest uppercase transition-all"
          >
            <CheckSquare size={16} /> Mark All Read
          </button>
        </motion.div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 space-y-4">
        <AnimatePresence>
          {notifications.length === 0 ? <div className="text-[var(--text-muted)] text-xs font-bold tracking-widest uppercase p-16 text-center bg-[var(--bg-primary)]/80 rounded-2xl border border-[var(--border-subtle)]">No notifications.</div> : notifications.map((notif: any, index: number) => {
            let Icon = Bell;
            let iconClass = 'bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/20';
            if (notif.notification_type === 'MESSAGE') {
              Icon = FileText;
              iconClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            } else if (notif.notification_type === 'WARNING' || notif.notification_type === 'ERROR') {
              Icon = AlertTriangle;
              iconClass = 'bg-red-500/10 text-red-400 border-red-500/20';
            } else if (notif.notification_type === 'SUCCESS') {
              Icon = CheckCircle2;
              iconClass = 'bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/20';
            }
            return (
            <motion.div 
              key={notif.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              onClick={() => handleNotificationClick(notif)}
              className={`group relative bg-[var(--bg-primary)]/80 backdrop-blur-md border rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all overflow-hidden ${
                !notif.is_read 
                  ? 'border-[#35D07F]/30 hover:border-[#35D07F]/60 hover:bg-[#35D07F]/5' 
                  : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-white/[0.02]'
              }`}
            >
              {/* Unread indicator line */}
              {!notif.is_read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#35D07F] shadow-[0_0_10px_rgba(53,208,127,0.5)]"></div>
              )}

              <div className="flex items-start md:items-center gap-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${iconClass}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`text-base font-bold tracking-widest ${!notif.is_read ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                      {notif.title}
                    </h3>
                    {!notif.is_read && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-[#35D07F]/20 text-[#35D07F] border border-[#35D07F]/30">
                        New
                      </span>
                    )}
                  </div>
                  <p className={`text-sm tracking-wide ${!notif.is_read ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`}>
                    {notif.message}
                  </p>
                  <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mt-2 block md:hidden">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center justify-end gap-6 shrink-0 min-w-[150px]">
                <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">{new Date(notif.created_at).toLocaleString()}</p>
                <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-hover)] group-hover:bg-[#35D07F] text-[var(--text-muted)] group-hover:text-black flex items-center justify-center transition-all">
                  <ChevronRight size={16} />
                </div>
              </div>
            </motion.div>
          )})}
        </AnimatePresence>

        {notifications.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center text-[var(--text-muted)] mb-4">
              <Check size={24} />
            </div>
            <h3 className="text-[var(--text-primary)] font-bold tracking-widest uppercase mb-2">You're all caught up!</h3>
            <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">No new notifications at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}



