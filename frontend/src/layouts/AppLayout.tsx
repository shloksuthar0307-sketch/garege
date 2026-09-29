import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Car,
  Calendar,
  ClipboardList,
  Search,
  Settings,
  Bell,
  Menu,
  FileCheck2,
  Wrench,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fadeIn } from '../animations/variants';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Car, label: 'Vehicles', path: '/vehicles' },
  { icon: Calendar, label: 'Bookings', path: '/bookings' },
  { icon: ClipboardList, label: 'Service Orders', path: '/service-orders' },
  { icon: FileCheck2, label: 'Inspections', path: '/inspections' },
  { icon: Wrench, label: 'Repairs', path: '/repairs' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

import type { Variants } from 'framer-motion';

const staggerNavContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const perspectiveNavItem: Variants = {
  hidden: {
    opacity: 0,
    rotateX: -60,
    y: 20,
    transformPerspective: 800,
    originY: 0,
  },
  show: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 280,
      damping: 22,
    },
  },
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      {/* Sidebar - Vengeance UI / Awwwards Style */}
      <motion.aside
        initial={{ width: 256 }}
        animate={{ width: sidebarOpen ? 256 : 80 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex-shrink-0 bg-[#0a0f1c] text-slate-300 flex flex-col z-20 shadow-2xl relative"
      >
        {/* Logo Area */}
        <div className="h-[72px] flex items-center px-6 border-b border-slate-800/60">
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                key="logo-full"
                variants={fadeIn}
                initial="initial"
                animate="animate"
                exit="exit"
                className="font-bold text-xl text-white flex items-center gap-3 w-full"
              >
                <div className="w-9 h-9 rounded-lg bg-[#0070f3] flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                  <Wrench size={18} className="text-white" />
                </div>
                <span className="tracking-tight">RepairTrace</span>
              </motion.div>
            ) : (
              <motion.div
                key="logo-icon"
                variants={fadeIn}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full flex justify-center"
              >
                <div className="w-10 h-10 rounded-lg bg-[#0070f3] flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                  <Wrench size={20} className="text-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Area with Perspective Carousel Entrance */}
        <motion.nav
          variants={staggerNavContainer}
          initial="hidden"
          animate="show"
          style={{ perspective: '1000px' }}
          className="flex-1 py-6 flex flex-col gap-1.5 px-4 overflow-y-auto"
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <motion.div key={item.path} variants={perspectiveNavItem}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'relative flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors group',
                    isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                  )}
                >
                  {/* Awwwards Style Sliding Background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBackground"
                      className="absolute inset-0 bg-[#0070f3] rounded-xl"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}

                  {/* Content (Z-10 to stay above the animated background) */}
                  <div className="relative z-10 flex items-center gap-3 w-full">
                    <item.icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 2}
                      className="flex-shrink-0"
                    />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="overflow-hidden whitespace-nowrap text-[15px] font-medium tracking-wide"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </NavLink>
              </motion.div>
            );
          })}
        </motion.nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* Topbar */}
        <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <Menu size={22} />
            </button>
            <div className="hidden md:flex items-center text-sm text-slate-500 font-medium">
              <span>Branch HQ</span>
              <span className="mx-2 text-slate-300">/</span>
              <span className="text-slate-900">Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-sm text-slate-500 border border-slate-200 transition-all shadow-sm group">
              <Search size={16} className="text-slate-400 group-hover:text-slate-600" />
              <span className="hidden sm:inline font-medium">Search records...</span>
              <kbd className="hidden sm:inline font-sans text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-sm ml-2 font-semibold">
                Ctrl K
              </kbd>
            </button>

            <button className="p-2.5 rounded-full hover:bg-slate-50 text-slate-500 relative transition-colors border border-transparent hover:border-slate-200">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
            </button>

            <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white ring-2 ring-slate-100 overflow-hidden flex-shrink-0 cursor-pointer shadow-sm">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin" alt="User Avatar" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeIn}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

