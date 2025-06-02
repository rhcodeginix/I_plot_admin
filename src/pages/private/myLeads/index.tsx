import { useState } from "react";
import { MyLeadsTable } from "./leads";
import { TODOTable } from "./todoTable";
import Button from "../../../components/common/button";
import { Plus } from "lucide-react";

export const MyLeads = () => {
  const [activeTab, setActiveTab] = useState<"Alle leads" | "Mine leads">(
    "Alle leads"
  );
  const email: string | null = localStorage.getItem("Iplot_admin");

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 md:px-6 pt-6">
        <h1 className="text-darkBlack font-medium text-lg md:text-xl desktop:text-2xl">
          Leads for Fjellheimhytta
        </h1>
        <div className="flex gap-2 text-center">
          <div className="flex gap-1.5">
            {[
              "Alle leads",
              email && email !== "andre.finger@gmail.com" && "Mine leads",
            ]
              .filter(Boolean)
              .map((tab: any) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2 md:px-4 py-2 text-sm font-medium ${
                    activeTab === tab
                      ? "border-b-2 border-purple text-purple"
                      : "text-gray-500"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
          </div>
          <Button
            text="Opprett nytt lead"
            className="border border-purple bg-purple text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
            icon={<Plus className="text-white w-5 h-5" />}
            path="/add-lead"
          />
        </div>
      </div>
      {activeTab === "Alle leads" && <MyLeadsTable />}
      {activeTab === "Mine leads" && <TODOTable />}
    </>
  );
};
