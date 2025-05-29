import { useState } from "react";
import { MyLeadsTable } from "./leads";
import { TODOTable } from "./todoTable";

export const MyLeads = () => {
  const [activeTab, setActiveTab] = useState<"Mine leads" | "Mine oppgaver">(
    "Mine leads"
  );
  const email: string | null = localStorage.getItem("Iplot_admin");

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 md:px-6 pt-6">
        <h1 className="text-darkBlack font-medium text-lg md:text-xl desktop:text-2xl">
          Leads for Fjellheimhytta
        </h1>
        <div className="flex gap-1.5">
          {[
            "Mine leads",
            email && email !== "andre.finger@gmail.com" && "Mine oppgaver",
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
      </div>
      {activeTab === "Mine leads" && <MyLeadsTable />}
      {activeTab === "Mine oppgaver" && <TODOTable />}
    </>
  );
};
