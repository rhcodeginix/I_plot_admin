/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Ic_filter from "../../../assets/images/Ic_filter.svg";
// import Ic_dropdown_menu from "../../../assets/images/Ic_dropdown_menu.svg";
// import Ic_green_up_arrow from "../../../assets/images/Ic_green_up_arrow.svg";
import DatePickerComponent from "../../../components/ui/datepicker";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { Spinner } from "../../../components/Spinner";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const [selectedDate1, setSelectedDate1] = useState<Date | null>(null);
  const [counts, setCounts] = useState({
    users: 0,
    husmodell: 0,
    plot: 0,
    householdLeads: 0,
    kombinasjoner: 0,
    constructedPlot: 0,
    bankLeads: 0,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const email = sessionStorage.getItem("Iplot_admin");

  const fetchSuppliersData = async () => {
    try {
      setLoading(true);
      let q;
      if (email === "andre.finger@gmail.com") {
        q = query(collection(db, "house_model"), orderBy("updatedAt", "desc"));
      } else {
        q = query(
          collection(db, "house_model"),
          where("createDataBy.email", "==", email),
          orderBy("updatedAt", "desc")
        );
      }
      const [
        usersSnapshot,
        husmodellSnapshot,
        plotSnapshot,
        householdLeadsShot,
        kombinasjonerShot,
        constructedPlotSnapshot,
        BankLeadShot,
      ] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(q),
        getDocs(collection(db, "empty_plot")),
        getDocs(query(collection(db, "leads"), where("Isopt", "==", true))),
        getDocs(query(collection(db, "leads"), where("Isopt", "==", false))),
        getDocs(collection(db, "plot_building")),
        getDocs(
          query(collection(db, "leads"), where("IsoptForBank", "==", true))
        ),
      ]);

      setCounts({
        users: usersSnapshot.size,
        husmodell: husmodellSnapshot.size,
        plot: plotSnapshot.size,
        householdLeads: householdLeadsShot.size,
        kombinasjoner: kombinasjonerShot.size,
        constructedPlot: constructedPlotSnapshot.size,
        bankLeads: BankLeadShot.size,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchSuppliersData();
  }, []);

  const data = [
    {
      title: "Antall brukere",
      value: counts.users,
      percentage: 10,
      path: "/users",
    },
    {
      title: "Antall tomter",
      value: counts.plot,
      percentage: 10,
      path: "/plot",
    },
    {
      title: "Antall husmodeller",
      value: counts.husmodell,
      percentage: 12,
      path: "/Husmodeller",
    },
    {
      title: "Antall husleverandører",
      value: "2",
      percentage: 12,
    },
    {
      title: "Antall husleads",
      value: counts.householdLeads,
      percentage: 12,
      path: "/se-husleads",
    },
    {
      title: "Antall bankleads",
      value: counts.bankLeads,
      percentage: 10,
      path: "/se-bankleads",
    },
    {
      title: "Antall kombinasjoner",
      title2: "(tomt+hus)",
      value: counts.kombinasjoner,
      percentage: 10,
      path: "/se-kombinasjoner",
    },
    {
      title: "Unike besøkende",
      value: "2713",
      percentage: 12,
    },
    {
      title: "Antall bygget tomt teller",
      value: counts.constructedPlot,
      percentage: 10,
      path: "/constructed-plot",
    },
  ];
  return (
    <>
      {loading && <Spinner />}

      <div className="px-6 pt-6 pb-16 flex flex-col gap-6">
        <h1 className="text-darkBlack font-medium text-[30px]">
          Velkommen tilbake, André
        </h1>
        <div className="flex items-center justify-between">
          <div className="shadow-shadow1 border border-gray1 rounded-[8px] flex">
            <div className="py-[10px] px-4 text-black2 font-medium text-sm">
              12 måneder
            </div>
            <div className="py-[10px] px-4 text-black2 font-medium text-sm border border-t-0 border-b-0 border-gray1">
              30 dager
            </div>
            <div className="py-[10px] px-4 text-black2 font-medium text-sm border-r border-gray1">
              7 dager
            </div>
            <div className="py-[10px] px-4 text-black2 font-medium text-sm">
              24 timer
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <DatePickerComponent
              selectedDate={selectedDate1}
              onDateChange={setSelectedDate1}
              dateFormat="MM/dd/yyyy"
              placeholderText="Select dates"
              className="border border-gray1 rounded-[8px] flex gap-2 items-center py-[10px] px-4 cursor-pointer shadow-shadow1 h-[40px] w-max"
            />
            <div className="border border-gray1 rounded-[8px] flex gap-2 items-center py-[10px] px-4 cursor-pointer shadow-shadow1 h-[40px]">
              <img src={Ic_filter} alt="" />
              <span className="text-black font-medium text-sm">Filters</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {data.map((item, index) => {
            return (
              <div
                className={`shadow-shadow2 border border-gray2 bg-lightPurple rounded-[8px] p-6 flex flex-col gap-2 ${
                  item?.path && "cursor-pointer"
                }`}
                key={index}
                onClick={item?.path ? () => navigate(item.path) : undefined}
              >
                <div className="flex items-center gap-2 justify-between">
                  <span className="text-gray text-sm font-medium">
                    {item.title}{" "}
                    {item.title2 && (
                      <span className="text-opacity-60 text-gray">
                        {item.title2}
                      </span>
                    )}
                  </span>
                  {/* <img src={Ic_dropdown_menu} alt="menu" /> */}
                </div>
                <div className="flex items-center gap-4 justify-between">
                  <h4 className="text-darkBlack font-semibold text-[30px]">
                    {item.value}
                  </h4>
                  {/* <div className="bg-lightGreen py-[2px] px-2 rounded-[16px] flex items-center gap-1">
                    <img src={Ic_green_up_arrow} alt="arrow" />
                    <span className="text-sm font-medium text-darkGreen">
                      {item.percentage}%
                    </span>
                  </div> */}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
