import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, AlertTriangle, Truck, Wrench, ArrowUpRight, ArrowDownRight, Archive, CheckSquare } from 'lucide-react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

const KpiCard = ({ title, value, icon: Icon, trend, status, loading, error }: any) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-all duration-500">
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl group-hover:bg-[#35D07F]/10 transition-all duration-500" />
    
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl border ${status === 'warning' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : status === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-white/10 text-white'}`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-lg ${trend > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    
    <div>
      <h3 className="text-white/50 text-xs font-bold tracking-widest uppercase mb-1">{title}</h3>
      <div className="flex items-baseline space-x-2">
        {loading ? (
          <div className="h-10 w-24 bg-white/10 animate-pulse rounded" />
        ) : (
          <span className="text-4xl font-light text-white tracking-tight">{value}</span>
        )}
      </div>
    </div>
  </div>
);

export default function InventoryDashboard() {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['inventory-dashboard'],
    queryFn: async () => {
      const res = await api.get('/inventory-manager/dashboard/');
      return res.data;
    },
    retry: 1
  });

  const { data: movements } = useQuery({
    queryKey: ['inventory-movements', 'recent'],
    queryFn: async () => {
      const res = await api.get('/inventory-manager/movements/');
      return res.data;
    }
  });

  const { data: requiredParts } = useQuery({
    queryKey: ['inventory-required-parts'],
    queryFn: async () => {
      const res = await api.get('/inventory-manager/required-parts/');
      return res.data;
    }
  });

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      toast.success('Inventory report generated successfully.');
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase text-white mb-2">Inventory Overview</h1>
          <p className="text-white/50 tracking-wide">Monitor real-time workshop stock and parts availability.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
            ) : (
                <span>Generate Report</span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Total Unique Parts" 
          value={data?.totalParts || 0} 
          icon={Package} 
          loading={isLoading}
          error={isError}
        />
        <KpiCard 
          title="Total Stock Units" 
          value={data?.totalStockUnits || 0} 
          icon={Archive} 
          loading={isLoading}
          error={isError}
        />
        <KpiCard 
          title="Low Stock Items" 
          value={data?.lowStock || 0} 
          icon={AlertTriangle} 
          status="warning"
          loading={isLoading}
          error={isError}
        />
        <KpiCard 
          title="Out of Stock" 
          value={data?.outOfStock || 0} 
          icon={AlertTriangle} 
          status="danger"
          loading={isLoading}
          error={isError}
        />
        <KpiCard 
          title="Reserved Units" 
          value={data?.reservedStock || 0} 
          icon={CheckSquare} 
          loading={isLoading}
          error={isError}
        />
        <KpiCard 
          title="Parts Waiting" 
          value={data?.partsWaiting || 0} 
          icon={Wrench} 
          status={data?.partsWaiting > 0 ? "warning" : ""}
          loading={isLoading}
          error={isError}
        />
        <KpiCard 
          title="Received Today" 
          value={data?.receivedToday || 0} 
          icon={Truck} 
          loading={isLoading}
          error={isError}
        />
        <KpiCard 
          title="Issued Today" 
          value={data?.issuedToday || 0} 
          icon={ArrowUpRight} 
          loading={isLoading}
          error={isError}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white mb-6">Recent Movements</h3>
            <div className="space-y-4">
              {!movements ? (
                <div className="text-white/30 text-sm tracking-wide py-4 text-center">Loading movements...</div>
              ) : movements.length === 0 ? (
                <div className="text-white/30 text-sm tracking-wide py-4 text-center">No recent movements.</div>
              ) : (
                movements.slice(0, 5).map((mov: any) => (
                  <div key={mov.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        {mov.movement_type === 'RECEIVED' ? <Truck size={14} className="text-[#35D07F]" /> :
                         mov.movement_type === 'ISSUED' ? <ArrowUpRight size={14} className="text-blue-400" /> :
                         <Package size={14} className="text-white/50" />}
                      </div>
                      <div>
                        <div className="text-sm text-white font-medium">{mov.part_details?.name || 'Part'}</div>
                        <div className="text-[10px] text-white/50 tracking-widest">{mov.movement_type} &bull; {new Date(mov.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{mov.movement_type === 'RECEIVED' ? '+' : mov.movement_type === 'ISSUED' ? '-' : ''}{mov.quantity}</div>
                      <div className="text-[10px] text-white/50">Stock: {mov.quantity_after}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white mb-6">Service Orders Waiting</h3>
            <div className="space-y-4">
              {!requiredParts ? (
                <div className="text-white/30 text-sm tracking-wide py-4 text-center">Loading orders...</div>
              ) : requiredParts.length === 0 ? (
                <div className="text-white/30 text-sm tracking-wide py-4 text-center">No orders currently waiting for parts.</div>
              ) : (
                requiredParts.slice(0, 5).map((req: any) => (
                  <div key={req.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <Wrench size={14} className="text-orange-500" />
                      </div>
                      <div>
                        <div className="text-sm text-white font-medium">{req.service_order_details?.order_number || 'Order'}</div>
                        <div className="text-[10px] text-white/50 tracking-widest truncate max-w-[150px]">{req.part_details?.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">Qty: {req.quantity_required}</div>
                      <div className="text-[10px] text-orange-500">{req.status}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
        </div>
      </div>
    </div>
  );
}

