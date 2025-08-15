import { Plus } from "lucide-react";
import Button from "../../../components/common/button";
import { LeadTable } from "./leadTable";
import { useEffect, useState } from "react";
import { fetchAdminDataByEmail } from "../../../lib/utils";

export const AllLeads = () => {
  const [Role, setRole] = useState<any>(null);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();

      if (data) {
        if (data?.role) {
          setRole(data?.role);
        }
      }
    };

    getData();
  }, []);

  return (
    <>
      <div className="px-6 pt-6 pb-16 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
              Tips til bank
            </h1>
            <p className="text-gray">Liste over alle Leads</p>
          </div>
          {Role && Role !== "Bankansvarlig" && (
            <div className="flex gap-3">
              <Button
                text="Registrer nytt tips"
                className="border border-purple bg-purple text-white text-sm rounded-[8px] h-[40px] font-medium relative px-3 md:px-4 py-[10px] flex items-center gap-2"
                icon={<Plus className="text-white w-5 h-5" />}
                path="/add-bank-leads"
              />
            </div>
          )}
        </div>
        <LeadTable />
      </div>
    </>
  );
};
