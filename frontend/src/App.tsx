import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Wrench } from 'lucide-react';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminSettings from './pages/AdminSettings';
import AdminBookings from './pages/AdminBookings';
import AdminRepairs from './pages/AdminRepairs';
import AdminInspections from './pages/AdminInspections';
import AdminIssues from './pages/AdminIssues';
import AdminEstimates from './pages/AdminEstimates';
import AdminApprovals from './pages/AdminApprovals';
import AdminVehicles from './pages/AdminVehicles';
import AdminCustomers from './pages/AdminCustomers';
import AdminTechnicians from './pages/AdminTechnicians';
import AdminAdvisors from './pages/AdminAdvisors';
import AdminEvidence from './pages/AdminEvidence';
import AdminInvoices from './pages/AdminInvoices';
import AdminFinance from './pages/AdminFinance';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminUsers from './pages/AdminUsers';
import AdminAuditLogs from './pages/AdminAuditLogs';
import AdminBranches from './pages/AdminBranches';
import { CustomerPortal } from './pages/CustomerPortal';
import CustomerDashboard from './pages/CustomerDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import TechnicianInspection from './pages/TechnicianInspection';
import TechnicianRepair from './pages/TechnicianRepair';
import TechnicianWorkList from './pages/TechnicianWorkList';
import TechnicianParts from './pages/TechnicianParts';
import TechnicianCompletion from './pages/TechnicianCompletion';
import TechnicianHistory from './pages/TechnicianHistory';
import TechnicianEvidence from './pages/TechnicianEvidence';
import TechnicianVehicleDetail from './pages/TechnicianVehicleDetail';
import TechnicianProfile from './pages/TechnicianProfile';
import AdvisorDashboard from './pages/AdvisorDashboard';
import AdvisorTodayServices from './pages/AdvisorTodayServices';
import AdvisorHistory from './pages/AdvisorHistory';
import AdvisorPayments from './pages/AdvisorPayments';
import AdvisorNotifications from './pages/AdvisorNotifications';
import AdvisorMessages from './pages/AdvisorMessages';
import ServiceRecords from './pages/ServiceRecords';
import MyVehicles from './pages/MyVehicles';
import VehicleDetail from './pages/VehicleDetail';
import CustomerProfile from './pages/CustomerProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import PublicVehicleHistory from './pages/PublicVehicleHistory';

import AdvisorLayout from './layouts/AdvisorLayout';
import TechnicianLayout from './layouts/TechnicianLayout';
import BranchManagerLayout from './layouts/BranchManagerLayout';
import CustomerPortalLayout from './layouts/CustomerPortalLayout';
import CustomerDashboardNew from './pages/customer_portal/CustomerDashboard';
import CustomerVehicles from './pages/customer_portal/CustomerVehicles';
import CustomerVehicleDetail from './pages/customer_portal/CustomerVehicleDetail';
import CustomerBookService from './pages/customer_portal/CustomerBookService';
import CustomerServiceRecords from './pages/customer_portal/CustomerServiceRecords';
import CustomerNotifications from './pages/customer_portal/CustomerNotifications';
import CustomerApprovals from './pages/customer_portal/CustomerApprovals';
import CustomerRepairs from './pages/customer_portal/CustomerRepairs';
import CustomerFavorites from './pages/customer_portal/CustomerFavorites';
import CustomerTeamRoster from './pages/customer_portal/CustomerTeamRoster';
import CustomerSharedResources from './pages/customer_portal/CustomerSharedResources';
import CustomerOrderHistory from './pages/customer_portal/CustomerOrderHistory';
import CustomerInvoices from './pages/customer_portal/CustomerInvoices';
import CustomerPaymentMethods from './pages/customer_portal/CustomerPaymentMethods';
import CustomerSubscription from './pages/customer_portal/CustomerSubscription';
import CustomerSupportTickets from './pages/customer_portal/CustomerSupportTickets';
import CustomerMessages from './pages/customer_portal/CustomerMessages';
import CustomerKnowledgeBase from './pages/customer_portal/CustomerKnowledgeBase';
import CustomerSecurity from './pages/customer_portal/CustomerSecurity';
import CustomerPreferences from './pages/customer_portal/CustomerPreferences';
import CustomerPortalProfile from './pages/customer_portal/CustomerPortalProfile';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerServiceOrders from './pages/manager/ManagerServiceOrders';
import ManagerInventory from './pages/manager/ManagerInventory';
import ManagerAppointments from './pages/manager/ManagerAppointments';
import ManagerWorkshop from './pages/manager/ManagerWorkshop';
import ManagerTechnicians from './pages/manager/ManagerTechnicians';
import ManagerCustomers from './pages/manager/ManagerCustomers';
import ManagerCustomerIssues from './pages/manager/ManagerCustomerIssues';
import ManagerInvoices from './pages/manager/ManagerInvoices';
import ManagerFinance from './pages/manager/ManagerFinance';
import ManagerReports from './pages/manager/ManagerReports';
import ManagerSettings from './pages/manager/ManagerSettings';
import ManagerProfile from './pages/manager/ManagerProfile';

import InventoryManagerLayout from './layouts/InventoryManagerLayout';
import InventoryDashboard from './pages/inventory/InventoryDashboard';
import InventoryParts from './pages/inventory/InventoryParts';
import InventoryReservations from './pages/inventory/InventoryReservations';
import InventoryServiceOrders from './pages/inventory/InventoryServiceOrders';
import InventorySuppliers from './pages/inventory/InventorySuppliers';
import InventoryReceiving from './pages/inventory/InventoryReceiving';
import InventoryMovements from './pages/inventory/InventoryMovements';
import InventoryAlerts from './pages/inventory/InventoryAlerts';
import InventorySettings from './pages/inventory/InventorySettings';
import InventoryProfile from './pages/inventory/InventoryProfile';

import { Toaster } from 'react-hot-toast';

import { useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  useEffect(() => {
    const theme = localStorage.getItem('portal-theme') || 'dark';
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else if (theme === 'dark') {
      root.classList.remove('light-theme');
    } else {
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        root.classList.add('light-theme');
      } else {
        root.classList.remove('light-theme');
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: '#1A1A1B',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }} 
      />
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/v/:token" element={<PublicVehicleHistory />} />

          {/* PREMIUM CUSTOMER PORTAL */}
          <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
            <Route path="/customer" element={<CustomerPortalLayout />}>
              <Route index element={<CustomerDashboardNew />} />
              <Route path="dashboard" element={<CustomerDashboardNew />} />
              <Route path="vehicles" element={<CustomerVehicles />} />
              <Route path="vehicles/:id" element={<CustomerVehicleDetail />} />
              <Route path="book-service" element={<CustomerBookService />} />
              <Route path="repairs" element={<CustomerRepairs />} />
              <Route path="approvals" element={<CustomerApprovals />} />
              <Route path="notifications" element={<CustomerNotifications />} />
              <Route path="favorites" element={<CustomerFavorites />} />
              <Route path="organization" element={<CustomerTeamRoster />} />
              <Route path="shared" element={<CustomerSharedResources />} />
              <Route path="billing" element={<CustomerOrderHistory />} />
              <Route path="invoices" element={<CustomerInvoices />} />
              <Route path="payments" element={<CustomerPaymentMethods />} />
              <Route path="subscription" element={<CustomerSubscription />} />
              <Route path="support" element={<CustomerSupportTickets />} />
              <Route path="messages" element={<CustomerMessages />} />
              <Route path="faq" element={<CustomerKnowledgeBase />} />
              <Route path="profile" element={<CustomerPortalProfile />} />
              <Route path="security" element={<CustomerSecurity />} />
              <Route path="preferences" element={<CustomerPreferences />} />
            </Route>
            
            {/* Catch specific legacy URLs and map them to the premium layout if they exist */}
            <Route element={<CustomerPortalLayout />}>
              <Route path="/customer-legacy/vehicle/details/:id" element={<CustomerVehicleDetail />} />
              <Route path="/customer-legacy/records" element={<CustomerServiceRecords />} />
              <Route path="/customer/records" element={<CustomerServiceRecords />} />
            </Route>

            {/* Fallback for unbuilt legacy customer pages to prevent blank screens */}
            <Route path="/customer-legacy/*" element={
              <div className="w-full h-screen bg-[var(--bg-root)] flex items-center justify-center text-[var(--text-primary)] flex-col gap-4">
                <h1 className="text-4xl font-light tracking-widest uppercase">Coming Soon</h1>
                <p className="text-white/50 tracking-widest text-xs uppercase">This module is under construction</p>
                <a href="/customer/dashboard" className="mt-8 border border-[var(--border-strong)] px-6 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-colors">Return to Dashboard</a>
              </div>
            } />
          </Route>
          
          {/* Redirect root to login instead of directly to customer */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Administrative SaaS Platform - Requires Admin/Staff roles */}
          
          {/* Technician Routes */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'BRANCH_MANAGER', 'SERVICE_ADVISOR', 'TECHNICIAN']} />}>
            <Route path="/technician" element={<TechnicianLayout />}>
              <Route index element={<TechnicianDashboard />} />
              <Route path="dashboard" element={<TechnicianDashboard />} />
              <Route path="vehicle/:id" element={<TechnicianVehicleDetail />} />
              <Route path="inspections" element={<TechnicianInspection />} />
              <Route path="repair" element={<TechnicianRepair />} />
              <Route path="assigned" element={<TechnicianWorkList />} />
              <Route path="today" element={<TechnicianWorkList />} />
              <Route path="repairs" element={<TechnicianWorkList />} />
              <Route path="completed" element={<TechnicianWorkList />} />
              <Route path="issues" element={<TechnicianWorkList />} />
              <Route path="evidence" element={<TechnicianEvidence />} />
              <Route path="progress" element={<TechnicianWorkList />} />
              <Route path="parts" element={<TechnicianParts />} />
              <Route path="completion" element={<TechnicianCompletion />} />
              <Route path="history" element={<TechnicianHistory />} />
              <Route path="profile" element={<TechnicianProfile />} />
              <Route path="*" element={
                <div className="w-full h-[80vh] flex items-center justify-center text-[var(--text-primary)] flex-col gap-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl">
                  <div className="w-20 h-20 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center mb-4">
                    <Wrench size={40} className="text-[#35D07F]" />
                  </div>
                  <h1 className="text-3xl font-light tracking-widest uppercase">Under Construction</h1>
                  <p className="text-[var(--text-muted)] tracking-widest text-xs uppercase max-w-md text-center">
                    This technician module is currently being built. Please return to the dashboard to continue your workflow.
                  </p>
                  <a href="/technician/dashboard" className="mt-6 bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/20 px-8 py-3 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-[#35D07F]/20 transition-colors">
                    Return to Dashboard
                  </a>
                </div>
              } />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'BRANCH_MANAGER', 'SERVICE_ADVISOR']} />}>
            <Route path="/advisor" element={<AdvisorLayout />}>
              <Route index element={<AdvisorDashboard />} />
              <Route path="today" element={<AdvisorTodayServices />} />
              <Route path="history" element={<AdvisorHistory />} />
              <Route path="payments" element={<AdvisorPayments />} />
              <Route path="notifications" element={<AdvisorNotifications />} />
              <Route path="messages" element={<AdvisorMessages />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="repairs" element={<AdminRepairs />} />
              <Route path="inspections" element={<AdminInspections />} />
              <Route path="issues" element={<AdminIssues />} />
              <Route path="approvals" element={<AdminApprovals />} />
              <Route path="vehicles" element={<AdminVehicles />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="invoices" element={<AdminInvoices />} />
              <Route path="*" element={<div className="p-8 text-[var(--text-primary)]">Under Construction</div>} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="repairs" element={<AdminRepairs />} />
              <Route path="inspections" element={<AdminInspections />} />
              <Route path="issues" element={<AdminIssues />} />
              <Route path="estimates" element={<AdminEstimates />} />
              <Route path="approvals" element={<AdminApprovals />} />
              
              <Route path="vehicles" element={<AdminVehicles />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="technicians" element={<AdminTechnicians />} />
              <Route path="advisors" element={<AdminAdvisors />} />
              
              <Route path="evidence" element={<AdminEvidence />} />
              
              <Route path="invoices" element={<AdminInvoices />} />
              <Route path="finance" element={<AdminFinance />} />
              
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="audit" element={<AdminAuditLogs />} />
              <Route path="branches" element={<AdminBranches />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'BRANCH_MANAGER']} />}>
            {/* Manager Routes */}
            <Route path="/manager" element={<BranchManagerLayout />}>
              <Route index element={<ManagerDashboard />} />
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="workshop" element={<ManagerWorkshop />} />
              <Route path="technicians" element={<ManagerTechnicians />} />
              <Route path="customers" element={<ManagerCustomers />} />
              <Route path="issues" element={<ManagerCustomerIssues />} />
              <Route path="invoices" element={<ManagerInvoices />} />
              <Route path="finance" element={<ManagerFinance />} />
              <Route path="reports" element={<ManagerReports />} />
              <Route path="settings" element={<ManagerSettings />} />
              <Route path="profile" element={<ManagerProfile />} />
              <Route path="service-orders" element={<ManagerServiceOrders />} />
              <Route path="inventory" element={<ManagerInventory />} />
              <Route path="appointments" element={<ManagerAppointments />} />
              <Route path="*" element={<div className="p-8 text-[var(--text-primary)]">Manager Module Under Construction</div>} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'BRANCH_MANAGER', 'INVENTORY_MANAGER']} />}>
            <Route path="/inventory-manager" element={<InventoryManagerLayout />}>
              <Route index element={<InventoryDashboard />} />
              <Route path="dashboard" element={<InventoryDashboard />} />
              <Route path="parts" element={<InventoryParts />} />
              <Route path="reservations" element={<InventoryReservations />} />
              <Route path="service-orders" element={<InventoryServiceOrders />} />
              <Route path="suppliers" element={<InventorySuppliers />} />
              <Route path="receiving" element={<InventoryReceiving />} />
              <Route path="movements" element={<InventoryMovements />} />
              <Route path="alerts" element={<InventoryAlerts />} />
              <Route path="settings" element={<InventorySettings />} />
              <Route path="profile" element={<InventoryProfile />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;


