import { useEffect, useState } from "react";
import { fetchAdminDataByEmail } from "../../../lib/utils";
import { AdminProfileForm } from "./addUsersForm";
import { BankProfileForm } from "./addBankUserForm";
import { AgentProfileForm } from "./addAgentUserForm";

export const Profile = () => {
  const [Role, setRole] = useState(null);
  const [IsAdmin, setIsAdmin] = useState(null);
  useEffect(() => {
    const getData = async () => {
      const data: any = await fetchAdminDataByEmail();
      if (data) {
        if (data?.role) {
          setRole(data?.role);
        }

        setIsAdmin(data?.is_admin ?? false);
      }
    };

    getData();
  }, []);
  return (
    <>
      {Role === "Admin" && <AdminProfileForm />}
      {Role === "Bankansvarlig" && <BankProfileForm />}
      {Role === "super-admin" && <BankProfileForm />}
      {Role === "Agent" && IsAdmin === true ? (
        <AgentProfileForm />
      ) : (
        Role === "Agent" && IsAdmin === true && <AdminProfileForm />
      )}
    </>
  );
};
