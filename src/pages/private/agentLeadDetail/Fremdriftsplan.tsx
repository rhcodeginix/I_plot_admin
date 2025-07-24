/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import Stepper from "../../../components/ui/stepper";
import { ChevronDown, Pencil } from "lucide-react";
import Img_pdf from "../../../assets/images/Img_pdf.png";
import Modal from "../../../components/common/modal";
import { AddComment } from "./addComment";
import { isValid, addDays, differenceInCalendarDays } from "date-fns";

function formatPrice(inputStr: any) {
  let noSuffix = inputStr.replace(" NOK", "");
  let withDots = noSuffix.replace(/\s+/g, " ");
  return "kr " + withDots;
}

export const Fremdriftsplan: React.FC<{
  bankData: any;
  loading: any;
  getData: any;
}> = ({ bankData, getData }) => {
  const [currIndex, setCurrIndex] = useState<number>(0);

  const order = [
    "Byggekontrakt",
    "Grunnarbeider",
    "Betongarbeid",
    "LeveringByggesett",
    "TettBygg",
    "FerdigUte",
    "FerdigInne",
    "Forhåndsbefaring",
    "Overtakelse",
  ];

  const steps = bankData?.Fremdriftsplan
    ? Object.entries(bankData?.Fremdriftsplan)
        .filter(([key]) => key !== "id")
        .map(([key, value]: any) => ({
          name: key,
          ...value,
        }))
        .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
    : [];

  useEffect(() => {
    if (steps && steps.length > 0) {
      const lastTruthyIndex = steps.reduce((lastIndex, item, idx) => {
        return item.comment ? idx : lastIndex;
      }, -1);

      if (lastTruthyIndex !== -1) {
        setCurrIndex(lastTruthyIndex + 1);
      }
    }
  }, [steps]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [SelectIndex, setSelectIndex] = useState(null);
  const handleConfirmPopup = () => {
    if (isModalOpen) {
      setIsModalOpen(false);
    } else {
      setIsModalOpen(true);
    }
  };

  const [openStepIndex, setOpenStepIndex] = useState<number | null>(null);
  const toggleAccordion = (index: number) => {
    setOpenStepIndex((prev) => (prev === index ? null : index));
  };

  return (
    <>
      <div className="mx-4 md:mx-6 lg:mx-10 rounded-lg mb-20">
        <h3 className="text-darkBlack text-base md:text-lg lg:text-xl font-semibold mb-2">
          Fremdrifts- og faktureringsplan
        </h3>
        <p className="text-darkBlack text-xs md:text-sm font-medium mb-6">
          Her oppdaterer du status på fremdriften slik at banken får oppdatert
          informasjon om fremdriften.{" "}
        </p>
        {steps && steps.length > 0 && (
          <div className="mb-6">
            <Stepper steps={steps} currIndex={currIndex} Style="true" />
          </div>
        )}
        <div className="flex flex-col gap-4 md:gap-6">
          {steps &&
            steps.map((step: any, index: number) => {
              let diffText = "";

              if (step?.comment?.full_fort_date) {
                const baseDate = new Date(step.date);
                const fullFortDate = new Date(step.comment.full_fort_date);

                const expectedDate = addDays(baseDate, Number(step.day) || 0);

                if (isValid(expectedDate) && isValid(fullFortDate)) {
                  const dayDifference = differenceInCalendarDays(
                    fullFortDate,
                    expectedDate
                  );
                  diffText = `(${
                    dayDifference >= 0 ? "+" : ""
                  }${dayDifference} dager)`;
                }
              }

              return (
                <div
                  key={index}
                  className={`py-3 px-4 bg-[#FFFFFF14] rounded-lg border flex flex-col gap-4 ${
                    step.status === "Approve"
                      ? "border-[#61C4A4]"
                      : step.status === "Unpaid" || step.status === "Reject"
                      ? "border-[#FFAFAF]"
                      : step.status === "Sent" && "border-[#FFB795]"
                  }`}
                >
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center gap-2 justify-between ${
                      currIndex > index && "cursor-pointer"
                    } `}
                    onClick={() => {
                      if (currIndex > index) toggleAccordion(index);
                    }}
                  >
                    <h4 className="text-darkBlack font-medium text-sm md:text-base desktop:text-lg">
                      Step {index + 1}:{" "}
                      <span className="font-bold">{step.name}</span>
                    </h4>
                    {currIndex > index ? (
                      <div className="flex items-center gap-2 md:gap-4 justify-end">
                        {step.status === "Approve" ? (
                          <div className="bg-[#E0FFF5] rounded-[16px] py-0.5 px-1 sm:px-2 text-[10px] sm:text-xs text-[#00857A]">
                            Betalt {formatPrice(step.pris)} (
                            {step.date.split("-").reverse().join(".")})
                          </div>
                        ) : step.status === "Reject" ? (
                          <div className="bg-[#FFE0E0] rounded-[16px] py-0.5 px-1 sm:px-2 text-[10px] sm:text-xs text-[#A20000]">
                            Avvis
                          </div>
                        ) : (
                          step.status === "Sent" && (
                            <div className="bg-[#FFEAE0] rounded-[16px] py-0.5 px-1 sm:px-2 text-[10px] sm:text-xs text-[#C84D00]">
                              Send Information
                            </div>
                          )
                        )}

                        <ChevronDown
                          className={`text-primary transition-transform duration-200 ${
                            openStepIndex === index ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    ) : currIndex === index ? (
                      <div className="flex items-center gap-2 md:gap-4 justify-end">
                        <span
                          className="text-primary text-sm font-semibold cursor-pointer"
                          onClick={() => {
                            setIsModalOpen(true);
                            setSelectIndex(step.name);
                          }}
                        >
                          Fullfør steget
                        </span>
                        <div className="bg-[#FFE0E0] rounded-[16px] py-0.5 px-1 sm:px-2 text-[10px] sm:text-xs text-[#A20000]">
                          Ubetalt
                        </div>
                      </div>
                    ) : (
                      currIndex < index && (
                        <div className="bg-[#FFE0E0] rounded-[16px] py-0.5 px-1 sm:px-2 text-[10px] sm:text-xs text-[#A20000] w-max ml-auto">
                          Ubetalt
                        </div>
                      )
                    )}
                  </div>
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-2 ${
                      step?.comment ? "lg:grid-cols-4" : "lg:grid-cols-3"
                    } gap-2 md:gap-3 desktop:gap-4`}
                  >
                    <div className="w-full flex flex-col gap-2">
                      <p className="text-[#5D6B98] text-xs md:text-sm">
                        Forventet oppstart
                      </p>
                      <h6 className="text-darkBlack font-medium text-sm md:text-base">
                        {step.date.split("-").reverse().join(".")}
                      </h6>
                    </div>
                    {step?.comment && (
                      <div className="w-full flex flex-col gap-2">
                        <p className="text-[#5D6B98] text-xs md:text-sm">
                          Fullført
                        </p>
                        <h6 className="text-darkBlack font-medium text-sm md:text-base">
                          {step.comment.full_fort_date
                            .split("-")
                            .reverse()
                            .join(".")}{" "}
                          <span className="text-[#30374F99]">{diffText}</span>
                        </h6>
                      </div>
                    )}
                    <div className="w-full flex flex-col gap-2">
                      <p className="text-[#5D6B98] text-xs md:text-sm">
                        Antatt antall dager til å fullføre
                      </p>
                      <h6 className="text-darkBlack font-medium text-sm md:text-base">
                        {step?.day} dager
                      </h6>
                    </div>
                    <div className="w-full flex flex-col gap-2">
                      <p className="text-[#5D6B98] text-xs md:text-sm">
                        Utbetaling ihht. faktureringsplan
                      </p>
                      <h6 className="text-darkBlack font-medium text-sm md:text-base">
                        {formatPrice(step.pris)}
                      </h6>
                    </div>
                  </div>
                  {currIndex > index && openStepIndex === index && (
                    <div className="border border-[#EAECF0] rounded-lg">
                      <div className="flex items-center justify-between gap-2 p-2 md:p-4 border-b border-[#EAECF0]">
                        <h3 className="text-darkBlack font-semibold text-sm md:text-base">
                          Grunnarbeider: Kommentar fra utbygger
                        </h3>
                        {step.status !== "Approve" && (
                          <Pencil
                            className="text-primary cursor-pointer w-5 h-5 md:w-6 md:h-6"
                            onClick={() => {
                              setIsModalOpen(true);
                              setSelectIndex(step.name);
                            }}
                          />
                        )}
                      </div>
                      <div className="p-2 md:p-4">
                        <p className="text-[#5D6B98] text-sm md:text-base mb-4 md:mb-6">
                          {step.comment.text}
                        </p>
                        <div>
                          <h4 className="text-darkBlack font-semibold text-sm md:text-base">
                            Bilder fra jobben:
                          </h4>
                          {step.comment.photo && (
                            <div className="mt-3 md:mt-5 flex items-center gap-3 md:gap-5 flex-wrap">
                              {step.comment.photo?.map(
                                (file: string, index: number) => {
                                  const isPdf = file
                                    .toLowerCase()
                                    .includes(".pdf");
                                  return (
                                    <div
                                      className="relative h-[130px] md:h-[140px] w-[130px] md:w-[140px]"
                                      key={index}
                                    >
                                      <img
                                        src={isPdf ? Img_pdf : file}
                                        alt={
                                          isPdf ? "PDF file" : "Uploaded image"
                                        }
                                        className="object-cover w-full h-full rounded-lg"
                                      />
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {currIndex > index &&
                    openStepIndex === index &&
                    step?.payment && (
                      <div className="border border-[#EAECF0] rounded-lg">
                        <div className="flex items-center justify-between gap-2 p-2 md:p-4 border-b border-[#EAECF0]">
                          <h3 className="text-darkBlack font-semibold text-sm md:text-base">
                            Grunnarbeider: Svar til utbygger
                          </h3>
                          {/* <Pencil
                              className="text-primary cursor-pointer w-5 h-5 md:w-6 md:h-6"
                          onClick={() => {
                            setIsPDFModalOpen(true);
                            setSelectIndex(step.name);
                          }}
                        /> */}
                        </div>
                        <div className="p-2 md:p-4">
                          <p className="text-[#5D6B98] text-sm md:text-base mb-4 md:mb-6">
                            {step.payment.text}
                          </p>
                          <div>
                            <h4 className="text-darkBlack font-semibold text-sm md:text-base">
                              Dokumenter
                            </h4>
                            {step.payment.pdf && (
                              <div className="mt-3 md:mt-5 flex items-center gap-3 md:gap-5 flex-wrap">
                                {step.payment.pdf?.map(
                                  (_file: any, index: number) => (
                                    <div
                                      className="relative h-[130px] md:h-[140px] w-[130px] md:w-[140px]"
                                      key={index}
                                    >
                                      <img
                                        src={Img_pdf}
                                        alt="logo"
                                        className="object-cover w-full h-full rounded-lg"
                                      />
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              );
            })}
        </div>
      </div>

      {isModalOpen && (
        <Modal onClose={handleConfirmPopup} isOpen={true}>
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 mx-4">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full md:w-[80%] max-h-[80vh] overflow-y-auto">
              <AddComment
                SelectIndex={SelectIndex}
                setIsModalOpen={setIsModalOpen}
                getData={getData}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
