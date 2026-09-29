import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Car, Wrench, Clock, CheckCircle, AlertTriangle, User, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManagerWorkshop() {
  const [orders, setOrders] = useState<any[]>([]);
  const [unassignedOrders, setUnassignedOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignModalBay, setAssignModalBay] = useState<string | null>(null);

  // Hardcode 15 bays for the workshop
  const totalBays = 15;

  const fetchActiveOrders = async () => {
    try {
      const res = await api.get('/manager/service-orders/');
      // Filter active orders assigned to a bay
      const active = res.data.filter((o: any) => o.bay && (o.status === 'IN_PROGRESS' || o.status === 'PENDING'));
      // Filter unassigned orders (PENDING/IN_PROGRESS but no bay)
      const unassigned = res.data.filter((o: any) => !o.bay && (o.status === 'IN_PROGRESS' || o.status === 'PENDING'));
      
      setOrders(active);
      setUnassignedOrders(unassigned);
    } catch (error) {
      console.error('Error fetching workshop data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  const handleAssignVehicle = async (orderId: string, bayName: string) => {
    try {
      await api.patch(`/manager/service-orders/${orderId}/`, { bay: bayName });
      toast.success(`Assigned to ${bayName}`);
      setAssignModalBay(null);
      await fetchActiveOrders();
    } catch (error) {
      console.error(error);
      toast.error('Failed to assign vehicle');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-[#35D07F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Create an array representing all bays
  const bays = Array.from({ length: totalBays }, (_, i) => {
    const bayName = `BAY ${String(i + 1).padStart(2, '0')}`;
    const orderInBay = orders.find((o) => o.bay === bayName);
    return { name: bayName, order: orderInBay };
  });

  const occupiedBays = orders.length;
  const availableBays = totalBays - occupiedBays;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-wide">Workshop Floor</h1>
          <p className="text-slate-400 text-sm mt-1">Live visual representation of service bays and active repairs.</p>
        </div>
        <div className="flex gap-6 bg-[#111112] border border-white/5 rounded-xl p-4">
          <div className="text-center px-4 border-r border-white/10">
            <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1">Total Bays</div>
            <div className="text-2xl font-light text-white">{totalBays}</div>
          </div>
          <div className="text-center px-4 border-r border-white/10">
            <div className="text-[10px] text-[#35D07F] font-bold tracking-widest uppercase mb-1">Occupied</div>
            <div className="text-2xl font-light text-[#35D07F]">{occupiedBays}</div>
          </div>
          <div className="text-center px-4">
            <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1">Available</div>
            <div className="text-2xl font-light text-slate-300">{availableBays}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {bays.map((bay, idx) => (
          <div 
            key={idx} 
            className={`rounded-2xl p-6 relative overflow-hidden transition-colors border ${
              bay.order 
                ? 'bg-[#111112] border-[#35D07F]/20 shadow-[0_0_20px_rgba(53,208,127,0.03)]' 
                : 'bg-transparent border-white/5 border-dashed hover:border-white/20 hover:bg-white/5'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">{bay.name}</span>
              {bay.order ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#35D07F]/10 text-[#35D07F]">
                  <Wrench size={12} /> {bay.order.status.replace('_', ' ')}
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-slate-800 text-slate-400">
                  Available
                </span>
              )}
            </div>

            {bay.order ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <Car size={18} className="text-slate-400" />
                    {bay.order.vehicle_details?.make} {bay.order.vehicle_details?.model}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 pl-6">
                    {bay.order.title}
                  </p>
                </div>
                
                <div className="h-px bg-white/5 my-4"></div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Service Order</span>
                    <span className="text-sm font-mono text-slate-300">{bay.order.order_number}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Technician</span>
                    <span className="text-sm text-slate-300 flex items-center gap-1">
                      <User size={12} /> {bay.order.technician || 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 bg-black/30 rounded-lg p-3 flex justify-between items-center border border-white/5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock size={14} /> Progress
                  </div>
                  <div className="flex items-center gap-2 flex-1 mx-4">
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#35D07F] rounded-full" style={{ width: `${bay.order.progress || Math.floor(Math.random() * 60) + 10}%` }}></div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-white">{bay.order.progress || Math.floor(Math.random() * 60) + 10}%</span>
                </div>
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-slate-600 gap-3">
                <Car size={32} className="opacity-20" />
                <button 
                  onClick={() => setAssignModalBay(bay.name)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Assign Vehicle
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Assign Modal */}
      {assignModalBay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111112] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h2 className="text-xl font-light text-white tracking-wide">Assign to {assignModalBay}</h2>
              <button onClick={() => setAssignModalBay(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {unassignedOrders.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  No unassigned service orders found.
                </div>
              ) : (
                unassignedOrders.map(uo => (
                  <div key={uo.id} className="border border-white/10 rounded-xl p-4 flex flex-col gap-3 hover:bg-white/5 transition-colors">
                    <div>
                      <div className="text-white font-medium mb-1 flex items-center justify-between">
                        <span>{uo.vehicle_details?.registration_number || 'Unknown Vehicle'}</span>
                        <span className="text-xs font-mono text-slate-400">{uo.order_number}</span>
                      </div>
                      <div className="text-sm text-slate-500">{uo.title}</div>
                    </div>
                    <button 
                      onClick={() => handleAssignVehicle(uo.id, assignModalBay)}
                      className="w-full py-2 bg-[#35D07F]/10 hover:bg-[#35D07F]/20 text-[#35D07F] rounded-lg text-sm font-bold transition-colors border border-[#35D07F]/20"
                    >
                      Assign Here
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

