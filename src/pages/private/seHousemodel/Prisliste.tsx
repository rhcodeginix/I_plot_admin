import React from "react";
import Ic_info_circle from "../../../assets/images/Ic_info_circle.svg";

export const Prisliste: React.FC<{ husmodellData: any }> = ({
  husmodellData,
}) => {
  const Byggekostnader = husmodellData?.Byggekostnader;

  const totalPrisOfByggekostnader = Byggekostnader
    ? Byggekostnader.reduce((acc: any, prod: any) => {
        const numericValue = prod.pris
          ?.replace(/\s/g, "")
          .replace(/\./g, "")
          .replace(",", ".");
        return acc + (numericValue ? parseFloat(numericValue) : 0);
      }, 0)
    : 0;
  const formattedNumberOfByggekostnader =
    totalPrisOfByggekostnader.toLocaleString("nb-NO");

  const Tomtekost = husmodellData?.Tomtekost;

  const totalPrisOfTomtekost = Tomtekost
    ? Tomtekost.reduce((acc: any, prod: any) => {
        const numericValue = prod.pris
          ?.replace(/\s/g, "")
          .replace(/\./g, "")
          .replace(",", ".");
        return acc + (numericValue ? parseFloat(numericValue) : 0);
      }, 0)
    : 0;
  const formattedNumber = totalPrisOfTomtekost.toLocaleString("nb-NO");

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div
          className="w-full lg:w-1/2 p-3 md:p-4 border border-gray2 rounded-lg h-max"
          style={{
            boxShadow:
              "0px 4px 6px -2px #10182808, 0px 12px 16px -4px #10182814",
          }}
        >
          <div className="text-center p-3 md:p-4 text-black font-medium text-base desktop:text-lg bg-lightPurple mb-3 md:mb-5">
            Byggekostnader
          </div>
          {husmodellData?.Byggekostnader?.length > 0 && (
            <div className="flex flex-col gap-3 md:gap-5">
              {husmodellData?.Byggekostnader?.map(
                (item: any, index: number) => {
                  return (
                    <div
                      className="flex items-center gap-2 justify-between"
                      key={index}
                    >
                      <div className="flex items-center gap-2">
                        <img src={Ic_info_circle} alt="icon" />
                        <p className="text-gray text-sm font-medium">
                          {item?.Headline}
                        </p>
                      </div>
                      <h4 className="text-black font-medium text-base">
                        {item?.pris ? `kr ${item.pris}` : "inkl. i tilbud"}
                      </h4>
                    </div>
                  );
                }
              )}
              <div className="border-t border-gray2"></div>
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <img src={Ic_info_circle} alt="icon" />
                  <p className="text-gray text-base md:text-lg font-bold">
                    Sum byggkostnader
                  </p>
                </div>
                <h4 className="text-black font-bold text-sm md:text-base">
                  kr {formattedNumberOfByggekostnader}
                </h4>
              </div>
            </div>
          )}
        </div>
        <div
          className="w-full lg:w-1/2 p-3 md:p-4 border border-gray2 rounded-lg h-max"
          style={{
            boxShadow:
              "0px 4px 6px -2px #10182808, 0px 12px 16px -4px #10182814",
          }}
        >
          <div className="text-center p-3 md:p-4 text-black font-medium text-base desktop:text-lg bg-lightPurple mb-3 md:mb-5">
            Tomkostnader
          </div>
          <div className="flex flex-col gap-3 md:gap-5">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <img src={Ic_info_circle} alt="icon" />
                <p className="text-gray text-sm font-medium">Tomtekjøp</p>
              </div>
              <input
                type="text"
                className="focus-within:outline-none placeholder:text-gray rounded-[8px] shadow-shadow1 border border-gray1 py-[10px] px-[14px] w-[140px]"
                placeholder="Enter"
              />
            </div>
            {husmodellData?.Tomtekost.length > 0 &&
              husmodellData?.Tomtekost?.map((item: any, index: number) => {
                return (
                  <div
                    className="flex items-center gap-2 justify-between"
                    key={index}
                  >
                    <div className="flex items-center gap-2">
                      <img src={Ic_info_circle} alt="icon" />
                      <p className="text-gray text-sm font-medium">
                        {item?.Headline}
                      </p>
                    </div>
                    <h4 className="text-black font-medium text-base">
                      kr {item?.pris ? `${item.pris}` : "inkl. i tilbud"}
                    </h4>
                  </div>
                );
              })}
            <div className="border-t border-gray2"></div>
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <img src={Ic_info_circle} alt="icon" />
                <p className="text-gray text-base md:text-lg font-bold">
                  Sum tomtekostnader
                </p>
              </div>
              <h4 className="text-black font-bold text-sm md:text-base">
                kr {formattedNumber}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
