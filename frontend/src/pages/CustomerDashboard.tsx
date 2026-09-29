import React, { Suspense, lazy } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import CustomerDashboard2D from './CustomerDashboard2D';

// Lazy load the heavy 3D experience so we don't fetch Three.js assets on mobile
const CustomerDashboard3D = lazy(() => import('./CustomerDashboard3D'));

export default function CustomerDashboard() {
  // Mobile, Tablet, and small Laptops (< 1280px) get the 2D Responsive Experience
  const isResponsiveMode = useMediaQuery('(max-width: 1279px)');

  if (isResponsiveMode) {
    return <CustomerDashboard2D />;
  }

  // Large desktops get the immersive 3D Experience
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-[#020202] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-16 h-16 border-4 border-[#35D07F]/20 border-t-[#35D07F] rounded-full animate-spin"></div>
        <p className="text-xs tracking-widest uppercase text-slate-500 font-bold">Loading 3D Environment</p>
      </div>
    }>
      <CustomerDashboard3D />
    </Suspense>
  );
}

