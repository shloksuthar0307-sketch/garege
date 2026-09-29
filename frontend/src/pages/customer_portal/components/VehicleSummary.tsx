import React from 'react';
import { Car, Calendar, Settings, ArrowRight, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VEHICLES = [];

export default function VehicleSummary({ loading }: { loading: boolean }) {
  const navigate = useNavigate();

  if (loading) return <div className="h-[200px] bg-[#0A0A0B]/80 rounded-2xl border border-white/5 animate-pulse"></div>;

  return (
    <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white">Vehicle Service Summary</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VEHICLES.map(vehicle => (
          <div key={vehicle.id} className="bg-[#111112] border border-white/5 hover:border-[#35D07F]/30 rounded-xl p-5 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white border border-white/10 group-hover:bg-[#35D07F]/10 group-hover:border-[#35D07F]/30 group-hover:text-[#35D07F] transition-all">
                  <Car size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-widest text-white">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                  <p className="text-slate-400 text-[10px] font-bold tracking-[0.15em] uppercase">Plate: {vehicle.plate} • {vehicle.mileage}</p>
                </div>
              </div>
              <div className={`px-2 py-1 border rounded text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${
                vehicle.health === 'Good' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}>
                {vehicle.health === 'Good' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                {vehicle.health}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5 mb-4">
              <div>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-1">Next Service Due</p>
                <p className="text-white text-sm font-bold tracking-widest">{vehicle.nextService}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-1">Last Serviced</p>
                <p className="text-white text-sm font-bold tracking-widest">{vehicle.lastService}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => navigate(`/customer/vehicles/${vehicle.id}`)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 hover:text-white text-slate-300 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all">View Details</button>
              <button onClick={() => navigate('/customer/records')} className="flex-1 py-2 bg-white/5 hover:bg-white/10 hover:text-white text-slate-300 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all">Service History</button>
              <button onClick={() => navigate('/customer/book-service')} className="flex-1 py-2 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all shadow-[0_0_10px_rgba(53,208,127,0.3)]">Book Service</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

