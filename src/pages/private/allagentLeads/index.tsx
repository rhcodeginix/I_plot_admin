import { Plus } from "lucide-react";
import Button from "../../../components/common/button";
import { BankTable } from "./bankTable";

export const AllBankLeads = () => {
  return (
    <>
      <div className="px-6 pt-6 pb-16 flex flex-col gap-4 md:gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
              Søknader sendt til bank
            </h1>
            <p className="text-gray text-sm md:text-base">
              Liste over alle dine søknader om banklån
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              text="Legg til"
              className="border border-primary bg-primary text-white text-sm rounded-[8px] h-[40px] font-medium relative px-3 md:px-4 py-[10px] flex items-center gap-2"
              icon={<Plus className="text-white w-5 h-5" />}
              path="/add-agent-leads"
            />
          </div>
        </div>
        <BankTable />
      </div>
    </>
  );
};
