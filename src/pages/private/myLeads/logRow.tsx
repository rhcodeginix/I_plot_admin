import { useState } from "react";
import { Pencil } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";

type LogItemProps = {
  log: any;
  leadId: string;
  fetchLogs: any;
};

export const LogRow = ({ log, leadId, fetchLogs }: LogItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState(log?.notat || "");

  const handleSave = async () => {
    try {
      const logDocRef = doc(
        db,
        "leads_from_supplier",
        leadId,
        "followups",
        log.id
      );
      await updateDoc(logDocRef, {
        notat: editedNote,
      });
      setIsEditing(false);
      await fetchLogs();
    } catch (err) {
      console.error("Failed to update note", err);
    }
  };

  return (
    <td className="px-4 py-6 text-sm text-black font-medium flex items-center gap-2 justify-between w-full">
      {isEditing ? (
        <>
          <input
            value={editedNote}
            onChange={(e) => setEditedNote(e.target.value)}
            className="border border-gray2 rounded-lg focus-within:outline-none px-3 py-2 text-sm"
          />
          <button
            onClick={handleSave}
            className="bg-purple text-white px-6 py-2 rounded"
          >
            Save
          </button>
        </>
      ) : (
        <>
          {log?.notat || log?.notes}
          <button
            onClick={() => setIsEditing(true)}
            className="ml-2 rounded-lg"
          >
            <Pencil className="h-6 w-6 text-purple" />
          </button>
        </>
      )}
    </td>
  );
};
