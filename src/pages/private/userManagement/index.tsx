import { Plus } from "lucide-react";
import Button from "../../../components/common/button";
import { UserTable } from "./userTable";
import { useState } from "react";

export const UserManagement = () => {
  const [activeTab, setActiveTab] = useState<
    "Admin" | "Agent" | "Bankansvarlig"
  >("Admin");
  const renderTable = () => {
    switch (activeTab) {
      case "Admin":
        return <UserTable role="Admin" />;
      case "Agent":
        return <UserTable role="Agent" />;
      case "Bankansvarlig":
        return <UserTable role="Bankansvarlig" />;
      default:
        return null;
    }
  };
  return (
    <>
      <div className="px-6 pt-6 pb-16 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-darkBlack font-medium text-[30px]">Brukers</h1>
            <p className="text-gray">Liste over alle bruker</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="">
            {["Admin", "Agent", "Bankansvarlig"].map((tab) => (
              <button
                key={tab}
                onClick={() =>
                  setActiveTab(tab as "Admin" | "Agent" | "Bankansvarlig")
                }
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === tab
                    ? "border-b-2 border-purple text-purple"
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
              className="border border-purple bg-purple text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
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
        {/* <UserTable /> */}
        {renderTable()}
      </div>
    </>
  );
};
