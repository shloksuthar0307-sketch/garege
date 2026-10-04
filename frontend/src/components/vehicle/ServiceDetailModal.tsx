import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

export default function ServiceDetailModal({ isOpen, onClose, order }: { isOpen: boolean; onClose: () => void; order: any }) {
  if (!isOpen || !order) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-0">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-[var(--bg-input)] backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full md:w-[600px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-[#fafafa]">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">{order.title}</h2>
              <p className="text-sm text-gray-500">Service Order {order.order_number}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors"><X size={16} className="text-gray-900" /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Service Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Status</div>
                <div className="text-sm font-medium text-gray-900">{order.status}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Advisor</div>
                <div className="text-sm font-medium text-gray-900">{order.advisor || '-'}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Technician</div>
                <div className="text-sm font-medium text-gray-900">{order.technician || '-'}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Workshop</div>
                <div className="text-sm font-medium text-gray-900">{order.workshop || '-'}</div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">Service Timeline</h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:via-gray-200 before:to-transparent">
                {order.timeline?.map((event: any, i: number) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-black text-[var(--text-primary)] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <Check size={10} />
                    </div>
                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-gray-100 bg-white shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-semibold text-sm text-gray-900">{event.title}</div>
                        <time className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                           {new Date(event.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </time>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financials */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">Financial Summary</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between"><span>Parts</span><span>₹{order.parts_cost}</span></div>
                <div className="flex justify-between"><span>Labor</span><span>₹{order.labor_cost}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>₹{order.tax}</span></div>
              </div>
              <div className="flex justify-between text-base font-semibold text-gray-900">
                <span>Total</span><span>₹{order.total_cost}</span>
              </div>
            </div>

          </div>
          
          <div className="p-4 border-t border-gray-100 bg-[#fafafa] flex gap-3">
            <button className="flex-1 bg-white border border-gray-200 text-gray-900 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              View Evidence
            </button>
            <button className="flex-1 bg-black text-[var(--text-primary)] text-sm font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
              Download Invoice
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


