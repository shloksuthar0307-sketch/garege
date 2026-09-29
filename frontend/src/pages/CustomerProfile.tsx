import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, Mail, Phone, MapPin, CreditCard, Shield, Bell, Car } from 'lucide-react';

const majesticEase: any = [0.16, 1, 0.3, 1];

export default function CustomerProfile() {
  const [activeTab, setActiveTab] = useState('Personal');

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white/30 overflow-x-hidden">
      {/* Background Blur Elements */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[#35D07F]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full px-8 md:px-16 py-8 flex justify-between items-center z-50">
        <Link 
          to="/customer/vehicle"
          className="flex items-center gap-4 text-white/50 hover:text-white transition-colors duration-500 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-sans tracking-[0.3em] uppercase hidden sm:block">Back to Dashboard</span>
        </Link>
        <div className="text-[10px] font-sans tracking-[0.3em] uppercase text-white/30">
          Account Settings
        </div>
      </nav>

      <main className="pt-32 px-8 md:px-16 max-w-7xl mx-auto pb-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: majesticEase }}
          className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-16"
        >
          <div className="w-32 h-32 rounded-full border border-white/20 bg-white/5 flex items-center justify-center relative overflow-hidden backdrop-blur-xl">
            <User size={48} className="text-white/30" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent" />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-light tracking-tighter mb-2">SHLOK MEHTA</h1>
            <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-white/50 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#35D07F] animate-pulse" />
              Premium Member Since 2024
            </p>
          </div>
        </motion.div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: majesticEase }}
            className="lg:col-span-3 flex flex-col gap-2"
          >
            {['Personal', 'Vehicles', 'Payment Methods', 'Security', 'Notifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-left px-6 py-4 text-xs font-sans tracking-[0.2em] uppercase transition-all duration-500 rounded-lg border ${
                  activeTab === tab 
                    ? 'border-white/20 bg-white/10 text-white' 
                    : 'border-transparent text-white/40 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}

            <div className="mt-8 pt-8 border-t border-white/10">
              <button
                onClick={() => {
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  window.location.href = '/login';
                }}
                className="w-full text-left px-6 py-4 text-xs font-sans tracking-[0.2em] uppercase transition-all duration-500 rounded-lg border border-red-500/20 text-red-500/80 hover:bg-red-500/10 hover:text-red-400"
              >
                Logout
              </button>
            </div>
          </motion.div>

          {/* Main Content Area */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: majesticEase }}
            className="lg:col-span-9"
          >
            {activeTab === 'Personal' && (
              <PersonalTab />
            )}

            {activeTab === 'Vehicles' && (
              <VehiclesTab />
            )}

            {activeTab === 'Payment Methods' && (
              <PaymentMethodsTab />
            )}

            {activeTab === 'Security' && (
              <SecurityTab />
            )}

            {activeTab === 'Notifications' && (
              <NotificationsTab />
            )}
            
          </motion.div>
        </div>
      </main>
    </div>
  );
}

// -- Tab Components --

function PersonalTab() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-md">
          <div className="flex items-center gap-4 text-white/40 mb-6">
            <Mail size={20} />
            <h3 className="text-[10px] font-sans tracking-[0.2em] uppercase">Email Address</h3>
          </div>
          {isEditing ? (
            <input type="email" defaultValue="shlok.mehta@example.com" className="w-full bg-transparent border-b border-white/30 text-xl font-light text-white focus:outline-none focus:border-[#35D07F] py-1" />
          ) : (
            <p className="text-xl font-light text-white">shlok.mehta@example.com</p>
          )}
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-md">
          <div className="flex items-center gap-4 text-white/40 mb-6">
            <Phone size={20} />
            <h3 className="text-[10px] font-sans tracking-[0.2em] uppercase">Phone Number</h3>
          </div>
          {isEditing ? (
            <input type="tel" defaultValue="+91 98765 43210" className="w-full bg-transparent border-b border-white/30 text-xl font-light text-white focus:outline-none focus:border-[#35D07F] py-1" />
          ) : (
            <p className="text-xl font-light text-white">+91 98765 43210</p>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-md md:col-span-2">
          <div className="flex items-center gap-4 text-white/40 mb-6">
            <MapPin size={20} />
            <h3 className="text-[10px] font-sans tracking-[0.2em] uppercase">Billing Address</h3>
          </div>
          {isEditing ? (
            <div className="space-y-4">
              <input type="text" defaultValue="124 Premium Automotive District" className="w-full bg-transparent border-b border-white/30 text-xl font-light text-white focus:outline-none focus:border-[#35D07F] py-1" />
              <input type="text" defaultValue="Mumbai, Maharashtra 400001, India" className="w-full bg-transparent border-b border-white/30 text-sm font-light text-white/50 focus:outline-none focus:border-[#35D07F] py-1" />
            </div>
          ) : (
            <>
              <p className="text-xl font-light text-white mb-2">124 Premium Automotive District</p>
              <p className="text-sm font-light text-white/50">Mumbai, Maharashtra 400001, India</p>
            </>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-4">
        {isEditing && (
          <button onClick={() => setIsEditing(false)} className="px-8 py-4 border border-white/20 text-white text-[10px] font-bold font-sans tracking-[0.2em] uppercase hover:bg-white/5 transition-colors">
            Cancel
          </button>
        )}
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className="px-8 py-4 bg-white text-black text-[10px] font-bold font-sans tracking-[0.2em] uppercase hover:bg-gray-200 transition-colors"
        >
          {isEditing ? 'Save Changes' : 'Edit Details'}
        </button>
      </div>
    </div>
  );
}

function VehiclesTab() {
  return (
    <div className="space-y-6">
      {[
        { make: 'Porsche', model: '718 Cayman', year: '2023', plate: 'GJ-XX-XXXX', status: 'In Service' },
        { make: 'BMW', model: 'M4 Competition', year: '2022', plate: 'MH-XX-XXXX', status: 'Active' }
      ].map((vehicle, idx) => (
        <Link to="/customer/vehicle" key={idx} className="bg-white/5 border border-white/10 rounded-xl p-8 flex items-center justify-between group hover:bg-white/10 transition-colors cursor-pointer block">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Car size={24} className="text-white/50 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="text-2xl font-light tracking-tight mb-1">{vehicle.make} {vehicle.model}</h3>
              <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-white/40">
                {vehicle.year} • {vehicle.plate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className={`text-[10px] font-sans tracking-[0.2em] uppercase ${vehicle.status === 'In Service' ? 'text-[#35D07F]' : 'text-white/50'}`}>
              {vehicle.status}
            </span>
            <ChevronRight size={20} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      ))}
      
      <Link to="/customer/vehicles" className="block text-center mt-8 text-[10px] font-sans tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors">
        View Full Garage / Add Vehicle
      </Link>
    </div>
  );
}

function PaymentMethodsTab() {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-md flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="w-16 h-12 bg-white/10 rounded-md border border-white/20 flex items-center justify-center">
            <CreditCard size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-light tracking-wide mb-1">•••• •••• •••• 4242</h3>
            <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-white/40">Expires 12/28</p>
          </div>
        </div>
        <span className="text-[10px] font-sans tracking-[0.2em] uppercase text-[#35D07F] border border-[#35D07F]/30 bg-[#35D07F]/10 px-3 py-1 rounded-full">
          Default
        </span>
      </div>
      
      {isAdding ? (
        <div className="bg-white/5 border border-white/20 rounded-xl p-8 space-y-4">
          <h3 className="text-sm font-sans tracking-[0.2em] uppercase text-white mb-6">New Payment Method</h3>
          <input type="text" placeholder="Card Number" className="w-full bg-transparent border-b border-white/30 text-lg font-light text-white focus:outline-none focus:border-[#35D07F] py-2" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="MM/YY" className="w-full bg-transparent border-b border-white/30 text-lg font-light text-white focus:outline-none focus:border-[#35D07F] py-2" />
            <input type="text" placeholder="CVC" className="w-full bg-transparent border-b border-white/30 text-lg font-light text-white focus:outline-none focus:border-[#35D07F] py-2" />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button onClick={() => setIsAdding(false)} className="px-6 py-3 border border-white/20 text-white text-[10px] font-sans tracking-[0.2em] uppercase hover:bg-white/5">Cancel</button>
            <button onClick={() => setIsAdding(false)} className="px-6 py-3 bg-[#35D07F] text-black text-[10px] font-bold font-sans tracking-[0.2em] uppercase hover:bg-[#2EB86F]">Save Card</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsAdding(true)} className="w-full py-8 border border-dashed border-white/20 rounded-xl text-[10px] font-sans tracking-[0.2em] uppercase text-white/50 hover:text-white hover:border-white/50 hover:bg-white/5 transition-all flex items-center justify-center gap-3">
          + Add New Payment Method
        </button>
      )}
    </div>
  );
}

function SecurityTab() {
  const [tfa, setTfa] = useState(false);
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-md">
      <div className="flex items-center justify-between py-6 border-b border-white/10">
        <div>
          <h3 className="text-lg font-light mb-1 text-white">Two-Factor Authentication</h3>
          <p className="text-sm font-light text-white/50">Add an extra layer of security to your account.</p>
        </div>
        <button onClick={() => setTfa(!tfa)} className={`px-6 py-2 border text-[10px] font-sans tracking-[0.2em] uppercase transition-colors ${tfa ? 'bg-[#35D07F] text-black border-[#35D07F]' : 'border-white/20 hover:bg-white/10'}`}>
          {tfa ? 'Enabled' : 'Enable'}
        </button>
      </div>
      <div className="flex items-center justify-between py-6">
        <div>
          <h3 className="text-lg font-light mb-1 text-white">Change Password</h3>
          <p className="text-sm font-light text-white/50">Update your current password.</p>
        </div>
        <button className="px-6 py-2 border border-white/20 text-[10px] font-sans tracking-[0.2em] uppercase hover:bg-white/10 transition-colors">
          Update
        </button>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState([true, false, true]);
  
  const toggle = (i: number) => {
    const newPrefs = [...prefs];
    newPrefs[i] = !newPrefs[i];
    setPrefs(newPrefs);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-md space-y-6">
      {[
        { title: 'Service Updates', desc: 'Receive real-time notifications about your vehicle service.' },
        { title: 'Promotional Offers', desc: 'Exclusive deals on premium detailing and parts.' },
        { title: 'Appointment Reminders', desc: 'Alerts for upcoming scheduled maintenance.' }
      ].map((item, i) => (
        <div key={i} className="flex items-center justify-between pb-6 border-b border-white/10 last:border-0 last:pb-0">
          <div>
            <h3 className="text-lg font-light mb-1 text-white">{item.title}</h3>
            <p className="text-sm font-light text-white/50">{item.desc}</p>
          </div>
          <div 
            onClick={() => toggle(i)}
            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${prefs[i] ? 'bg-[#35D07F]' : 'bg-white/20'}`}
          >
            <motion.div 
              animate={{ x: prefs[i] ? 24 : 4 }}
              className="absolute top-1 w-4 h-4 bg-black rounded-full" 
            />
          </div>
        </div>
      ))}
    </div>
  );
}

