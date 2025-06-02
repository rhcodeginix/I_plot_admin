import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";

export const Oppsummering: React.FC<{ bankData: any; loading: any }> = ({
  bankData,
}) => {
  const [finalData, setFinalData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const husmodellDocRef = doc(
          db,
          "house_model",
          String(bankData?.plotHusmodell?.house?.housemodell)
        );
        const husmodellDocSnap = await getDoc(husmodellDocRef);

        if (husmodellDocSnap.exists()) {
          setFinalData(husmodellDocSnap.data());
        } else {
          console.error("No document found for husmodell ID.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (bankData?.plotHusmodell?.house?.housemodell) {
      fetchData();
    }
  }, [bankData]);
  const plotData = bankData?.plotHusmodell?.plot;
  const houseData = bankData?.plotHusmodell?.house;

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
  const okonomi = bankData?.ProjectAccount?.husmodellData;

  const Byggekostnader = okonomi?.Byggekostnader ?? [];
  const Tomtekost = okonomi?.Tomtekost ?? [];
  const parsePrice = (value: any): number => {
    if (!value) return 0;
    return parseFloat(
      String(value).replace(/\s/g, "").replace(/\./g, "").replace(",", ".")
    );
  };

  const totalPrisOfByggekostnader = [...Byggekostnader].reduce(
    (acc: number, prod: any, index: number) => {
      const value = index < Byggekostnader.length ? prod.pris : prod.pris;
      return acc + parsePrice(value);
    },
    0
  );

  const formattedNumberOfByggekostnader =
    totalPrisOfByggekostnader.toLocaleString("nb-NO");

  const totalPrisOfTomtekost = [...Tomtekost].reduce(
    (acc: number, prod: any, index: number) => {
      const value = index < Tomtekost.length ? prod.pris : prod.pris;
      return acc + parsePrice(value);
    },
    0
  );

  const formattedNumber = totalPrisOfTomtekost.toLocaleString("nb-NO");

  return (
    <div className="mb-28 mx-10">
      <div
        className="rounded-lg mb-6"
        style={{
          boxShadow: "0px 1px 2px 0px #1018280F, 0px 1px 3px 0px #1018281A",
        }}
      >
        <div className="py-4 px-5 flex items-center gap-3 border-b border-[#E8E8E8]">
          <span className="text-sm md:text-base desktop:text-lg font-semibold">
            Oppsummering
          </span>
        </div>
        <div className="p-5">
          <div className="text-sm md:text-base desktop:text-lg text-black font-medium">
            Informasjon om kunden
          </div>
          <div className="py-5 grid grid-cols-2 gap-6">
            {bankData &&
              bankData?.Kunden?.Kundeinformasjon.length &&
              bankData?.Kunden?.Kundeinformasjon.map(
                (item: any, index: number) => {
                  return (
                    <div className="flex flex-col gap-2" key={index}>
                      <div className="flex gap-3 items-center">
                        <div className="w-[300px] text-[#5D6B98]">Type</div>
                        <div className="w-[300px] text-darkBlack">
                          {item?.Kundetype}
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="w-[300px] text-[#5D6B98]">Navn:</div>
                        <div className="w-[300px] text-darkBlack">
                          {item?.f_name} {item?.l_name}
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="w-[300px] text-[#5D6B98]">Adresse:</div>
                        <div className="w-[300px] text-darkBlack">
                          {item?.Adresse}
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="w-[300px] text-[#5D6B98]">Mobil:</div>
                        <div className="w-[300px] text-darkBlack">
                          {item?.mobileNummer}
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="w-[300px] text-[#5D6B98]">E-post:</div>
                        <div className="w-[300px] text-darkBlack">
                          {item?.EPost}
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="w-[300px] text-[#5D6B98]">
                          Fødselsdato:
                        </div>
                        <div className="w-[300px] text-darkBlack">
                          {item?.dato}
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="w-[300px] text-[#5D6B98]">
                          Personnummer:
                        </div>
                        <div className="w-[300px] text-darkBlack">
                          {item?.Personnummer}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
          </div>
          <div className="border-t border-[#DCDFEA] mb-5"></div>
          <div className="text-sm md:text-base desktop:text-lg text-black font-medium">
            Informasjon om tomten
          </div>
          <div className="py-5">
            <div className="flex flex-col gap-2">
              <div className="flex gap-3 items-center">
                <div className="w-[300px] text-[#5D6B98]">Adresse:</div>
                <div className="text-darkBlack">{plotData?.address}</div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-[300px] text-[#5D6B98]">
                  Kunden eier tomten allerede:
                </div>
                <div className="text-darkBlack">
                  {plotData?.alreadyHavePlot
                    ? plotData?.alreadyHavePlot
                    : "Nei"}
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-[300px] text-[#5D6B98]">
                  Totale tomtekostnader:
                </div>
                <div className="text-darkBlack">
                  kr {plotData?.tomtekostnader}
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-[300px] text-[#5D6B98]">Kommentar:</div>
                <div className="text-darkBlack">{plotData?.Kommentar}</div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#DCDFEA] mb-5"></div>
          <div className="text-sm md:text-base desktop:text-lg text-black font-medium">
            Informasjon om husmodellen
          </div>
          <div className="py-5">
            <div className="flex flex-col gap-2">
              <div className="flex gap-3 items-center">
                <div className="w-[300px] text-[#5D6B98]">Husmodell</div>
                <div className="text-darkBlack">
                  {finalData?.Husdetaljer?.husmodell_name}
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-[300px] text-[#5D6B98]">
                  Totale byggekostnader:
                </div>
                <div className="text-darkBlack">
                  kr {houseData?.byggekostnader}
                </div>
              </div>
              <div className="flex gap-3 items-center mb-3">
                <div className="w-[300px] text-[#5D6B98]">Kommentar:</div>
                <div className="text-darkBlack">{houseData?.Kommentar}</div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#DCDFEA] mb-5"></div>
          <div className="text-sm md:text-base desktop:text-lg text-black font-medium">
            Informasjon om økonomisk plan
          </div>
          <div className="py-5">
            <div className="flex flex-col gap-2">
              <div className="flex gap-3 items-center">
                <div className="w-[300px] text-[#5D6B98]">Lastet opp</div>
                <div className="text-darkBlack">
                  {bankData?.ProjectAccount?.Økonomisk ===
                  "Last opp en økonomisk plan"
                    ? "Ja"
                    : "Nei"}
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-[300px] text-[#5D6B98]">Operettet</div>
                <div className="text-darkBlack">
                  {bankData?.ProjectAccount?.Økonomisk ===
                  "Opprett en økonomisk plan"
                    ? "Ja"
                    : "Nei"}
                </div>
              </div>
              <div className="flex gap-3 items-center mb-3">
                <div className="w-[300px] text-[#5D6B98]">Ettersendes</div>
                <div className="text-darkBlack">
                  {bankData?.ProjectAccount?.Økonomisk ===
                  "Ettersend en økonomisk plan"
                    ? "Ja"
                    : "Nei"}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#DCDFEA] mb-5"></div>
          <div className="text-sm md:text-base desktop:text-lg text-black font-medium">
            Forhåndstakst
          </div>
          <div className="py-5">
            <div className="flex flex-col gap-2">
              <div className="flex gap-3 items-center">
                <div className="w-[300px] text-[#5D6B98]">
                  Ønskes forhåndstakst?
                </div>
                <div className="text-darkBlack">
                  {bankData?.Forhandstakst?.advance_quote ===
                  "Ja, jeg ønsker forhåndstakst"
                    ? "Ja (lead sendes til megler når du sendes inn banktipset)"
                    : bankData?.Forhandstakst?.advance_quote}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#F9F9FB] rounded-lg py-3 px-4 flex flex-col gap-3">
            <div className="flex gap-3 items-center">
              <div className="w-[300px] text-[#5D6B98] text-base">
                Sum tomtekostnader
              </div>
              <div className="w-full text-darkBlack font-medium flex gap-4 items-center">
                kr {plotData?.tomtekostnader}
                <p className="text-[#5D6B98] text-base font-normal">
                  (prosjektregnskapet oversendes megler)
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-[300px] text-[#5D6B98] text-base">
                Sum byggkostnader
              </div>
              <div className="w-full text-darkBlack font-medium flex gap-4 items-center">
                kr {houseData?.byggekostnader}
                <p className="text-[#5D6B98] text-base font-normal">
                  (prosjektregnskapet oversende banken)
                </p>
              </div>
            </div>
            <div className="border-t border-[#EAECF0] w-full"></div>
            <div className="flex gap-3 items-center">
              <div className="w-[300px] text-[#5D6B98] font-medium text-xl">
                Totale kostnader
              </div>
              <div className="w-full text-darkBlack font-bold text-xl">
                kr {sum ? numberToNorwegian(sum) : 0}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-darkBlack mb-5 text-sm md:text-base desktop:text-lg font-semibold">
          Økonomisk plan
        </h4>
        <div className="flex gap-6">
          <div
            className="w-1/2 p-4 border border-gray2 rounded-lg h-max"
            style={{
              boxShadow:
                "0px 4px 6px -2px #10182808, 0px 12px 16px -4px #10182814",
            }}
          >
            <div className="text-center p-4 text-[#101828] font-medium text-sm md:text-base desktop:text-lg bg-[#F9F9FB] mb-5 relative">
              Byggekostnader
            </div>
            <div className="flex flex-col gap-5">
              {okonomi?.Byggekostnader?.length > 0 && (
                <div className="flex flex-col gap-5">
                  {okonomi?.Byggekostnader?.map((item: any, index: number) => {
                    return (
                      <div
                        className="flex items-center gap-2 justify-between"
                        key={index}
                      >
                        <div className="flex items-center gap-2">
                          <p className="text-gray text-sm font-medium">
                            {item?.Headline}
                          </p>
                        </div>

                        <h4 className="text-black font-medium text-base">
                          {item?.pris ? `kr ${item.pris}` : "inkl. i tilbud"}
                        </h4>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="border-t border-gray2"></div>
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-gray text-sm md:text-base desktop:text-lg font-bold">
                    Sum byggkostnader
                  </p>
                </div>
                <h4 className="text-black font-bold text-base">
                  kr {formattedNumberOfByggekostnader}
                </h4>
              </div>
            </div>
          </div>
          <div
            className="w-1/2 p-4 border border-gray2 rounded-lg h-max"
            style={{
              boxShadow:
                "0px 4px 6px -2px #10182808, 0px 12px 16px -4px #10182814",
            }}
          >
            <div className="text-center p-4 text-[#101828] font-medium text-sm md:text-base desktop:text-lg bg-[#F9F9FB] mb-5 relative">
              Tomkostnader
            </div>
            <div className="flex flex-col gap-5">
              {okonomi?.Tomtekost.length > 0 &&
                okonomi?.Tomtekost?.map((item: any, index: number) => {
                  return (
                    <div
                      className="flex items-center gap-2 justify-between"
                      key={index}
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-gray text-sm font-medium">
                          {item?.Headline}
                        </p>
                      </div>
                      <h4 className="text-black font-medium text-base">
                        {item?.pris ? `kr ${item.pris}` : "inkl. i tilbud"}
                      </h4>
                    </div>
                  );
                })}

              <div className="border-t border-gray2"></div>
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-gray text-sm md:text-base desktop:text-lg font-bold">
                    Sum tomtekostnader
                  </p>
                </div>
                <h4 className="text-black font-bold text-base">
                  kr {formattedNumber}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
