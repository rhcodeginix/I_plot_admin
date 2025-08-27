/* eslint-disable react-hooks/exhaustive-deps */
import {
  ChevronRight,
  InspectionPanel,
  Mail,
  Phone,
  Shirt,
  Video,
  Infinity,
  Presentation,
  Recycle,
  Signature,
  PhoneForwarded,
  CircleArrowRight,
  Pencil,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Ic_close from "../../../assets/images/Ic_close.svg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  convertFullStringTo24Hour,
  convertTimestamp,
  fetchAdminDataByEmail,
  fetchLeadData,
  fetchSupplierData,
  formatNorwegianPhone,
  formatTimestamp,
} from "../../../lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../../components/ui/form";
import Button from "../../../components/common/button";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import toast from "react-hot-toast";
import { LogRow } from "./logRow";
import MultiSelect from "../../../components/ui/multiSelect";
import Modal from "../../../components/common/modal";
import { AddFollowupForm } from "./addFollowUp";
import { fetchHusmodellData as singleHouseModelData } from "../../../lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { AddLogging } from "./addLogging";
import { EditProfile } from "./editProfile";

const formSchema = z.object({
  Husmodell: z
    .array(z.string().min(1, { message: "Husmodell må spesifiseres." }))
    .min(1, { message: "Minst én husmodell må velges." })
    .optional(),
  City: z
    .array(z.string().min(1, { message: "Ønsket bygget i må spesifiseres." }))
    .min(1, { message: "Minst én by må velges." })
    .optional(),
  Tildelt: z.string().min(1, { message: "Tildelt i must må spesifiseres." }),
});
export const monthMap: Record<string, string> = {
  januar: "January",
  februar: "February",
  märz: "March",
  april: "April",
  mai: "May",
  juni: "June",
  juli: "July",
  august: "August",
  september: "September",
  oktober: "October",
  november: "November",
  dezember: "December",
};
export const MyLeadsDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  const [leadData, setLeadData] = useState<any>(null);
  const email = localStorage.getItem("Iplot_admin");
  const [permission, setPermission] = useState<any>(null);
  const [role, setRole] = useState<any>(null);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();
      if (data) {
        if (data?.role) {
          setRole(data?.role);
        }
        const finalData = data?.supplier;
        setPermission(finalData);
      }
    };

    getData();
  }, [permission]);

  const getLeadData = useCallback(async () => {
    if (!id) return;

    try {
      const data = await fetchLeadData(id);
      if (data) {
        setLeadData(data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      return;
    }

    getLeadData();
  }, [getLeadData]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const [houseModels, setHouseModels] = useState([]);
  const fetchHusmodellData = async () => {
    try {
      let q;
      if (email === "andre.finger@gmail.com" || role === "Admin") {
        q = query(
          collection(db, "house_model"),
          where(
            "Husdetaljer.Leverandører",
            "==",
            "065f9498-6cdb-469b-8601-bb31114d7c95"
          )
        );
      } else {
        q = query(
          collection(db, "house_model"),
          where("Husdetaljer.Leverandører", "==", permission)
        );
      }

      const querySnapshot = await getDocs(q);

      const data: any = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHouseModels(data);
    } catch (error) {
      console.error("Error fetching husmodell data:", error);
    } finally {
    }
  };

  const [cities, setCities] = useState([]);
  const fetchCitiesData = async () => {
    try {
      let q = query(collection(db, "cities"));

      const querySnapshot = await getDocs(q);

      const data: any = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCities(data);
    } catch (error) {
      console.error("Error fetching city data:", error);
    } finally {
    }
  };
  const [supplierData, setSupplierData] = useState<any>();
  const getData = async (id: string) => {
    const data: any = await fetchSupplierData(id);
    if (data) {
      setSupplierData(data);
    }
  };
  const [SelectHistoryValue, setSelectHistoryValue] = useState("");
  useEffect(() => {
    if (leadData?.supplierId) {
      getData(leadData?.supplierId);
    }
  }, [leadData?.supplierId]);

  const [suppliers, setSuppliers] = useState([]);

  const fetchSuppliersData = async () => {
    try {
      let q;
      if (email === "andre.finger@gmail.com" || role === "Admin") {
        q = query(
          collection(db, "admin"),
          where("supplier", "==", "065f9498-6cdb-469b-8601-bb31114d7c95")
        );
      } else {
        q = query(
          collection(db, "admin"),
          where("supplier", "==", String(permission))
        );
      }

      const querySnapshot = await getDocs(q);

      const data: any = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers data:", error);
    } finally {
    }
  };

  useEffect(() => {
    fetchCitiesData();
    fetchHusmodellData();
    fetchSuppliersData();
  }, [permission]);
  useEffect(() => {
    const fetchPreferredHouse = async () => {
      if (!id) return;

      const subDocRef = doc(
        db,
        "leads_from_supplier",
        String(id),
        "preferred_house_model",
        String(id)
      );

      const subDocSnap = await getDoc(subDocRef);

      if (subDocSnap.exists()) {
        const data = subDocSnap.data();

        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null)
            form.setValue(key as any, value);
        });
      }
    };

    fetchPreferredHouse();
  }, [form, id, houseModels?.length > 0, cities.length > 0]);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const fetchPreferredHouse = async () => {
      if (!id) return;

      const subDocRef = doc(
        db,
        "leads_from_supplier",
        String(id),
        "history",
        String(id)
      );

      const subDocSnap = await getDoc(subDocRef);

      if (subDocSnap.exists()) {
        const data = subDocSnap.data();

        Object.entries(data).forEach(([key, value]) => {
          if (key === "activeStep") {
            setActiveStep(value);
          }
        });
      }
    };

    fetchPreferredHouse();
  }, [id]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const formatter = new Intl.DateTimeFormat("nb-NO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const subDocRef = doc(
        db,
        "leads_from_supplier",
        String(id),
        "preferred_house_model",
        String(id)
      );
      const subDocSnap = await getDoc(subDocRef);
      if (data.City === undefined) {
        delete data.City;
      }
      if (data.Husmodell === undefined) {
        delete data.Husmodell;
      }

      if (subDocSnap.exists()) {
        await updateDoc(subDocRef, {
          ...data,
          updatedAt: formatter.format(new Date()),
        });
        toast.success("Preferred house info updated.", {
          position: "top-right",
        });
        await updateDoc(doc(db, "leads_from_supplier", String(id)), {
          updatedAt: Timestamp.now(),
        });
        navigate("/my-leads");
      } else {
        await setDoc(subDocRef, {
          ...data,
          createdAt: formatter.format(new Date()),
          updatedAt: formatter.format(new Date()),
        });
        toast.success("Preferred house info created.", {
          position: "top-right",
        });
        await updateDoc(doc(db, "leads_from_supplier", String(id)), {
          updatedAt: Timestamp.now(),
        });
        navigate("/my-leads");
      }
    } catch (error) {
      console.error("Firestore operation failed:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
      });
    }
  };

  const steps = [
    {
      title: "Lead mottatt",
      date: convertTimestamp(
        leadData?.createdAt?.seconds,
        leadData?.createdAt?.nanoseconds
      ),
    },
    { title: "I dialog", date: "-" },
    { title: "Førstegangsmøte", date: "-" },
    { title: "Tilbud sendt", date: "-" },
    { title: "Signert", date: "-" },
  ];

  const getStepStyle = (index: number) => {
    if (index < activeStep) return "bg-[#008930] border-[#EEF3F7]";
    if (index === activeStep) return "bg-[#008930] border-[#EEF3F7]";
    return "bg-[#F9FAFB] border-[#F9FAFB]";
  };

  const getDotStyle = (index: number) => {
    if (index < activeStep) return "bg-[#EAECF0]";
    if (index === activeStep) return "bg-white";
    return "bg-[#EAECF0]";
  };

  const getTextStyle = (index: number) => {
    if (index <= activeStep) return "text-primary";
    return "text-black";
  };

  const options = [
    { label: "I dialog", color: "#581845", textColor: "text-[#581845]" },
    { label: "Førstegangsmøte", color: "#996CFF", textColor: "text-primary" },
    { label: "Tilbud sendt", color: "#E46A00", textColor: "text-[#994700]" },
    { label: "Signert", color: "#0022E4", textColor: "text-[#001795]" },
  ];

  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState("All");
  const logFilterData = [
    { name: "All" },
    { name: "Telefon" },
    { name: "Telesamtale" },
    { name: "Møte" },
    { name: "initial" },
    { name: "Ring tilbake" },
    { name: "Videomøte" },
    { name: "Befaring" },
    { name: "E-post" },
    { name: "Annet" },
    { name: "Førstegangsmøte" },
    { name: "Tilbud sendt" },
    { name: "Signert" },
  ];

  const fetchLogs = async () => {
    if (!id) return;

    const logsCollectionRef = collection(
      db,
      "leads_from_supplier",
      String(id),
      "followups"
    );

    try {
      const logsSnapshot = await getDocs(logsCollectionRef);

      const fetchedLogs: any = logsSnapshot.docs.map((doc) => {
        const data = doc.data();
        if (data?.type === "initial" || data?.Hurtigvalg === "initial") {
          setActiveStep(1);
        }

        let timestamp: number | undefined = undefined;

        if (typeof data.createdAt === "string") {
          const [datePart, timePart] = data.createdAt
            .split("|")
            .map((s) => s.trim());
          const [day, monthName, year] = datePart.split(" ");
          const engMonth = monthMap[monthName.toLowerCase()] || monthName;

          const dateStr = `${engMonth} ${day}, ${year} ${timePart}`;
          timestamp = new Date(dateStr).getTime();
        } else if (data.createdAt?.toMillis) {
          timestamp = data.createdAt.toMillis();
        } else {
          timestamp = 0;
        }

        return {
          id: doc.id,
          ...data,
          _sortTime: timestamp,
        };
      });

      fetchedLogs.sort((a: any, b: any) => b._sortTime - a._sortTime);

      setLogs(fetchedLogs);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  const logFilterValue = logFilter === "All" ? "" : logFilter;

  const filteredLogs = !logFilterValue
    ? logs
    : logs.filter((log: any) => {
        const logType = log?.Hurtigvalg || log?.type;
        return logType === logFilterValue;
      });

  useEffect(() => {
    fetchLogs();
  }, [id]);

  const houseModelsOption: any =
    houseModels && houseModels.length > 0
      ? houseModels.map((model: any) => ({
          value: model?.id,
          label: model?.Husdetaljer?.husmodell_name,
        }))
      : [];
  const cityOption: any =
    cities && cities.length > 0
      ? cities.map((model: any) => ({
          value: model?.name,
          label: model?.name,
        }))
      : [];

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const handlePopup = () => {
    if (isPopupOpen) {
      setIsPopupOpen(false);
    } else {
      setIsPopupOpen(true);
    }
  };
  const [isLoggingPopupOpen, setIsLoggingPopupOpen] = useState(false);
  const handleLoggingPopup = () => {
    if (isLoggingPopupOpen) {
      setIsLoggingPopupOpen(false);
    } else {
      setIsLoggingPopupOpen(true);
    }
  };

  const [editProfile, setEditProfile] = useState(false);
  const handleEditProfilePopup = () => {
    if (editProfile) {
      setEditProfile(false);
    } else {
      setEditProfile(true);
    }
  };
  const [finalData, setFinalData] = useState<any>(null);

  useEffect(() => {
    const fetchPreferredHouse = async () => {
      if (!id) return;

      const subDocRef = doc(
        db,
        "leads_from_supplier",
        String(id),
        "preferred_house_model",
        String(id)
      );

      const subDocSnap = await getDoc(subDocRef);

      if (subDocSnap.exists()) {
        const data: any = subDocSnap.data();
        if (data?.Husmodell?.[0]) {
          const HouseData: any = await singleHouseModelData(
            String(data?.Husmodell?.[0])
          );
          if (HouseData && HouseData.Husdetaljer) {
            setFinalData(HouseData);
          }
        }
      }
    };

    fetchPreferredHouse();
  }, [id]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <div className="bg-lightGreen py-4 px-4 md:px-6">
        <div className="flex items-center gap-1.5 md:gap-3">
          <Link
            to="/my-leads"
            className="text-gray text-xs md:text-sm font-medium"
          >
            Leads
          </Link>
          <ChevronRight className="w-4 h-4 text-gray2" />
          <span className="text-primary text-xs md:text-sm font-medium">
            Leadsdetaljer
          </span>
        </div>
        {finalData && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between">
            <div className="text-darkBlack text-lg md:text-xl desktop:text-2xl font-medium mt-2 md:mt-4">
              Lead for{" "}
              <span className="font-bold">
                {finalData?.Husdetaljer?.husmodell_name}
              </span>
            </div>
            {leadData?.leadId && (
              <Button
                text="Se detaljer"
                className="border border-green2 bg-green2 text-white text-sm md:text-base rounded-[8px] h-[40px] md:h-[48px] font-medium relative px-4 md:px-[30px] py-[10px] flex items-center gap-2"
                type="button"
                onClick={() => {
                  navigate(`/se-bankleads/${leadData?.leadId}`);
                }}
              />
            )}
          </div>
        )}
      </div>
      <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <div
              className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] desktop:w-[160px] desktop:h-[160px] rounded-full flex items-center justify-center border-[4px] border-[#fff] bg-lightGreen text-primary text-[2rem] md:text-[40px] desktop:text-[48px] font-medium"
              style={{
                boxShadow:
                  "0px 4px 6px -2px #10182808, 0px 12px 16px -4px #10182814",
              }}
            >
              {leadData?.leadData?.name
                .split(" ")
                .map((word: any) => word.charAt(0))
                .join("")}
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-darkBlack text-xl md:text-2xl desktop:text-[28px] font-medium">
                {leadData?.leadData?.name}
              </h4>
              <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                <span className="flex items-center gap-2 md:gap-4">
                  {leadData?.leadData?.email ||
                    (leadData?.leadData?.epost && (
                      <>
                        <span className="text-gray text-sm md:text-base desktop:text-lg">
                          {leadData?.leadData?.email ||
                            leadData?.leadData?.epost}
                        </span>
                        <div className="border-l border-gray2 h-[14px]"></div>
                      </>
                    ))}
                </span>
                <span className="text-gray text-sm md:text-base desktop:text-lg">
                  {formatNorwegianPhone(leadData?.leadData?.telefon)}
                </span>
              </div>
            </div>
            <Pencil
              className="text-primary cursor-pointer"
              onClick={handleEditProfilePopup}
            />
          </div>
          <div className="flex gap-2 md:gap-4">
            <div className="flex flex-col gap-2 md:gap-4 md:items-end">
              <div className="flex items-center gap-3 md:gap-5">
                <p className="text-xs sm:text-sm text-gray">
                  {formatTimestamp(leadData?.createdAt)}
                </p>
                {/* <div className="bg-lightGreen rounded-[16px] py-1.5 px-4 flex items-center gap-1.5 h-[30px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-green"></div>
                  <span className="text-darkGreen text-sm font-medium">Ny</span>
                </div> */}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray text-xs sm:text-sm">Kilde:</span>
                <div className="bg-lightGreen py-1 px-3 h-[28px] rounded-[40px] flex items-center justify-between clear-start text-black text-xs sm:text-sm font-medium">
                  {supplierData?.company_name}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            text="Legg til ny oppfølgning"
            className="border border-green2 bg-green2 text-white text-sm md:text-base rounded-[8px] h-[40px] md:h-[48px] font-medium relative px-4 md:px-[30px] py-[10px] flex items-center gap-2"
            type="button"
            onClick={() => {
              handlePopup();
              setSelectHistoryValue("");
            }}
          />
          <Button
            text="Ny loggføring"
            className="border border-lightGreen bg-lightGreen text-primary text-sm md:text-base rounded-[8px] h-[40px] md:h-[48px] font-medium relative px-4 md:px-[30px] py-[10px] flex items-center gap-2"
            type="button"
            onClick={() => {
              handleLoggingPopup();
              setSelectHistoryValue("");
            }}
          />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
            <div className="shadow-shadow3 border border-gray2 rounded-lg p-4 md:p-6">
              <h4 className="text-darkBlack text-sm md:text-base desktop:text-lg font-semibold mb-3 md:mb-5">
                Leadsinformasjon
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 md:gap-x-5 gap-y-4 md:gap-y-8">
                <div>
                  <FormField
                    control={form.control}
                    name="Husmodell"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <p
                          className={`${
                            fieldState.error ? "text-red" : "text-black"
                          } mb-[6px] text-sm font-medium`}
                        >
                          Husmodell
                        </p>
                        <FormControl>
                          <MultiSelect
                            options={houseModelsOption}
                            onChange={(value) => {
                              const data: any = value.map(
                                (option: any) => option.value
                              );

                              field.onChange(data);
                            }}
                            placeholder="Velg Husmodell"
                            className={`${
                              fieldState?.error ? "border-red" : "border-gray1"
                            } `}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="City"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <p
                          className={`${
                            fieldState.error ? "text-red" : "text-black"
                          } mb-[6px] text-sm font-medium`}
                        >
                          Ønsket bygget i
                        </p>
                        <FormControl>
                          <MultiSelect
                            options={cityOption}
                            onChange={(value) => {
                              const data: any = value.map(
                                (option: any) => option.value
                              );

                              field.onChange(data);
                            }}
                            placeholder="Velg fylke"
                            className={`${
                              fieldState?.error ? "border-red" : "border-gray1"
                            } `}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="">
                  <div>
                    <FormField
                      control={form.control}
                      name="Tildelt"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <p
                            className={`${
                              fieldState.error ? "text-red" : "text-black"
                            } mb-[6px] text-sm font-medium`}
                          >
                            Tildelt
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
                                  <SelectValue placeholder="Velg ansatt" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  <SelectGroup>
                                    {suppliers?.map((sup: any, index) => {
                                      return (
                                        <SelectItem value={sup?.id} key={index}>
                                          {sup?.f_name} {sup?.l_name}
                                        </SelectItem>
                                      );
                                    })}
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
                </div>
              </div>
              <div className="flex justify-end w-full gap-3 md:gap-5 items-center mt-4 md:mt-8">
                <Button
                  text="Lagre"
                  className="border border-green2 bg-green2 text-white text-base rounded-[8px] h-[40px] md:h-[48px] font-medium relative px-px-6 md:[50px] py-[10px] flex items-center gap-2"
                  type="submit"
                />
              </div>
            </div>
          </form>
        </Form>
        <div className="shadow-shadow3 border border-gray2 rounded-lg p-3 md:p-6">
          <h4 className="text-darkBlack text-sm md:text-base desktop:text-lg font-semibold mb-3 md:mb-5">
            Fremdrift
          </h4>
          <div className="w-full mb-3 md:mb-5">
            <div className="relative flex justify-between items-center">
              <div className="absolute top-3.5 md:top-5 left-[50px] md:left-[72px] right-[50px] md:right-[72px] h-0.5 bg-gray2 z-0"></div>

              <div
                className="absolute top-3.5 md:top-5 left-[50px] md:left-[72px] h-0.5 bg-primary z-10 transition-all duration-300 ease-in-out"
                style={{
                  width: `calc((100% - 144px) * ${
                    activeStep / (steps.length - 1)
                  })`,
                }}
              ></div>
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col z-20 items-center w-[145px]"
                >
                  <div
                    className={`w-8 md:w-10 h-8 md:h-10 rounded-full flex items-center justify-center border-4 shadow-md ${getStepStyle(
                      index
                    )}`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${getDotStyle(index)}`}
                    ></div>
                  </div>
                  <div
                    className={`mt-2 md:mt-3 font-medium whitespace-nowrap text-[10px] sm:text-xs md:text-sm desktop:text-base text-center ${getTextStyle(
                      index
                    )}`}
                  >
                    {step.title}
                  </div>
                  <div
                    className={`text-[10px] sm:text-xs md:text-sm desktop:text-base whitespace-nowrap text-center ${getTextStyle(
                      index
                    )}`}
                  >
                    {step.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex sm:items-center gap-3 md:gap-5">
            <span className="text-xs md:text-sm desktop::text-base">
              Hurtigvalg:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {options.map(({ label, color, textColor }) => (
                <div
                  key={label}
                  onClick={() => {
                    if (label === "I dialog") {
                      setActiveStep(1);
                    }
                    if (label === "Førstegangsmøte") {
                      setActiveStep(2);
                    }
                    if (label === "Tilbud sendt") {
                      setActiveStep(3);
                    }
                    if (label === "Signert") {
                      setActiveStep(4);
                    }
                    setSelectHistoryValue(label);
                    handlePopup();
                  }}
                  className={`cursor-pointer border-2 rounded-lg py-2 px-2.5 sm:px-4 shadow-shadow1 flex items-center gap-2 transition-all duration-200 border-primary
                          ${
                            SelectHistoryValue === label ? "bg-[#EBDEFF]" : ""
                          }`}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span
                    className={`text-[10px] sm:text-xs font-medium ${textColor}`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-darkBlack text-sm md:text-base desktop:text-lg font-semibold mb-3 md:mb-5">
              Logg
            </h3>
            <div className="w-[300px]">
              <Select
                onValueChange={(value) => {
                  setLogFilter(value);
                }}
                value={logFilter}
              >
                <SelectTrigger
                  className={`bg-white rounded-[8px] border text-black border-gray1`}
                >
                  <SelectValue placeholder="Enter Type partner" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectGroup>
                    {logFilterData.map((log, index) => (
                      <SelectItem value={log.name} key={index}>
                        {log.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="min-w-full rounded-md overflow-hidden">
              <thead className="bg-[#F9FAFB]">
                <tr>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray">
                    Date
                  </th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray">
                    Title
                  </th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs && filteredLogs.length > 0 ? (
                  filteredLogs.map((log: any, index) => {
                    const logType = log?.Hurtigvalg || log?.type;

                    const getIconForType = (type: string) => {
                      switch (type) {
                        case "Telefon":
                          return <Phone className="w-5 h-5" />;
                        case "Telesamtale":
                          return <Phone className="w-5 h-5" />;
                        case "Møte":
                          return <Shirt className="w-5 h-5" />;
                        case "initial":
                          return <CircleArrowRight className="w-5 h-5" />;
                        case "Ring tilbake":
                          return <PhoneForwarded className="w-5 h-5" />;
                        case "Videomøte":
                          return <Video className="w-5 h-5" />;
                        case "Befaring":
                          return <InspectionPanel className="w-5 h-5" />;
                        case "E-post":
                          return <Mail className="w-5 h-5" />;
                        case "Annet":
                          return <Infinity className="w-5 h-5" />;
                        case "Førstegangsmøte":
                          return <Presentation className="w-5 h-5" />;
                        case "Tilbud sendt":
                          return <Recycle className="w-5 h-5" />;
                        case "Signert":
                          return <Signature className="w-5 h-5" />;
                        default:
                          return null;
                      }
                    };
                    return (
                      <tr className="border-b border-gray2" key={index}>
                        <td className="px-3 md:px-4 py-3 md:py-6 text-xs md:text-sm text-black font-medium w-max whitespace-nowrap">
                          {log?.createdAt && log?.createdAt?.seconds
                            ? formatTimestamp(log?.createdAt)
                            : convertFullStringTo24Hour(log?.createdAt) ||
                              formatTimestamp(log?.date)}
                        </td>
                        <td className="px-3 md:px-4 py-3 md:py-6 text-xs md:text-sm text-black font-medium w-max whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getIconForType(logType)}
                            {logType}
                          </div>
                        </td>
                        <LogRow
                          log={log}
                          leadId={String(id)}
                          fetchLogs={fetchLogs}
                        />
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3}>
                      <div className="text-center py-2 text-xs md:text-sm text-black">
                        No Logs Found
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {isPopupOpen && (
        <Modal
          isOpen={true}
          onClose={() => {
            if (!isDropdownOpen) {
              setIsPopupOpen(false);
            }
          }}
        >
          <div className="bg-white p-4 md:p-6 rounded-lg w-[100vw] sm:w-[500px] relative">
            <button
              className="absolute top-3 right-3"
              onClick={() => setIsPopupOpen(false)}
            >
              <img src={Ic_close} alt="close" />
            </button>
            <AddFollowupForm
              fetchLogs={fetchLogs}
              fetchHusmodellData={fetchHusmodellData}
              handlePopup={handlePopup}
              SelectHistoryValue={SelectHistoryValue}
              setSelectHistoryValue={setSelectHistoryValue}
              setDropdownOpen={setIsDropdownOpen}
            />
          </div>
        </Modal>
      )}
      {isLoggingPopupOpen && (
        <Modal
          isOpen={true}
          onClose={() => {
            if (!isDropdownOpen) {
              setIsLoggingPopupOpen(false);
            }
          }}
        >
          <div className="bg-white p-4 md:p-6 rounded-lg w-[100vw] sm:w-[500px] relative">
            <button
              className="absolute top-3 right-3"
              onClick={() => setIsLoggingPopupOpen(false)}
            >
              <img src={Ic_close} alt="close" />
            </button>
            <AddLogging
              fetchLogs={fetchLogs}
              fetchHusmodellData={fetchHusmodellData}
              handlePopup={handleLoggingPopup}
              SelectHistoryValue={SelectHistoryValue}
              setSelectHistoryValue={setSelectHistoryValue}
              setDropdownOpen={setIsDropdownOpen}
            />
          </div>
        </Modal>
      )}
      {editProfile && (
        <Modal isOpen={true} onClose={handleEditProfilePopup}>
          <div className="bg-white p-4 md:p-6 rounded-lg w-[100vw] sm:w-[500px] relative">
            <button
              className="absolute top-3 right-3"
              onClick={() => setEditProfile(false)}
            >
              <img src={Ic_close} alt="close" />
            </button>
            <EditProfile
              handlePopup={handleEditProfilePopup}
              getLeadData={getLeadData}
              leadData={leadData}
            />
          </div>
        </Modal>
      )}
    </>
  );
};
