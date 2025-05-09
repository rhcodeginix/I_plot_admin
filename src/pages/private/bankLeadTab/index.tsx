import { useEffect, useState } from "react";
import { Kunden } from "./kunden";
import { Banknote, ChevronRight, ScrollText, User } from "lucide-react";
import { PlotHusmodell } from "./plotHusmodell";
import { ProjectAccounting } from "./projectAccounting";
import { Oppsummering } from "./oppsummering";
import { useLocation } from "react-router-dom";
import { fetchBankLeadData } from "../../../lib/utils";

export const BankleadsTabs = () => {
  const [activeTab, setActiveTab] = useState<any>(0);
  const tabData = [
    { label: "Kunden", icon: <User /> },
    { label: "Tomt og husmodell", icon: <Banknote /> },
    { label: "Prosjektregnskap", icon: <ScrollText /> },
    { label: "Oppsummering", icon: <Banknote /> },
  ];
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  const [bankData, setBankData] = useState<any>();

  useEffect(() => {
    if (!id) {
      return;
    }

    const getData = async () => {
      const data = await fetchBankLeadData(id);
      setBankData(data);
    };

    getData();
  }, [id]);
  const projectAccount = bankData?.ProjectAccount?.husmodellData;

  const parsePrice = (value: any): number => {
    if (!value) return 0;
    return parseFloat(
      String(value).replace(/\s/g, "").replace(/\./g, "").replace(",", ".")
    );
  };
  const Byggekostnader = projectAccount?.Byggekostnader ?? [];
  const Tomtekost = projectAccount?.Tomtekost ?? [];

  const totalPrisOfByggekostnader = [...Byggekostnader].reduce(
    (acc: number, prod: any, index: number) => {
      const value = prod?.pris;
      return acc + parsePrice(value);
    },
    0
  );

  const totalPrisOfTomtekost = [...Tomtekost].reduce(
    (acc: number, prod: any, index: number) => {
      const value = prod.pris;
      return acc + parsePrice(value);
    },
    0
  );

  const grandTotal = totalPrisOfTomtekost + totalPrisOfByggekostnader;
  const formattedGrandTotal = grandTotal.toLocaleString("nb-NO");
  return (
    <>
      <div>
        {activeTab === 0 && (
          <div className="px-8 pt-4 pb-8 flex flex-col gap-6 bg-[#F5F3FF]">
            <div>
              <h3 className="text-[#111322] font-bold text-2xl mb-2">
                Registrer lead til bank
              </h3>
              <p className="text-[#4D4D4D] text-sm">
                Her registrer du informasjon om kunden. Jo mer informasjon, jo
                bedre kan banken forberede seg <br /> før de tar kontakt med
                kunden.
              </p>
            </div>
          </div>
        )}
        {activeTab === 1 && (
          <div className="px-8 pt-4 pb-8 flex flex-col gap-6 bg-[#F5F3FF]">
            <div className="flex items-center gap-1">
              <span
                className="text-[#7839EE] text-sm font-medium cursor-pointer"
                onClick={() => setActiveTab(0)}
              >
                Kunderegistrering
              </span>
              <ChevronRight className="h-4 w-4 text-[#5D6B98]" />
              <span className="text-[#5D6B98] text-sm">Tomt og husmodell</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-[#111322] font-bold text-2xl mb-2">
                  Registrer lead til bank
                </h3>
                <p className="text-[#4D4D4D] text-sm">
                  Her registrer du informasjon om kunden. Jo mer informasjon, jo
                  bedre kan banken forberede seg <br /> før de tar kontakt med
                  kunden.
                </p>
              </div>
              <div>
                <p className="text-[#5D6B98] mb-2 text-sm">Tilbudspris</p>
                <h3 className="text-darkBlack font-semibold text-xl">
                  {formattedGrandTotal ? formattedGrandTotal : 0} NOK
                </h3>
                <p className="text-sm text-gray">inkl. tomtepris</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 2 && (
          <div className="px-8 pt-4 pb-8 flex flex-col gap-6 bg-[#F5F3FF]">
            <div className="flex items-center gap-1">
              <span
                className="text-[#7839EE] text-sm font-medium cursor-pointer"
                onClick={() => setActiveTab(0)}
              >
                Kunderegistrering
              </span>
              <ChevronRight className="h-4 w-4 text-[#5D6B98]" />
              <span
                className="text-[#7839EE] text-sm font-medium cursor-pointer"
                onClick={() => setActiveTab(1)}
              >
                Tomt og husmodell
              </span>
              <ChevronRight className="h-4 w-4 text-[#5D6B98]" />
              <span className="text-[#5D6B98] text-sm">Prosjektregnskap</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-[#111322] font-bold text-2xl mb-2">
                  Registrer lead til bank
                </h3>
                <p className="text-[#4D4D4D] text-sm">
                  Her registrer du informasjon om kunden. Jo mer informasjon, jo
                  bedre kan banken forberede seg <br /> før de tar kontakt med
                  kunden.
                </p>
              </div>
              <div>
                <p className="text-[#5D6B98] mb-2 text-sm">Tilbudspris</p>
                <h3 className="text-darkBlack font-semibold text-xl">
                  {formattedGrandTotal ? formattedGrandTotal : 0} NOK
                </h3>
                <p className="text-sm text-gray">inkl. tomtepris</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 3 && (
          <div className="px-8 pt-4 pb-8 flex flex-col gap-6 bg-[#F5F3FF]">
            <div className="flex items-center gap-1">
              <span
                className="text-[#7839EE] text-sm font-medium cursor-pointer"
                onClick={() => setActiveTab(0)}
              >
                Kunderegistrering
              </span>
              <ChevronRight className="h-4 w-4 text-[#5D6B98]" />
              <span
                className="text-[#7839EE] text-sm font-medium cursor-pointer"
                onClick={() => setActiveTab(1)}
              >
                Tomt og husmodell
              </span>
              <ChevronRight className="h-4 w-4 text-[#5D6B98]" />
              <span
                className="text-[#7839EE] text-sm font-medium cursor-pointer"
                onClick={() => setActiveTab(2)}
              >
                Prosjektregnskap
              </span>
              <ChevronRight className="h-4 w-4 text-[#5D6B98]" />
              <span className="text-[#5D6B98] text-sm">Oppsummering</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-[#111322] font-bold text-2xl mb-2">
                  Registrer lead til bank
                </h3>
                <p className="text-[#4D4D4D] text-sm">
                  Her registrer du informasjon om kunden. Jo mer informasjon, jo
                  bedre kan banken forberede seg <br /> før de tar kontakt med
                  kunden.
                </p>
              </div>
              <div>
                <p className="text-[#5D6B98] mb-2 text-sm">Tilbudspris</p>
                <h3 className="text-darkBlack font-semibold text-xl">
                  {formattedGrandTotal ? formattedGrandTotal : 0} NOK
                </h3>
                <p className="text-sm text-gray">inkl. tomtepris</p>
              </div>
            </div>
          </div>
        )}
        <div className="relative">
          <div className="flex items-center justify-between gap-2 mb-6 px-10 mt-4">
            <div
              className="flex gap-4 rounded-lg bg-white p-[6px]"
              style={{
                boxShadow:
                  "0px 1px 2px 0px #1018280F, 0px 1px 3px 0px #1018281A",
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
                  onClick={() => {
                    if (id) {
                      setActiveTab(index);
                    }
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          {activeTab === 0 && <Kunden setActiveTab={setActiveTab} />}
          {activeTab === 1 && <PlotHusmodell setActiveTab={setActiveTab} />}
          {activeTab === 2 && <ProjectAccounting setActiveTab={setActiveTab} />}
          {activeTab === 3 && <Oppsummering setActiveTab={setActiveTab} />}
        </div>
      </div>
    </>
  );
};
