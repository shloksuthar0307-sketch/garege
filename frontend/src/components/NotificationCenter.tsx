import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, Check, Trash2, X } from 'lucide-react';
import { useNotificationStore } from '../store/useNotificationStore';
import type { AppNotification } from '../store/useNotificationStore';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  const [toasts, setToasts] = useState<AppNotification[]>([]);

  // Show a toast when a new notification arrives
  useEffect(() => {
    // In a real app we'd subscribe to the store and diff, but for now
    // let's just listen for a custom event or let the store handle it.
    // For simplicity, any new unread notification in the last 2 seconds can be toasted.
    const newUnread = notifications.filter(n => !n.read && Date.now() - n.timestamp < 2000);
    if (newUnread.length > 0) {
      setToasts(prev => [...prev, ...newUnread.filter(n => !prev.find(p => p.id === n.id))]);
    }
  }, [notifications]);

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-[#35D07F]" />;
      case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'error': return <XCircle size={16} className="text-red-500" />;
      default: return <Info size={16} className="text-blue-400" />;
    }
  };

  const formatTime = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <>
      {/* BELL ICON / DROPDOWN TOGGLE */}
      <div className="relative z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors relative"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-3 right-3 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0A0A0B] flex items-center justify-center text-[8px] text-white font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* BACKDROP */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />

              {/* DROPDOWN MENU */}
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#111112] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[80vh]"
              >
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-[#1A1A1C]">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    <p className="text-xs text-slate-400">You have {unreadCount} unread messages</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={markAllAsRead}
                      className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                      title="Mark all as read"
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      onClick={clearAll}
                      className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                      title="Clear all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto custom-scrollbar flex-1">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                      <Bell size={24} className="mb-2 opacity-20" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => !notif.read && markAsRead(notif.id)}
                          className={`p-4 border-b border-white/5 flex gap-3 cursor-pointer transition-colors ${
                            notif.read ? 'opacity-60 hover:bg-white/5' : 'bg-[#35D07F]/5 hover:bg-[#35D07F]/10'
                          }`}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {getIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm font-medium truncate pr-2 ${notif.read ? 'text-slate-300' : 'text-white'}`}>
                                {notif.title}
                              </h4>
                              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                {formatTime(notif.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 rounded-full bg-[#35D07F] mt-1.5 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* TOAST CONTAINER */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-[#111112] border border-white/10 rounded-xl shadow-2xl p-4 w-80 pointer-events-auto flex gap-3 items-start"
            >
              <div className="mt-0.5">
                {getIcon(toast.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white mb-1">{toast.title}</h4>
                <p className="text-xs text-slate-400">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-slate-500 hover:text-white"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

