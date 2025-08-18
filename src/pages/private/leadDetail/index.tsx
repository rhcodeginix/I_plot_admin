/* eslint-disable react-hooks/exhaustive-deps */
import { BookText, ChartPie, ChevronRight, FileText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchAdminDataByEmail, fetchBankLeadData } from "../../../lib/utils";
import { Oppsummering } from "./oppsummering";
import { Fremdriftsplan } from "./Fremdriftsplan";
import { Documenters } from "./document";

export const LeadsDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  const [bankData, setBankData] = useState<any>();

  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();
      if (data?.role) {
        setRole(data.role);
      }
    };

    getData();
  }, []);

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
    { label: "Summary", icon: <BookText className="w-5 h-5 md:w-6 md:h-6" /> },
    {
      label: "Dokumentasjon",
      icon: <FileText className="w-5 h-5 md:w-6 md:h-6" />,
    },
    {
      label: "Fremdriftsplan",
      icon: <ChartPie className="w-5 h-5 md:w-6 md:h-6" />,
    },
  ];
  useEffect(() => {
    const timeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);

    return () => clearTimeout(timeout);
  }, [activeTab]);

  return (
    <>
      <div className="px-4 md:px-6 lg:px-8 pt-4 pb-8 flex flex-col gap-4 md:gap-6 bg-lightGreen">
        <div className="flex items-center gap-1">
          <span
            className="text-primary text-xs md:text-sm font-medium cursor-pointer"
            onClick={() =>
              navigate(
                `${
                  role === "Agent" || role === "Bankansvarlig"
                    ? "/bank-leads"
                    : "/agent-leads"
                }`
              )
            }
          >
            Leads sendt til banken
          </span>
          <ChevronRight className="h-4 w-4 text-[#5D6B98]" />
          <span className="text-[#5D6B98] text-xs md:text-sm">
            Detaljer om potensielle kunder
          </span>
        </div>
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
            <div className="text-darkBlack text-2xl md:text-[28px] desktop:text-[32px] font-medium">
              {bankData?.Kunden?.Kundeinformasjon[0]?.f_name}{" "}
              {bankData?.Kunden?.Kundeinformasjon[0]?.l_name}{" "}
              <span className="text-[#5D6B98] text-base md:text-lg desktop:text-xl whitespace-nowrap">
                <br className="sm:hidden" />({id})
              </span>
            </div>
            <div>
              {bankData?.status === "Sent" ||
              bankData?.status === "Ikke sendt" ? (
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
          <p className="text-[#5D6B98] text-sm md:text-base desktop:text-lg font-medium">
            {bankData?.plotHusmodell?.plot?.address}
          </p>
        </div>
      </div>
      <div className="relative">
        <div className="flex items-center justify-between gap-2 mb-6 px-4 md:px-6 lg:px-10 mt-4">
          <div
            className="flex gap-2.5 md:gap-4 rounded-lg bg-white p-[6px] overflow-auto"
            style={{
              boxShadow: "0px 1px 2px 0px #1018280F, 0px 1px 3px 0px #1018281A",
            }}
          >
            {tabData.map((tab, index) => (
              <button
                key={index}
                className={`${
                  id ? "cursor-pointer" : "cursor-auto"
                } flex items-center gap-1.5 md:gap-2 text-sm md:text-base text-darkBlack py-1.5 sm:py-2 px-2 md:px-3 rounded-lg ${
                  activeTab === index
                    ? "font-semibold bg-primary text-white"
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
        {activeTab === 1 && <Documenters getData={getData} />}
        {activeTab === 2 && (
          <Fremdriftsplan bankData={bankData} getData={getData} />
        )}
      </div>
    </>
  );
};
