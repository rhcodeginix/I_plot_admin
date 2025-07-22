import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useIsAuthenticated } from "../hooks/useAuth";
import { fetchAdminDataByEmail } from "../lib/utils";
import { db } from "../config/firebaseConfig";
import bcrypt from "bcryptjs";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

function generateRandomPassword(length = 12) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  return password;
}

export const StartupHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useIsAuthenticated();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const hasRun = useRef(false);

  useEffect(() => {
    const getData = async () => {
      const data: any = await fetchAdminDataByEmail();
      if (data?.role) {
        setRole(data.role);
      }
      setLoading(false);
    };

    getData();
  }, []);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    if (location.pathname === "/") {
      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get("token");

      const verifyToken = async (token: string) => {
        navigate(`/auth?token=${token}`);

        try {
          const response = await fetch(
            "https://tr1av984od.execute-api.eu-north-1.amazonaws.com/prod/sso/verify-token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ token }),
            }
          );

          const result = await response.json();
          const adminDocRef = doc(db, "admin", result?.userData?.email);
          const adminSnap = await getDoc(adminDocRef);

          if (!adminSnap.exists()) {
            const uniqueId = uuidv4();
            const [f_name, ...rest] = result?.userData?.name.trim().split(" ");
            const l_name = rest.join(" ");

            await setDoc(adminDocRef, {
              email: result?.userData?.email,
              f_name,
              l_name,
              id: uniqueId,
              password: generateRandomPassword(),
              createdAt: new Date(),
              role: "Agent",
              updatedAt: new Date(),
              supplier: "9f523136-72ca-4bde-88e5-de175bc2fc71",
            });

            toast.success("Admin created successfully!", {
              position: "top-right",
            });
            localStorage.setItem("Iplot_admin", result?.userData?.email);
            navigate("/dashboard");
          } else {
            const adminData = adminSnap.data();
            const storedPassword = adminData?.password;

            const hashedPassword = bcrypt.hashSync(storedPassword, 10);
            await updateDoc(adminDocRef, { password: hashedPassword });

            toast.success("Login successfully", {
              position: "top-right",
            });
            localStorage.setItem("Iplot_admin", result?.userData?.email);
            const loginUserData = await fetchAdminDataByEmail();
            if (loginUserData) {
              navigate(
                loginUserData?.role === "Bankansvarlig" ||
                  loginUserData?.role === "Agent"
                  ? "/bank-leads"
                  : "/dashboard"
              );
            }
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          navigate("/login", { replace: true });
        }
      };

      const init = async () => {
        if (token) {
          await verifyToken(token);
        } else {
          if (isAuthenticated) {
            navigate(
              role === "Bankansvarlig" || role === "Agent"
                ? "/bank-leads"
                : "/dashboard",
              {
                replace: true,
              }
            );
          } else {
            navigate("/login", { replace: true });
          }
          setLoading(false);
        }
      };

      init();
    }
  }, [location.search, isAuthenticated, role, navigate]);

  if (loading) return <div>Loading...</div>;

  return <Outlet />;
};
