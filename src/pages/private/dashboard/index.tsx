/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
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

export const Dashboard = () => {
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

      if (email === "andre.finger@gmail.com" || role === "Admin") {
        leadTrue = query(collection(db, "leads"), where("Isopt", "==", true));
        leadFalse = query(collection(db, "leads"), where("Isopt", "==", false));
        leadBankTrue = query(
          collection(db, "leads"),
          where("IsoptForBank", "==", true)
        );
        suppliers = query(collection(db, "suppliers"));
      } else {
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
    ...(email === "andre.finger@gmail.com" || role === "Admin"
      ? [
          {
            title: "Antall brukere",
            value: counts.users,
            percentage: 10,
            path: "/users",
          },
        ]
      : []),
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
  ];
  return (
    <>
      <div className="px-4 md:px-6 pt-6 pb-16 flex flex-col gap-6">
        <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
          Velkommen tilbake, {name}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5 desktop:gap-6">
          {loading ? (
            <>
              {(email === "andre.finger@gmail.com" || role === "Admin") && (
                <div
                  className="w-full h-[125px] rounded-md custom-shimmer"
                  style={{ borderRadius: "8px" }}
                ></div>
              )}
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
                    className={`shadow-shadow2 border border-gray2 bg-lightGreen rounded-[8px] p-3.5 sm:p-4 lg:p-6 flex flex-col gap-2 ${
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
