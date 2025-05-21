/* eslint-disable react-hooks/exhaustive-deps */
import { BookText, ChartPie, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchBankLeadData } from "../../../lib/utils";
import { Oppsummering } from "./oppsummering";
import { Fremdriftsplan } from "./Fremdriftsplan";

export const LeadsDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  const [bankData, setBankData] = useState<any>();

  const getData = useCallback(async () => {
    if (!id) return;

    try {
      const data = await fetchBankLeadData(id);
      if (data) {
        setBankData(data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      return;
    }

    getData();
  }, [getData]);

  const [activeTab, setActiveTab] = useState<any>(0);
  const tabData = [
    { label: "Summary", icon: <BookText /> },
    { label: "Fremdriftsplan", icon: <ChartPie /> },
  ];
  useEffect(() => {
    const timeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);

    return () => clearTimeout(timeout);
  }, [activeTab]);

  return (
    <>
      <div className="px-8 pt-4 pb-8 flex flex-col gap-6 bg-[#F5F3FF]">
        <div className="flex items-center gap-1">
          <span
            className="text-[#7839EE] text-sm font-medium cursor-pointer"
            onClick={() => navigate("/agent-leads")}
          >
            Leads sendt til banken
          </span>
          <ChevronRight className="h-4 w-4 text-[#5D6B98]" />
          <span className="text-[#5D6B98] text-sm">
            Detaljer om potensielle kunder
          </span>
        </div>
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="text-darkBlack text-[2rem] font-medium">
              {bankData?.Kunden?.Kundeinformasjon[0]?.f_name}{" "}
              {bankData?.Kunden?.Kundeinformasjon[0]?.l_name}{" "}
              <span className="text-[#5D6B98] text-xl">({id})</span>
            </div>
            <div>
              {bankData?.status === "Sent" ? (
                <p className="text-xs text-[#A27200] w-max bg-[#FFF6E0] py-0.5 px-2 rounded-[16px]">
                  {bankData?.status}
                </p>
              ) : bankData?.status === "Rejected" ? (
                <p className="text-xs text-[#A20000] w-max bg-[#FFE0E0] py-0.5 px-2 rounded-[16px]">
                  {bankData?.status}
                </p>
              ) : bankData?.status === "Approved" ? (
                <p className="text-xs text-[#00857A] bg-[#E0FFF5] w-max py-0.5 px-2 rounded-[16px]">
                  {bankData?.status}
                </p>
              ) : (
                bankData?.status === "In Process" && (
                  <p className="text-xs text-[#C84D00] bg-[#FFEAE0] w-max py-0.5 px-2 rounded-[16px]">
                    {bankData?.status}
                  </p>
                )
              )}
            </div>
          </div>
          <p className="text-[#5D6B98] text-lg font-medium">
            {bankData?.plotHusmodell?.plot?.address}
          </p>
        </div>
      </div>
      <div className="relative">
        <div className="flex items-center justify-between gap-2 mb-6 px-10 mt-4">
          <div
            className="flex gap-4 rounded-lg bg-white p-[6px]"
            style={{
              boxShadow: "0px 1px 2px 0px #1018280F, 0px 1px 3px 0px #1018281A",
            }}
          >
            {tabData.map((tab, index) => (
              <button
                key={index}
                className={`${
                  id ? "cursor-pointer" : "cursor-auto"
                } flex items-center gap-2 text-darkBlack py-2 px-3 rounded-lg ${
                  activeTab === index
                    ? "font-semibold bg-[#7839EE] text-white"
                    : "text-[#4D4D4D]"
                }`}
                onClick={() => setActiveTab(index)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 0 && <Oppsummering bankData={bankData} />}
        {activeTab === 1 && (
          <Fremdriftsplan bankData={bankData} getData={getData} />
        )}
      </div>
    </>
  );
};
