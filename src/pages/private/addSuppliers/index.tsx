import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { AddSuppliersForm } from "./addSuppliersForm";
import { useEffect, useState } from "react";
import { CreateNewOffice } from "./createOffice";
import { OfficesTable } from "./OfficesTable";

export const AddSuppliers = () => {
  const [activeTab, setActiveTab] = useState<
    "Leverandører" | "Legg til kontor" | "Kontorliste"
  >("Leverandører");

  const [editId, setEditId] = useState(null);

  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;

  useEffect(() => {
    if (editId && activeTab !== "Legg til kontor") {
      setEditId(null);
    }
  }, [activeTab]);

  return (
    <>
      <div className="px-4 md:px-6 pt-6 pb-16 flex flex-col gap-4 md:gap-6">
        <div className="flex items-center gap-1.5 md:gap-3">
          <Link
            to={"/Leverandorer"}
            className="text-gray text-xs md:text-sm font-medium"
          >
            Leverandører
          </Link>
          <ChevronRight className="text-gray2 w-4 h-4" />
          <span className="text-primary text-xs md:text-sm font-medium">
            Legg til nye leverandører
          </span>
        </div>
        {id && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-2">
            <div className="flex gap-1.5">
              {["Leverandører", "Legg til kontor", "Kontorliste"]
                .filter(Boolean)
                .map((tab) => (
                  <button
                    key={tab}
                    onClick={() =>
                      setActiveTab(
                        tab as
                          | "Leverandører"
                          | "Legg til kontor"
                          | "Kontorliste"
                      )
                    }
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
        )}
        {activeTab === "Leverandører" && (
          <>
            <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
              Legg til leverandør
            </h1>
            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 lg:gap-8">
              <div className="w-max">
                <h5 className="text-black text-sm font-medium">
                  Partnerdetaljer
                </h5>
                <p className="text-gray text-sm whitespace-nowrap">
                  Legg til bilder og persondetaljer
                </p>
              </div>
              <div className="w-full shadow-shadow2 rounded-lg overflow-hidden relative">
                <AddSuppliersForm />
              </div>
            </div>
          </>
        )}
        {activeTab === "Legg til kontor" && (
          <>
            <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
              Legg til kontor
            </h1>
            <div>
              <div className="w-full shadow-shadow2 rounded-lg overflow-hidden relative">
                <CreateNewOffice
                  editId={editId}
                  setEditId={setEditId}
                  setActiveTab={setActiveTab}
                />
              </div>
            </div>
          </>
        )}
        {activeTab === "Kontorliste" && (
          <>
            <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
              Kontorliste
            </h1>
            <div>
              <OfficesTable setEditId={setEditId} setActiveTab={setActiveTab} />
            </div>
          </>
        )}
      </div>
    </>
  );
};
