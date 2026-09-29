import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { useGLTF, Environment, OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { getZoneFromMeshName } from '../inspection/VehicleZoneMapper';
import { DamageMarker } from '../inspection/DamageMarker';
import { DamagePanel } from '../inspection/DamagePanel';
import type { DamageData } from '../inspection/DamagePanel';
import { InspectionSummary } from '../inspection/InspectionSummary';

function PorscheModel({ 
  onModelClick 
}: { 
  onModelClick: (e: ThreeEvent<MouseEvent>, zone: string) => void 
}) {
  const { scene } = useGLTF('/models/porsche_full.gltf');
  const modelRef = useRef<THREE.Group>(null);

  // Apply a nice car paint material
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        // Add metallic paint to body panels based on name
        const n = mesh.name.toLowerCase();
        if (n.includes('body') || n.includes('door') || n.includes('hood') || n.includes('fender') || n.includes('bumper') || n.includes('roof') || n.includes('trunk')) {
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: '#215c8f', // Beautiful Metallic Blue
            metalness: 0.7,
            roughness: 0.2,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
          });
        } else if (n.includes('glass') || n.includes('window')) {
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: '#000000',
            metalness: 0.9,
            roughness: 0.1,
            transmission: 0.8,
            transparent: true,
          });
        } else if (n.includes('wheel') || n.includes('rim')) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: '#888888',
            metalness: 0.8,
            roughness: 0.4
          });
        }
      }
    });
  }, [scene]);

  return (
    <group ref={modelRef} position={[0, -0.5, 0]}>
      <primitive 
        object={scene} 
        scale={0.8} 
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          const meshName = e.object.name;
          const zone = getZoneFromMeshName(meshName);
          onModelClick(e, zone);
        }}
      />
    </group>
  );
}

export default function ServiceOrder3DView() {
  const [damages, setDamages] = useState<DamageData[]>([
    { id: '1', zone: 'Front Bumper', mesh_identifier: 'bumper_front', damage_type: 'Scratch', severity: 'Moderate', description: 'Deep scratch on the right side.', estimated_hours: '1.5', estimated_cost: '2500', world_position_x: -0.9, world_position_y: -0.1, world_position_z: 1.4 }
  ]);
  const [activeDamage, setActiveDamage] = useState<DamageData | null>(null);

  const handleModelClick = (e: ThreeEvent<MouseEvent>, zone: string) => {
    const { x, y, z } = e.point;
    const newDamage: DamageData = {
      zone,
      mesh_identifier: e.object.name,
      damage_type: 'Scratch',
      severity: 'Minor',
      description: '',
      estimated_hours: '1.0',
      estimated_cost: '1000',
      world_position_x: x,
      world_position_y: y,
      world_position_z: z
    };
    setActiveDamage(newDamage);
  };

  const handleSaveDamage = (data: DamageData) => {
    if (data.id) {
      setDamages(damages.map(d => d.id === data.id ? data : d));
    } else {
      setDamages([...damages, { ...data, id: Date.now().toString() }]);
    }
    setActiveDamage(null);
  };

  const handleDeleteDamage = (id: string) => {
    setDamages(damages.filter(d => d.id !== id));
    setActiveDamage(null);
  };

  return (
    <div className="w-full h-full bg-slate-100 relative overflow-hidden">
      
      <InspectionSummary damages={damages} />
      <Suspense fallback={<div className="flex items-center justify-center w-full h-full text-slate-500">Loading Digital Twin...</div>}>
        <Canvas camera={{ position: [4, 2, 4], fov: 45 }}>
          <Environment preset="city" />
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          <directionalLight position={[-10, 10, -5]} intensity={1} />
          
          <PorscheModel onModelClick={handleModelClick} />
          <ContactShadows resolution={1024} scale={10} blur={2} opacity={0.5} far={10} color="#000000" />
          
          {damages.map((dmg) => (
            <DamageMarker
              key={dmg.id}
              id={dmg.id!}
              position={[dmg.world_position_x, dmg.world_position_y, dmg.world_position_z]}
              zone={dmg.zone}
              damageType={dmg.damage_type}
              severity={dmg.severity}
              isSelected={activeDamage?.id === dmg.id}
              onClick={() => setActiveDamage(dmg)}
            />
          ))}

          {activeDamage && !activeDamage.id && (
            <DamageMarker
              id="draft"
              position={[activeDamage.world_position_x, activeDamage.world_position_y, activeDamage.world_position_z]}
              zone={activeDamage.zone}
              damageType={activeDamage.damage_type}
              severity={activeDamage.severity}
              isSelected={true}
              onClick={() => {}}
            />
          )}

          <OrbitControls 
            enablePan={false}
            minDistance={2}
            maxDistance={8}
            maxPolarAngle={Math.PI / 2 + 0.1}
          />
        </Canvas>
      </Suspense>

      {/* Floating UI Overlay for Panel */}
      {activeDamage && (
        <DamagePanel
          damage={activeDamage}
          onSave={handleSaveDamage}
          onDelete={handleDeleteDamage}
          onClose={() => setActiveDamage(null)}
        />
      )}
    </div>
  );
}

