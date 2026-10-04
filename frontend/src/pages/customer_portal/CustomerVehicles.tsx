import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Plus, Search, Filter, ShieldCheck, ShieldAlert, Settings, Calendar, PenTool, History, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CustomerVehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMake, setNewMake] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newVin, setNewVin] = useState('');
  
  // Filter states
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterHealth, setFilterHealth] = useState('All'); // 'All', 'Good', 'Attention Required'

  // Ref for click-outside to close filter menu
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customer/vehicles/');
      setVehicles(res.data?.results || res.data || []);
    } catch (error: any) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter vehicles based on search query AND health filter
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = `${v.year} ${v.make} ${v.model} ${v.registration_number} ${v.vin}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHealth = filterHealth === 'All' || v.health === filterHealth;
    return matchesSearch && matchesHealth;
  });

  const handleSaveVehicle = async () => {
    try {
      await api.post('/customer/vehicles/', {
        make: newMake,
        model: newModel,
        year: newYear,
        registration_number: newPlate,
        vin: newVin
      });
      toast.success('Vehicle successfully added to your garage!', {
        style: { background: '#1A1A1B', color: '#fff', border: '1px solid rgba(53,208,127,0.2)' },
        iconTheme: { primary: '#35D07F', secondary: '#000' }
      });
      setShowAddModal(false);
      fetchVehicles();
    } catch (error) {
      toast.error('Failed to add vehicle');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <Car className="text-[#35D07F]" size={28} />
            My Vehicles
          </h1>
          <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">
            Manage your registered vehicles and service history.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH VEHICLES..." 
              className="pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] uppercase tracking-widest focus:border-[#35D07F] outline-none transition-all w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative" ref={filterMenuRef}>
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center justify-center p-2.5 border rounded-xl transition-all ${
                showFilterMenu || filterHealth !== 'All' 
                  ? 'bg-[var(--bg-surface-active)] border-white/30 text-[var(--text-primary)]' 
                  : 'bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Filter size={18} />
              {filterHealth !== 'All' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#35D07F]"></span>
              )}
            </button>

            <AnimatePresence>
              {showFilterMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-3 w-56 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl shadow-2xl p-5 z-20"
                >
                  <h3 className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-4 flex items-center justify-between">
                    Filter by Status
                    {filterHealth !== 'All' && (
                      <span 
                        onClick={() => setFilterHealth('All')} 
                        className="text-[#35D07F] cursor-pointer hover:underline"
                      >
                        Reset
                      </span>
                    )}
                  </h3>
                  <div className="space-y-3">
                    {['All', 'Good', 'Attention Required'].map(status => (
                      <label key={status} className="flex items-center gap-3 cursor-pointer group" onClick={() => setFilterHealth(status)}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          filterHealth === status 
                            ? 'border-[#35D07F] bg-[#35D07F]' 
                            : 'border-[var(--border-strong)] group-hover:border-[#35D07F]/50'
                        }`}>
                          {filterHealth === status && <Check size={12} className="text-black" />}
                        </div>
                        <span className={`text-xs tracking-wider transition-colors ${
                          filterHealth === status 
                            ? 'text-[var(--text-primary)] font-bold' 
                            : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                        }`}>
                          {status}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setShowAddModal(true)} 
            className="flex items-center gap-2 px-6 py-2.5 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(53,208,127,0.3)]"
          >
            <Plus size={16} /> Add Vehicle
          </button>
        </motion.div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-[#35D07F] border-t-transparent rounded-full animate-spin mb-4"></div>
            <h3 className="text-[var(--text-primary)] font-bold tracking-widest uppercase mb-2">Loading Vehicles...</h3>
          </div>
        ) : filteredVehicles.length > 0 ? filteredVehicles.map((vehicle, index) => (
          <motion.div 
            key={vehicle.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 + 0.2 }}
            className="bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-2xl p-6 transition-all group shadow-xl"
          >
            <div className="flex justify-between items-start mb-6 border-b border-[var(--border-subtle)] pb-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-[var(--bg-surface-hover)] rounded-2xl flex items-center justify-center text-[var(--text-primary)] border border-[var(--border-default)] group-hover:bg-[#35D07F]/10 group-hover:border-[#35D07F]/30 group-hover:text-[#35D07F] transition-all shrink-0">
                  <Car size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-widest text-[var(--text-primary)] mb-1">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                  <p className="text-[var(--text-muted)] text-xs font-bold tracking-[0.15em] uppercase">Plate: <span className="text-[var(--text-primary)]">{vehicle.registration_number}</span></p>
                </div>
              </div>
              <div className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                vehicle.health === 'Good' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}>
                {vehicle.health === 'Good' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                {vehicle.health}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div>
                <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1">VIN</p>
                <p className="text-[var(--text-secondary)] text-xs tracking-wider">{vehicle.vin}</p>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1">Mileage</p>
                <p className="text-[var(--text-secondary)] text-xs tracking-wider">{vehicle.mileage}</p>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1">Engine</p>
                <p className="text-[var(--text-secondary)] text-xs tracking-wider">{vehicle.engine}</p>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1">Color</p>
                <p className="text-[var(--text-secondary)] text-xs tracking-wider">{vehicle.color}</p>
              </div>
            </div>

            <div className="bg-[var(--bg-surface-hover)] rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[var(--border-subtle)]">
               <div className="flex items-center gap-3">
                 <Calendar className="text-[#35D07F]" size={20} />
                 <div>
                   <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-0.5">Next Service Due</p>
                   <p className="text-[var(--text-primary)] text-sm font-bold tracking-widest">{vehicle.nextService}</p>
                 </div>
               </div>
               <div className="h-8 w-px bg-[var(--bg-surface-active)] hidden sm:block"></div>
               <div className="flex items-center gap-3">
                 <Settings className="text-[var(--text-muted)]" size={20} />
                 <div>
                   <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-0.5">Last Serviced</p>
                   <p className="text-[var(--text-primary)] text-sm font-bold tracking-widest">{vehicle.lastService}</p>
                 </div>
               </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate(`/customer-legacy/vehicle/details/${vehicle.id}`)} className="flex-1 py-3 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] hover:text-[var(--text-primary)] border border-[var(--border-default)] text-[var(--text-secondary)] rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2">
                <PenTool size={14} /> View / Edit
              </button>
              <button onClick={() => navigate('/customer-legacy/records')} className="flex-1 py-3 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] hover:text-[var(--text-primary)] border border-[var(--border-default)] text-[var(--text-secondary)] rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2">
                <History size={14} /> History
              </button>
              <button onClick={() => navigate('/customer/support')} className="flex-1 py-3 bg-[#35D07F] hover:bg-[#2bb46c] text-black rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(53,208,127,0.2)] flex items-center justify-center gap-2">
                Book Service
              </button>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[var(--bg-surface-hover)] rounded-full flex items-center justify-center text-[var(--text-muted)] mb-4">
              <Car size={24} />
            </div>
            <h3 className="text-[var(--text-primary)] font-bold tracking-widest uppercase mb-2">No Vehicles Found</h3>
            <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">We couldn't find any vehicles matching your search or filter.</p>
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm" 
              onClick={() => setShowAddModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-[var(--bg-primary)] border border-[var(--border-default)] p-6 rounded-2xl z-10 w-full max-w-lg shadow-2xl relative"
            >
              <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <X size={20} />
              </button>
              
              <h2 className="text-[var(--text-primary)] text-lg font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
                <Car className="text-[#35D07F]" size={20} /> Add New Vehicle
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1 block">Make</label>
                  <input type="text" placeholder="e.g. Toyota" value={newMake} onChange={(e) => setNewMake(e.target.value)} className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3 text-[var(--text-primary)] text-sm outline-none focus:border-[#35D07F] transition-colors" />
                </div>
                <div>
                  <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1 block">Model</label>
                  <input type="text" placeholder="e.g. Camry" value={newModel} onChange={(e) => setNewModel(e.target.value)} className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3 text-[var(--text-primary)] text-sm outline-none focus:border-[#35D07F] transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1 block">Year</label>
                  <input type="text" placeholder="e.g. 2024" value={newYear} onChange={(e) => setNewYear(e.target.value)} className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3 text-[var(--text-primary)] text-sm outline-none focus:border-[#35D07F] transition-colors" />
                </div>
                <div>
                  <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1 block">License Plate</label>
                  <input type="text" placeholder="e.g. ABC-1234" value={newPlate} onChange={(e) => setNewPlate(e.target.value)} className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3 text-[var(--text-primary)] text-sm outline-none focus:border-[#35D07F] transition-colors uppercase" />
                </div>
              </div>

              <div className="mb-8">
                <label className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1 block">VIN (Vehicle Identification Number)</label>
                <input type="text" placeholder="17-Digit VIN" value={newVin} onChange={(e) => setNewVin(e.target.value)} className="w-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-xl p-3 text-[var(--text-primary)] text-sm outline-none focus:border-[#35D07F] transition-colors uppercase" />
              </div>
              
              <button 
                onClick={handleSaveVehicle} 
                className="w-full py-3.5 bg-[#35D07F] text-black font-bold tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(53,208,127,0.3)] hover:bg-[#2bb46c] transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Save Vehicle
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}



