import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import ShareHistoryDialog from './ShareHistoryDialog';
import BookServiceModal from './BookServiceModal';

interface VehicleActionSectionProps {
  vehicleId: string;
  onViewHistory: () => void;
  className?: string;
}

export default function VehicleActionSection({ vehicleId, onViewHistory, className = '' }: VehicleActionSectionProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className={`flex flex-col gap-4 w-full max-w-[420px] mx-auto ${className}`}>
      
      <button 
        onClick={() => setIsBookingOpen(true)}
        className="w-full bg-black text-[var(--text-primary)] text-sm font-semibold h-12 rounded-[14px] shadow-sm hover:bg-gray-800 transition-all active:scale-[0.98] flex items-center justify-center"
      >
        Book Service
      </button>

      <button 
        onClick={onViewHistory}
        className="w-full bg-white border border-gray-200 text-gray-900 text-sm font-medium h-12 rounded-[14px] hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-[0.98] flex items-center justify-center"
      >
        View Service History
      </button>

      <button 
        onClick={() => setIsShareOpen(true)}
        className="group w-full flex items-center justify-center gap-2 bg-transparent text-gray-500 text-sm font-medium h-12 rounded-[14px] hover:text-gray-900 transition-colors mt-2"
      >
        <Share2 size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        Share Vehicle History
      </button>

      <BookServiceModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        vehicleId={vehicleId}
      />

      <ShareHistoryDialog 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
        vehicleId={vehicleId} 
      />
    </div>
  );
}


