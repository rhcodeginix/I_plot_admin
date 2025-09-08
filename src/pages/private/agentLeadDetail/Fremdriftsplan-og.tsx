import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../../components/ui/form";
import Button from "../../../components/common/button";
import { Input } from "../../../components/ui/input";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { useLocation } from "react-router-dom";
import { fetchAdminDataByEmail, fetchBankLeadData } from "../../../lib/utils";
import toast from "react-hot-toast";

const sectionSchema = z.object({
  date: z.string().min(1, "Forventet oppstart er påkrevd"),
  day: z.string().min(1, "Antatt antall dager til å fullføre er påkrevd"),
  pris: z.string().min(1, "Utbetaling ihht. faktureringsplan er påkrevd"),
});

const formSchema = z.object({
  Byggekontrakt: sectionSchema,
  Grunnarbeider: sectionSchema,
  Betongarbeid: sectionSchema,
  LeveringByggesett: sectionSchema,
  TettBygg: sectionSchema,
  FerdigUte: sectionSchema,
  FerdigInne: sectionSchema,
  Forhåndsbefaring: sectionSchema,
  Overtakelse: sectionSchema,
});

export type FremdriftsplanHandle = {
  validateForm: () => Promise<boolean>;
};

export const FremdriftsplanOg: React.FC<{
  setActiveTab: any;
  getData: any;
}> = ({ setActiveTab, getData }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  const form = useForm<any>({
    resolver: zodResolver(formSchema),
  });
  const [stepOrder, setStepOrder] = useState([
    "Byggekontrakt",
    "Grunnarbeider",
    "Betongarbeid",
    "LeveringByggesett",
    "TettBygg",
    "FerdigUte",
    "FerdigInne",
    "Forhåndsbefaring",
    "Overtakelse",
  ]);

  const onSubmit = async (data: any) => {
    try {
      const docRef = doc(db, "bank_leads", String(id));

      // const addStatus = (section: any) => ({
      const addStatus = (section: any, index: number) => ({
        ...section,
        status: "Unpaid",
        order: index,
      });

      // const BankData = {
      //   Byggekontrakt: addStatus(data.Byggekontrakt),
      //   Grunnarbeider: addStatus(data.Grunnarbeider),
      //   Betongarbeid: addStatus(data.Betongarbeid),
      //   LeveringByggesett: addStatus(data.LeveringByggesett),
      //   TettBygg: addStatus(data.TettBygg),
      //   FerdigUte: addStatus(data.FerdigUte),
      //   FerdigInne: addStatus(data.FerdigInne),
      //   Forhåndsbefaring: addStatus(data.Forhåndsbefaring),
      //   Overtakelse: addStatus(data.Overtakelse),
      //   id,
      // };
      const BankData: any = { id };

      stepOrder.forEach((stepName, index) => {
        BankData[stepName] = addStatus(data[stepName], index);
      });
      const formatDate = (date: Date) => {
        return date
          .toLocaleString("sv-SE", { timeZone: "UTC" })
          .replace(",", "");
      };

      await updateDoc(docRef, {
        Fremdriftsplan: BankData,
        updatedAt: formatDate(new Date()),
      });
      toast.success("Lagret", { position: "top-right" });

      setActiveTab(3);
      getData();
    } catch (error) {
      console.error("Firestore operation failed:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
      });
    }
  };

  const email = localStorage.getItem("Iplot_admin");
  const [role, setRole] = useState<any>(null);
  const [permission, setPermission] = useState<any>(null);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();
      if (data?.role) {
        setRole(data?.role);
      }
      if (data && data?.supplier) {
        const finalData = data?.supplier;
        setPermission(finalData);
      } else {
        setPermission(null);
      }
    };

    getData();
  }, [permission]);

  const [house, setHouse] = useState([]);

  const fetchHusmodellData = async () => {
    try {
      let q;
      if (email === "andre.finger@gmail.com" || role === "Admin") {
        q = query(collection(db, "house_model"), orderBy("updatedAt", "desc"));
      } else {
        if (permission || permission !== null) {
          q = query(
            collection(db, "house_model"),
            where("Husdetaljer.Leverandører", "==", permission)
          );
        } else {
          q = query(
            collection(db, "house_model"),
            orderBy("updatedAt", "desc")
          );
        }
      }

      const querySnapshot = await getDocs(q);

      const data: any = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHouse(data);
    } catch (error) {
      console.error("Error fetching husmodell data:", error);
    }
  };

  useEffect(() => {
    fetchHusmodellData();
  }, [permission]);

  useEffect(() => {
    if (!id) {
      return;
    }

    const getData = async () => {
      const data = await fetchBankLeadData(id);

      if (data && data.Fremdriftsplan) {
        Object.entries(data.Fremdriftsplan).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            form.setValue(key as any, value);
          }
        });
      }
    };

    getData();
  }, [form, id, house]);

  useEffect(() => {
    const steps = [
      "Byggekontrakt",
      "Grunnarbeider",
      "Betongarbeid",
      "LeveringByggesett",
      "TettBygg",
      "FerdigUte",
      "FerdigInne",
      "Forhåndsbefaring",
      "Overtakelse",
    ];

    const subscription = form.watch((value, { name }) => {
      for (let i = 0; i < steps.length - 1; i++) {
        const current = steps[i];
        const next = steps[i + 1];

        const currentDate = value?.[current]?.date;
        const currentDay = value?.[current]?.day;
        const nextDate = value?.[next]?.date;

        const shouldUpdate =
          currentDate && currentDay && (!nextDate || name?.includes(current));

        if (shouldUpdate) {
          const startDate = new Date(currentDate);
          const daysToAdd = parseInt(currentDay, 10);

          if (!isNaN(startDate.getTime()) && !isNaN(daysToAdd)) {
            const newDate = new Date(startDate);
            newDate.setDate(startDate.getDate() + daysToAdd);
            const formattedDate = newDate.toISOString().split("T")[0];

            form.setValue(`${next}.date`, formattedDate);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("dragIndex", index.toString());
  };

  // const handleDrop = (e: React.DragEvent, dropIndex: number) => {
  //   e.preventDefault();
  //   const dragIndex = Number(e.dataTransfer.getData("dragIndex"));
  //   if (dragIndex === dropIndex) return;

  //   const newOrder = [...stepOrder];
  //   const [moved] = newOrder.splice(dragIndex, 1);
  //   newOrder.splice(dropIndex, 0, moved);
  //   setStepOrder(newOrder);
  // };
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = Number(e.dataTransfer.getData("dragIndex"));
    if (dragIndex === dropIndex) return;

    const newOrder = [...stepOrder];
    const temp = newOrder[dragIndex];
    newOrder[dragIndex] = newOrder[dropIndex];
    newOrder[dropIndex] = temp;

    setStepOrder(newOrder);
  };

  const allowDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <div
            className="mx-4 md:mx-6 lg:mx-10 rounded-lg mb-10"
            style={{
              boxShadow: "0px 1px 2px 0px #1018280F, 0px 1px 3px 0px #1018281A",
            }}
          >
            <div className="py-3 md:py-4 px-3 md:px-5 border-b border-[#E8E8E8]">
              <span className="text-base desktop:text-xl font-semibold">
                Fremdrifts- og faktureringsplan
              </span>
              <p className="text-[#5D6B98] font-bold text-xs md:text-sm mt-1 md:mt-2">
                Her legge du inn forventet tidsbruk i antall dager{" "}
                <span className="font-normal">
                  (medregnet helger og helligdager)
                </span>
              </p>
            </div>

            <div className="p-3 md:p-5 flex flex-col gap-3 md:gap-5">
              {stepOrder.map((stepName, index) => (
                <div
                  key={stepName}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={allowDrop}
                  onDrop={(e) => handleDrop(e, index)}
                  className="flex flex-col gap-3 md:gap-4 cursor-move"
                >
                  <h4 className="font-medium text-sm md:text-base desktop:text-lg text-black">
                    Step {index + 1}:{" "}
                    <span className="font-bold">{stepName}</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 desktop:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
                    <FormField
                      control={form.control}
                      name={`${stepName}.date`}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <p
                            className={`${
                              fieldState.error ? "text-red" : ""
                            } mb-[6px] text-sm`}
                          >
                            Forventet oppstart
                          </p>
                          <FormControl>
                            <Input
                              placeholder="Skriv inn Forventet oppstart"
                              {...field}
                              className={`bg-white rounded-[8px] border text-black
                                          ${
                                            fieldState?.error
                                              ? "border-red"
                                              : "border-gray1"
                                          } `}
                              type="date"
                              disable={index === 0 ? false : true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`${stepName}.day`}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <p
                            className={`${
                              fieldState.error ? "text-red" : ""
                            } mb-[6px] text-sm`}
                          >
                            Antatt antall dager til å fullføre
                          </p>
                          <FormControl>
                            <Input
                              placeholder="Skriv inn Antatt antall dager til å fullføre"
                              {...field}
                              className={`bg-white rounded-[8px] border text-black
                                          ${
                                            fieldState?.error
                                              ? "border-red"
                                              : "border-gray1"
                                          } `}
                              type="number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`${stepName}.pris`}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <p
                            className={`${
                              fieldState.error ? "text-red" : ""
                            } mb-[6px] text-sm`}
                          >
                            Utbetaling ihht. faktureringsplan
                          </p>
                          <FormControl>
                            <Input
                              placeholder="Skriv inn Utbetaling ihht. faktureringsplan"
                              {...field}
                              className={`bg-white rounded-[8px] border text-black
                                  ${
                                    fieldState?.error
                                      ? "border-red"
                                      : "border-gray1"
                                  } `}
                              inputMode="numeric"
                              type="text"
                              onChange={({ target: { value } }: any) =>
                                field.onChange({
                                  target: {
                                    name: `pris`,
                                    value: value.replace(/\D/g, "")
                                      ? new Intl.NumberFormat("no-NO").format(
                                          Number(value.replace(/\D/g, ""))
                                        )
                                      : "",
                                  },
                                })
                              }
                              value={field.value === null ? "-" : field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end w-full gap-5 items-center sticky bottom-0 bg-white z-50 border-t border-gray2 p-4 left-0">
            <div onClick={() => setActiveTab(1)}>
              <Button
                text="Tilbake"
                className="border border-gray2 text-black text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
              />
            </div>
            <div id="submit">
              <Button
                text="Neste"
                className="border border-primary bg-primary text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                type="submit"
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};
