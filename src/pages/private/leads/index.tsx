import { Plus } from "lucide-react";
import Button from "../../../components/common/button";
import { LeadTable } from "./leadTable";
import { useEffect, useState } from "react";
import { fetchAdminDataByEmail } from "../../../lib/utils";

export const AllLeads = () => {
  const [Role, setRole] = useState<any>(null);
  const [Supplier, setSupplier] = useState<any>(null);
  const [Email, setEmail] = useState<any>(null);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();

      if (data) {
        setEmail(data?.email);
        if (data?.role) {
          setRole(data?.role);
        }
        if (data?.supplier) {
          setSupplier(data?.supplier);
        }
      }
    };

    getData();
  }, []);

  return (
    <>
      <div className="px-6 pt-6 pb-16 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex flex-col gap-1">
            <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
              Tips til bank
            </h1>
            <p className="text-gray">Liste over alle Leads</p>
          </div>
          <div className="flex gap-4 flex-col sm:flex-row sm:items-center">
            {Supplier &&
              Supplier === "9f523136-72ca-4bde-88e5-de175bc2fc71" && (
                <Button
                  text="Gå til romkonfiguratoren"
                  className="border-2 border-primary text-primary text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                  onClick={() => {
                    const url = `https://boligkonfigurator.mintomt.no?email=${encodeURIComponent(
                      Email
                    )}`;
                    window.location.href = url;
                  }}
                />
              )}
            {Role && Role !== "Bankansvarlig" && (
              <Button
                text="Registrer nytt tips"
                className="border border-primary bg-primary text-white text-sm rounded-[8px] h-[40px] font-medium relative px-3 md:px-4 py-[10px] flex items-center gap-2"
                icon={<Plus className="text-white w-5 h-5" />}
                path="/add-bank-leads"
              />
            )}
          </div>
        </div>
        <LeadTable />
      </div>
    </>
  );
};
