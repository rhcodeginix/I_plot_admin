import React, { useEffect, useRef } from "react";
import Tick from "../../../assets/images/Tick.svg";

// function getDaysDifference(plannedDateStr: any) {
//   const plannedDate: any = new Date(plannedDateStr);
//   const today: any = new Date();

//   plannedDate.setHours(0, 0, 0, 0);
//   today.setHours(0, 0, 0, 0);

//   const diffTime = plannedDate - today;
//   const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

//   return diffDays;
// }

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
        <div className="py-3">
          <div className="stepper_main overFlowScrollHidden">
            <div className="stepper-wrapper">
              <div className="progress"></div>
              {steps.map((step: any, index: number) => (
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
                      {step.date.split("-").reverse().join(".")}
                    </p>
                    <p className="text-darkBlack text-xs">
                      Forventet varighet:
                    </p>
                    <p className="text-darkBlack text-xs">
                      {step.day} dager
                      {/* ({getDaysDifference(step.date)} dager) */}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    </>
  );
};

export default Stepper;
