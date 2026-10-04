import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { ShieldCheck, History, Clock, FileText, Wrench } from 'lucide-react';
import { format } from 'date-fns';

export default function PublicVehicleHistory() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const res = await api.get(`/vehicle-history/${token}/`);
        setData(res.data);
      } catch (err: any) {
        console.error('Error fetching history:', err);
        setError(err.message || 'Invalid or revoked QR code');
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      fetchHistory();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-root)] text-[var(--text-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--bg-root)] text-[var(--text-primary)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-light mb-4">Access Denied</h1>
          <p className="text-white/60 mb-8">{error || 'This vehicle history link is invalid or has been revoked.'}</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-white/90 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const { vehicle, history } = data;

  return (
    <div className="min-h-screen bg-[var(--bg-root)] text-[var(--text-primary)]">
      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] pt-12 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 text-emerald-400 mb-6 bg-emerald-400/10 w-fit px-4 py-2 rounded-full text-sm font-medium">
            <ShieldCheck size={18} />
            Verified Vehicle History
          </div>
          <h1 className="text-4xl font-bold mb-2">
            {vehicle?.year} {vehicle?.make} {vehicle?.model}
          </h1>
          <p className="text-white/60 text-lg">
            VIN: {vehicle?.vin?.substring(0, 10)}...{vehicle?.vin?.substring(vehicle.vin.length - 4)}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-medium mb-8 flex items-center gap-3">
          <History className="text-[#35D07F]" /> Service History
        </h2>
        
        {history && history.length > 0 ? (
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
            {history.map((record: any, index: number) => (
              <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#020202] bg-[var(--bg-secondary)] text-white/50 group-hover:text-[var(--text-primary)] group-hover:bg-[#35D07F] transition-colors shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_1px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_0_1px_#35D07F]">
                  <Wrench size={16} />
                </div>
                
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-2xl hover:border-[var(--border-strong)] transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Clock size={14} />
                      {record.date ? format(new Date(record.date), 'MMM d, yyyy') : 'Unknown Date'}
                    </div>
                    {record.mileage && (
                      <div className="text-sm font-medium bg-[var(--bg-surface-hover)] px-2 py-1 rounded">
                        {record.mileage.toLocaleString()} mi
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-medium mb-3">{record.service_type || 'Service Visit'}</h3>
                  
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    {record.description || 'Standard maintenance performed.'}
                  </p>

                  {record.facility && (
                    <div className="flex items-center gap-2 text-sm text-white/50 border-t border-[var(--border-subtle)] pt-4 mt-4">
                      <FileText size={14} />
                      {record.facility}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl">
            <History className="mx-auto text-white/20 mb-4" size={48} />
            <h3 className="text-xl font-medium mb-2">No History Found</h3>
            <p className="text-white/50">There are no service records available for this vehicle yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}


