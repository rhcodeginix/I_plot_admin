import { Navigate, Outlet } from "react-router-dom";
import { useIsAuthenticated } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { fetchAdminDataByEmail } from "../lib/utils";

export const AuthLayout = () => {
  const isAuthenticated = useIsAuthenticated();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();
      if (data?.role) {
        setRole(data.role);
      }
      setLoading(false);
    };

    getData();
  }, []);

  if (isAuthenticated && !loading) {
    return (
      <Navigate
        to={role === "Bankansvarlig" ? "/bank-leads" : "/dashboard"}
        replace
      />
    );
  }

  if (loading) return <div>Loading...</div>;

  return <Outlet />;
};
