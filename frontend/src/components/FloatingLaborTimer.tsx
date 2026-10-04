import React, { useEffect, useState } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { useLaborStore } from '../store/useLaborStore';
import { useTechnicianStore } from '../store/useTechnicianStore';

export const FloatingLaborTimer: React.FC = () => {
  const { 
    jobId, 
    isRunning, 
    accumulatedMs, 
    lastStartTime, 
    estimatedMinutes, 
    pauseTimer, 
    resumeTimer, 
    stopJob 
  } = useLaborStore();
  
  const { greasyHandsMode } = useTechnicianStore();
  const [displayMs, setDisplayMs] = useState(accumulatedMs);

  useEffect(() => {
    let interval: number;
    if (isRunning) {
      interval = window.setInterval(() => {
        const now = Date.now();
        const start = lastStartTime || now;
        setDisplayMs(accumulatedMs + (now - start));
      }, 1000);
    } else {
      setDisplayMs(accumulatedMs);
    }
    return () => clearInterval(interval);
  }, [isRunning, accumulatedMs, lastStartTime]);

  if (!jobId) return null;

  const totalSeconds = Math.floor(displayMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const estimatedMs = estimatedMinutes * 60 * 1000;
  const isOvertime = displayMs > estimatedMs;

  return (
    <div className={`fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border ${isOvertime ? 'border-red-500' : 'border-blue-500'} p-4 flex flex-col gap-3 z-50 transition-all ${greasyHandsMode ? 'scale-125 origin-bottom-right' : ''}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <Clock className={isOvertime ? 'text-red-500' : 'text-blue-500'} size={greasyHandsMode ? 28 : 20} />
          <div>
            <div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Current Job</div>
            <div className={`font-mono font-bold ${greasyHandsMode ? 'text-2xl' : 'text-lg'} ${isOvertime ? 'text-red-600 dark:text-red-400' : ''}`}>
              {timeString}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Est. Time</div>
          <div className="font-mono text-sm text-gray-600 dark:text-gray-300">
            {estimatedMinutes}m
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 justify-center">
        {isRunning ? (
          <button 
            onClick={pauseTimer}
            className={`flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-[var(--text-primary)] rounded-lg font-medium transition-colors ${greasyHandsMode ? 'p-4 text-xl' : 'py-2 px-3 text-sm'}`}
          >
            <Pause size={greasyHandsMode ? 24 : 16} />
            Pause
          </button>
        ) : (
          <button 
            onClick={resumeTimer}
            className={`flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-[var(--text-primary)] rounded-lg font-medium transition-colors ${greasyHandsMode ? 'p-4 text-xl' : 'py-2 px-3 text-sm'}`}
          >
            <Play size={greasyHandsMode ? 24 : 16} />
            Resume
          </button>
        )}
        <button 
          onClick={stopJob}
          className={`flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-[var(--text-primary)] rounded-lg font-medium transition-colors ${greasyHandsMode ? 'p-4 text-xl' : 'py-2 px-3 text-sm'}`}
        >
          <Square size={greasyHandsMode ? 24 : 16} />
          Stop
        </button>
      </div>
    </div>
  );
};


