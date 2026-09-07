import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { Sprout } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: (UserRole | string)[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { appUser, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-farmora-light font-sans flex flex-col items-center justify-center">
        <div className="flex items-center space-x-3 text-farmora-primary mb-4 animate-pulse">
          <Sprout className="w-10 h-10" />
          <span className="font-bold text-2xl tracking-tight">Farmora</span>
        </div>
        <div className="w-8 h-8 border-4 border-farmora-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-farmora-muted font-medium">Verifying access credentials...</p>
      </div>
    );
  }

  if (!token || !appUser) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  const userRole = (appUser.role || '').toLowerCase();
  const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

  // Check if role is allowed
  const isAllowed = normalizedAllowed.includes(userRole) || 
                    (normalizedAllowed.includes('transporter') && ['transport_driver', 'driver'].includes(userRole)) ||
                    (normalizedAllowed.includes('transport_driver') && ['transporter', 'driver'].includes(userRole));

  if (!isAllowed) {
    // Redirect to user's assigned portal automatically based on PostgreSQL role
    if (userRole === 'farmer') {
      return <Navigate to="/farmer" replace />;
    } else if (userRole === 'buyer') {
      return <Navigate to="/buyer" replace />;
    } else if (['transporter', 'transport_driver', 'driver'].includes(userRole)) {
      return <Navigate to="/transporter" replace />;
    } else {
      return <Navigate to="/auth" replace />;
    }
  }

  return <>{children}</>;
}
