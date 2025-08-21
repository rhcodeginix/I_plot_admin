import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../config/firebaseConfig";
import DatePickerComponent from "../../../components/ui/datepicker";
import { formatDateOnly } from "../../../lib/utils";
import { calculateDateRange } from "../myLeads/leads";

export const Events = () => {
  const [counts, setCounts] = useState({
    project: 0,
    lead: 0,
    AI: 0,
    pdf: 0,
    // ppt: 0,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [selectedDate1, setSelectedDate1] = useState<Date | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<string | null>(
    null
  );

  const fetchData = async () => {
    try {
      setLoading(true);

      let formattedSelectedDate: string | null = null;
      let startDate: string | null = null;
      let endDate: string | null = null;

      if (selectedDate1) {
        formattedSelectedDate = formatDateOnly(selectedDate1);
      } else if (selectedDateRange) {
        const range: any = calculateDateRange(selectedDateRange);
        startDate = range.startDate;
        endDate = range.endDate;
      }

      const filterByDate = (date: any) => {
        const formattedItemDate = new Date(date).toISOString().split("T")[0];
        if (formattedSelectedDate)
          return formattedItemDate === formattedSelectedDate;
        if (startDate && endDate)
          return formattedItemDate >= startDate && formattedItemDate <= endDate;
        return true;
      };

      const formatDocData = (docs: any[]) => docs.map((doc) => doc.data());

      const [allProjectsSnap, placedOrdersSnap, ...typeSnaps] =
        await Promise.all([
          getDocs(
            query(collection(db, "projects"), where("is_deleted", "==", false))
          ),
          getDocs(
            query(
              collection(db, "projects"),
              where("placeOrder", "==", true),
              where("is_deleted", "==", false)
            )
          ),
          ...["AI", "PDF", "PPT"].map((type) =>
            getDocs(
              query(
                collection(db, "boligconfigurator_count"),
                where("type", "==", type)
              )
            )
          ),
        ]);

      const houseModels = formatDocData(allProjectsSnap.docs).filter((item) =>
        filterByDate(item?.updatedAt)
      );
      const roomModels = formatDocData(placedOrdersSnap.docs).filter((item) =>
        filterByDate(item?.updatedAt)
      );
      const typeCounts = typeSnaps.map(
        (snap) =>
          formatDocData(snap.docs).filter((item) =>
            filterByDate(item?.timeStamp)
          ).length
      );

      setCounts({
        project: houseModels.length,
        lead: roomModels.length,
        AI: typeCounts[0],
        pdf: typeCounts[1],
        // ppt: typeCounts[2],
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate1, selectedDateRange]);

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
    // {
    //   title: "PPT",
    //   value: counts.ppt,
    //   path: "/events/ppt",
    // },
  ];

  return (
    <>
      <div className="px-4 md:px-6 pt-6 pb-16 flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
            Kontosammendrag
          </h1>
        </div>
        <div className="mb-6 flex lg:items-center flex-col lg:flex-row gap-2 justify-between">
          <div className="shadow-shadow1 border border-gray1 rounded-[8px] flex w-max">
            <div
              className={`p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm cursor-pointer ${
                selectedDateRange === "12 måneder" && "bg-gray2"
              }`}
              onClick={() => setSelectedDateRange("12 måneder")}
            >
              12 måneder
            </div>
            <div
              className={`p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm border border-t-0 border-b-0 border-gray1 cursor-pointer ${
                selectedDateRange === "30 dager" && "bg-gray2"
              }`}
              onClick={() => setSelectedDateRange("30 dager")}
            >
              30 dager
            </div>
            <div
              className={`p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm cursor-pointer border-r border-gray1 ${
                selectedDateRange === "7 dager" && "bg-gray2"
              }`}
              onClick={() => setSelectedDateRange("7 dager")}
            >
              7 dager
            </div>
            <div
              className={`p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm cursor-pointer ${
                selectedDateRange === "24 timer" && "bg-gray2"
              }`}
              onClick={() => setSelectedDateRange("24 timer")}
            >
              24 timer
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
            <DatePickerComponent
              selectedDate={selectedDate1}
              onDateChange={setSelectedDate1}
              dateFormat="dd.MM.yyyy"
              placeholderText="Velg dato"
              className="border border-gray1 rounded-[8px] flex gap-2 items-center p-2.5 md:py-[10px] md:px-4 cursor-pointer shadow-shadow1 h-[40px] w-max"
            />
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
              {/* <div
                className="w-full h-[125px] rounded-md custom-shimmer"
                style={{ borderRadius: "8px" }}
              ></div> */}
            </>
          ) : (
            <>
              {data.map((item, index) => {
                return (
                  <div
                    className={`shadow-shadow2 border border-gray2 bg-lightGreen rounded-[8px] p-3.5 sm:p-4 lg:p-6 flex flex-col gap-2 ${
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
