import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Tabs from "../../../components/ui/tabnav";
import { Husdetaljer } from "./Husdetaljer";
import { Huskonfigurator } from "./Huskonfigurator";
import { Prisliste } from "./Prisliste";
import { fetchHusmodellData, formatCurrency } from "../../../lib/utils";

export const EditHouseModel = () => {
  const [activeTab, setActiveTab] = useState(0);
  const tabData = [
    { label: "Husdetaljer" },
    { label: "Huskonfigurator" },
    { label: "Prisliste" },
  ];
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  const [house, setHouse] = useState<any | null>(null);
  useEffect(() => {
    if (!id) {
      return;
    }
    const getData = async () => {
      const data = await fetchHusmodellData(id);
      if (data && data.Husdetaljer) {
        setHouse(data?.Husdetaljer);
      }
    };
    if (id) {
      getData();
    }
  }, [id]);

  return (
    <>
      <div className="py-4 px-4 md:px-6">
        <div className="flex items-center gap-1.5 md:gap-3 mb-3 md:mb-6">
          <Link
            to={"/Husmodeller"}
            className="text-gray text-xs md:text-sm font-medium"
          >
            Husmodeller
          </Link>
          <ChevronRight className="text-gray2 w-4 h-4" />
          <span className="text-primary text-xs md:text-sm font-medium">
            Endre husmodell
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 md:mb-5">
          <h1 className="text-darkBlack font-medium text-lg md:text-xl desktop:text-2xl">
            Endre husmodell
          </h1>
          <div className="flex gap-1 flex-wrap sm:gap-3 items-center">
            <p className="text-gray text-sm md:text-base desktop:text-lg">
              Sum antatte anleggskostnader inkl. mva.
            </p>
            <h1 className="text-darkBlack font-bold text-lg md:text-xl desktop:text-2xl">
              {house && house?.pris ? formatCurrency(house?.pris) : "kr 0"}
            </h1>
          </div>
        </div>
        {house && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <img
              src={house?.photo}
              alt="house"
              className="w-full sm:w-[160px] rounded-lg"
            />
            <div>
              <h2 className="text-darkBlack font-semibold text-base md:text-lg desktop:text-xl">
                {house?.husmodell_name}
              </h2>
              <p className="text-gray desktop:w-[900px] text-sm md:text-base">
                {house?.Hustittel}
              </p>
            </div>
          </div>
        )}
      </div>
      <div>
        <div className="border-b border-gray2 flex items-center justify-between gap-2 mb-4 md:mb-6 px-4 md:px-6">
          <Tabs
            tabs={tabData}
            activeTab={activeTab}
            {...(location.pathname.startsWith("/edit-husmodell")
              ? { setActiveTab }
              : {})}
          />
        </div>
        {activeTab === 0 && <Husdetaljer setActiveTab={setActiveTab} />}
        {activeTab === 1 && <Huskonfigurator setActiveTab={setActiveTab} />}
        {activeTab === 2 && <Prisliste setActiveTab={setActiveTab} />}
      </div>
    </>
  );
};
