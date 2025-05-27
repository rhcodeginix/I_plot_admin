import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../../config/firebaseConfig";
import { fetchSupplierData } from "../../../lib/utils";

export const BrokerCell: React.FC<{ id: string }> = ({ id }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchPreferredHouse = async () => {
      if (!id) return;

      const subDocRef = doc(
        db,
        "leads_from_supplier",
        String(id),
        "preferred_house_model",
        String(id)
      );

      const subDocSnap = await getDoc(subDocRef);

      if (subDocSnap.exists()) {
        setData(subDocSnap.data());
      }
    };

    fetchPreferredHouse();
  }, [id]);

  const [finalData, setFinalData] = useState<any>(null);
  useEffect(() => {
    if (!data?.Tildelt) {
      return;
    }
    const getData = async () => {
      const SupplierData: any = await fetchSupplierData(String(data?.Tildelt));
      if (SupplierData) {
        setFinalData(SupplierData);
      }
    };

    getData();
  }, [data?.Tildelt]);

  return (
    <>
      {finalData ? (
        <div className="flex items-center gap-3 w-max">
          <div className="w-8 h-8 rounded-full border border-gray1 bg-gray3 flex items-center justify-center">
            {finalData?.Kontaktperson[0]}
          </div>
          <div>
            <p className="font-medium text-black text-sm mb-[2px]">
              {finalData?.Kontaktperson}
            </p>
            <p className="text-xs text-gray">{finalData?.KontaktpersonEPost}</p>
          </div>
        </div>
      ) : (
        <p className="text-center">-</p>
      )}
    </>
  );
};
