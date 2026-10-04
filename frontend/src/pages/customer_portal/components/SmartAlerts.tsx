import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Wrench, Calendar, CreditCard, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SmartAlerts() {
  const navigate = useNavigate();

  const alerts: any[] = [];

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence>
        {alerts.map((alert, idx) => (
          <motion.div 
            key={alert.id}
            onClick={() => navigate(alert.link)}
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: idx * 0.1 }}
            className={`bg-${alert.color}-500/10 border border-${alert.color}-500/20 text-${alert.color}-400 px-4 py-3 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-${alert.color}-500/20 transition-all`}
          >
            <div className="flex items-center gap-3">
              <alert.icon size={18} />
              <span className="text-xs font-bold tracking-widest uppercase">{alert.message}</span>
            </div>
            <button className={`text-${alert.color}-400 hover:text-${alert.color}-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1`}>
              {alert.actionText} <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}


