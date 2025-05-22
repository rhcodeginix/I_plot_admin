// import { Navigate, Outlet } from "react-router-dom";
// import { useIsAuthenticated } from "../hooks/useAuth";
// import { useEffect, useState } from "react";
// import { fetchAdminDataByEmail } from "../lib/utils";

// export const AuthLayout = () => {
//   const [Role, setRole] = useState<any>(null);

//   useEffect(() => {
//     const getData = async () => {
//       const data = await fetchAdminDataByEmail();
//       console.log(data);

//       if (data) {
//         if (data?.role) {
//           setRole(data?.role);
//         }
//       }
//     };

//     getData();
//   }, [Role]);
//   console.log(Role);

//   if (useIsAuthenticated()) {
//     return (
//       <Navigate
//         to={
//           !Role || (Role && Role !== "Bankansvarlig")
//             ? "/dashboard"
//             : "/agent-leads"
//         }
//         replace
//       />
//     );
//   }

//   return <Outlet />;
// };

import { Navigate, Outlet } from "react-router-dom";
import { useIsAuthenticated } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { fetchAdminDataByEmail } from "../lib/utils";

export const AuthLayout = () => {
  const isAuthenticated = useIsAuthenticated(); // call hooks at top level
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // add loading state

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
        to={role === "Bankansvarlig" ? "/agent-leads" : "/dashboard"}
        replace
      />
    );
  }

  if (loading) return <div>Loading...</div>;

  return <Outlet />;
};
