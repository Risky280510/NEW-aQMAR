import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, isLoading, checkAuth } = useAuthStore();
  const location = useLocation();

  // Force a re-check of authentication when the component mounts
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      checkAuth();
    }
  }, [isAuthenticated, isLoading, checkAuth]);

  if (isLoading) {
    // Show a better loading indicator
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg">Loading your session...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    // Navigate to the login page, save the original page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authorization check (Role)
  const userRole = user?.role;
  if (userRole && allowedRoles.includes(userRole)) {
    // If the role is allowed, render the child component (landing page)
    return <Outlet />;
  } else {
    console.log(
      "Access denied - User role:",
      userRole,
      "Allowed roles:",
      allowedRoles,
    );
    // If the role is not allowed, navigate to the "Access Denied" page
    return <Navigate to="/access-denied" replace />;
  }
};

export default ProtectedRoute;
