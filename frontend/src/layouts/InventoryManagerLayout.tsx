import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../lib/auth';
import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, LayoutDashboard, Search, Bell, Settings, LogOut, 
  AlertTriangle, Truck, History, Wrench, Menu, X, CheckSquare, Users
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/inventory-manager/dashboard' },
  { icon: Package, label: 'Parts & Stock', path: '/inventory-manager/parts' },
  { icon: CheckSquare, label: 'Reservations', path: '/inventory-manager/reservations' },
  { icon: Wrench, label: 'Service Orders', path: '/inventory-manager/service-orders' },
  { icon: Users, label: 'Suppliers', path: '/inventory-manager/suppliers' },
  { icon: Truck, label: 'Receiving', path: '/inventory-manager/receiving' },
  { icon: History, label: 'Stock Movement', path: '/inventory-manager/movements' },
  { icon: AlertTriangle, label: 'Alerts', path: '/inventory-manager/alerts' },
  { icon: Settings, label: 'Settings', path: '/inventory-manager/settings' },
];

export default function InventoryManagerLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Basic JWT parse
  const token = getAccessToken();
  let user = null;
  if (token) {
    try {
      user = JSON.parse(atob(token.split('.')[1]))?.user;
    } catch (e) {}
  }

  const handleLogout = () => {
    clearTokens();
navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[var(--bg-root)] text-[var(--text-primary)] overflow-hidden selection:bg-[#35D07F] selection:text-black">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0A0A] border-r border-[var(--border-subtle)] 
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 flex flex-col
      `}>
        <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <h1 className="text-xl font-light tracking-widest uppercase">RepairTrace</h1>
            <p className="text-[#35D07F] text-xs font-bold tracking-widest uppercase mt-1">Inventory Manager</p>
          </div>
          <button 
            className="lg:hidden text-white/50 hover:text-[var(--text-primary)]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'bg-[var(--bg-surface-active)] text-[var(--text-primary)] border border-[var(--border-default)]' 
                  : 'text-white/50 hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-transparent'}
              `}
            >
              <item.icon size={20} className={location.pathname === item.path ? "text-[#35D07F]" : ""} />
              <span className="text-sm font-medium tracking-wide uppercase">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--border-subtle)]">
          <div 
            onClick={() => navigate('/inventory-manager/profile')}
            className={`flex items-center space-x-3 px-2 py-3 mb-2 rounded-xl cursor-pointer transition-colors ${location.pathname.includes('/profile') ? 'bg-[var(--bg-surface-active)] border border-[var(--border-default)]' : 'hover:bg-[var(--bg-surface-hover)] border border-transparent'}`}
          >
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center border border-[var(--border-default)] text-[var(--text-primary)] font-medium">
              {user?.full_name?.charAt(0) || 'I'}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)] tracking-wide">{user?.full_name || 'Inventory Manager'}</p>
              <p className="text-[11px] text-white/40 font-medium tracking-wider">{user?.branch_name || 'Central Branch'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium uppercase tracking-wide">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-[var(--bg-root)] border-b border-[var(--border-subtle)] flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center">
            <button 
              className="lg:hidden text-white/50 hover:text-[var(--text-primary)] mr-4"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center space-x-2 text-white/50">
              <span className="text-xs uppercase tracking-widest">{location.pathname.split('/').filter(Boolean).join(' / ')}</span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                type="text" 
                placeholder="Ctrl + K to search" 
                className="w-64 bg-[var(--bg-surface-hover)] border border-[var(--border-default)] rounded-full py-2 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder-white/30 focus:outline-none focus:border-[#35D07F]/50 focus:bg-[var(--bg-surface-active)] transition-all"
              />
            </div>
            <button className="relative text-white/50 hover:text-[var(--text-primary)] transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-[var(--text-primary)] border border-[#020202]">
                3
              </span>
            </button>
            <button 
              onClick={() => navigate('/inventory-manager/settings')}
              className={`transition-colors ${location.pathname.includes('/settings') ? 'text-[#35D07F]' : 'text-white/50 hover:text-[var(--text-primary)]'}`}
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#35D07F]/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}


