import React, { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useStaffWindowStore } from "../../store/staffWindowStore";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("admin" | "staff")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, loading, user } = useAuthStore();
  const { selectedWindow, serviceInfo } = useStaffWindowStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Derive role: admin = is_superuser, staff = is_staff only
  if (allowedRoles) {
    const userRole = user.is_superuser ? "admin" : "staff";
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Staff with assigned service must select a window before accessing other pages
  if (
    !!serviceInfo &&
    !selectedWindow &&
    location.pathname !== "/staff/onboarding"
  ) {
    return <Navigate to="/staff/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
