import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Wrench, ShieldCheck, Download, Share2, Search, CheckCircle2 
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchVehicle } from '../api/client';
import EditVehicleModal from '../components/vehicle/EditVehicleModal';
import ServiceHistoryDrawer from '../components/vehicle/ServiceHistoryDrawer';
import ServiceDetailModal from '../components/vehicle/ServiceDetailModal';
import VehicleActionSection from '../components/vehicle/VehicleActionSection';

const majesticEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: majesticEase }
};

const FALLBACK_IMAGES: Record<string, string> = {
  'PORSCHE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Porsche_718_Cayman_S_IMG_0719.jpg/800px-Porsche_718_Cayman_S_IMG_0719.jpg',
  'BMW': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/BMW_M4_Competition_G82_1X7A6227.jpg/800px-BMW_M4_Competition_G82_1X7A6227.jpg',
  'MERCEDES-BENZ': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/2019_Mercedes-Benz_G63_AMG_Automatic_4.0.jpg/800px-2019_Mercedes-Benz_G63_AMG_Automatic_4.0.jpg',
  'DEFAULT': 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80'
};

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const vehicleId = id || '00000000-0000-0000-0000-000000000001';

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => fetchVehicle(vehicleId),
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  if (isLoading) {
    return <div className="min-h-screen bg-[#fafafa] flex items-center justify-center text-gray-400">Loading Vehicle Profile...</div>;
  }

  if (!vehicle) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#111111] font-sans pb-24">
      {/* Popups */}
      <EditVehicleModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} vehicle={vehicle} />
      <ServiceHistoryDrawer isOpen={isHistoryDrawerOpen} onClose={() => setIsHistoryDrawerOpen(false)} vehicleId={vehicle.id} onOpenDetail={(order) => setSelectedService(order)} />
      <ServiceDetailModal isOpen={!!selectedService} onClose={() => setSelectedService(null)} order={selectedService} />

      {/* 1. TOP NAVIGATION */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-black text-white flex items-center justify-center text-[8px] font-bold">RT</div>
          <span className="text-xs font-semibold tracking-widest uppercase text-gray-900">RepairTrace</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs font-medium text-gray-500">
          <Link to="/customer/vehicle" className="hover:text-black transition-colors">Dashboard</Link>
          <Link to="/customer/vehicles" className="text-black">My Vehicles</Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">SM</div>
        </div>
      </nav>

      {/* 2. BREADCRUMB */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-4">
        <div className="text-[10px] font-medium tracking-widest uppercase text-gray-400 flex items-center gap-2">
          <Link to="/customer/vehicle" className="hover:text-black transition-colors">Dashboard</Link>
          <span>/</span>
          <Link to="/customer/vehicles" className="hover:text-black transition-colors">My Vehicles</Link>
          <span>/</span>
          <span className="text-gray-900">{vehicle.make} {vehicle.model}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* MAIN CONTENT (Left Column) */}
          <div className="w-full lg:w-[65%] flex flex-col gap-12">
            
            {/* 3. VEHICLE HEADER */}
            <motion.section {...fadeIn} className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-1/2 aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center relative">
                <img 
                  src={vehicle.image_url || FALLBACK_IMAGES[vehicle.make.toUpperCase()] || FALLBACK_IMAGES['DEFAULT']}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <div>
                  <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-1">{vehicle.make} {vehicle.model}</h1>
                  <p className="text-sm text-gray-500 font-medium">{vehicle.registration_number}</p>
                </div>
                
                <p className="text-sm text-gray-600">{vehicle.year} · {vehicle.fuel_type} · {vehicle.transmission}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">VIN: {vehicle.vin}</p>

                <div className="mt-4 p-4 rounded-xl bg-white border border-gray-200 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-sm font-bold text-gray-900 ${vehicle.health_score > 70 ? 'border-green-500' : 'border-amber-500'}`}>
                    {vehicle.health_score}
                  </div>
                  <div>
                    <div className="text-xs font-semibold tracking-wider uppercase text-gray-500 mb-1">Vehicle Health</div>
                    <div className={`text-sm font-medium flex items-center gap-1.5 ${vehicle.health_score > 70 ? 'text-green-600' : 'text-amber-600'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${vehicle.health_score > 70 ? 'bg-green-500' : 'bg-amber-500'}`} /> {vehicle.health_status}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button onClick={() => setIsHistoryDrawerOpen(true)} className="flex-1 bg-black text-white text-sm font-medium py-3 rounded-lg hover:bg-gray-800 transition-colors">
                    Service History
                  </button>
                  <button onClick={() => setIsEditModalOpen(true)} className="flex-1 bg-white border border-gray-200 text-gray-900 text-sm font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    Edit Vehicle
                  </button>
                </div>
              </div>
            </motion.section>

            {/* 5. VEHICLE HEALTH */}
            <motion.section {...fadeIn}>
              <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-6">Vehicle Health</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicle.health_categories?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl">
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${item.warning ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${item.score}%` }} />
                      </div>
                      <span className={`text-sm font-semibold w-8 text-right ${item.warning ? 'text-amber-600' : 'text-gray-900'}`}>{item.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* 7. MAINTENANCE */}
            <motion.section {...fadeIn}>
              <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-6">Upcoming Maintenance</h2>
              <div className="flex flex-col gap-3">
                {vehicle.maintenance_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center p-5 bg-white border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                        <Wrench size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{item.due_text}</p>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest rounded border ${item.is_urgent ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* 8. WARRANTY & DOCUMENTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.section {...fadeIn}>
                <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-6">Warranty</h2>
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  {vehicle.warranties?.slice(0,1).map((w: any) => (
                     <div key={w.id}>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-1">{w.title}</h3>
                            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                              <ShieldCheck size={12} /> {w.status}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Expires</div>
                            <div className="text-sm font-medium text-gray-900">{w.expires_date || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Coverage</div>
                            <div className="text-sm font-medium text-gray-900">{w.coverage || 'N/A'}</div>
                          </div>
                        </div>
                     </div>
                  ))}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    {vehicle.warranties?.slice(1).map((w: any) => (
                      <div key={w.id} className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">{w.title}</span>
                        <span className={`text-[10px] font-medium ${w.status === 'Active' ? 'text-green-600' : 'text-amber-600'}`}>{w.status}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 bg-gray-50 text-gray-900 text-xs font-medium py-2.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    View Full Warranty
                  </button>
                </div>
              </motion.section>

              <motion.section {...fadeIn}>
                <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-6">Documents</h2>
                <div className="flex flex-col gap-2">
                  {vehicle.documents?.map((doc: any) => (
                    <div key={doc.id} className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl group hover:border-gray-300 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-gray-400" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{doc.title}</h4>
                          <p className="text-[10px] text-gray-500 mt-0.5">{doc.subtitle}</p>
                        </div>
                      </div>
                      <Download size={14} className="text-gray-300 group-hover:text-gray-900 transition-colors" />
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>

            {/* Mobile Action Section (Hidden on Desktop) */}
            <div className="block lg:hidden mt-12 mb-8">
              <VehicleActionSection 
                vehicleId={vehicle.id} 
                onViewHistory={() => setIsHistoryDrawerOpen(true)} 
              />
            </div>
          </div>

          {/* SIDEBAR (Right Column) */}
          <div className="hidden lg:flex w-[35%] flex-col gap-8 sticky top-24">
            
            <motion.div {...fadeIn} className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-6">Vehicle Summary</h2>
              
              <div className="mb-6">
                <h3 className="text-2xl font-semibold tracking-tight text-gray-900">{vehicle.make} {vehicle.model}</h3>
                <p className="text-sm text-gray-500">{vehicle.registration_number}</p>
              </div>

              <div className="flex items-end gap-1 mb-8">
                <span className="text-3xl font-light text-gray-900">{vehicle.mileage.toLocaleString()}</span>
                <span className="text-sm font-medium text-gray-400 mb-1">km</span>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Health</span>
                  <span className="font-semibold text-gray-900">{vehicle.health_score} / 100</span>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeIn}>
              <VehicleActionSection 
                vehicleId={vehicle.id} 
                onViewHistory={() => setIsHistoryDrawerOpen(true)} 
              />
            </motion.div>

          </div>

        </div>
      </div>
    </div>
  );
}

