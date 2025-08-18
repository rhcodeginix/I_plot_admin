import { Plus } from "lucide-react";
import Button from "../../../components/common/button";
import { UserTable } from "./userTable";
import { useEffect, useState } from "react";
import { fetchAdminDataByEmail } from "../../../lib/utils";

export const UserManagement = () => {
  const [Role, setRole] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "Admin" | "Boligkonsulenter" | "Bankansvarlig"
  >("Admin");

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();

      if (data) {
        if (data?.role) {
          setRole(data?.role);
          if (data?.role === "Agent") {
            setActiveTab("Boligkonsulenter");
          }
        }
      }
    };

    getData();
  }, []);

  const renderTable = () => {
    switch (activeTab) {
      case "Admin":
        return <UserTable role="Admin" />;
      case "Boligkonsulenter":
        return <UserTable role="Agent" />;
      case "Bankansvarlig":
        return <UserTable role="Bankansvarlig" />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="px-4 md:px-6 pt-6 pb-16 flex flex-col gap-4 md:gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
              Brukere
            </h1>
            <p className="text-gray text-sm md:text-base">
              Liste over alle bruker
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {[
              Role && Role !== "Agent" && "Admin",
              "Boligkonsulenter",
              Role && Role !== "Agent" && "Bankansvarlig",
            ]
              .filter(Boolean)
              .map((tab) => (
                <button
                  key={tab}
                  onClick={() =>
                    setActiveTab(
                      tab as "Admin" | "Boligkonsulenter" | "Bankansvarlig"
                    )
                  }
                  className={`px-2 md:px-4 py-2 text-sm font-medium ${
                    activeTab === tab
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-500"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
          </div>
          <div className="flex gap-3">
            <Button
              text="Legg til"
              className="border border-primary bg-primary text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
              icon={<Plus className="text-white w-5 h-5" />}
              path={
                activeTab === "Admin"
                  ? "/legg-user"
                  : activeTab === "Bankansvarlig"
                  ? "/add-bank-user"
                  : "/add-agent-user"
              }
            />
          </div>
        </div>
        {renderTable()}
      </div>
    </>
  );
};
