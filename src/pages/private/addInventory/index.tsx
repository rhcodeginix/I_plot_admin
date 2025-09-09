import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { InventoryForm } from "./InventoryForm";

export const AddInventory = () => {
  return (
    <>
      <div className="px-4 md:px-6 pt-6 pb-16 flex flex-col gap-4 md:gap-6">
        <div className="flex items-center gap-1.5 md:gap-3">
          <Link
            to={"/inventory"}
            className="text-gray text-xs md:text-sm font-medium"
          >
            Inventory
          </Link>
          <ChevronRight className="text-gray2 w-4 h-4" />
          <span className="text-primary text-xs md:text-sm font-medium">
            Legg til Inventory
          </span>
        </div>
        <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
          Legg til Inventory
        </h1>
        <InventoryForm />
      </div>
    </>
  );
};
