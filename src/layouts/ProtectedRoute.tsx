import { Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { fetchAdminRole } from "../lib/utils";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRole = async () => {
      const role: any = await fetchAdminRole();
      setUserRole(role);
      setLoading(false);
    };
    getRole();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
