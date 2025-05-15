import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Tabs from "../../../components/ui/tabnav";
import { Husdetaljer } from "./Husdetaljer";
import { Huskonfigurator } from "./Huskonfigurator";
import { Prisliste } from "./Prisliste";
import { fetchHusmodellData, formatCurrency } from "../../../lib/utils";
import { Spinner } from "../../../components/Spinner";

export const EditHouseModel = () => {
  const [activeTab, setActiveTab] = useState(0);
  const tabData = [
    { label: "Husdetaljer" },
    { label: "Huskonfigurator" },
    { label: "Prisliste" },
  ];
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  const [house, setHouse] = useState<any | null>(null);
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const getData = async () => {
      const data = await fetchHusmodellData(id);
      if (data && data.Husdetaljer) {
        setHouse(data?.Husdetaljer);
      }
      setLoading(false);
    };
    if (id) {
      getData();
    }
  }, [id]);

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="py-4 px-6">
            <div className="flex items-center gap-3 mb-6">
              <Link
                to={"/Husmodeller"}
                className="text-gray text-sm font-medium"
              >
                Husmodeller
              </Link>
              <ChevronRight className="text-gray2 w-4 h-4" />
              <span className="text-primary text-sm font-medium">
                Endre husmodell
              </span>
            </div>
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-darkBlack font-medium text-[24px]">
                Endre husmodell
              </h1>
              <div className="flex gap-3 items-center">
                <p className="text-gray text-lg">
                  Sum antatte anleggskostnader inkl. mva.
                </p>
                <h1 className="text-darkBlack font-bold text-[24px]">
                  {house && house?.pris ? formatCurrency(house?.pris) : "0 NOK"}
                </h1>
              </div>
            </div>
            {house && (
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={house?.photo}
                  alt="house"
                  className="w-[160px] rounded-lg"
                />
                <div>
                  <h2 className="text-darkBlack font-semibold text-[20px]">
                    {house?.husmodell_name}
                  </h2>
                  <p className="text-gray w-[900px]">{house?.Hustittel}</p>
                </div>
              </div>
            )}
          </div>
          <div>
            <div className="border-b border-gray2 flex items-center justify-between gap-2 mb-6 px-6">
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
      )}
    </>
  );
};
