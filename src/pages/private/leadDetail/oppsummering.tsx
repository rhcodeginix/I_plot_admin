import React, { useEffect, useState } from "react";
import { UserRoundCheck } from "lucide-react";
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
        className="mx-10 rounded-lg mb-28"
        style={{
          boxShadow: "0px 1px 2px 0px #1018280F, 0px 1px 3px 0px #1018281A",
        }}
      >
        <div className="py-4 px-5 flex items-center gap-3 border-b border-[#E8E8E8]">
          <UserRoundCheck />
          <span className="text-lg font-semibold">Oppsummering</span>
        </div>
        <div className="bg-[#F6F4F2] py-3 px-5 text-sm font-semibold">
          Informasjon om <span className="font-extrabold">kunden:</span>
        </div>
        <div className="p-5 grid grid-cols-2 gap-6">
          {bankData &&
            bankData?.Kunden?.Kundeinformasjon.length &&
            bankData?.Kunden?.Kundeinformasjon.map(
              (item: any, index: number) => {
                return (
                  <div className="flex flex-col gap-2" key={index}>
                    <div className="flex gap-3 items-center">
                      <div className="w-[150px] text-[#00000099] font-semibold">
                        Type
                      </div>
                      <div className="w-[300px] text-[#000000] font-semibold">
                        {item?.Kundetype}
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="w-[150px] text-[#00000099] font-semibold">
                        Navn:
                      </div>
                      <div className="w-[300px] text-[#000000] font-semibold">
                        {item?.f_name} {item?.l_name}
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="w-[150px] text-[#00000099] font-semibold">
                        Adresse:
                      </div>
                      <div className="w-[300px] text-[#000000] font-semibold">
                        {item?.Adresse}
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="w-[150px] text-[#00000099] font-semibold">
                        Mobil:
                      </div>
                      <div className="w-[300px] text-[#000000] font-semibold">
                        {item?.mobileNummer}
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="w-[150px] text-[#00000099] font-semibold">
                        E-post:
                      </div>
                      <div className="w-[300px] text-[#000000] font-semibold">
                        {item?.EPost}
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="w-[150px] text-[#00000099] font-semibold">
                        Fødselsdato:
                      </div>
                      <div className="w-[300px] text-[#000000] font-semibold">
                        {item?.dato}
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="w-[150px] text-[#00000099] font-semibold">
                        Personnummer:
                      </div>
                      <div className="w-[300px] text-[#000000] font-semibold">
                        {item?.Personnummer}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
        </div>
        <div className="bg-[#F6F4F2] py-3 px-5 text-sm font-semibold">
          Informasjon om <span className="font-extrabold">tomten:</span>
        </div>
        <div className="p-5">
          <div className="flex flex-col gap-2">
            <div className="flex gap-3 items-center">
              <div className="w-[300px] text-[#00000099] font-semibold">
                Adresse:
              </div>
              <div className="w-full text-[#000000] font-semibold">
                {plotData?.address}
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-[300px] text-[#00000099] font-semibold">
                Kunden eier tomten allerede:
              </div>
              <div className="w-full text-[#000000] font-semibold">
                {plotData?.alreadyHavePlot ? plotData?.alreadyHavePlot : "Nei"}
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-[300px] text-[#00000099] font-semibold">
                Totale tomtekostnader:
              </div>
              <div className="w-full text-[#000000] font-semibold">
                {plotData?.tomtekostnader} NOK
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-[300px] text-[#00000099] font-semibold">
                Kommentar:
              </div>
              <div className="w-full text-[#000000] font-semibold">
                {plotData?.Kommentar}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#F6F4F2] py-3 px-5 text-sm font-semibold">
          Informasjon om <span className="font-extrabold">husmodellen:</span>
        </div>
        <div className="p-5">
          <div className="flex flex-col gap-2">
            <div className="flex gap-3 items-center">
              <div className="w-[300px] text-[#00000099] font-semibold">
                Husmodell
              </div>
              <div className="w-full text-[#000000] font-semibold">
                {finalData?.Husdetaljer?.husmodell_name}
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-[300px] text-[#00000099] font-semibold">
                Totale byggekostnader:
              </div>
              <div className="w-full text-[#000000] font-semibold">
                {houseData?.byggekostnader} NOK
              </div>
            </div>
            <div className="flex gap-3 items-center mb-3">
              <div className="w-[300px] text-[#00000099] font-semibold">
                Kommentar:
              </div>
              <div className="w-full text-[#000000] font-semibold">
                {houseData?.Kommentar}
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-[300px] text-[#000000] font-semibold text-lg">
                Sum tomtekostnader
              </div>
              <div className="w-full text-[#000000] font-semibold text-lg flex gap-[60px] items-center">
                {plotData?.tomtekostnader} NOK
                <p className="text-[#00000099] text-base">
                  (prosjektregnskapet oversende banken)
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-[300px] text-[#000000] font-semibold text-lg">
                Sum byggkostnader
              </div>
              <div className="w-full text-[#000000] font-semibold text-lg flex gap-[60px] items-center">
                {houseData?.byggekostnader} NOK
                <p className="text-[#00000099] text-base">
                  (prosjektregnskapet oversende banken)
                </p>
              </div>
            </div>
            <div className="border-t border-[#EAECF0] w-full"></div>
            <div className="flex gap-3 items-center">
              <div className="w-[300px] text-[#000000] font-semibold text-xl">
                Totale kostnader
              </div>
              <div className="w-full text-[#000000] font-semibold text-xl flex gap-[60px] items-center">
                {numberToNorwegian(sum)} NOK
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
