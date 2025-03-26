import { HusleadsTable } from "./husleadsTable";

export const Husleads = () => {
  return (
    <>
      <div className="px-6 pt-6 pb-16 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-darkBlack font-medium text-[30px]">
              Antall husleads
            </h1>
            <p className="text-gray">Liste over alle Antall husleads</p>
          </div>
        </div>
        <HusleadsTable />
      </div>
    </>
  );
};
