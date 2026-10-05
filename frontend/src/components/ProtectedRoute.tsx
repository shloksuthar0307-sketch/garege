import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../lib/auth';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const token = getAccessToken();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      clearTokens();
      return <Navigate to="/login" replace />;
    }
    
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
    clearTokens();
return <Navigate to="/login" replace />;
  }
}


