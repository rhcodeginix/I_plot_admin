import { Navigate, Outlet } from "react-router-dom";
import { useIsAuthenticated } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { fetchAdminDataByEmail } from "../lib/utils";

export const AuthLayout = () => {
  const [Role, setRole] = useState<any>(null);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();

      if (data) {
        if (data?.role) {
          setRole(data?.role);
        }
      }
    };

    getData();
  }, []);

  if (useIsAuthenticated()) {
    return (
      <Navigate
        to={
          !Role || (Role && Role !== "Bankansvarlig")
            ? "/dashboard"
            : "/agent-leads"
        }
        replace
      />
    );
  }

  return <Outlet />;
};
