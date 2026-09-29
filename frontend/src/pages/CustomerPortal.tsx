import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActiveRepair3D } from '../components/customer/ActiveRepair3D';
import { MyVehicle2D } from '../components/customer/MyVehicle2D';
import { ServiceHistory } from '../components/customer/ServiceHistory';
import { Appointments } from '../components/customer/Appointments';
import { Invoices } from '../components/customer/Invoices';
import { Connect } from '../components/customer/Connect';
import { Car, Wrench, History, Calendar, FileText, Bell, MessageSquare, User, Menu, LogOut, ChevronRight, X } from 'lucide-react';
import { useGarageStore } from '../hooks/useGarageStore';

type Tab = 'active' | 'vehicle' | 'history' | 'appointments' | 'invoices' | 'messages';

export function CustomerPortal() {
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const tabs = [
    { id: 'active', label: 'Active Repair', icon: Wrench, status: 'amber' },
    { id: 'vehicle', label: 'My Vehicle', icon: Car },
    { id: 'history', label: 'Service History', icon: History },
    { id: 'invoices', label: 'Invoices & Estimates', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'messages', label: 'Connect', icon: MessageSquare, badge: 1 },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'active': return <ActiveRepair3D />;
      case 'vehicle': return <MyVehicle2D />;
      case 'history': return <ServiceHistory />;
      case 'invoices': return <Invoices />;
      case 'appointments': return <Appointments />;
      case 'messages': return <Connect />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-sans selection:bg-white/20">
      {/* Premium Header */}
      <header className="h-20 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-4 lg:gap-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-widest text-white hidden sm:block">REPAIRTRACE</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={'px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 relative ' + (isActive ? 'text-white bg-white/10' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5')}
                >
                  <Icon className={'w-4 h-4 ' + (isActive ? 'text-white' : 'text-gray-500')} />
                  {tab.label}
                  {('status' in tab && tab.status === 'amber') && <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                  {('badge' in tab && tab.badge) && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold">
                      {('badge' in tab && tab.badge)}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-red-500" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border border-white/10 hover:bg-white/5 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-gray-700 to-gray-500 flex items-center justify-center text-white text-xs font-bold">SM</div>
              <span className="text-sm font-medium text-white hidden sm:block">Shlok M.</span>
            </button>
            
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2"
                >
                  <div className="px-4 py-3 border-b border-white/5 mb-2">
                    <p className="text-sm font-medium text-white">Shlok M.</p>
                    <p className="text-xs text-gray-500 mt-0.5">shlok@example.com</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">Profile Settings</button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">Notification Preferences</button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">Security</button>
                  <div className="h-px bg-white/5 my-2" />
                  <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-white/5 transition-colors flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-400">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-[#111] border-l border-white/10 z-50 flex flex-col p-6 lg:hidden"
            >
              <div className="flex justify-between items-center mb-10">
                <span className="text-lg font-bold tracking-widest text-white">MENU</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <div className="flex flex-col gap-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id as Tab); setIsMobileMenuOpen(false); }}
                      className={'px-4 py-4 rounded-2xl text-left flex items-center justify-between transition-colors ' + (isActive ? 'bg-white text-black font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-white')}
                    >
                      <div className="flex items-center gap-4">
                        <Icon className={'w-5 h-5 ' + (isActive ? 'text-black' : 'text-gray-500')} />
                        {tab.label}
                      </div>
                      {('status' in tab && tab.status === 'amber') && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

