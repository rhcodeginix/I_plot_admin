import React from "react";
import EierinformasjonChart from "./chart";

const Eierinformasjon: React.FC<{ data: any }> = ({ data }) => {
  function calculateOwnership(andel: any) {
    let [owned, total] = andel.split("/")?.map(Number);
    let percentage = (owned / total) * 100;
    return percentage + "%";
  }
  const EierinformasjonData = data?.map((item: any) => ({
    name: "Ownership Share",
    value: calculateOwnership(item?.andel),
  }));

  return (
    <div className="flex gap-6">
      <div
        className="w-1/3 p-5 rounded-lg h-max"
        style={{
          boxShadow: "0px 1px 2px 0px #1018280F, 0px 1px 3px 0px #1018281A",
        }}
      >
        <h5 className="text-black text-sm md:text-base desktop:text-lg font-semibold mb-8">
          Eierskap
        </h5>
        <EierinformasjonChart chartData={EierinformasjonData} />
      </div>
      <div className="w-2/3">
        <div className="grid grid-cols-2 gap-6">
          {data &&
            data?.map((item: any, index: number) => {
              return (
                <div
                  className="p-5 rounded-lg flex flex-col gap-4"
                  style={{
                    boxShadow:
                      "0px 1px 2px 0px #1018280F, 0px 1px 3px 0px #1018281A",
                  }}
                  key={index}
                >
                  <div>
                    <h5 className="text-black text-sm md:text-base desktop:text-lg font-semibold mb-2">
                      ID: {item?.eierId}
                    </h5>
                    <h6 className="text-black text-sm font-medium">
                      FØDSELSNUMMER (Code: {item?.personalNumberType?.code})
                    </h6>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-gray text-xs mb-1">Eierandel</p>
                      <h6 className="text-black text-sm font-medium">
                        {calculateOwnership(item?.andel)}
                      </h6>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Eierinformasjon;
