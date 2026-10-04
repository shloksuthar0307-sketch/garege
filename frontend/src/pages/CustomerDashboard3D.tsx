import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, Clock, Bell, ChevronRight, 
  CheckCircle2, AlertTriangle,
  MessageSquare, Calendar, CreditCard, Download, ShieldCheck, Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

// --- 3D COMPONENTS ---

function VehicleModel({ focusTarget, setFocusTarget, diagnostics }: { focusTarget: string | null, setFocusTarget: (t: string | null) => void, diagnostics?: any[] }) {
  const { scene } = useGLTF('/models/Vehicle_full.gltf');
  const modelRef = useRef<THREE.Group>(null);
  
  // Apply premium materials to the untextured car model
  useEffect(() => {
    if (!scene) return;
    
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const name = mesh.name.toLowerCase();
        const matName = mesh.material ? (mesh.material as any).name?.toLowerCase() || '' : '';
        
        // Identify car parts based on common naming conventions in GLTF models
        const isBody = name.includes('body') || name.includes('paint') || matName.includes('body') || matName.includes('paint') || name.includes('shell');
        const isGlass = name.includes('glass') || name.includes('window') || name.includes('windshield') || matName.includes('glass');
        const isTire = name.includes('tire') || name.includes('wheel') || name.includes('rubber') || matName.includes('tire');
        const isRim = name.includes('rim') || name.includes('alloy') || matName.includes('rim');
        const isLight = name.includes('light') || name.includes('lamp') || name.includes('headlight') || name.includes('taillight');

        if (isBody) {
          // Premium Guards Red Vehicle Paint
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: '#cc0000',
            metalness: 0.3,
            roughness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            envMapIntensity: 2.0
          });
        } else if (isGlass) {
          // Dark Tinted Glass
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: '#000000',
            metalness: 0.9,
            roughness: 0.05,
            transmission: 0.9, // glass-like
            opacity: 1,
            transparent: true,
            envMapIntensity: 2.0
          });
        } else if (isTire) {
          // Rubber
          mesh.material = new THREE.MeshStandardMaterial({
            color: '#111111',
            metalness: 0.1,
            roughness: 0.8
          });
        } else if (isRim) {
          // Dark Gunmetal Rims
          mesh.material = new THREE.MeshStandardMaterial({
            color: '#444444',
            metalness: 0.9,
            roughness: 0.3,
            envMapIntensity: 1.5
          });
        } else if (isLight) {
          // Lights
          mesh.material = new THREE.MeshStandardMaterial({
            color: '#ffffff',
            metalness: 0.9,
            roughness: 0.1,
            emissive: '#ffffff',
            emissiveIntensity: 0.2
          });
        } else {
          // Default dark plastic/metal for everything else (grilles, undercarriage, interior)
          if (mesh.material) {
             const baseColor = (mesh.material as any).color || new THREE.Color('#222222');
             mesh.material = new THREE.MeshStandardMaterial({
               color: '#1a1a1a',
               metalness: 0.5,
               roughness: 0.6
             });
          }
        }
      }
    });
  }, [scene]);

  // Create hotspots
  const hotspots = [
    { id: 'front-brakes', position: [-0.9, 0.4, 1.4], label: 'Front Brakes' },
    { id: 'engine', position: [0, 0.7, -1.8], label: 'Engine Bay' }
  ];

  // Only show hotspots if they exist in diagnostics
  const validHotspots = hotspots.filter(h => diagnostics?.some(d => d.hotspotId === h.id));

  return (
    <group ref={modelRef} position={[0, 0, 0]}>
      <primitive object={scene} />
      {validHotspots.map((hotspot) => (
        <Html
          key={hotspot.id}
          position={new THREE.Vector3(...hotspot.position)}
          center
          distanceFactor={10}
          zIndexRange={[100, 0]}
        >
          <div 
            className={`cursor-pointer group flex flex-col items-center transition-transform ${focusTarget === hotspot.id ? 'scale-125' : 'hover:scale-110'}`}
            onClick={() => setFocusTarget(hotspot.id === focusTarget ? null : hotspot.id)}
          >
            <div className="w-8 h-8 rounded-full bg-red-500/80 border-2 border-white flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.6)] backdrop-blur-md">
              <AlertTriangle size={14} className="text-[var(--text-primary)]" />
            </div>
            <div className="mt-2 px-3 py-1 bg-[var(--bg-overlay)] backdrop-blur-md border border-[var(--border-strong)] rounded-full text-xs font-bold text-[var(--text-primary)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {hotspot.label}
            </div>
          </div>
        </Html>
      ))}
    </group>
  );
}

function GarageEnvironment() {
  return (
    <group>
      <Environment preset="night" environmentIntensity={1.5} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={1} color="#ff3333" distance={20} />
      <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#111111" roughness={0.8} metalness={0.2} />
      </mesh>
    </group>
  );
}

function CameraController({ focusTarget }: { focusTarget: string | null }) {
  const { camera, controls } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useEffect(() => {
    if (focusTarget === 'front-brakes') {
      targetPosition.current.set(-2, 1, 2.5);
      targetLookAt.current.set(-0.9, 0.4, 1.4);
    } else if (focusTarget === 'engine') {
      targetPosition.current.set(0, 2, -3.5);
      targetLookAt.current.set(0, 0.7, -1.8);
    } else {
      // Default view
      targetPosition.current.set(4, 2, 5);
      targetLookAt.current.set(0, 0.5, 0);
    }
  }, [focusTarget]);

  useFrame(() => {
    camera.position.lerp(targetPosition.current, 0.05);
    if (controls && (controls as any).target) {
      (controls as any).target.lerp(targetLookAt.current, 0.05);
    } else {
      camera.lookAt(targetLookAt.current);
    }
  });

  return null;
}

// --- DASHBOARD OVERLAY COMPONENT ---

export default function CustomerDashboard3D() {
  const navigate = useNavigate();
  
  const { data: apiData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['customerDashboard'],
    queryFn: async () => {
      // Endpoint should return the structured data.
      // E.g. { data: { customer: {...}, vehicle: {...}, activeService: {...} } }
      const res = await api.get('/customer/dashboard/');
      return res.data;
    },
    retry: 1,
  });

  const [focusTarget, setFocusTarget] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Dashboard');

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-[#050505] text-[var(--text-primary)] flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        <p className="text-sm text-[var(--text-muted)] font-medium tracking-widest uppercase">Loading Garage</p>
      </div>
    );
  }

  if (isError || !apiData) {
    return (
      <div className="w-full h-screen bg-[#050505] text-[var(--text-primary)] flex items-center justify-center flex-col gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-2" />
        <h2 className="text-xl font-light">Failed to load dashboard data</h2>
        <p className="text-sm text-[var(--text-muted)] max-w-md text-center">{error?.message || 'Unknown error occurred.'}</p>
        <button 
          onClick={() => refetch()}
          className="mt-4 bg-[var(--bg-surface-active)] hover:bg-white/20 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors border border-[var(--border-strong)]"
        >
          Try Again
        </button>
      </div>
    );
  }

  const data = apiData;
  const activeIssue = data?.activeService?.diagnostics?.find((d: any) => d.hotspotId === focusTarget);

  return (
    <div className="w-full h-screen bg-[#050505] text-[var(--text-secondary)] font-sans flex flex-col overflow-hidden selection:bg-red-500/30 relative">
      
      {/* 3D SCENE BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows camera={{ position: [4, 2, 5], fov: 45 }}>
          <Suspense fallback={null}>
            <GarageEnvironment />
            <VehicleModel focusTarget={focusTarget} setFocusTarget={setFocusTarget} diagnostics={data?.activeService?.diagnostics} />
            <CameraController focusTarget={focusTarget} />
          </Suspense>
          <OrbitControls 
            enablePan={false} 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 2 - 0.05}
            minDistance={3}
            maxDistance={10}
            makeDefault
          />
        </Canvas>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent pointer-events-none w-1/3" />
      </div>

      {/* HEADER HUD */}
      <header className="h-20 bg-[#050505]/40 backdrop-blur-xl border-b border-[var(--border-subtle)] flex items-center justify-between px-8 z-10 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-[var(--text-primary)] shadow-[0_0_20px_rgba(220,38,38,0.4)]">
            <Wrench size={20} />
          </div>
          <div>
            <h1 className="text-xl font-light text-[var(--text-primary)] tracking-wide">Good evening, {data?.customer?.name?.split(' ')[0] || 'Guest'}</h1>
            <p className="text-xs text-red-500 uppercase tracking-widest font-bold mt-1">Your {data?.vehicle?.make || 'Vehicle'} is currently being serviced.</p>
          </div>
        </div>

        <nav className="hidden lg:flex gap-2">
          {['Dashboard', 'My Vehicle', 'Appointments', 'History', 'Documents'].map(item => (
            <button 
              key={item} 
              onClick={() => setActiveTab(item)}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-colors ${activeTab === item ? 'bg-[var(--bg-surface-active)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'}`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] flex items-center justify-center text-[var(--text-primary)] transition-colors relative border border-[var(--border-default)]">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button 
            onClick={() => setActiveModal('profile')}
            className="flex items-center gap-3 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] border border-[var(--border-default)] py-1.5 pl-2 pr-4 rounded-full transition-colors"
          >
            <img src={data?.customer?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'} alt="Profile" className="w-7 h-7 rounded-full bg-slate-800" />
            <span className="text-sm font-medium text-[var(--text-primary)] hidden sm:block">Profile</span>
          </button>
        </div>
      </header>

      {/* HUD OVERLAYS */}
      <div className="flex-1 relative z-10 pointer-events-none p-8 flex flex-col justify-between">
        
        {activeTab === 'Dashboard' && data?.vehicle && data?.activeService && (
          <AnimatePresence mode="wait">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-between">
              
              <div className="flex justify-between items-start">
                {/* VEHICLE INFO CARD */}
                <div className="w-80 bg-[var(--bg-primary)]/60 backdrop-blur-xl border border-[var(--border-default)] rounded-[24px] p-6 pointer-events-auto shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--bg-surface-hover)] rounded-full blur-2xl" />
                   <div className="relative z-10">
                     <h2 className="text-2xl font-light text-[var(--text-primary)] mb-1">{data.vehicle.make} {data.vehicle.model}</h2>
                     <div className="flex gap-2 mb-6">
                       <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface-hover)] px-2 py-1 rounded border border-[var(--border-default)]">{data.vehicle.registration}</span>
                       <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface-hover)] px-2 py-1 rounded border border-[var(--border-default)]">ID: {data.activeService.id}</span>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4 mb-6">
                       <div>
                         <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Mileage</p>
                         <p className="text-sm text-[var(--text-primary)] font-mono">{data.vehicle.mileage?.toLocaleString() || 0} km</p>
                       </div>
                       <div>
                         <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Fuel</p>
                         <p className="text-sm text-[var(--text-primary)] font-mono">42%</p>
                       </div>
                     </div>

                     <div className="space-y-4">
                       <div>
                         <div className="flex justify-between text-xs mb-1">
                           <span className="font-bold text-red-400 uppercase tracking-widest">Service In Progress</span>
                           <span className="text-[var(--text-primary)]">{data.activeService.progress || 0}%</span>
                         </div>
                         <div className="w-full h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${data.activeService.progress || 0}%` }} className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                         </div>
                       </div>
                       <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Est. Completion: {data.activeService.estimatedCompletion ? new Date(data.activeService.estimatedCompletion).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</p>
                     </div>
                   </div>
                </div>

                {/* DIAGNOSTIC PANEL (Shows when hotspot clicked) */}
                <AnimatePresence>
                  {focusTarget && activeIssue && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      className="w-80 bg-[var(--bg-primary)]/80 backdrop-blur-2xl border border-red-500/30 rounded-[24px] p-6 pointer-events-auto shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                          <AlertTriangle size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">{activeIssue.component}</h3>
                          <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">{activeIssue.issue}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Health</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden">
                            <div className="h-full bg-red-500" style={{ width: `${activeIssue.health || 0}%` }} />
                          </div>
                          <span className="text-xs text-[var(--text-primary)] font-mono">{activeIssue.health || 0}%</span>
                        </div>
                      </div>

                      <p className="text-xs text-[var(--text-muted)] mb-6 leading-relaxed">{activeIssue.recommendation}</p>

                      <div className="flex flex-col gap-2">
                        <button onClick={() => setActiveModal('estimate')} className="w-full bg-white text-black font-bold text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-slate-200 transition-colors">
                          View Estimate (₹{activeIssue.estimatedCost?.toLocaleString() || 0})
                        </button>
                        <button onClick={() => setFocusTarget(null)} className="w-full bg-transparent border border-[var(--border-strong)] text-[var(--text-primary)] font-bold text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-[var(--bg-surface-hover)] transition-colors">
                          Reset View
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* BOTTOM PANELS */}
              <div className="grid grid-cols-4 gap-6 items-end pointer-events-none mt-auto">
                
                {/* TIMELINE */}
                <div className="col-span-2 bg-[var(--bg-primary)]/60 backdrop-blur-xl border border-[var(--border-default)] rounded-[24px] p-6 pointer-events-auto max-h-72 overflow-y-auto custom-scrollbar">
                   <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Service Timeline</h3>
                     <button onClick={() => setActiveModal('report')} className="text-[10px] text-[var(--text-primary)] font-bold uppercase tracking-widest flex items-center gap-1 hover:text-red-400 transition-colors">
                       Detailed Report <ChevronRight size={14} />
                     </button>
                   </div>
                   <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-px before:bg-[var(--bg-surface-active)]">
                     {data.activeService.timeline?.map((event: any) => (
                       <div key={event.id} className={`relative flex gap-4 ${event.status === 'pending' ? 'opacity-40' : ''}`}>
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${event.status === 'completed' ? 'bg-red-500 text-[var(--text-primary)]' : event.status === 'active' ? 'bg-black border-2 border-red-500 text-red-500' : 'bg-black border-2 border-slate-700 text-slate-700'}`}>
                           {event.status === 'completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                         </div>
                         <div className="pt-0.5">
                           <div className="flex items-center gap-3 mb-1">
                             <span className="text-sm font-bold text-[var(--text-primary)]">{event.title}</span>
                             {event.time && <span className="text-[10px] font-mono text-[var(--text-muted)]">{new Date(event.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                           </div>
                           <p className="text-xs text-[var(--text-muted)]">{event.description}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* HEALTH & ACTIONS */}
                <div className="col-span-1 bg-[var(--bg-primary)]/60 backdrop-blur-xl border border-[var(--border-default)] rounded-[24px] p-6 pointer-events-auto">
                  <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">Vehicle Health</h3>
                  <div className="space-y-3 mb-6">
                    {[
                      { name: 'Engine', status: 'Good', color: 'text-green-400', dot: 'bg-green-400' },
                      { name: 'Brakes', status: 'Attention', color: 'text-red-400', dot: 'bg-red-400' },
                      { name: 'Tyres', status: 'Good', color: 'text-green-400', dot: 'bg-green-400' },
                    ].map(sys => (
                      <div key={sys.name} className="flex justify-between items-center bg-[var(--bg-input)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
                        <span className="text-xs text-[var(--text-primary)] font-medium">{sys.name}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${sys.dot}`} />
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${sys.color}`}>{sys.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setActiveModal('appointments')} className="w-full bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] border border-[var(--border-default)] text-[var(--text-primary)] py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2">
                    <Calendar size={14} /> Book Next Service
                  </button>
                </div>

                {/* ADVISOR CARD */}
                <div className="col-span-1 bg-[var(--bg-primary)]/60 backdrop-blur-xl border border-[var(--border-default)] rounded-[24px] p-6 pointer-events-auto">
                   <div className="flex items-center gap-4 mb-6">
                     <div className="relative">
                       <img src={data.activeService.advisor?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Advisor'} alt="Advisor" className="w-12 h-12 rounded-full border border-[var(--border-strong)] bg-slate-800" />
                       <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0A0A0B] rounded-full" />
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-[var(--text-primary)]">{data.activeService.advisor?.name || 'Service Advisor'}</h4>
                       <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{data.activeService.advisor?.role || 'Service Center'}</p>
                     </div>
                   </div>
                   <div className="flex flex-col gap-2">
                     <button onClick={() => setActiveModal('chat')} className="w-full bg-[var(--bg-surface-active)] hover:bg-white/20 text-[var(--text-primary)] py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 border border-[var(--border-subtle)]">
                       <MessageSquare size={16} /> Contact Advisor
                     </button>
                     <button onClick={() => setActiveModal('invoice')} className="w-full bg-transparent hover:bg-[var(--bg-surface-hover)] border border-[var(--border-strong)] text-[var(--text-primary)] py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2">
                       <CreditCard size={16} /> View Invoice
                     </button>
                   </div>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {activeTab === 'My Vehicle' && data?.vehicle && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
            className="flex-1 flex flex-col pointer-events-auto max-w-5xl mx-auto w-full pt-10"
          >
            <div className="bg-[var(--bg-primary)]/80 backdrop-blur-xl border border-[var(--border-default)] rounded-[32px] p-8 shadow-2xl w-full">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-light text-[var(--text-primary)] mb-2">{data.vehicle.make} {data.vehicle.model} ({data.vehicle.year})</h2>
                  <div className="flex gap-3">
                    <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-surface-hover)] px-3 py-1.5 rounded-lg border border-[var(--border-default)]">{data.vehicle.registration}</span>
                    <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-surface-hover)] px-3 py-1.5 rounded-lg border border-[var(--border-default)]">VIN: {data.vehicle.vin}</span>
                  </div>
                </div>
                <div className="text-right flex gap-6">
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Color</p>
                    <p className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">{data.vehicle.color}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Mileage</p>
                    <p className="text-sm font-mono text-[var(--text-primary)] uppercase tracking-widest">{data.vehicle.mileage?.toLocaleString()} KM</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8">
                {data.vehicle.health && Object.entries(data.vehicle.health).map(([key, value]) => {
                  const val = value as number;
                  return (
                    <div key={key} className="bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-2xl p-5 hover:bg-[var(--bg-surface-active)] transition-colors">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-[var(--text-secondary)] font-bold uppercase tracking-widest">{key}</span>
                        <span className={`text-[10px] font-bold tracking-widest px-2 py-1 rounded-md ${val > 80 ? 'bg-green-500/20 text-green-400 border border-green-500/20' : val > 50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>{val}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden">
                        <div className={`h-full ${val > 80 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : val > 50 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-2xl p-6">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-1 flex items-center gap-2"><ShieldCheck size={16} className="text-green-400" /> Warranty Status</h3>
                  <p className="text-xs text-[var(--text-muted)]">Your vehicle has <span className="text-[var(--text-primary)] font-bold">{data.vehicle.warranty?.vehicleRemaining || 0} months</span> of factory warranty remaining.</p>
                </div>
                <button onClick={() => setActiveTab('Dashboard')} className="bg-red-600 hover:bg-red-500 text-[var(--text-primary)] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                  Return to Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {!['Dashboard', 'My Vehicle'].includes(activeTab) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
            className="flex-1 flex flex-col items-center justify-center pointer-events-auto max-w-2xl mx-auto w-full"
          >
            <div className="bg-[var(--bg-primary)]/80 backdrop-blur-xl border border-[var(--border-default)] rounded-[32px] p-12 text-center shadow-2xl w-full">
              <div className="w-20 h-20 rounded-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] flex items-center justify-center mx-auto mb-6">
                <Clock size={32} className="text-[var(--text-muted)]" />
              </div>
              <h2 className="text-2xl font-light text-[var(--text-primary)] mb-2">{activeTab}</h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-8">
                Detailed information for {activeTab} is synchronized with your Service Center profile. This module is active but empty in the current demo.
              </p>
              <button 
                onClick={() => setActiveTab('Dashboard')}
                className="bg-red-600 hover:bg-red-500 text-[var(--text-primary)] px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(220,38,38,0.3)]"
              >
                Return to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {activeModal === 'profile' && data?.customer && (
          <ModalWrapper title="Customer Profile" onClose={() => setActiveModal(null)}>
            <div className="p-6">
              <div className="flex items-center gap-6 mb-8 bg-[#111] p-6 rounded-2xl border border-[var(--border-subtle)]">
                <img src={data.customer.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'} alt="Profile" className="w-20 h-20 rounded-full border-2 border-[var(--border-strong)] bg-slate-800" />
                <div>
                  <h3 className="text-xl font-light text-[var(--text-primary)] mb-1">{data.customer.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] font-mono mb-2">ID: {data.customer.id}</p>
                  <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                    Member since {data.customer.memberSince ? new Date(data.customer.memberSince).getFullYear() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center bg-[var(--bg-surface-hover)] p-4 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Email</span>
                  <span className="text-sm text-[var(--text-primary)]">{data.customer.email}</span>
                </div>
                <div className="flex justify-between items-center bg-[var(--bg-surface-hover)] p-4 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Phone</span>
                  <span className="text-sm text-[var(--text-primary)]">{data.customer.phone}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => alert('Editing profile is disabled in this demo.')}
                  className="flex-1 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-[var(--text-primary)] py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border border-[var(--border-default)]"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={() => {
                    navigate('/login');
                  }}
                  className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border border-red-500/20"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </ModalWrapper>
        )}
        {activeModal === 'estimate' && data?.activeService?.estimate && (
          <ModalWrapper title="Estimate Approval" onClose={() => setActiveModal(null)}>
            <div className="p-6 text-sm">
              <div className="bg-[#111] rounded-2xl border border-[var(--border-default)] p-4 font-mono space-y-3 mb-6">
                {data.activeService.estimate.parts?.map((p: any, i: number) => (
                  <div key={i} className="flex justify-between"><span className="text-[var(--text-secondary)]">{p.name} (x{p.quantity})</span><span>₹{p.total.toLocaleString()}</span></div>
                ))}
                {data.activeService.estimate.labor?.map((l: any, i: number) => (
                  <div key={i} className="flex justify-between"><span className="text-[var(--text-muted)]">Labor: {l.name}</span><span>₹{l.total.toLocaleString()}</span></div>
                ))}
                <div className="h-px bg-[var(--bg-surface-active)] my-2" />
                <div className="flex justify-between text-[var(--text-secondary)]"><span>Subtotal</span><span>₹{data.activeService.estimate.subtotal?.toLocaleString() || 0}</span></div>
                <div className="flex justify-between text-[var(--text-secondary)]"><span>Tax</span><span>₹{data.activeService.estimate.tax?.toLocaleString() || 0}</span></div>
                <div className="flex justify-between text-green-400"><span>Discount</span><span>-₹{data.activeService.estimate.discount?.toLocaleString() || 0}</span></div>
                <div className="h-px bg-[var(--bg-surface-active)] my-2" />
                <div className="flex justify-between text-[var(--text-primary)] font-bold text-lg"><span>Total</span><span>₹{data.activeService.estimate.total?.toLocaleString() || 0}</span></div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setActiveModal(null)} className="flex-1 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] py-3 rounded-xl font-bold tracking-widest uppercase text-xs transition-colors border border-[var(--border-default)]">Decline</button>
                <button onClick={() => { alert('Approved successfully'); setActiveModal(null); }} className="flex-1 bg-red-600 hover:bg-red-500 text-[var(--text-primary)] py-3 rounded-xl font-bold tracking-widest uppercase text-xs transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)]">Approve</button>
              </div>
            </div>
          </ModalWrapper>
        )}

        {activeModal === 'chat' && data?.activeService?.advisor && (
          <ModalWrapper title="Service Advisor" onClose={() => setActiveModal(null)}>
            <div className="flex flex-col h-96 p-4">
              <div className="flex-1 overflow-y-auto space-y-4">
                <div className="flex gap-3">
                  <img src={data.activeService.advisor.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Advisor'} alt="Advisor" className="w-8 h-8 rounded-full bg-slate-800" />
                  <div className="bg-[#111] p-3 rounded-2xl rounded-tl-none border border-[var(--border-subtle)] text-sm">
                    Hello {data?.customer?.name?.split(' ')[0] || 'there'}, I have sent the estimate for the brake pads. Let me know if you have questions.
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <input type="text" placeholder="Type a message..." className="flex-1 bg-[#111] border border-[var(--border-default)] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors" />
                <button className="bg-red-600 px-4 rounded-xl text-[var(--text-primary)] font-bold uppercase tracking-widest text-xs hover:bg-red-500">Send</button>
              </div>
            </div>
          </ModalWrapper>
        )}

        {activeModal === 'invoice' && data?.activeService?.invoice && (
          <ModalWrapper title={`Invoice ${data.activeService.invoice.id || 'N/A'}`} onClose={() => setActiveModal(null)}>
            <div className="p-6">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Status</p>
                  <p className="text-amber-400 font-bold uppercase tracking-widest">{data.activeService.invoice.status || 'Pending'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Amount Due</p>
                  <p className="text-2xl font-mono text-[var(--text-primary)]">₹{data.activeService.invoice.amount?.toLocaleString() || 0}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setActiveModal(null);
                  navigate('/customer/invoices');
                }}
                className="w-full bg-[#35D07F] hover:bg-[#2bb46c] text-black py-4 rounded-xl font-bold tracking-widest uppercase text-xs transition-colors shadow-[0_0_20px_rgba(53,208,127,0.3)] mb-3 flex items-center justify-center gap-2 cursor-pointer"
              >
                Pay Now with Razorpay
              </button>
              <button 
                onClick={() => alert('PDF generation service is currently offline.')}
                className="w-full bg-transparent border border-[var(--border-strong)] text-[var(--text-primary)] py-3 rounded-xl font-bold tracking-widest uppercase text-xs transition-colors hover:bg-[var(--bg-surface-hover)] flex items-center justify-center gap-2"
              >
                <Download size={16} /> Download PDF
              </button>
            </div>
          </ModalWrapper>
        )}
        
        {activeModal === 'report' && data?.vehicle && (
          <ModalWrapper title="Detailed Service Report" onClose={() => setActiveModal(null)}>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111] p-4 rounded-xl border border-[var(--border-subtle)]">
                  <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-1">VIN</p>
                  <p className="text-sm font-mono text-[var(--text-primary)]">{data.vehicle.vin}</p>
                </div>
                <div className="bg-[#111] p-4 rounded-xl border border-[var(--border-subtle)]">
                  <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Service Center</p>
                  <p className="text-sm text-[var(--text-primary)]">Vehicle Center Ahmedabad</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 border-b border-[var(--border-default)] pb-2">Inspection Checklist</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3 text-green-400"><CheckCircle2 size={16} /> Engine oil inspected</div>
                  <div className="flex items-center gap-3 text-green-400"><CheckCircle2 size={16} /> Battery checked</div>
                  <div className="flex items-center gap-3 text-amber-400"><AlertTriangle size={16} /> Front brake replacement needed</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 border-b border-[var(--border-default)] pb-2">Technician Notes</h4>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic bg-[#111] p-4 rounded-xl border border-[var(--border-subtle)]">
                  "Vehicle is in excellent condition overall. Front brakes required urgent replacement due to scoring on the rotors. Fluids topped up." - Arjun Patel
                </p>
              </div>

              <button 
                onClick={() => alert('PDF generation service is currently offline.')}
                className="w-full bg-[var(--bg-surface-active)] border border-[var(--border-strong)] text-[var(--text-primary)] py-3 rounded-xl font-bold tracking-widest uppercase text-xs transition-colors hover:bg-white/20 flex items-center justify-center gap-2"
              >
                <Download size={16} /> Download Full PDF Report
              </button>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper component for modals
function ModalWrapper({ title, onClose, children }: { title: string, onClose: () => void, children: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-overlay)] backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-[24px] shadow-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-[var(--border-subtle)]">
          <h2 className="text-lg font-light text-[var(--text-primary)]">{title}</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"><ChevronRight size={20} className="rotate-180" /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}



