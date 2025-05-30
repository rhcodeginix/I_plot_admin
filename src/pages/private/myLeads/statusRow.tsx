import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../../config/firebaseConfig";
import { monthMap } from "./myLeadsDetail";

export const StatusCell: React.FC<{ id: string }> = ({ id }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchPreferredHouse = async () => {
      if (!id) return;

      const logsCollectionRef = collection(
        db,
        "leads_from_supplier",
        String(id),
        "followups"
      );

      try {
        const logsSnapshot = await getDocs(logsCollectionRef);

        const fetchedLogs: any = logsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const getTimestamp = (item: any): number => {
          const updatedAt = item?.updatedAt;

          if (typeof updatedAt === "string") {
            const [datePart, timePart] = updatedAt
              .split("|")
              .map((s: string) => s.trim());
            const [day, monthName, year] = datePart.split(" ");
            const engMonth = monthMap[monthName.toLowerCase()] || monthName;
            const dateStr = `${engMonth} ${day}, ${year} ${timePart}`;
            const parsed = new Date(dateStr).getTime();
            return isNaN(parsed) ? 0 : parsed;
          } else if (updatedAt?.toMillis) {
            return updatedAt.toMillis();
          } else {
            return item?.date?.seconds ? item.date.seconds * 1000 : 0;
          }
        };
        fetchedLogs.sort((a: any, b: any) => getTimestamp(b) - getTimestamp(a));

        setData(fetchedLogs);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      }
    };

    fetchPreferredHouse();
  }, [id]);

  return (
    <>
      {data && data.length > 0 ? (
        <div
          className={`flex items-center justify-between w-max rounded-[16px] py-[2px] px-2
        ${
          data[0]?.Hurtigvalg === "Førstegangsmøte"
            ? "bg-[#e3d8fe] text-primary"
            : ""
        }
        ${
          data[0]?.Hurtigvalg === "Start prosess"
            ? "bg-[#e2e6fd] text-[#001795]"
            : ""
        }
        ${
          data[0]?.Hurtigvalg === "Signert"
            ? "bg-lightGreen text-darkGreen"
            : ""
        }
        ${
          !["Signert", "Førstegangsmøte", "Start prosess"].includes(
            data[0]?.Hurtigvalg
          )
            ? "bg-[#FFEBD9] text-[#994700]"
            : ""
        }`}
        >
          {data[0]?.Hurtigvalg === "initial" || data[0]?.type === "initial"
            ? "Ubehandlet"
            : data[0]?.Hurtigvalg || data[0]?.type}
        </div>
      ) : (
        <div className="text-[#994700] flex items-center justify-between w-max bg-[#FFEBD9] rounded-[16px] py-[2px] px-2">
          Ubehandlet
        </div>
      )}
    </>
  );
};
