import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Settings2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchVehicles } from '../api/client';

const majesticEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Fallback images based on make if no image_url is provided
const FALLBACK_IMAGES: Record<string, string> = {
  'PORSCHE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Porsche_718_Cayman_S_IMG_0719.jpg/800px-Porsche_718_Cayman_S_IMG_0719.jpg',
  'BMW': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/BMW_M4_Competition_G82_1X7A6227.jpg/800px-BMW_M4_Competition_G82_1X7A6227.jpg',
  'MERCEDES-BENZ': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/2019_Mercedes-Benz_G63_AMG_Automatic_4.0.jpg/800px-2019_Mercedes-Benz_G63_AMG_Automatic_4.0.jpg',
  'DEFAULT': 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80'
};

const getStatusColor = (health: string) => {
  if (health === 'Good Condition') return 'text-green-400';
  if (health === 'Fair Condition') return 'text-yellow-400';
  return 'text-blue-400';
};

const getStatusText = (health: string) => {
  if (health === 'Good Condition') return 'Ready';
  if (health === 'Fair Condition') return 'Due for Service';
  return 'In Service';
};

export default function MyVehicles() {
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles,
  });

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-[#020202] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-[#020202] text-white selection:bg-white/30 px-8 py-12 md:px-16 overflow-y-auto">
      
      {/* Top Nav */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: majesticEase }}
        className="flex justify-between items-center mb-24"
      >
        <Link to="/customer/vehicle" className="flex items-center gap-4 text-white/50 hover:text-white transition-colors duration-500 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform duration-500" strokeWidth={1} />
          <span className="text-[10px] font-sans tracking-[0.2em] uppercase">Back to Dashboard</span>
        </Link>
        <div className="w-6 h-6 border border-white/20 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white/50" />
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.2, ease: majesticEase }}
          >
            <h1 className="text-6xl font-light tracking-tighter mb-4">My Garage</h1>
            <p className="text-[11px] font-sans tracking-[0.2em] text-white/40 uppercase">{vehicles.length} Vehicles Registered</p>
          </motion.div>
          
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: majesticEase }}
            className="flex items-center gap-2 border border-white/20 px-6 py-3 hover:bg-white hover:text-black transition-all duration-500 group"
          >
            <Plus size={14} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-[10px] font-sans tracking-[0.2em] uppercase">Add Vehicle</span>
          </motion.button>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle: any, i: number) => {
            const imageUrl = vehicle.image_url || FALLBACK_IMAGES[vehicle.make.toUpperCase()] || FALLBACK_IMAGES['DEFAULT'];
            const statusColor = getStatusColor(vehicle.health_status);
            const statusText = getStatusText(vehicle.health_status);

            return (
              <Link to={`/customer/vehicle/details/${vehicle.id}`} key={vehicle.id}>
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, delay: 0.6 + (i * 0.1), ease: majesticEase }}
                  className="group relative h-96 border border-white/10 hover:border-white/30 transition-colors duration-500 overflow-hidden cursor-pointer flex flex-col justify-end p-8"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={imageUrl} 
                      alt={vehicle.model} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out"
                    />
                    {/* Cinematic Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-black/40" />
                  </div>
                  
                  {/* Subtle Animated Top Border (Vengeance Style) */}
                  <div className="absolute top-0 left-0 w-0 h-[2px] bg-white group-hover:w-full transition-all duration-700 ease-out z-20" />

                  {/* Card Content */}
                  <div className="relative z-10 transform group-hover:-translate-y-2 transition-transform duration-500">
                    <div className="flex justify-between items-start mb-12">
                      <div className={`text-[10px] font-sans tracking-widest uppercase flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 ${statusColor}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        {statusText}
                      </div>
                      <ShieldCheck size={16} className="text-white/40 group-hover:text-white transition-colors duration-500 drop-shadow-md" />
                    </div>
                    
                    <div className="text-[10px] font-sans tracking-[0.3em] text-white/70 uppercase mb-1 drop-shadow-md">{vehicle.make}</div>
                    <h2 className="text-3xl font-light tracking-tight text-white mb-4 drop-shadow-lg">{vehicle.model}</h2>
                    
                    <div className="flex items-center gap-6 text-[10px] font-sans tracking-widest text-white/60 uppercase border-t border-white/10 pt-4 mt-4">
                      <span className="flex items-center gap-2"><Settings2 size={12} /> {vehicle.year}</span>
                      <span>{vehicle.registration_number}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}

