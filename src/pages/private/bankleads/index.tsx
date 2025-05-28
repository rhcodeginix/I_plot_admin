import { BankleadsTable } from "./bankleadsTable";

export const Bankleads = () => {
  return (
    <>
      <div className="px-4 md:px-6 pt-6 pb-16 flex flex-col gap-4 md:gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
              Antall bankleads
            </h1>
            <p className="text-gray text-sm md:text-base">
              Liste over alle Antall bankleads
            </p>
          </div>
        </div>
        <BankleadsTable />
      </div>
    </>
  );
};
