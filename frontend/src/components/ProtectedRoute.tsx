import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = payload.user?.role;
    
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // If they are logged in but don't have the right role, send them to their dashboard
      if (userRole === 'CUSTOMER') {
        return <Navigate to="/customer/vehicle" replace />;
      }
      return <Navigate to="/login" replace />;
    }
    
    return <Outlet />;
  } catch (e) {
    // Invalid token
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return <Navigate to="/login" replace />;
  }
}

