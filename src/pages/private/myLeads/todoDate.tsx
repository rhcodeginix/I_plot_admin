import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../../config/firebaseConfig";
import { monthMap } from "./myLeadsDetail";
import { formatTimestamp } from "../../../lib/utils";

export const TodoDateCell: React.FC<{ id: string }> = ({ id }) => {
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
        <p className="text-sm font-semibold text-black w-max">
          {data?.[0]?.date ? formatTimestamp(data?.[0]?.date) : "-"}
        </p>
      ) : (
        <>-</>
      )}
    </>
  );
};
