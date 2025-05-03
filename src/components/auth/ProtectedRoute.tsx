
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Allow managers to access owner routes
  if (allowedRoles && 
      !allowedRoles.includes(user.role) && 
      !(user.role === "manager" && allowedRoles.includes("owner"))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : null;
};

export default ProtectedRoute;
