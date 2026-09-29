import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchServiceHistory } from '../../api/client';

export default function ServiceHistoryDrawer({ isOpen, onClose, vehicleId, onOpenDetail }: { isOpen: boolean; onClose: () => void; vehicleId: string; onOpenDetail: (order: any) => void }) {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const { data: services, isLoading } = useQuery({
    queryKey: ['serviceHistory', vehicleId, search, activeTab],
    queryFn: () => fetchServiceHistory(vehicleId, search, activeTab),
    enabled: isOpen && !!vehicleId && vehicleId !== '1',
  });

  // Dummy data for presentation mode when the backend isn't connected
  const dummyServices = [
    { id: '1', date_created: '2026-08-15T10:00:00Z', title: '10,000 Mile Service', type: 'Maintenance', order_number: 'SRV-1029', total_cost: '450.00' },
    { id: '2', date_created: '2026-06-22T14:30:00Z', title: 'Brake Fluid Flush', type: 'Repair', order_number: 'SRV-0982', total_cost: '210.00' },
    { id: '3', date_created: '2026-02-10T09:15:00Z', title: 'Annual Inspection', type: 'Inspection', order_number: 'SRV-0844', total_cost: '150.00' },
  ];

  const displayServices = services || dummyServices;
  const isFetching = isLoading && vehicleId !== '1';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex justify-end pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full md:w-[600px] h-full bg-[#fafafa] shadow-2xl flex flex-col pointer-events-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">Service History</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors z-50">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="relative w-full mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search service history..." 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:border-black transition-colors" 
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['All', 'Maintenance', 'Repair', 'Inspection', 'Warranty'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                      activeTab === tab 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isFetching && services === undefined ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                  <div className="text-sm text-gray-500">Loading history...</div>
                </div>
              ) : displayServices.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-10">No matching services found.</div>
              ) : (
                displayServices.map((order: any) => (
                  <div key={order.id} className="flex gap-4 relative group">
                    <div className="w-16 pt-5 text-[10px] font-bold text-gray-400 text-right uppercase">
                      {new Date(order.date_created).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex-1 bg-white border border-gray-200 rounded-xl p-5 hover:border-black transition-colors flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">{order.title}</h3>
                        <p className="text-xs text-gray-500">{order.type} • {order.order_number}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-sm font-semibold text-gray-900">${order.total_cost}</span>
                        <button 
                          onClick={() => onOpenDetail(order)}
                          className="text-[10px] font-semibold uppercase tracking-wider text-black border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

