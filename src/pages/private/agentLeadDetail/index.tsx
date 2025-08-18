/* eslint-disable react-hooks/exhaustive-deps */
import {
  Banknote,
  BookText,
  ChartPie,
  ChevronRight,
  FileText,
  ScrollText,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchBankLeadData } from "../../../lib/utils";
import { Oppsummering } from "./oppsummering";
import { Forhandstakst } from "./forhandstakst";
import { Fremdriftsplan } from "./Fremdriftsplan";
import { FremdriftsplanOg } from "./Fremdriftsplan-og";
import { Documenters } from "./document";

export const BankLeadsDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  const [loading, setLoading] = useState(true);
  const [bankData, setBankData] = useState<any>();

  const getData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await fetchBankLeadData(id);
      if (data) {
        setBankData(data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    getData();
  }, [getData]);

  const [activeTab, setActiveTab] = useState<any>(0);
  const tabData = [
    { label: "Summary", icon: <BookText className="w-5 h-5 md:w-6 md:h-6" /> },
    {
      label: "Forhåndstakst",
      icon: <Banknote className="w-5 h-5 md:w-6 md:h-6" />,
    },
    {
      label: "Fremdrifts- og faktureringsplan",
      icon: <ScrollText className="w-5 h-5 md:w-6 md:h-6" />,
    },
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

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const step = searchParams.get("step");
    if (step) {
      setActiveTab(Number(step));
      searchParams.delete("step");

      navigate(`${location.pathname}?${searchParams.toString()}`, {
        replace: true,
      });
    }
  }, []);
  return (
    <>
      <div className="px-4 md:px-6 lg:px-8 pt-4 pb-8 flex flex-col gap-4 md:gap-6 bg-lightGreen">
        <div className="flex items-center gap-1">
          <span
            className="text-primary text-xs md:text-sm font-medium cursor-pointer"
            onClick={() => navigate("/agent-leads")}
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
                className={`whitespace-nowrap ${
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

        {activeTab === 0 && (
          <Oppsummering bankData={bankData} loading={loading} />
        )}
        {activeTab === 1 && (
          <Forhandstakst
            bankData={bankData}
            setActiveTab={setActiveTab}
            getData={getData}
          />
        )}
        {activeTab === 2 && (
          <FremdriftsplanOg setActiveTab={setActiveTab} getData={getData} />
        )}
        {activeTab === 3 && (
          <Documenters setActiveTab={setActiveTab} getData={getData} />
        )}
        {activeTab === 4 && (
          <Fremdriftsplan
            bankData={bankData}
            loading={loading}
            getData={getData}
          />
        )}
      </div>
    </>
  );
};
