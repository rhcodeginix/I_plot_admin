import { useCallback, useEffect, useRef, useState } from "react";
import { Kunden } from "./kunden";
import {
  Banknote,
  ChevronRight,
  FileText,
  ScrollText,
  User,
} from "lucide-react";
import { PlotHusmodell } from "./plotHusmodell";
import { ProjectAccounting } from "./projectAccounting";
import { Oppsummering } from "./oppsummering";
import { useLocation } from "react-router-dom";
import { fetchBankLeadData } from "../../../lib/utils";
import { Forhandstakst } from "./forhandstakst";

export const AgentleadsTabs = () => {
  const [activeTab, setActiveTab] = useState<any>(0);
  const tabData = [
    { label: "Kunden", icon: <User className="w-4 h-4 md:w-6 md:h-6" /> },
    {
      label: "Tomt og husmodell",
      icon: <Banknote className="w-4 h-4 md:w-6 md:h-6" />,
    },
    {
      label: "Prosjektregnskap",
      icon: <ScrollText className="w-4 h-4 md:w-6 md:h-6" />,
    },
    {
      label: "Forhåndstakst",
      icon: <FileText className="w-4 h-4 md:w-6 md:h-6" />,
    },
    {
      label: "Oppsummering",
      icon: <FileText className="w-4 h-4 md:w-6 md:h-6" />,
    },
  ];
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
  const plotData = bankData?.plotHusmodell?.plot;
  const houseData = bankData?.plotHusmodell?.house;

  const kundenRef = useRef<any>(null);
  const plotHusmodellRef = useRef<any>(null);
  const projectAccountingRef = useRef<any>(null);
  const ForhandstakstRef = useRef<any>(null);
  const FremdriftsplanRef = useRef<any>(null);

  const validateBeforeTabChange = async (targetTabIndex: number) => {
    if (activeTab === 0 && kundenRef.current) {
      const isValid = await kundenRef.current.validateForm();
      if (!isValid) return;
    }
    if (activeTab === 1 && plotHusmodellRef.current) {
      const isValid = await plotHusmodellRef.current.validateForm();
      if (!isValid) return;
    }
    if (activeTab === 2 && projectAccountingRef.current) {
      const isValid = await projectAccountingRef.current.validateForm();
      if (!isValid) return;
    }
    if (activeTab === 3 && ForhandstakstRef.current) {
      const isValid = await ForhandstakstRef.current.validateForm();
      if (!isValid) return;
    }
    if (activeTab === 4 && FremdriftsplanRef.current) {
      const isValid = await FremdriftsplanRef.current.validateForm();
      if (!isValid) return;
    }

    setActiveTab(targetTabIndex);
  };

  function norwegianToNumber(str: any) {
    if (typeof str !== "string") return 0;
    return Number(str.replace(/\s/g, ""));
  }

  const sum =
    norwegianToNumber(plotData?.tomtekostnader) +
    norwegianToNumber(houseData?.byggekostnader);

  function numberToNorwegian(num: any) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  return (
    <>
      <div>
        {activeTab === 0 && (
          <div className="px-4 md:px-8 pt-4 pb-8 flex flex-col gap-6 bg-[#F5F3FF]">
            <div>
              <h3 className="text-[#111322] font-bold text-lg md:text-xl desktop:text-2xl mb-2">
                Registrer lead til bank
              </h3>
              <p className="text-[#4D4D4D] text-sm">
                Her registrer du informasjon om kunden. Jo mer informasjon, jo
                bedre kan banken forberede seg{" "}
                <br className="hidden lg:block" /> før de tar kontakt med
                kunden.
              </p>
            </div>
          </div>
        )}
        {activeTab === 1 && (
          <div className="px-4 md:px-8 pt-4 pb-8 flex flex-col gap-6 bg-[#F5F3FF]">
            <div className="flex items-center gap-1 flex-wrap">
              <span
                className="text-[#7839EE] text-xs md:text-sm font-medium cursor-pointer"
                onClick={() => setActiveTab(0)}
              >
                Kunderegistrering
              </span>
              <ChevronRight className="h-4 w-4 text-[#5D6B98]" />
              <span className="text-[#5D6B98] text-xs md:text-sm">Tomt og husmodell</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h3 className="text-[#111322] font-bold text-lg md:text-xl desktop:text-2xl mb-2">
                  Registrer lead til bank
                </h3>
                <p className="text-[#4D4D4D] text-xs md:text-sm">
                  Her registrer du informasjon om kunden. Jo mer informasjon, jo
                  bedre kan banken forberede seg{" "}
                  <br className="hidden lg:block" /> før de tar kontakt med
                  kunden.
                </p>
              </div>
              <div>
                <p className="text-[#5D6B98] mb-2 text-sm">Tilbudspris</p>
                <h3 className="text-darkBlack font-semibold text-base md:text-lg desktop:text-xl whitespace-nowrap">
                  kr {sum ? numberToNorwegian(sum) : 0}
                </h3>
                <p className="text-sm text-gray">inkl. tomtepris</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 2 && (
          <div className="px-4 md:px-8 pt-4 pb-8 flex flex-col gap-6 bg-[#F5F3FF]">
            <div className="flex items-center gap-1 flex-wrap">
              <span
                className="text-[#7839EE] text-xs md:text-sm font-medium cursor-pointer"
                onClick={() => setActiveTab(0)}
              >
                Kunderegistrering
              </span>
              <ChevronRight className="h-4 w-4 text-[#5D6B98]" />
              <span
                className="text-[#7839EE] text-xs md:text-sm font-medium cursor-pointer"
                onClick={() => setActiveTab(1)}
              >
                Tomt og husmodell
              </span>
              <ChevronRight className="h-4 w-4 text-[#5D6B98]" />
              <span className="text-[#5D6B98] text-xs md:text-sm">Prosjektregnskap</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h3 className="text-[#111322] font-bold text-lg md:text-xl desktop:text-2xl mb-2">
                  Registrer lead til bank
                </h3>
                <p className="text-[#4D4D4D] text-xs md:text-sm">
                  Her registrer du informasjon om kunden. Jo mer informasjon, jo
                  bedre kan banken forberede seg{" "}
                  <br className="hidden lg:block" /> før de tar kontakt med
                  kunden.
                </p>
              </div>
              <div>
                <p className="text-[#5D6B98] mb-2 text-sm">Tilbudspris</p>
                <h3 className="text-darkBlack font-semibold text-base md:text-lg desktop:text-xl whitespace-nowrap">
                  kr {sum ? numberToNorwegian(sum) : 0}
                </h3>
                <p className="text-xs md:text-sm text-gray">inkl. tomtepris</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 3 && (
          <div className="px-4 md:px-8 pt-4 pb-8 flex flex-col gap-6 bg-[#F5F3FF]">
            <div className="flex items-center gap-1 flex-wrap">
              <span
                className="text-[#7839EE] text-xs md:text-sm font-medium cursor-pointer"
                onClick={() => setActiveTab(0)}
              >
                Kunderegistrering
              </span>
              <ChevronRight className="h-4 w-4 text-[#5D6B98]" />
              <span
                className="text-[#7839EE] text-xs md:text-sm font-medium cursor-pointer"
                onClick={() => setActiveTab(1)}
              >
                Tomt og husmodell
              </span>
              <ChevronRight className="h-4 w-4 text-[#5D6B98]" />
              <span
                className="text-[#7839EE] text-xs md:text-sm font-medium cursor-pointer"
                onClick={() => setActiveTab(2)}
              >
                Prosjektregnskap
              </span>
              <ChevronRight className="h-4 w-4 text-[#5D6B98]" />
              <span className="text-[#5D6B98] text-xs md:text-sm">Forhåndstakst</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h3 className="text-[#111322] font-bold text-lg md:text-xl desktop:text-2xl mb-2">
                  Registrer lead til bank
                </h3>
                <p className="text-[#4D4D4D] text-xs md:text-sm">
                  Her registrer du informasjon om kunden. Jo mer informasjon, jo
                  bedre kan banken forberede seg{" "}
                  <br className="hidden lg:block" /> før de tar kontakt med
                  kunden.
                </p>
              </div>
              <div>
                <p className="text-[#5D6B98] mb-2 text-xs md:text-sm">Tilbudspris</p>
                <h3 className="text-darkBlack font-semibold text-base md:text-lg desktop:text-xl whitespace-nowrap">
                  kr {sum ? numberToNorwegian(sum) : 0}
                </h3>
                <p className="text-xs md:text-sm text-gray">inkl. tomtepris</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 4 && (
          <div className="px-4 md:px-8 pt-4 pb-8 flex flex-col gap-6 bg-[#F5F3FF]">
            <div className="flex items-center gap-1 flex-wrap">
              <span
                className="text-[#7839EE] text-xs md:text-sm font-medium cursor-pointer"
                onClick={() => setActiveTab(0)}
              >
                Kunderegistrering
              </span>
              <ChevronRight className="h-4 w-4 text-[#5D6B98]" />
              <span
                className="text-[#7839EE] text-xs md:text-sm font-medium cursor-pointer"
                onClick={() => setActiveTab(1)}
              >
                Tomt og husmodell
              </span>
              <ChevronRight className="h-4 w-4 text-[#5D6B98]" />
              <span
                className="text-[#7839EE] text-xs md:text-sm font-medium cursor-pointer"
                onClick={() => setActiveTab(2)}
              >
                Prosjektregnskap
              </span>
              <ChevronRight className="h-4 w-4 text-[#5D6B98]" />
              <span
                className="text-[#7839EE] text-xs md:text-sm font-medium cursor-pointer"
                onClick={() => setActiveTab(3)}
              >
                Forhåndstakst
              </span>
              <ChevronRight className="h-4 w-4 text-[#5D6B98]" />
              <span className="text-[#5D6B98] text-xs md:text-sm">Oppsummering</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h3 className="text-[#111322] font-bold text-lg md:text-xl desktop:text-2xl mb-2">
                  Registrer lead til bank
                </h3>
                <p className="text-[#4D4D4D] text-xs md:text-sm">
                  Her registrer du informasjon om kunden. Jo mer informasjon, jo
                  bedre kan banken forberede seg{" "}
                  <br className="hidden lg:block" /> før de tar kontakt med
                  kunden.
                </p>
              </div>
              <div>
                <p className="text-[#5D6B98] mb-2 text-xs md:text-sm">Tilbudspris</p>
                <h3 className="text-darkBlack font-semibold text-base md:text-lg desktop:text-xl whitespace-nowrap">
                  kr {sum ? numberToNorwegian(sum) : 0}
                </h3>
                <p className="text-xs md:text-sm text-gray">inkl. tomtepris</p>
              </div>
            </div>
          </div>
        )}
        <div className="relative">
          <div className="flex items-center justify-between gap-2 mb-6 px-4 py-1 md:px-8 lg:px-10 mt-4">
            <div
              className="flex gap-2 md:gap-3 lg:gap-4 rounded-lg bg-white p-1 md:p-1.2 overflow-auto"
              style={{
                boxShadow:
                  "0px 1px 2px 0px #1018280F, 0px 1px 3px 0px #1018281A",
              }}
            >
              {tabData.map((tab, index) => (
                <button
                  key={index}
                  className={`text-sm md:text-base whitespace-nowrap ${
                    id ? "cursor-pointer" : "cursor-auto"
                  } flex items-center gap-2 text-darkBlack py-2 px-2 md:px-3 rounded-lg ${
                    activeTab === index
                      ? "font-semibold bg-[#7839EE] text-white"
                      : "text-[#4D4D4D]"
                  }`}
                  onClick={() => {
                    if (id) {
                      validateBeforeTabChange(index);
                    }
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 0 && (
            <Kunden ref={kundenRef} setActiveTab={setActiveTab} />
          )}
          {activeTab === 1 && (
            <PlotHusmodell ref={plotHusmodellRef} setActiveTab={setActiveTab} />
          )}
          {activeTab === 2 && (
            <ProjectAccounting
              ref={projectAccountingRef}
              setActiveTab={setActiveTab}
              getData={getData}
            />
          )}
          {activeTab === 3 && (
            <Forhandstakst setActiveTab={setActiveTab} ref={ForhandstakstRef} />
          )}
          {activeTab === 4 && <Oppsummering setActiveTab={setActiveTab} />}
          {/* {activeTab === 5 && (
            <Fremdriftsplan
              setActiveTab={setActiveTab}
              ref={FremdriftsplanRef}
            />
          )} */}
        </div>
      </div>
    </>
  );
};
