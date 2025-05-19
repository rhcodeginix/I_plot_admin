import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Tabs from "../../../components/ui/tabnav";
import Button from "../../../components/common/button";
import { Husdetaljer } from "./Husdetaljer";
import { Prisliste } from "./Prisliste";
import { fetchHusmodellData, formatCurrency } from "../../../lib/utils";

export const SeHouseModel = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabData = [{ label: "Husdetaljer" }, { label: "Prisliste" }];

  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  const [loading, setLoading] = useState(true);
  const [husmodellData, setHusmodellData] = useState<any>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const getData = async () => {
      const data: any = await fetchHusmodellData(id);
      if (data) {
        setHusmodellData(data);
      }
      setLoading(false);
    };

    getData();
  }, [id]);

  return (
    <>
      <div className="bg-lightPurple py-4 px-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to={"/Husmodeller"} className="text-gray text-sm font-medium">
            Husmodeller
          </Link>
          <ChevronRight className="text-gray2 w-4 h-4" />
          <span className="text-primary text-sm font-medium">Se husmodell</span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-4 items-center">
            {loading ? (
              <div
                className="w-[180px] h-[113px] rounded-md custom-shimmer mb-2"
                style={{ borderRadius: "8px" }}
              ></div>
            ) : (
              <img
                src={husmodellData?.Husdetaljer?.photo}
                alt="plot-image"
                className="w-[180px] h-[113px] rounded-lg"
              />
            )}
            <div className="flex flex-col gap-4">
              {loading ? (
                <div
                  className="w-[300px] h-[30px] rounded-md custom-shimmer mb-2"
                  style={{ borderRadius: "8px" }}
                ></div>
              ) : (
                <h4 className="text-darkBlack font-medium text-2xl">
                  {husmodellData?.Husdetaljer?.husmodell_name}
                </h4>
              )}
              <div className="flex items-center gap-4">
                {loading ? (
                  <div
                    className="w-[100px] h-[30px] rounded-md custom-shimmer mb-2"
                    style={{ borderRadius: "8px" }}
                  ></div>
                ) : (
                  <div className="text-lg text-darkBlack font-semibold">
                    {husmodellData?.Husdetaljer?.BRATotal}{" "}
                    <span className="text-gray font-normal">
                      m<sup>2</sup>
                    </span>
                  </div>
                )}
                <div className="h-3 border-l border-gray2"></div>
                {loading ? (
                  <div
                    className="w-[100px] h-[30px] rounded-md custom-shimmer mb-2"
                    style={{ borderRadius: "8px" }}
                  ></div>
                ) : (
                  <div className="text-lg text-darkBlack font-semibold">
                    {husmodellData?.Husdetaljer?.Soverom}{" "}
                    <span className="text-gray font-normal">soverom</span>
                  </div>
                )}
                <div className="h-3 border-l border-gray2"></div>
                {loading ? (
                  <div
                    className="w-[100px] h-[30px] rounded-md custom-shimmer mb-2"
                    style={{ borderRadius: "8px" }}
                  ></div>
                ) : (
                  <div className="text-lg text-darkBlack font-semibold">
                    {husmodellData?.Husdetaljer?.Bad}{" "}
                    <span className="text-gray font-normal">bad</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-gray text-sm">Pris fra</p>
            {loading ? (
              <div
                className="w-[300px] h-[30px] rounded-md custom-shimmer mb-2"
                style={{ borderRadius: "8px" }}
              ></div>
            ) : (
              <h5 className="text-darkBlack text-xl font-semibold">
                {formatCurrency(husmodellData?.Husdetaljer?.pris)}
              </h5>
            )}
          </div>
        </div>
      </div>
      <div className="py-4 px-6">
        <div className="border-b border-gray2 flex items-center justify-between gap-2 mb-6">
          <Tabs
            tabs={tabData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <Button
            text="Endre husmodell"
            className="border border-purple bg-purple text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
            path={`/edit-husmodell/${id}`}
          />
        </div>
        {activeTab === 0 && (
          <Husdetaljer husmodellData={husmodellData?.Husdetaljer} loading={loading} />
        )}
        {activeTab === 1 && (
          <Prisliste husmodellData={husmodellData?.Prisliste} />
        )}
      </div>
    </>
  );
};
