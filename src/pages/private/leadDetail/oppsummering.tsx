import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";

export const Oppsummering: React.FC<{ bankData: any }> = ({ bankData }) => {
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

  return (
    <>
      <div
        className="mx-4 md:mx-6 lg:mx-10 rounded-lg mb-28"
        style={{
          boxShadow: "0px 1px 2px 0px #1018280F, 0px 1px 3px 0px #1018281A",
        }}
      >
        <div className="py-3 md:py-4 px-3 md:px-5 flex items-center gap-3 border-b border-[#E8E8E8]">
          <span className="text-sm md:text-base desktop:text-lg font-semibold">
            Oppsummering
          </span>
        </div>
        <div className="p-3 md:p-5">
          <div className="text-base desktop:text-lg text-black font-medium">
            Informasjon om kunden
          </div>
          <div className="py-3 md:py-5 grid grid-cols-1 desktop:grid-cols-2 gap-4 md:gap-6">
            {bankData &&
              bankData?.Kunden?.Kundeinformasjon.length &&
              bankData?.Kunden?.Kundeinformasjon.map(
                (item: any, index: number) => {
                  return (
                    <div className="flex flex-col gap-2" key={index}>
                      <div className="flex gap-2 md:gap-3 items-center">
                        <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                          Type
                        </div>
                        <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-all text-darkBlack text-sm md:text-base">
                          {item?.Kundetype}
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                          Navn:
                        </div>
                        <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-all text-darkBlack text-sm md:text-base">
                          {item?.f_name} {item?.l_name}
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                          Adresse:
                        </div>
                        <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-all text-darkBlack text-sm md:text-base">
                          {item?.Adresse}
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                          Mobil:
                        </div>
                        <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-all text-darkBlack text-sm md:text-base">
                          {item?.mobileNummer}
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                          E-post:
                        </div>
                        <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-all text-darkBlack text-sm md:text-base">
                          {item?.EPost}
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                          Fødselsdato:
                        </div>
                        <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-all text-darkBlack text-sm md:text-base">
                          {item?.dato}
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                          Personnummer:
                        </div>
                        <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-all text-darkBlack text-sm md:text-base">
                          {item?.Personnummer}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
          </div>
          <div className="border-t border-[#DCDFEA] mb-5"></div>
          <div className="text-base desktop:text-lg text-black font-medium">
            Informasjon om tomten
          </div>
          <div className="py-3 md:py-5">
            <div className="flex flex-col gap-2">
              <div className="flex gap-3 items-center">
                <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                  Adresse:
                </div>
                <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-all text-sm md:text-base">
                  {plotData?.address}
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                  Kunden eier tomten allerede:
                </div>
                <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-all text-sm md:text-base">
                  {plotData?.alreadyHavePlot
                    ? plotData?.alreadyHavePlot
                    : "Nei"}
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                  Totale tomtekostnader:
                </div>
                <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-all text-sm md:text-base">
                  kr {plotData?.tomtekostnader}
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                  Kommentar:
                </div>
                <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-all text-sm md:text-base">
                  {plotData?.Kommentar}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#DCDFEA] mb-3 md:mb-5"></div>
          <div className="text-base desktop:text-lg text-black font-medium">
            Informasjon om husmodellen
          </div>
          <div className="py-3 md:py-5">
            <div className="flex flex-col gap-2">
              <div className="flex gap-3 items-center">
                <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                  Husmodell
                </div>
                <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-all text-sm md:text-base">
                  {finalData?.Husdetaljer?.husmodell_name}
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                  Totale byggekostnader:
                </div>
                <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-all text-sm md:text-base">
                  kr {houseData?.byggekostnader}
                </div>
              </div>
              <div className="flex gap-3 items-center mb-3">
                <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                  Kommentar:
                </div>
                <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-all text-sm md:text-base">
                  {houseData?.Kommentar}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#DCDFEA] mb-3 md:mb-5"></div>
          <div className="text-base desktop:text-lg text-black font-medium">
            Informasjon om økonomisk plan
          </div>
          <div className="py-3 md:py-5">
            <div className="flex flex-col gap-2">
              <div className="flex gap-3 items-center">
                <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                  Lastet opp
                </div>
                <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-all text-sm md:text-base">
                  {bankData?.ProjectAccount?.Økonomisk ===
                  "Last opp en økonomisk plan"
                    ? "Ja"
                    : "Nei"}
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                  Operettet
                </div>
                <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-all text-sm md:text-base">
                  {bankData?.ProjectAccount?.Økonomisk ===
                  "Opprett en økonomisk plan"
                    ? "Ja"
                    : "Nei"}
                </div>
              </div>
              <div className="flex gap-3 items-center mb-3">
                <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                  Ettersendes
                </div>
                <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-all text-sm md:text-base">
                  {bankData?.ProjectAccount?.Økonomisk ===
                  "Ettersend en økonomisk plan"
                    ? "Ja"
                    : "Nei"}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#DCDFEA] mb-3 md:mb-5"></div>
          <div className="text-base desktop:text-lg text-black font-medium">
            Forhåndstakst
          </div>
          <div className="py-3 md:py-5">
            <div className="flex flex-col gap-2">
              <div className="flex gap-3 items-center">
                <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                  Ønskes forhåndstakst?
                </div>
                <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-all text-sm md:text-base">
                  {bankData?.Forhandstakst?.advance_quote ===
                  "Ja, jeg ønsker forhåndstakst"
                    ? "Ja (lead sendes til megler når du sendes inn banktipset)"
                    : bankData?.Forhandstakst?.advance_quote}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#F9F9FB] rounded-lg py-3 px-3 md:px-4 flex flex-col gap-2 sm:gap-3">
            <div className="flex gap-2 sm:gap-3 items-center">
              <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                Sum tomtekostnader
              </div>
              <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-alltext-sm md:text-base">
                kr {plotData?.tomtekostnader}{" "}
                <span className="text-[#5D6B98] text-sm md:text-base font-normal">
                  (prosjektregnskapet oversendes megler)
                </span>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 items-center">
              <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                Sum byggkostnader
              </div>
              <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-alltext-sm md:text-base">
                kr {houseData?.byggekostnader}{" "}
                <span className="text-[#5D6B98] text-sm md:text-base font-normal">
                  (prosjektregnskapet oversende banken)
                </span>
              </div>
            </div>
            <div className="border-t border-[#EAECF0] w-full"></div>
            <div className="flex gap-2 sm:gap-3 items-center">
              <div className="w-[130px] sm:w-[200px] md:w-[300px] text-[#5D6B98] font-medium text-base md:text-lg desktop:text-xl">
                Totale kostnader
              </div>
              <div className="w-[calc(100%-130px)] sm:w-[calc(100%-200px)] md:w-[calc(100%-300px)] break-alltext-base md:text-lg desktop:text-xl">
                kr {numberToNorwegian(sum)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
