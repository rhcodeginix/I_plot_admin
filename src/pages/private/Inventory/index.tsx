import Button from "../../../components/common/button";
import { InventoryTable } from "./InventoryTable";

export const Inventory = () => {
  return (
    <>
      <div className="px-4 md:px-6 pt-6 pb-16 flex flex-col gap-4 md:gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
            All Inventory
          </h1>

          <Button
            text="Legg til"
            className="border border-primary bg-primary text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
            path="/add-inventory"
          />
        </div>
        <InventoryTable />
      </div>
    </>
  );
};
