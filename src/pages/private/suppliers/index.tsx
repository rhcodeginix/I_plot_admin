import { Plus } from "lucide-react";
// import Ic_download_cloud from "../../../assets/images/Ic_download_cloud.svg";
import Button from "../../../components/common/button";
import { SupplierTable } from "./supplierTable";
import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { fetchAdminDataByEmail } from "../../../lib/utils";

export const Suppliers = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // const handleUploadClick = () => {
  //   if (fileInputRef.current) {
  //     fileInputRef.current.click();
  //   }
  // };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const fileExt =
      files[0].name.endsWith(".xlsx") || files[0].name.endsWith(".xls");
    if (fileExt) {
      parseExcelFile(files);
    } else {
      toast.error("Invalid file format. Please upload a CSV or Excel file.", {
        position: "top-right",
      });
    }
  };

  const parseExcelFile = async (file: any) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = e.target?.result;

      if (data) {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const excelData = XLSX.utils.sheet_to_json(worksheet);
        console.log(excelData);
      }
    };
    reader.readAsBinaryString(file[0]);
  };
  const [isAdd, setIsAdd] = useState(false);
  const email = sessionStorage.getItem("Iplot_admin");

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();
      if (data) {
        const finalData = data?.modulePermissions?.find(
          (item: any) => item.name === "Leverandører"
        );
        setIsAdd(finalData?.permissions?.add);
      }
    };

    getData();
  }, []);

  return (
    <>
      <div className="px-6 pt-6 pb-16 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-darkBlack font-medium text-[30px]">
              Leverandører
            </h1>
            <p className="text-gray">Liste over alle leverandører</p>
          </div>
          <div className="flex gap-3">
            {/* <div
              className="border border-gray1 rounded-[8px] flex gap-2 items-center py-[10px] px-4 cursor-pointer shadow-shadow1 h-[40px]"
              onClick={handleUploadClick}
            >
              <img src={Ic_download_cloud} alt="download" />
              <span className="text-black text-sm font-medium">
                Last ned CSV
              </span>
            </div> */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".xls,.xlsx"
              className="hidden"
              onChange={handleFileChange}
            />
            {(isAdd || email === "andre.finger@gmail.com") && (
              <Button
                text="Legg til"
                className="border border-purple bg-purple text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                icon={<Plus className="text-white w-5 h-5" />}
                path="/legg-til-leverandor"
              />
            )}
          </div>
        </div>
        <SupplierTable />
      </div>
    </>
  );
};
