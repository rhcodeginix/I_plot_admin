import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { fetchAdminDataByEmail } from "../lib/utils";
import { analytics } from "../config/firebaseConfig";
import { logEvent } from "firebase/analytics";

export const AuthLayout = () => {
  const isAuthenticated = useIsAuthenticated();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    if (analytics) {
      logEvent(analytics, "page_view", {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location]);

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
        to={
          role === "Bankansvarlig"
            ? "/bank-leads"
            : role === "Agent"
            ? "/agent-leads"
            : "/dashboard"
        }
        replace
      />
    );
  }

  if (loading) return <div>Loading...</div>;

  return <Outlet />;
};
