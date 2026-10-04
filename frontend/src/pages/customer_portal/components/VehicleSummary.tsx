import React from 'react';
import { Car, Calendar, Settings, ArrowRight, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';



export default function VehicleSummary({ loading, vehicles = [] }: { loading: boolean, vehicles?: any[] }) {
  const navigate = useNavigate();

  if (loading) return <div className="h-[200px] bg-[var(--bg-primary)]/80 rounded-2xl border border-[var(--border-subtle)] animate-pulse"></div>;

  return (
    <div className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--text-primary)]">Vehicle Service Summary</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(!vehicles || vehicles.length === 0) ? (
          <div className="col-span-1 md:col-span-2 text-[var(--text-muted)] text-xs font-bold tracking-widest uppercase p-4 text-center">
            No vehicles registered.
          </div>
        ) : (
          (vehicles || []).map(vehicle => (
          <div key={vehicle.id} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[#35D07F]/30 rounded-xl p-5 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--bg-surface-hover)] rounded-xl flex items-center justify-center text-[var(--text-primary)] border border-[var(--border-default)] group-hover:bg-[#35D07F]/10 group-hover:border-[#35D07F]/30 group-hover:text-[#35D07F] transition-all">
                  <Car size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-widest text-[var(--text-primary)]">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                  <p className="text-[var(--text-muted)] text-[10px] font-bold tracking-[0.15em] uppercase">Plate: {vehicle.registration_number} • {vehicle.mileage || '0 miles'}</p>
                </div>
              </div>
              <div className={`px-2 py-1 border rounded text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${
                (vehicle.health || 'Good') === 'Good' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}>
                {(vehicle.health || 'Good') === 'Good' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                {vehicle.health || 'Good'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-[var(--border-subtle)] mb-4">
              <div>
                <p className="text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-widest mb-1">Next Service Due</p>
                <p className="text-[var(--text-primary)] text-sm font-bold tracking-widest">{vehicle.nextService || 'TBD'}</p>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-widest mb-1">Last Serviced</p>
                <p className="text-[var(--text-primary)] text-sm font-bold tracking-widest">{vehicle.lastService || 'Unknown'}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => navigate(`/customer/vehicles/${vehicle.id}`)} className="flex-1 py-2 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] hover:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all">View Details</button>
              <button onClick={() => navigate('/customer/records')} className="flex-1 py-2 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] hover:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all">Service History</button>
              <button onClick={() => navigate('/customer/book-service')} className="flex-1 py-2 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all shadow-[0_0_10px_rgba(53,208,127,0.3)]">Book Service</button>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}




