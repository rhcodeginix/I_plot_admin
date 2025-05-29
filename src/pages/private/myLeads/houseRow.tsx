import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../../config/firebaseConfig";
import { fetchHusmodellData } from "../../../lib/utils";

export const HouseModelCell: React.FC<{ id: string }> = ({ id }) => {
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
    if (!data?.Husmodell?.[0]) {
      return;
    }
    const getData = async () => {
      const HouseData: any = await fetchHusmodellData(
        String(data?.Husmodell?.[0])
      );
      if (HouseData && HouseData.Husdetaljer) {
        setFinalData(HouseData);
      }
    };

    getData();
  }, [data?.Husmodell]);

  return (
    <>
      {finalData ? (
        <div className="flex items-center gap-3 w-max">
          <img
            src={finalData?.Husdetaljer?.photo}
            alt="logo"
            className="h-10 w-10 rounded-full"
          />
          <p className="text-black text-sm font-semibold">
            {finalData?.Husdetaljer?.husmodell_name}
          </p>
        </div>
      ) : (
        <p className="text-center">-</p>
      )}
    </>
  );
};
