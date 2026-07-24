// components/protected-route.tsx
import { Navigate } from "react-router-dom";
import { useAuth, Role } from "@/app/contexts/auth-context";

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Role[];
}) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login/staff" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login/staff" replace />;
  }

  return <>{children}</>;
}