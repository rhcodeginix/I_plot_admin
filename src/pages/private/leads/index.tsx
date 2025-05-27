import { LeadTable } from "./leadTable";

export const AllLeads = () => {
  return (
    <>
      <div className="px-6 pt-6 pb-16 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">Leads</h1>
            <p className="text-gray">Liste over alle Leads</p>
          </div>
        </div>
        <LeadTable />
      </div>
    </>
  );
};
