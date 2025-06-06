/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Ic_filter from "../../../assets/images/Ic_filter.svg";
import DatePickerComponent from "../../../components/ui/datepicker";
import {
  collection,
  getCountFromServer,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { fetchAdminDataByEmail } from "../../../lib/utils";
// import { signInAnonymously } from "firebase/auth";

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
    supplier: 0,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const email = localStorage.getItem("Iplot_admin");
  const [permission, setPermission] = useState<any>(null);
  // useEffect(() => {
  //   const getToken = async () => {
  //     try {
  //       const result = await signInAnonymously(auth);
  //       const token = await result.user.getIdToken();

  //       console.log("Firebase Token:", token);
  //     } catch (error) {
  //       console.error("Error signing in anonymously:", error);
  //     }
  //   };

  //   getToken();
  // }, []);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();
      if (data) {
        const finalData = data?.supplier;
        setPermission(finalData);
      }
    };

    getData();
  }, [permission]);

  const fetchSuppliersData = async () => {
    try {
      setLoading(true);
      let q;
      let leadTrue;
      let leadFalse;
      let leadBankTrue;
      let suppliers;

      if (email === "andre.finger@gmail.com") {
        q = query(collection(db, "house_model"), orderBy("updatedAt", "desc"));
        leadTrue = query(collection(db, "leads"), where("Isopt", "==", true));
        leadFalse = query(collection(db, "leads"), where("Isopt", "==", false));
        leadBankTrue = query(
          collection(db, "leads"),
          where("IsoptForBank", "==", true)
        );
        suppliers = query(collection(db, "suppliers"));
      } else {
        q = query(
          collection(db, "house_model"),
          where("createDataBy.email", "==", email),
          where("Husdetaljer.Leverandører", "==", String(permission))
        );
        leadTrue = query(
          collection(db, "leads"),
          where("Isopt", "==", true),
          where(
            "finalData.husmodell.Husdetaljer.Leverandører",
            "==",
            String(permission)
          )
        );
        leadFalse = query(
          collection(db, "leads"),
          where("Isopt", "==", false),
          where(
            "finalData.husmodell.Husdetaljer.Leverandører",
            "==",
            String(permission)
          )
        );
        leadBankTrue = query(
          collection(db, "leads"),
          where("IsoptForBank", "==", true),
          where(
            "finalData.husmodell.Husdetaljer.Leverandører",
            "==",
            String(permission)
          )
        );
        suppliers = query(
          collection(db, "suppliers"),
          where("id", "==", String(permission))
        );
      }

      const [
        usersCount,
        husmodellCount,
        plotCount,
        householdLeadsCount,
        kombinasjonerCount,
        constructedPlotCount,
        bankLeadsCount,
        supplierCount,
      ] = await Promise.all([
        getCountFromServer(collection(db, "users")),
        getCountFromServer(q),
        getCountFromServer(collection(db, "empty_plot")),
        getCountFromServer(leadTrue),
        getCountFromServer(leadFalse),
        getCountFromServer(collection(db, "plot_building")),
        getCountFromServer(leadBankTrue),
        getCountFromServer(suppliers),
      ]);

      setCounts({
        users: usersCount.data().count,
        husmodell: husmodellCount.data().count,
        plot: plotCount.data().count,
        householdLeads: householdLeadsCount.data().count,
        kombinasjoner: kombinasjonerCount.data().count,
        constructedPlot: constructedPlotCount.data().count,
        bankLeads: bankLeadsCount.data().count,
        supplier: supplierCount.data().count,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchSuppliersData();
  }, [permission]);

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
    {
      title: "Leverandorer",
      value: counts.supplier,
      percentage: 10,
      path: "/Leverandorer",
    },
  ];
  return (
    <>
      <div className="px-4 md:px-6 pt-6 pb-16 flex flex-col gap-6">
        <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
          Velkommen tilbake, André
        </h1>
        <div className="flex lg:items-center flex-col lg:flex-row gap-2 justify-between">
          <div className="shadow-shadow1 border border-gray1 rounded-[8px] flex w-max">
            <div className="p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm">
              12 måneder
            </div>
            <div className="p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm border border-t-0 border-b-0 border-gray1">
              30 dager
            </div>
            <div className="p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm border-r border-gray1">
              7 dager
            </div>
            <div className="p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm">
              24 timer
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
            <DatePickerComponent
              selectedDate={selectedDate1}
              onDateChange={setSelectedDate1}
              dateFormat="MM/dd/yyyy"
              placeholderText="Velg dato"
              className="border border-gray1 rounded-[8px] flex gap-2 items-center py-[10px] px-4 cursor-pointer shadow-shadow1 h-[40px] w-full sm:w-max"
            />
            <div className="border border-gray1 rounded-[8px] flex gap-2 items-center py-[10px] px-4 pr-8 cursor-pointer shadow-shadow1 h-[40px]">
              <img src={Ic_filter} alt="" />
              <span className="text-black font-medium text-sm">Filters</span>
            </div>
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
                        {item.title}{" "}
                        {item.title2 && (
                          <span className="text-opacity-60 text-gray">
                            {item.title2}
                          </span>
                        )}
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
