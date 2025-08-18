import { useEffect, useState } from "react";
import Button from "../../../components/common/button";
import { HusmodellerTable } from "./HusmodellerTable";
import { fetchAdminDataByEmail } from "../../../lib/utils";

export const Husmodeller = () => {
  const [isAdd, setIsAdd] = useState(false);
  const email = localStorage.getItem("Iplot_admin");
  const [role, setRole] = useState<any>(null);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();
      if (data) {
        if (data?.role) {
          setRole(data?.role);
        }
        const finalData = data?.modulePermissions?.find(
          (item: any) => item.name === "Husmodell"
        );
        setIsAdd(finalData?.permissions?.add);
      }
    };

    getData();
  }, []);
  return (
    <>
      <div className="px-4 md:px-6 pt-6 pb-16 flex flex-col gap-4 md:gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
            Alle hus- og hyttemodeller
          </h1>
          {(isAdd ||
            email === "andre.finger@gmail.com" ||
            role === "Admin") && (
            <Button
              text="Legg til ny modell"
              className="border border-primary bg-primary text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
              path="/add-husmodell"
            />
          )}
        </div>
        <HusmodellerTable />
      </div>
    </>
  );
};
