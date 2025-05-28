import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { AddSuppliersForm } from "./addSuppliersForm";

export const AddSuppliers = () => {
  return (
    <>
      <div className="px-4 md:px-6 pt-6 pb-16 flex flex-col gap-4 md:gap-6">
        <div className="flex items-center gap-1.5 md:gap-3">
          <Link
            to={"/Leverandorer"}
            className="text-gray text-xs md:text-sm font-medium"
          >
            Leverandører
          </Link>
          <ChevronRight className="text-gray2 w-4 h-4" />
          <span className="text-primary text-xs md:text-sm font-medium">
            Legg til nye leverandører
          </span>
        </div>
        <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
          Legg til leverandør
        </h1>
        <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 lg:gap-8">
          <div className="w-max">
            <h5 className="text-black text-sm font-medium">Partnerdetaljer</h5>
            <p className="text-gray text-sm whitespace-nowrap">
              Legg til bilder og persondetaljer
            </p>
          </div>
          <div className="w-full shadow-shadow2 rounded-lg overflow-hidden relative">
            <AddSuppliersForm />
          </div>
        </div>
      </div>
    </>
  );
};
