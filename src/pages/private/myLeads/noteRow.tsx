import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../../config/firebaseConfig";
import { monthMap } from "./myLeadsDetail";

interface NoteCellProps {
  id: string;
  rowData: any;
}

export const NoteCell: React.FC<NoteCellProps> = ({ id, rowData }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchFollowups = async () => {
      if (!id) return;

      try {
        const logsCollectionRef = collection(
          db,
          "leads_from_supplier",
          String(id),
          "followups"
        );
        const snapshot = await getDocs(logsCollectionRef);

        const logs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const getTimestamp = (item: any): number => {
          const updatedAt = item?.updatedAt;

          if (typeof updatedAt === "string") {
            try {
              const [datePart, timePart] = updatedAt
                .split("|")
                .map((s: string) => s.trim());
              const [day, monthName, year] = datePart.split(" ");
              const engMonth = monthMap[monthName.toLowerCase()] || monthName;
              const parsed = new Date(
                `${engMonth} ${day}, ${year} ${timePart}`
              ).getTime();
              return isNaN(parsed) ? 0 : parsed;
            } catch {
              return 0;
            }
          }

          if (updatedAt?.toMillis) return updatedAt.toMillis();
          if (item?.date?.seconds) return item.date.seconds * 1000;

          return 0;
        };

        const sortedLogs = logs.sort(
          (a, b) => getTimestamp(b) - getTimestamp(a)
        );
        setData(sortedLogs);
      } catch (error) {
        console.error("Error fetching followups:", error);
      }
    };

    fetchFollowups();
  }, [id]);

  const latestNote = data.length > 0 ? data[0]?.notat || data[0]?.notes : null;

  return (
    <p className="text-sm text-black w-max max-w-[500px]">
      {latestNote || rowData || "Ingen notater"}
    </p>
  );
};
