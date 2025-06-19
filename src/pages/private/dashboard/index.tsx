// /* eslint-disable react-hooks/exhaustive-deps */
// import { useEffect, useState } from "react";
// import DatePickerComponent from "../../../components/ui/datepicker";
// import {
//   Timestamp,
//   collection,
//   getCountFromServer,
//   getDocs,
//   query,
//   where,
// } from "firebase/firestore";
// import { db } from "../../../config/firebaseConfig";
// import { useNavigate } from "react-router-dom";
// import { fetchAdminDataByEmail } from "../../../lib/utils";
// // import { signInAnonymously } from "firebase/auth";

// export const Dashboard = () => {
//   const [selectedDate1, setSelectedDate1] = useState<Date | null>(null);
//   const [counts, setCounts] = useState({
//     users: 0,
//     husmodell: 0,
//     plot: 0,
//     householdLeads: 0,
//     kombinasjoner: 0,
//     constructedPlot: 0,
//     bankLeads: 0,
//     supplier: 0,
//   });
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const email = localStorage.getItem("Iplot_admin");
//   const [permission, setPermission] = useState<any>(null);
//   const [selectedRange, setSelectedRange] = useState("");
//   // useEffect(() => {
//   //   const getToken = async () => {
//   //     try {
//   //       const result = await signInAnonymously(auth);
//   //       const token = await result.user.getIdToken();

//   //       console.log("Firebase Token:", token);
//   //     } catch (error) {
//   //       console.error("Error signing in anonymously:", error);
//   //     }
//   //   };

//   //   getToken();
//   // }, []);

//   const [supp, setSupp] = useState<any>(null);
//   const [role, setRole] = useState<any>(null);
//   const [name, setName] = useState<any>(null);

//   useEffect(() => {
//     const getData = async () => {
//       const data = await fetchAdminDataByEmail();
//       if (data) {
//         if (data?.role) {
//           setRole(data?.role);
//         }
//         if (data?.supplier) {
//           setSupp(data?.supplier);
//         }
//         setName(data?.f_name ? `${data?.f_name} ${data?.l_name}` : data?.name);

//         const finalData = data?.modulePermissions?.find(
//           (item: any) => item.name === "Husmodell"
//         );
//         setPermission(finalData?.permissions);
//       }
//     };

//     getData();
//   }, []);

//   useEffect(() => {
//     const getData = async () => {
//       const data = await fetchAdminDataByEmail();
//       if (data) {
//         const finalData = data?.supplier;
//         setPermission(finalData);
//       }
//     };

//     getData();
//   }, [permission]);

//   const fetchSuppliersData = async () => {
//     const excludedEmails = [
//       "drashti.doubledotts@gmail.com",
//       "abc@gmail.com",
//       "keren@arnhoff.no",
//       "simen@askerhaandverk.no",
//       "ole@nestegg.no",
//       "fenger@iplot.no",
//       "drashtisavani22@gmail.com",
//       "rudraksh.shukla98@gmail.com",
//       "tanmaymundra01@gmail.com",
//     ];
//     let fromTimestamp: any = null;

//     if (selectedRange) {
//       const now = new Date();
//       let fromDate: Date | null;

//       switch (selectedRange) {
//         case "30d":
//           fromDate = new Date(now.setDate(now.getDate() - 30));
//           break;
//         case "7d":
//           fromDate = new Date(now.setDate(now.getDate() - 7));
//           break;
//         case "24h":
//           fromDate = new Date(now.setHours(now.getHours() - 24));
//           break;
//         case "12m":
//           fromDate = new Date(now.setFullYear(now.getFullYear() - 1));
//           break;
//         default:
//           fromDate = null;
//       }

//       if (fromDate) {
//         fromTimestamp = Timestamp.fromDate(fromDate);
//       }
//     }

//     try {
//       setLoading(true);
//       let q;
//       let leadTrue;
//       let leadFalse;
//       let leadBankTrue;
//       let suppliers;

//       if (role === "Agent") {
//         q = query(
//           collection(db, "house_model"),
//           where("Husdetaljer.Leverandører", "==", supp)
//         );
//       } else {
//         q = query(collection(db, "house_model"));
//       }

//       if (email === "andre.finger@gmail.com") {
//         // q = query(collection(db, "house_model"));
//         leadTrue = query(collection(db, "leads"), where("Isopt", "==", true));
//         leadFalse = query(collection(db, "leads"), where("Isopt", "==", false));
//         leadBankTrue = query(
//           collection(db, "leads"),
//           where("IsoptForBank", "==", true)
//         );
//         suppliers = query(collection(db, "suppliers"));
//       } else {
//         // q = query(
//         //   collection(db, "house_model"),
//         //   where("createDataBy.email", "==", email),
//         //   where("Husdetaljer.Leverandører", "==", String(permission))
//         // );
//         leadTrue = query(
//           collection(db, "leads"),
//           where("Isopt", "==", true),
//           where(
//             "finalData.husmodell.Husdetaljer.Leverandører",
//             "==",
//             String(permission)
//           )
//         );
//         leadFalse = query(
//           collection(db, "leads"),
//           where("Isopt", "==", false),
//           where(
//             "finalData.husmodell.Husdetaljer.Leverandører",
//             "==",
//             String(permission)
//           )
//         );
//         leadBankTrue = query(
//           collection(db, "leads"),
//           where("IsoptForBank", "==", true),
//           where(
//             "finalData.husmodell.Husdetaljer.Leverandører",
//             "==",
//             String(permission)
//           )
//         );
//         suppliers = query(
//           collection(db, "suppliers"),
//           where("id", "==", String(permission))
//         );
//       }

//       const [
//         usersCount,
//         husmodellCount,
//         plotCount,
//         householdLeadsCount,
//         kombinasjonerCount,
//         constructedPlotCount,
//         bankLeadsCount,
//         supplierCount,
//       ] = await Promise.all([
//         getCountFromServer(collection(db, "users")),
//         // getCountFromServer(q),
//         q,
//         getCountFromServer(collection(db, "empty_plot")),
//         leadTrue,
//         leadFalse,
//         getCountFromServer(collection(db, "plot_building")),
//         leadBankTrue,
//         getCountFromServer(suppliers),
//       ]);
//       const querySnapshot = await getDocs(kombinasjonerCount);

//       const filteredLeads = querySnapshot.docs.filter((doc) => {
//         const data = doc.data();
//         const createdAt = data?.createdAt;

//         if (excludedEmails.includes(data?.user?.email)) return false;

//         if (
//           fromTimestamp &&
//           createdAt &&
//           createdAt.toDate() < fromTimestamp.toDate()
//         ) {
//           return false;
//         }

//         return true;
//       });

//       const queryhusleadSnapshot = await getDocs(householdLeadsCount);

//       const filteredhusLeads = queryhusleadSnapshot.docs.filter(
//         // (doc) => !excludedEmails.includes(doc.data()?.user?.email)
//         (doc) => {
//           const data = doc.data();
//           const createdAt = data?.createdAt;

//           if (excludedEmails.includes(data?.user?.email)) return false;

//           if (
//             fromTimestamp &&
//             createdAt &&
//             createdAt.toDate() < fromTimestamp.toDate()
//           ) {
//             return false;
//           }

//           return true;
//         }
//       );
//       const querybankleadSnapshot = await getDocs(bankLeadsCount);

//       const filteredBankLeads = querybankleadSnapshot.docs.filter(
//         // (doc) => !excludedEmails.includes(doc.data()?.user?.email)
//         (doc) => {
//           const data = doc.data();
//           const createdAt = data?.createdAt;

//           if (excludedEmails.includes(data?.user?.email)) return false;

//           if (
//             fromTimestamp &&
//             createdAt &&
//             createdAt.toDate() < fromTimestamp.toDate()
//           ) {
//             return false;
//           }

//           return true;
//         }
//       );

//       const queryHusmodellSnapShot = await getDocs(husmodellCount);

//       const husmodellLeads = queryHusmodellSnapShot.docs.filter((doc) => {
//         const data = doc.data();
//         const createdAt = data?.createdAt;

//         if (fromTimestamp && createdAt) {
//           const createdAtDate = new Date(createdAt.replace(" ", "T"));
//           if (createdAtDate < fromTimestamp.toDate()) {
//             return false;
//           }
//         }

//         return true;
//       });

//       setCounts({
//         users: usersCount.data().count,
//         husmodell: husmodellLeads.length,
//         plot: plotCount.data().count,
//         householdLeads: filteredhusLeads.length,
//         kombinasjoner: filteredLeads.length,
//         constructedPlot: constructedPlotCount.data().count,
//         bankLeads: filteredBankLeads.length,
//         supplier: supplierCount.data().count,
//       });
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };
//   useEffect(() => {
//     fetchSuppliersData();
//   }, [permission, selectedRange]);

//   const data = [
//     // {
//     //   title: "Antall brukere",
//     //   value: counts.users,
//     //   percentage: 10,
//     //   path: "/users",
//     // },
//     {
//       title: "Antall tomter",
//       value: counts.plot,
//       percentage: 10,
//       path: "/plot",
//     },
//     {
//       title: "Antall husmodeller",
//       value: counts.husmodell,
//       percentage: 12,
//       path: "/Husmodeller",
//     },
//     {
//       title: "Antall husleads",
//       value: counts.householdLeads,
//       percentage: 12,
//       path: "/se-husleads",
//     },
//     {
//       title: "Antall bankleads",
//       value: counts.bankLeads,
//       percentage: 10,
//       path: "/se-bankleads",
//     },
//     {
//       title: "Kundesøk",
//       title2: "(tomt+hus)",
//       value: counts.kombinasjoner,
//       percentage: 10,
//       path: "/se-kombinasjoner",
//     },
//     {
//       title: "Søkte adresser",
//       value: counts.constructedPlot,
//       percentage: 10,
//       path: "/constructed-plot",
//     },
//     // {
//     //   title: "Leverandorer",
//     //   value: counts.supplier,
//     //   percentage: 10,
//     //   path: "/Leverandorer",
//     // },
//   ];
//   return (
//     <>
//       <div className="px-4 md:px-6 pt-6 pb-16 flex flex-col gap-6">
//         <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
//           Velkommen tilbake, {name}
//         </h1>
//         <div className="flex lg:items-center flex-col lg:flex-row gap-2 justify-between">
//           {/* <div className="shadow-shadow1 border border-gray1 rounded-[8px] flex w-max">
//             <div className="p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm">
//               12 måneder
//             </div>
//             <div className="p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm border border-t-0 border-b-0 border-gray1">
//               30 dager
//             </div>
//             <div className="p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm border-r border-gray1">
//               7 dager
//             </div>
//             <div className="p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm">
//               24 timer
//             </div>
//           </div> */}
//           <div className="shadow-shadow1 border border-gray1 rounded-[8px] flex w-max">
//             {[
//               { label: "12 måneder", value: "12m" },
//               { label: "30 dager", value: "30d" },
//               { label: "7 dager", value: "7d" },
//               { label: "24 timer", value: "24h" },
//             ].map(({ label, value }, index) => (
//               <div
//                 key={value}
//                 onClick={() => {
//                   setSelectedRange(value);
//                 }}
//                 className={`p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm cursor-pointer ${
//                   index !== 0 ? "border-l border-gray1" : ""
//                 } ${selectedRange === value ? "bg-primary/10" : ""}`}
//               >
//                 {label}
//               </div>
//             ))}
//           </div>

//           <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
//             <DatePickerComponent
//               selectedDate={selectedDate1}
//               onDateChange={setSelectedDate1}
//               dateFormat="MM/dd/yyyy"
//               placeholderText="Velg dato"
//               className="border border-gray1 rounded-[8px] flex gap-2 items-center py-[10px] px-4 cursor-pointer shadow-shadow1 h-[40px] w-full sm:w-max"
//             />
//           </div>
//         </div>
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5 desktop:gap-6">
//           {loading ? (
//             <>
//               {/* <div
//                 className="w-full h-[125px] rounded-md custom-shimmer"
//                 style={{ borderRadius: "8px" }}
//               ></div> */}
//               {/* <div
//                 className="w-full h-[125px] rounded-md custom-shimmer"
//                 style={{ borderRadius: "8px" }}
//               ></div> */}
//               <div
//                 className="w-full h-[125px] rounded-md custom-shimmer"
//                 style={{ borderRadius: "8px" }}
//               ></div>
//               <div
//                 className="w-full h-[125px] rounded-md custom-shimmer"
//                 style={{ borderRadius: "8px" }}
//               ></div>
//               <div
//                 className="w-full h-[125px] rounded-md custom-shimmer"
//                 style={{ borderRadius: "8px" }}
//               ></div>
//               <div
//                 className="w-full h-[125px] rounded-md custom-shimmer"
//                 style={{ borderRadius: "8px" }}
//               ></div>
//               <div
//                 className="w-full h-[125px] rounded-md custom-shimmer"
//                 style={{ borderRadius: "8px" }}
//               ></div>
//               <div
//                 className="w-full h-[125px] rounded-md custom-shimmer"
//                 style={{ borderRadius: "8px" }}
//               ></div>
//             </>
//           ) : (
//             <>
//               {data.map((item, index) => {
//                 return (
//                   <div
//                     className={`shadow-shadow2 border border-gray2 bg-lightPurple rounded-[8px] p-3.5 sm:p-4 lg:p-6 flex flex-col gap-2 ${
//                       item?.path && "cursor-pointer"
//                     }`}
//                     key={index}
//                     onClick={item?.path ? () => navigate(item.path) : undefined}
//                   >
//                     <div className="flex items-center gap-2 justify-between">
//                       <span className="text-gray text-sm font-medium">
//                         {item.title}{" "}
//                         {item.title2 && (
//                           <span className="text-opacity-60 text-gray">
//                             {item.title2}
//                           </span>
//                         )}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-4 justify-between">
//                       <h4 className="text-darkBlack font-semibold text-xl md:text-2xl desktop:text-[30px]">
//                         {item.value}
//                       </h4>
//                     </div>
//                   </div>
//                 );
//               })}
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
// import DatePickerComponent from "../../../components/ui/datepicker";
import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { fetchAdminDataByEmail } from "../../../lib/utils";
// import { signInAnonymously } from "firebase/auth";

export const Dashboard = () => {
  // const [selectedDate1, setSelectedDate1] = useState<Date | null>(null);
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

  const [supp, setSupp] = useState<any>(null);
  const [role, setRole] = useState<any>(null);
  const [name, setName] = useState<any>(null);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();
      if (data) {
        if (data?.role) {
          setRole(data?.role);
        }
        if (data?.supplier) {
          setSupp(data?.supplier);
        }
        setName(data?.f_name ? `${data?.f_name} ${data?.l_name}` : data?.name);

        const finalData = data?.modulePermissions?.find(
          (item: any) => item.name === "Husmodell"
        );
        setPermission(finalData?.permissions);
      }
    };

    getData();
  }, []);

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
    const excludedEmails = [
      "drashti.doubledotts@gmail.com",
      "abc@gmail.com",
      "keren@arnhoff.no",
      "simen@askerhaandverk.no",
      "ole@nestegg.no",
      "fenger@iplot.no",
      "drashtisavani22@gmail.com",
      "rudraksh.shukla98@gmail.com",
      "tanmaymundra01@gmail.com",
    ];

    try {
      setLoading(true);
      let q;
      let leadTrue;
      let leadFalse;
      let leadBankTrue;
      let suppliers;

      if (role === "Agent") {
        q = query(
          collection(db, "house_model"),
          where("Husdetaljer.Leverandører", "==", supp)
        );
      } else {
        q = query(collection(db, "house_model"));
      }

      if (email === "andre.finger@gmail.com") {
        // q = query(collection(db, "house_model"));
        leadTrue = query(collection(db, "leads"), where("Isopt", "==", true));
        leadFalse = query(collection(db, "leads"), where("Isopt", "==", false));
        leadBankTrue = query(
          collection(db, "leads"),
          where("IsoptForBank", "==", true)
        );
        suppliers = query(collection(db, "suppliers"));
      } else {
        // q = query(
        //   collection(db, "house_model"),
        //   where("createDataBy.email", "==", email),
        //   where("Husdetaljer.Leverandører", "==", String(permission))
        // );
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
        leadTrue,
        leadFalse,
        getCountFromServer(collection(db, "plot_building")),
        leadBankTrue,
        getCountFromServer(suppliers),
      ]);
      const querySnapshot = await getDocs(kombinasjonerCount);

      const filteredLeads = querySnapshot.docs.filter(
        (doc) => !excludedEmails.includes(doc.data()?.user?.email)
      );
      const queryhusleadSnapshot = await getDocs(householdLeadsCount);

      const filteredhusLeads = queryhusleadSnapshot.docs.filter(
        (doc) => !excludedEmails.includes(doc.data()?.user?.email)
      );
      const querybankleadSnapshot = await getDocs(bankLeadsCount);

      const filteredBankLeads = querybankleadSnapshot.docs.filter(
        (doc) => !excludedEmails.includes(doc.data()?.user?.email)
      );

      setCounts({
        users: usersCount.data().count,
        husmodell: husmodellCount.data().count,
        plot: plotCount.data().count,
        householdLeads: filteredhusLeads.length,
        kombinasjoner: filteredLeads.length,
        constructedPlot: constructedPlotCount.data().count,
        bankLeads: filteredBankLeads.length,
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
    // {
    //   title: "Antall brukere",
    //   value: counts.users,
    //   percentage: 10,
    //   path: "/users",
    // },
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
      title: "Antall leads",
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
      title: "Kundesøk",
      title2: "(tomt+hus)",
      value: counts.kombinasjoner,
      percentage: 10,
      path: "/se-kombinasjoner",
    },
    {
      title: "Søkte adresser",
      value: counts.constructedPlot,
      percentage: 10,
      path: "/constructed-plot",
    },
    // {
    //   title: "Leverandorer",
    //   value: counts.supplier,
    //   percentage: 10,
    //   path: "/Leverandorer",
    // },
  ];
  return (
    <>
      <div className="px-4 md:px-6 pt-6 pb-16 flex flex-col gap-6">
        <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
          Velkommen tilbake, {name}
        </h1>
        {/* <div className="flex lg:items-center flex-col lg:flex-row gap-2 justify-between">
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
          </div>
        </div> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5 desktop:gap-6">
          {loading ? (
            <>
              {/* <div
                className="w-full h-[125px] rounded-md custom-shimmer"
                style={{ borderRadius: "8px" }}
              ></div> */}
              {/* <div
                className="w-full h-[125px] rounded-md custom-shimmer"
                style={{ borderRadius: "8px" }}
              ></div> */}
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
