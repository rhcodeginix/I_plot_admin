import { MapPin, UserRoundCheck, X } from "lucide-react";
// import { Spinner } from "../../../components/Spinner";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import ApiUtils from "../../../api";
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
import { useLocation, useNavigate } from "react-router-dom";
import { fetchAdminDataByEmail, fetchBankLeadData } from "../../../lib/utils";
import toast from "react-hot-toast";
import { Spinner } from "../../../components/Spinner";

const formSchema = z.object({
  plot: z.object({
    address: z.string().min(1, "Adresse er påkrevd"),
    Kommunenummer: z.string().min(1, "Kommunenummer er påkrevd"),
    Gårdsnummer: z.string().min(1, "Gårdsnummer er påkrevd"),
    Bruksnummer: z.string().min(1, "Bruksnummer er påkrevd"),
    Seksjonsnummer: z.string().optional(),
    Festenummer: z.string().optional(),
    alreadyHavePlot: z.string().optional(),
    Kommentar: z.string().min(1, {
      message: "Kommentar til banken må bestå av minst 1 tegn.",
    }),
  }),
  house: z.object({
    housemodell: z
      .string()
      .min(1, { message: "Housemodell must må spesifiseres." }),
    Kommentar: z.string().min(1, {
      message: "Kommentar til banken må bestå av minst 1 tegn.",
    }),
  }),
});

export const PlotHusmodell: React.FC<{
  setActiveTab: any;
}> = ({ setActiveTab }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  const [loading, setLoading] = useState(true);
  const form = useForm<any>({
    resolver: zodResolver(formSchema),
  });

  const [addressData, setAddressData] = useState<any>(null);
  const [showAddressDropdown, setShowAddressDropdown] = useState(true);

  const handleKartInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    if (value) {
      try {
        const response = await ApiUtils.getAddress(value);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        setAddressData(json.adresser);
      } catch (error: any) {
        console.error(error?.message);
      }
    }
  };
  const selectedPlotType = form.watch("plot.alreadyHavePlot");

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const docRef = doc(db, "bank_leads", String(id));

      const BankData = {
        ...data,
        id: id,
      };
      const formatDate = (date: Date) => {
        return date
          .toLocaleString("sv-SE", { timeZone: "UTC" })
          .replace(",", "");
      };
      await updateDoc(docRef, {
        plotHusmodell: BankData,
        updatedAt: formatDate(new Date()),
      });
      toast.success("Updated successfully", { position: "top-right" });

      navigate(`/edit-bank-leads/${id}`);
      setActiveTab(2);
    } catch (error) {
      console.error("Firestore operation failed:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
      });
    }
  };

  const email = sessionStorage.getItem("Iplot_admin");
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
      setLoading(false);
      return;
    }

    const getData = async () => {
      const data = await fetchBankLeadData(id);

      if (data && data.plotHusmodell) {
        Object.entries(data.plotHusmodell).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            form.setValue(key as any, value);
          }
        });
      }

      setLoading(false);
    };

    getData();
  }, [form, id, house]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <div
            className="mx-10 rounded-lg"
            style={{
              boxShadow: "0px 1px 2px 0px #1018280F, 0px 1px 3px 0px #1018281A",
            }}
          >
            <div className="py-4 px-5 flex items-center gap-3 border-b border-[#E8E8E8]">
              <UserRoundCheck />
              <span className="text-lg font-semibold">
                Registrering av prosjekt
              </span>
            </div>
            <div className="bg-[#F6F4F2] py-3 px-5 text-sm font-semibold">
              Informasjon om <span className="font-extrabold">tomten:</span>
            </div>
            <div className="p-6 mb-6 z-40 relative">
              <div className="flex flex-col gap-6">
                <div className="flex gap-6">
                  <div className="w-[35%]">
                    <FormField
                      control={form.control}
                      name="plot.address"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <p
                            className={`${
                              fieldState.error ? "text-red" : "text-black"
                            } mb-[6px] text-sm font-medium`}
                          >
                            Adresse for prosjektet
                          </p>
                          <FormControl>
                            <div className="relative">
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="Skriv inn Adresse for prosjektet"
                                  {...field}
                                  className={`bg-white truncate pr-10 rounded-[8px] border text-black
                                          ${
                                            fieldState?.error
                                              ? "border-red"
                                              : "border-gray1"
                                          } `}
                                  type="text"
                                  onChange={(e: any) => {
                                    setShowAddressDropdown(true);
                                    handleKartInputChange(e);
                                    field.onChange(e.target.value);
                                  }}
                                  autoComplete="off"
                                />
                                {field.value && (
                                  <X
                                    onClick={() => {
                                      form.setValue("plot.address", "");
                                      form.setValue("plot.Kommunenummer", "");
                                      form.setValue("plot.Gårdsnummer", "");
                                      form.setValue("plot.Bruksnummer", "");
                                      form.setValue("plot.Seksjonsnummer", "");
                                      form.setValue("plot.Festenummer", "");
                                      setAddressData(null);
                                    }}
                                    className="cursor-pointer text-primary absolute top-3 w-5 h-5 right-2"
                                  />
                                )}
                              </div>

                              {(field.value || addressData) &&
                                showAddressDropdown &&
                                addressData?.length > 0 && (
                                  <div
                                    className="absolute top-auto left-0 bg-white rounded-[8px] py-[12px] p-2.5 desktop:px-3 w-full h-auto max-h-[400px] overflow-y-auto overFlowYAuto"
                                    style={{
                                      zIndex: 999,
                                      boxShadow:
                                        "rgba(16, 24, 40, 0.09) 0px 4px 6px -2px, rgba(16, 24, 40, 0.09) 0px 12px 16px -4px",
                                    }}
                                  >
                                    {addressData?.map(
                                      (address: any, index: number) => (
                                        <div
                                          className="p-2 desktop:p-3 flex items-center gap-2.5 desktop:gap-4 hover:bg-lightPurple cursor-pointer"
                                          key={index}
                                          onClick={() => {
                                            const formatted = `${address.adressetekst} ${address.postnummer} ${address.poststed}`;
                                            const fields = {
                                              "plot.address": formatted,
                                              "plot.Kommunenummer":
                                                address.kommunenummer,
                                              "plot.Gårdsnummer":
                                                address.gardsnummer,
                                              "plot.Bruksnummer":
                                                address.bruksnummer,
                                              "plot.Seksjonsnummer":
                                                address.bokstav,
                                              "plot.Festenummer":
                                                address.festenummer,
                                            };

                                            Object.entries(fields).forEach(
                                              ([key, value]) => {
                                                form.setValue(key, `${value}`);
                                              }
                                            );

                                            setShowAddressDropdown(false);
                                          }}
                                        >
                                          <MapPin />
                                          <div>
                                            <span className="text-gray text-sm font-medium">
                                              Adresse:
                                            </span>{" "}
                                            <span className="text-black font-medium text-base">
                                              {`${address.adressetekst}  ${address.postnummer} ${address.poststed}` ||
                                                "N/A"}
                                            </span>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-[13%]">
                    <FormField
                      control={form.control}
                      name="plot.Kommunenummer"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <p
                            className={`${
                              fieldState.error ? "text-red" : "text-black"
                            } mb-[6px] text-sm font-medium`}
                          >
                            Kommunenummer
                          </p>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Skriv inn Kommunenummer"
                                {...field}
                                className={`bg-white rounded-[8px] border text-black
                                          ${
                                            fieldState?.error
                                              ? "border-red"
                                              : "border-gray1"
                                          } `}
                                type="text"
                                disable={field.value ? true : false}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-[13%]">
                    <FormField
                      control={form.control}
                      name="plot.Gårdsnummer"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <p
                            className={`${
                              fieldState.error ? "text-red" : "text-black"
                            } mb-[6px] text-sm font-medium`}
                          >
                            Gårdsnummer
                          </p>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Skriv inn Gårdsnummer"
                                {...field}
                                className={`bg-white rounded-[8px] border text-black
                                          ${
                                            fieldState?.error
                                              ? "border-red"
                                              : "border-gray1"
                                          } `}
                                type="text"
                                disable={field.value ? true : false}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-[13%]">
                    <FormField
                      control={form.control}
                      name="plot.Bruksnummer"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <p
                            className={`${
                              fieldState.error ? "text-red" : "text-black"
                            } mb-[6px] text-sm font-medium`}
                          >
                            Bruksnummer
                          </p>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Skriv inn Bruksnummer"
                                {...field}
                                className={`bg-white rounded-[8px] border text-black
                                          ${
                                            fieldState?.error
                                              ? "border-red"
                                              : "border-gray1"
                                          } `}
                                type="text"
                                disable={field.value ? true : false}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-[13%]">
                    <FormField
                      control={form.control}
                      name="plot.Seksjonsnummer"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <p
                            className={`${
                              fieldState.error ? "text-red" : "text-black"
                            } mb-[6px] text-sm font-medium`}
                          >
                            Seksjonsnummer
                          </p>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Skriv inn Seksjonsnummer"
                                {...field}
                                className={`bg-white rounded-[8px] border text-black
                                          ${
                                            fieldState?.error
                                              ? "border-red"
                                              : "border-gray1"
                                          } `}
                                type="text"
                                disable={field.value ? true : false}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-[13%]">
                    <FormField
                      control={form.control}
                      name="plot.Festenummer"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <p
                            className={`${
                              fieldState.error ? "text-red" : "text-black"
                            } mb-[6px] text-sm font-medium`}
                          >
                            Festenummer
                          </p>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Skriv inn Festenummer"
                                {...field}
                                className={`bg-white rounded-[8px] border text-black
                                          ${
                                            fieldState?.error
                                              ? "border-red"
                                              : "border-gray1"
                                          } `}
                                type="text"
                                disable={field.value ? true : false}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <p className={`font-semibold`}>
                    Eier kunden tomten allerede?
                  </p>
                  <div className="flex gap-4 items-center">
                    {[
                      {
                        label: "Ja",
                        value: "Ja",
                      },
                      {
                        label: "Nei",
                        value: "Nei",
                      },
                    ].map((item: any, index: number) => (
                      <div
                        key={index}
                        onClick={() => {
                          form.setValue("plot.alreadyHavePlot", item.value);
                        }}
                        className={`border-2 rounded-lg p-[10px] w-[106px] cursor-pointer ${
                          selectedPlotType === item.value
                            ? "border-[#002776]"
                            : "border-transparent"
                        }`}
                        style={{
                          boxShadow:
                            selectedPlotType === item.value
                              ? ""
                              : "0px 1px 4px 0px #27201D26",
                        }}
                      >
                        <div
                          className={`${
                            selectedPlotType === item.value
                              ? "font-medium"
                              : "text-[#4D4D4D] font-normal"
                          } text-sm text-center font-medium`}
                        >
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-[65%]">
                    <FormField
                      control={form.control}
                      name="plot.Kommentar"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <p
                            className={`${
                              fieldState.error ? "text-red" : "text-black"
                            } mb-[6px] text-sm font-medium`}
                          >
                            Kommentar til banken:
                          </p>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Skriv her..."
                                {...field}
                                className={`bg-white rounded-[8px] border text-black
                                          ${
                                            fieldState?.error
                                              ? "border-red"
                                              : "border-gray1"
                                          } `}
                                type="text"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="border-t border-[#D1D1D1] w-full"></div>
                <div className="bg-[#F6F4F2] py-3 px-5 text-sm font-semibold">
                  Informasjon om{" "}
                  <span className="font-extrabold">husmodellen:</span>
                </div>
                <div className="flex gap-6">
                  <div className="w-[35%]">
                    <FormField
                      control={form.control}
                      name="house.housemodell"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <p
                            className={`${
                              fieldState.error ? "text-red" : "text-black"
                            } mb-[6px] text-sm font-medium`}
                          >
                            Velg husmodell
                          </p>
                          <FormControl>
                            <div className="relative">
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                }}
                                value={field.value}
                              >
                                <SelectTrigger
                                  className={`bg-white rounded-[8px] border text-black
                              ${
                                fieldState?.error
                                  ? "border-red"
                                  : "border-gray1"
                              } `}
                                >
                                  <SelectValue placeholder="Velg husmodell" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  <SelectGroup>
                                    {house && house.length > 0 ? (
                                      house?.map(
                                        (house: any, index: number) => {
                                          return (
                                            <SelectItem
                                              value={house?.id}
                                              key={index}
                                            >
                                              {
                                                house?.Husdetaljer
                                                  ?.husmodell_name
                                              }
                                            </SelectItem>
                                          );
                                        }
                                      )
                                    ) : (
                                      <>Ingen hus funnet!</>
                                    )}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-[65%]"></div>
                </div>
                <div className="flex gap-6">
                  <div className="w-[65%]">
                    <FormField
                      control={form.control}
                      name="house.Kommentar"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <p
                            className={`${
                              fieldState.error ? "text-red" : "text-black"
                            } mb-[6px] text-sm font-medium`}
                          >
                            Kommentar til banken:
                          </p>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Skriv her..."
                                {...field}
                                className={`bg-white rounded-[8px] border text-black
                                          ${
                                            fieldState?.error
                                              ? "border-red"
                                              : "border-gray1"
                                          } `}
                                type="text"
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
            <div onClick={() => setActiveTab(0)} className="w-1/2 sm:w-auto">
              <Button
                text="Tilbake"
                className="border border-gray2 text-black text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
              />
            </div>
            <div id="submit">
              <Button
                text="Lagre"
                className="border border-purple bg-purple text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                type="submit"
              />
            </div>
          </div>
          {loading && <Spinner />}
        </form>
      </Form>
    </>
  );
};
