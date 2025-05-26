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

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const docRef = doc(db, "bank_leads", String(id));

      // const BankData = {
      //   ...data,
      //   id: id,
      // };
      const addStatus = (section: any) => ({
        ...section,
        status: "Unpaid",
      });

      const BankData = {
        Byggekontrakt: addStatus(data.Byggekontrakt),
        Grunnarbeider: addStatus(data.Grunnarbeider),
        Betongarbeid: addStatus(data.Betongarbeid),
        LeveringByggesett: addStatus(data.LeveringByggesett),
        TettBygg: addStatus(data.TettBygg),
        FerdigUte: addStatus(data.FerdigUte),
        FerdigInne: addStatus(data.FerdigInne),
        Forhåndsbefaring: addStatus(data.Forhåndsbefaring),
        Overtakelse: addStatus(data.Overtakelse),
        id,
      };
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
  const [permission, setPermission] = useState<any>(null);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();
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
      if (email === "andre.finger@gmail.com") {
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

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <div
            className="mx-10 rounded-lg mb-10"
            style={{
              boxShadow: "0px 1px 2px 0px #1018280F, 0px 1px 3px 0px #1018281A",
            }}
          >
            <div className="py-4 px-5 border-b border-[#E8E8E8]">
              <span className="text-xl font-semibold">
                Fremdrifts- og faktureringsplan
              </span>
              <p className="text-[#5D6B98] font-bold text-sm mt-2">
                Her legge du inn forventet tidsbruk i antall dager{" "}
                <span className="font-normal">
                  (medregnet helger og helligdager)
                </span>
              </p>
            </div>

            <div className="p-5 flex flex-col gap-5">
              <div className="flex flex-col gap-4">
                <h4 className="font-medium text-lg text-black">
                  Step 1: <span className="font-bold">Byggekontrakt</span>
                </h4>
                <div className="grid grid-cols-4 gap-5">
                  <div>
                    <FormField
                      control={form.control}
                      name={`Byggekontrakt.date`}
                      render={({ field, fieldState }: any) => (
                        <FormItem>
                          <p
                            className={`${
                              fieldState.error ? "text-red" : ""
                            } mb-[6px] text-sm`}
                          >
                            Forventet oppstart
                          </p>
                          <FormControl>
                            <div className="relative">
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
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name={`Byggekontrakt.day`}
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
                            <div className="relative">
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name={`Byggekontrakt.pris`}
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
                            <div className="relative">
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-medium text-lg text-black">
                  Step 2: <span className="font-bold">Grunnarbeider</span>
                </h4>
                <div className="grid grid-cols-4 gap-5">
                  <div>
                    <FormField
                      control={form.control}
                      name={`Grunnarbeider.date`}
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
                            <div className="relative">
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
                                disable
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name={`Grunnarbeider.day`}
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
                            <div className="relative">
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name={`Grunnarbeider.pris`}
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
                            <div className="relative">
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-medium text-lg text-black">
                  Step 3: <span className="font-bold">Betongarbeid</span>
                </h4>
                <div className="grid grid-cols-4 gap-5">
                  <div>
                    <FormField
                      control={form.control}
                      name={`Betongarbeid.date`}
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
                            <div className="relative">
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
                                disable
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name={`Betongarbeid.day`}
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
                            <div className="relative">
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name={`Betongarbeid.pris`}
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
                            <div className="relative">
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-medium text-lg text-black">
                  Step 4: <span className="font-bold">Levering byggesett</span>
                </h4>
                <div className="grid grid-cols-4 gap-5">
                  <div>
                    <FormField
                      control={form.control}
                      name={`LeveringByggesett.date`}
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
                            <div className="relative">
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
                                disable
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name={`LeveringByggesett.day`}
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
                            <div className="relative">
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name={`LeveringByggesett.pris`}
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
                            <div className="relative">
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-medium text-lg text-black">
                  Step 5: <span className="font-bold">Tett bygg</span>
                </h4>
                <div className="grid grid-cols-4 gap-5">
                  <div>
                    <FormField
                      control={form.control}
                      name={`TettBygg.date`}
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
                            <div className="relative">
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
                                disable
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name={`TettBygg.day`}
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
                            <div className="relative">
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name={`TettBygg.pris`}
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
                            <div className="relative">
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-medium text-lg text-black">
                  Step 6: <span className="font-bold">Ferdig ute</span>
                </h4>
                <div className="grid grid-cols-4 gap-5">
                  <div>
                    <FormField
                      control={form.control}
                      name={`FerdigUte.date`}
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
                            <div className="relative">
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
                                disable
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name={`FerdigUte.day`}
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
                            <div className="relative">
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name={`FerdigUte.pris`}
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
                            <div className="relative">
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-medium text-lg text-black">
                  Step 7: <span className="font-bold">Ferdig inne</span>
                </h4>
                <div className="grid grid-cols-4 gap-5">
                  <div>
                    <FormField
                      control={form.control}
                      name={`FerdigInne.date`}
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
                            <div className="relative">
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
                                disable
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name={`FerdigInne.day`}
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
                            <div className="relative">
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name={`FerdigInne.pris`}
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
                            <div className="relative">
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-medium text-lg text-black">
                  Step 8: <span className="font-bold">Forhåndsbefaring</span>
                </h4>
                <div className="grid grid-cols-4 gap-5">
                  <div>
                    <FormField
                      control={form.control}
                      name={`Forhåndsbefaring.date`}
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
                            <div className="relative">
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
                                disable
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name={`Forhåndsbefaring.day`}
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
                            <div className="relative">
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name={`Forhåndsbefaring.pris`}
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
                            <div className="relative">
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-medium text-lg text-black">
                  Step 9: <span className="font-bold">Overtakelse</span>
                </h4>
                <div className="grid grid-cols-4 gap-5">
                  <div>
                    <FormField
                      control={form.control}
                      name={`Overtakelse.date`}
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
                            <div className="relative">
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
                                disable
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name={`Overtakelse.day`}
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
                            <div className="relative">
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name={`Overtakelse.pris`}
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
                            <div className="relative">
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end w-full gap-5 items-center sticky bottom-0 bg-white z-50 border-t border-gray2 p-4 left-0">
            <div onClick={() => setActiveTab(1)} >
              <Button
                text="Tilbake"
                className="border border-gray2 text-black text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
              />
            </div>
            <div id="submit">
              <Button
                text="Neste"
                className="border border-purple bg-purple text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                type="submit"
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};
