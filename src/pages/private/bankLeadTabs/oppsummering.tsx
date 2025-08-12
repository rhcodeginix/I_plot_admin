import React, { useEffect, useState } from "react";
import Button from "../../../components/common/button";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchAdminDataByEmail, fetchBankLeadData } from "../../../lib/utils";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { toast } from "react-hot-toast";
import Modal from "../../../components/common/modal";

export const Oppsummering: React.FC<{
  setActiveTab: any;
}> = ({ setActiveTab }) => {
  const location = useLocation();
  const navigate = useNavigate();
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

  const [Role, setRole] = useState<any>(null);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();

      if (data) {
        if (data?.role) {
          setRole(data?.role);
        }
      }
    };

    getData();
  }, []);

  const sendWelcomeEmail = async () => {
    try {
      const response = await fetch(
        "https://nh989m12uk.execute-api.eu-north-1.amazonaws.com/prod/banklead",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "send-welcome",
            email: "rudraksh.shukla98@gmail.com",
            fields: {
              FNAME: bankData?.Kunden?.Kundeinformasjon[0]?.f_name,
              LNAME: bankData?.Kunden?.Kundeinformasjon[0]?.l_name,
              phone: bankData?.Kunden?.Kundeinformasjon[0]?.mobileNummer,
              email: bankData?.Kunden?.Kundeinformasjon[0]?.EPost,
              dealer: "BoligPartner",
              office: bankData?.Kunden?.Kundeinformasjon[0]?.office,
              projectAddress: bankData?.plotHusmodell?.plot?.address,
              landCost: `kr ${plotData?.tomtekostnader}`,
              buildingCost: `kr ${houseData?.byggekostnader}`,
              totalCost: `kr ${numberToNorwegian(sum)}`,
              link: `https://admin.mintomt.no/bank-leads-detail/${id}`,
            },
          }),
        }
      );

      const result = await response.json();
      toast.success(result.message, {
        position: "top-right",
      });
      navigate("/bank-leads");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const [isPopup, setIsPopup] = useState(false);
  const handleConfirmPopup = () => {
    if (isPopup) {
      setIsPopup(false);
    } else {
      setIsPopup(true);
    }
  };

  return (
    <>
      <div
        className="mx-4 md:mx-8 lg:mx-10 rounded-lg mb-28"
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
      <div className="flex justify-end w-full gap-5 items-center fixed bottom-0 bg-white z-50 border-t border-gray2 p-4 left-0">
        <div onClick={() => setActiveTab(3)}>
          <Button
            text="Tilbake"
            className="border border-gray2 text-black text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
          />
        </div>
        <Button
          text="Send til bank"
          className="border border-purple bg-purple text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
          onClick={() => {
            if (Role === "Admin" || Role === "super-admin") {
              handleConfirmPopup();
            } else {
              sendWelcomeEmail();
            }
          }}
        />
      </div>

      {isPopup && (
        <Modal onClose={handleConfirmPopup} isOpen={true}>
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-lg font-semibold mb-4">
                Er du sikker på at du vil sende denne e-posten til banken?
              </p>

              <div className="flex justify-center mt-5 w-full gap-5 items-center">
                <div
                  onClick={() => {
                    setIsPopup(false);
                    navigate("/bank-leads");
                  }}
                >
                  <Button
                    text="Avbryt"
                    className="border border-gray2 text-black text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                  />
                </div>
                <div
                  onClick={() => {
                    sendWelcomeEmail();
                    setIsPopup(false);
                  }}
                >
                  <Button
                    text="Bekrefte"
                    className="border border-purple bg-purple text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
