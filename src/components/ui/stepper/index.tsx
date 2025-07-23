import React, { useEffect, useRef } from "react";
import Tick from "../../../assets/images/Tick.svg";
import { isValid, addDays, differenceInCalendarDays } from "date-fns";

interface StepperProps {
  steps: any;
  currIndex: any;
  Style?: any;
}

const Stepper: React.FC<StepperProps> = ({ steps, currIndex, Style }) => {
  const stepRefs = useRef<any>([]);

  useEffect(() => {
    const currentStepEl = stepRefs.current[currIndex];
    if (currentStepEl) {
      currentStepEl.scrollIntoView({ behavior: "smooth", inline: "start" });
    }
  }, [currIndex]);

  return (
    <>
      <>
        <div className="py-3 overflow-auto overflowXAuto">
          <div className="stepper_main min-w-[1200px] w-full px-1">
            <div className="stepper-wrapper gap-3 big:gap-5 sBig:gap-[28px]">
              <div className="progress"></div>
              {steps.map((step: any, index: number) => {
                let diffText: any = "";

                if (step?.comment?.full_fort_date) {
                  const baseDate = new Date(step.date);
                  const fullFortDate = new Date(step.comment.full_fort_date);

                  const expectedDate = addDays(baseDate, Number(step.day) || 0);

                  if (isValid(expectedDate) && isValid(fullFortDate)) {
                    const dayDifference = differenceInCalendarDays(
                      fullFortDate,
                      expectedDate
                    );

                    diffText = (
                      <span
                        style={{
                          color: dayDifference < 0 ? "#00857A" : "#A20000",
                          fontWeight: "600",
                        }}
                      >
                        ({dayDifference >= 0 ? "+" : ""}
                        {dayDifference} dager)
                      </span>
                    );
                  }
                }
                return (
                  <div
                    key={index}
                    ref={(el: any) => (stepRefs.current[index] = el)}
                    className={`screen-indicator-span cursor-pointer ${
                      index < currIndex
                        ? "completed"
                        : index === currIndex
                        ? "current"
                        : ""
                    }`}
                    style={{
                      color: index === currIndex ? "#2a343e" : "",
                    }}
                  >
                    <div
                      className="flex items-center gap-1.5 md:gap-2"
                      style={{ zIndex: 2 }}
                    >
                      {index < currIndex ? (
                        <div className="w-6 h-6 bg-[#099250] flex items-center justify-center rounded-full">
                          <img src={Tick} alt="Completed" />
                        </div>
                      ) : (
                        <span className="screen-index"></span>
                      )}
                      {index < steps.length - 1 && (
                        <div
                          className={`screen-indicator ${
                            Style && "screen-more"
                          } ${
                            index < currIndex
                              ? "completed"
                              : index === currIndex
                              ? "current"
                              : ""
                          }`}
                        ></div>
                      )}
                    </div>

                    <div>
                      <h5 className="text-darkBlack text-sm font-medium mb-1">
                        {step.name}
                      </h5>
                      <p className="text-darkBlack text-xs">
                        {step.date && step.date.split("-").reverse().join(".")}
                      </p>
                      <p className="text-darkBlack text-xs">
                        Forventet varighet:
                      </p>
                      <p className="text-darkBlack text-xs">
                        {step.day} dager
                        {diffText}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </>
    </>
  );
};

export default Stepper;
