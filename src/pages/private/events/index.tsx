import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../config/firebaseConfig";

export const Events = () => {
  const [counts, setCounts] = useState({
    project: 0,
    lead: 0,
    AI: 0,
    pdf: 0,
    ppt: 0,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      let AI;
      let pdf;
      let ppt;

      AI = query(
        collection(db, "boligconfigurator_count"),
        where("type", "==", "AI")
      );
      pdf = query(
        collection(db, "boligconfigurator_count"),
        where("type", "==", "PDF")
      );
      ppt = query(
        collection(db, "boligconfigurator_count"),
        where("type", "==", "PPT")
      );

      const projectDocs = await getDocs(
        collection(db, "housemodell_configure_broker")
      );
      const houseModels = projectDocs.docs.map((doc) => ({
        ...doc.data(),
      }));

      const projectCount = houseModels.reduce(
        (acc, item) => acc + (item?.KundeInfo?.length || 0),
        0
      );

      const [leadCount, AICount, pdfCount, pptCount] = await Promise.all([
        getCountFromServer(collection(db, "room_configurator")),
        getDocs(AI),
        getDocs(pdf),
        getDocs(ppt),
      ]);

      setCounts({
        project: projectCount,
        lead: leadCount.data().count,
        AI: AICount.size,
        pdf: pdfCount.size,
        ppt: pptCount.size,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const data = [
    {
      title: "Prosjekter",
      value: counts.project,
      path: "/events/projects",
    },
    {
      title: "Leads",
      value: counts.lead,
      path: "/events/leads",
    },
    {
      title: "AI",
      value: counts.AI,
      path: "/events/ai",
    },
    {
      title: "PDF",
      value: counts.pdf,
      path: "/events/pdf",
    },
    {
      title: "PPT",
      value: counts.ppt,
      path: "/events/ppt",
    },
  ];

  return (
    <>
      <div className="px-4 md:px-6 pt-6 pb-16 flex flex-col gap-4 md:gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
              Kontosammendrag
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5 desktop:gap-6">
          {loading ? (
            <>
              <div
                className="w-full h-[125px] rounded-md custom-shimmer"
                style={{ borderRadius: "8px" }}
              ></div>
              <div
                className="w-full h-[125px] rounded-md custom-shimmer"
                style={{ borderRadius: "8px" }}
              ></div>
              <div
                className="w-full h-[125px] rounded-md custom-shimmer"
                style={{ borderRadius: "8px" }}
              ></div>
              <div
                className="w-full h-[125px] rounded-md custom-shimmer"
                style={{ borderRadius: "8px" }}
              ></div>
              <div
                className="w-full h-[125px] rounded-md custom-shimmer"
                style={{ borderRadius: "8px" }}
              ></div>
            </>
          ) : (
            <>
              {data.map((item, index) => {
                return (
                  <div
                    className={`shadow-shadow2 border border-gray2 bg-lightPurple rounded-[8px] p-3.5 sm:p-4 lg:p-6 flex flex-col gap-2 ${
                      item?.path && "cursor-pointer"
                    }`}
                    key={index}
                    onClick={item?.path ? () => navigate(item.path) : undefined}
                  >
                    <div className="flex items-center gap-2 justify-between">
                      <span className="text-gray text-sm font-medium">
                        {item.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 justify-between">
                      <h4 className="text-darkBlack font-semibold text-xl md:text-2xl desktop:text-[30px]">
                        {item.value}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
};
