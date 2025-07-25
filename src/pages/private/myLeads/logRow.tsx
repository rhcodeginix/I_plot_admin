import { useState } from "react";
import { Pencil } from "lucide-react";
import { Timestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";

type LogItemProps = {
  log: any;
  leadId: string;
  fetchLogs: any;
};

export const LogRow = ({ log, leadId, fetchLogs }: LogItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState(log?.notat || log?.notes || "");

  const handleSave = async () => {
    try {
      const logDocRef = doc(
        db,
        "leads_from_supplier",
        leadId,
        "followups",
        log.id
      );
      const now = new Date();

      const datePart = new Intl.DateTimeFormat("nb-NO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(now);

      const timePart = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(now);

      const formattedDateTime = `${datePart} | ${timePart}`;

      await updateDoc(logDocRef, {
        notat: editedNote,
        updatedAt: formattedDateTime,
      });

      await updateDoc(doc(db, "leads_from_supplier", String(leadId)), {
        updatedAt: Timestamp.now(),
      });
      setIsEditing(false);
      setEditedNote("");
      await fetchLogs();
    } catch (err) {
      console.error("Failed to update note", err);
    }
  };

  return (
    <td className="px-3 md:px-4 py-3 md:py-6 text-xs md:text-sm text-black font-medium flex items-center gap-2 justify-between w-max max-w-[600px] md:w-full">
      {isEditing ? (
        <>
          <input
            value={editedNote}
            onChange={(e) => setEditedNote(e.target.value)}
            className="border border-gray2 rounded-lg focus-within:outline-none px-3 py-2 text-xs md:text-sm"
          />
          <button
            onClick={handleSave}
            className="bg-purple text-white px-3 md:px-6 py-2 rounded"
          >
            Save
          </button>
        </>
      ) : (
        <>
          <p className="break-all">{log?.notat || log?.notes}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="ml-2 rounded-lg"
          >
            <Pencil className="h-5 md:h-6 w-5 md:w-6 text-purple" />
          </button>
        </>
      )}
    </td>
  );
};
