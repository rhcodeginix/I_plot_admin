/* eslint-disable react-hooks/exhaustive-deps */
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import Ic_close from "../../../assets/images/Ic_close.svg";
import { Link, useLocation } from "react-router-dom";
import {
  convertTimestamp,
  fetchLeadData,
  fetchSupplierData,
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
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import toast from "react-hot-toast";
import { LogRow } from "./logRow";
import MultiSelect from "../../../components/ui/multiSelect";
import Modal from "../../../components/common/modal";
import { AddFollowupForm } from "./addFollowUp";

const formSchema = z.object({
  Husmodell: z
    .array(z.string().min(1, { message: "Husmodell må spesifiseres." }))
    .min(1, { message: "Minst én husmodell må velges." }),
  City: z
    .array(z.string().min(1, { message: "Ønsket bygget i må spesifiseres." }))
    .min(1, { message: "Minst én by må velges." }),
  Tildelt: z.string().min(1, { message: "Tildelt i must må spesifiseres." }),
});

export const MyLeadsDetail = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  const [leadData, setLeadData] = useState<any>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    const getData = async () => {
      const data = await fetchLeadData(id);
      if (data) {
        setLeadData(data);
      }
    };

    getData();
  }, [id]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const [houseModels, setHouseModels] = useState([]);
  const fetchHusmodellData = async () => {
    try {
      let q = query(
        collection(db, "house_model"),
        orderBy("updatedAt", "desc")
      );

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
      let q = query(collection(db, "suppliers"));

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
  }, []);
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

      if (subDocSnap.exists()) {
        await updateDoc(subDocRef, {
          ...data,
          updatedAt: formatter.format(new Date()),
        });
        toast.success("Preferred house info updated.", {
          position: "top-right",
        });
      } else {
        await setDoc(subDocRef, {
          ...data,
          createdAt: formatter.format(new Date()),
        });
        toast.success("Preferred house info created.", {
          position: "top-right",
        });
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
    { title: "Førstegangsmøte", date: "-" },
    { title: "I process", date: "-" },
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
    if (index <= activeStep) return "text-purple";
    return "text-black";
  };

  const options = [
    { label: "Førstegangsmøte", color: "#996CFF", textColor: "text-primary" },
    { label: "Start prosess", color: "#E46A00", textColor: "text-[#994700]" },
    { label: "Signert", color: "#0022E4", textColor: "text-[#001795]" },
  ];

  const [logs, setLogs] = useState([]);
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

      const fetchedLogs: any = logsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLogs(fetchedLogs);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

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
  return (
    <>
      <div className="bg-lightPurple py-4 px-6">
        <div className="mb-4 flex items-center gap-3">
          <Link to="/my-leads" className="text-gray text-sm font-medium">
            Leads
          </Link>
          <ChevronRight className="w-4 h-4 text-gray2" />
          <span className="text-primary text-sm font-medium">
            Leadsdetaljer
          </span>
        </div>
        <div className="text-darkBlack text-lg md:text-xl desktop:text-2xl font-medium">
          Lead for <span className="font-bold">Spåtind 66</span>
        </div>
      </div>
      <div className="p-6 flex flex-col gap-6">
        <div className="flex gap-6 items-center justify-between">
          <div className="flex items-center gap-6">
            <div
              className="w-[160px] h-[160px] rounded-full flex items-center justify-center border-[4px] border-[#fff] bg-lightPurple text-primary text-[48px] font-medium"
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
              <h4 className="text-darkBlack text-[28px] font-medium">
                {leadData?.leadData?.name}
              </h4>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-4">
                  {leadData?.leadData?.email && (
                    <>
                      <span className="text-gray text-lg">
                        {leadData?.leadData?.email}
                      </span>
                      <div className="border-l border-gray2 h-[14px]"></div>
                    </>
                  )}
                </span>
                <span className="text-gray text-lg">
                  {leadData?.leadData?.telefon}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-4 items-end">
              <div className="flex items-center gap-5">
                <p className="text-sm text-gray">
                  {formatTimestamp(leadData?.createdAt)}
                </p>
                <div className="bg-lightGreen rounded-[16px] py-1.5 px-4 flex items-center gap-1.5 h-[30px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-green"></div>
                  <span className="text-darkGreen text-sm font-medium">Ny</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray text-sm">Kilde:</span>
                <div className="bg-lightPurple py-1 px-3 h-[28px] rounded-[40px] flex items-center justify-between clear-start text-black text-sm font-medium">
                  {supplierData?.company_name}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            text="Legg til oppfølging"
            className="border border-green2 bg-green2 text-white text-base rounded-[8px] h-[48px] font-medium relative px-[30px] py-[10px] flex items-center gap-2"
            type="button"
            onClick={() => {
              handlePopup();
              setSelectHistoryValue("");
            }}
          />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
            <div className="shadow-shadow3 border border-gray2 rounded-lg p-6">
              <h4 className="text-darkBlack text-lg font-semibold mb-5">
                Leadsinformasjon
              </h4>
              <div className="grid grid-cols-2 gap-x-5 gap-y-8">
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
                            placeholder="Velg Ønsket bygget i"
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
                <div className="col-span-2">
                  <div className="flex items-center gap-3">
                    <span className="text-gray text-xs font-medium">
                      Tildelt:
                    </span>
                    {suppliers &&
                      suppliers.length > 0 &&
                      suppliers.map((sup: any, index) => {
                        return (
                          <Button
                            text={`+ ${sup?.Kontaktperson}`}
                            className={`border-2 border-purple text-xs rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2 ${
                              form.watch("Tildelt") === sup?.id
                                ? "bg-purple text-white"
                                : "bg-white text-purple"
                            }`}
                            type="button"
                            key={index}
                            onClick={() => {
                              form.setValue("Tildelt", sup?.id);
                            }}
                          />
                        );
                      })}
                  </div>
                  {form.formState.errors.Tildelt && !form.watch("Tildelt") && (
                    <div className="text-red text-sm mt-2">
                      {form.formState.errors.Tildelt?.message}
                    </div>
                  )}
                </div>
                {/* <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="LeadsNotat"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <p
                          className={`${
                            fieldState.error ? "text-red" : "text-black"
                          } mb-[6px] text-sm font-medium`}
                        >
                          Notat
                        </p>
                        <FormControl>
                          <div className="relative">
                            <TextArea
                              placeholder="Fyll inn kommentar"
                              {...field}
                              className={`h-[100px] bg-white rounded-[8px] border text-black
                                  ${
                                    fieldState?.error
                                      ? "border-red"
                                      : "border-gray1"
                                  } `}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div> */}
              </div>
              <div className="flex justify-end w-full gap-5 items-center mt-8">
                <div onClick={() => form.reset()} >
                  <Button
                    text="Tilbake"
                    className="border border-lightPurple bg-lightPurple text-primary text-base rounded-[8px] h-[48px] font-medium relative py-[10px] flex items-center gap-2 px-[50px]"
                  />
                </div>
                <Button
                  text="Lagre"
                  className="border border-green2 bg-green2 text-white text-base rounded-[8px] h-[48px] font-medium relative px-[50px] py-[10px] flex items-center gap-2"
                  type="submit"
                />
              </div>
            </div>
          </form>
        </Form>
        <div className="shadow-shadow3 border border-gray2 rounded-lg p-6">
          <h4 className="text-darkBlack text-lg font-semibold mb-5">
            Historikk
          </h4>
          <div className="w-full mb-5">
            <div className="relative flex justify-between items-center">
              <div className="absolute top-5 left-[72px] right-[72px] h-0.5 bg-gray2 z-0"></div>

              <div
                className="absolute top-5 left-[72px] h-0.5 bg-purple z-10 transition-all duration-300 ease-in-out"
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
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-4 shadow-md ${getStepStyle(
                      index
                    )}`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${getDotStyle(index)}`}
                    ></div>
                  </div>
                  <div
                    className={`mt-3 font-medium text-base text-center ${getTextStyle(
                      index
                    )}`}
                  >
                    {step.title}
                  </div>
                  <div
                    className={`text-base text-center ${getTextStyle(index)}`}
                  >
                    {step.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-5">
            Hurtigvalg:
            <div className="flex items-center gap-2 flex-wrap">
              {options.map(({ label, color, textColor }) => (
                <div
                  key={label}
                  onClick={() => {
                    if (label === "Førstegangsmøte") {
                      setActiveStep(1);
                    }
                    if (label === "Start prosess") {
                      setActiveStep(2);
                    }
                    if (label === "Signert") {
                      setActiveStep(3);
                    }
                    setSelectHistoryValue(label);
                    handlePopup();
                  }}
                  className={`cursor-pointer border-2 rounded-lg py-2 px-4 shadow-shadow1 flex items-center gap-2 transition-all duration-200 border-primary
                          ${
                            SelectHistoryValue === label ? "bg-[#EBDEFF]" : ""
                          }`}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className={`text-xs font-medium ${textColor}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* <Form {...form}>
          <form
            onSubmit={HistorikkForm.handleSubmit(onHistorikkSubmit)}
            className="relative"
          >
            {HurtigvalgValue &&
              HurtigvalgValue !== "" &&
              HurtigvalgValue !== "Email Sent" &&
              HurtigvalgValue !== "Signert" && (
                <div className="mt-6">
                  <h5 className="text-darkBlack text-base font-bold mb-4">
                    {HurtigvalgValue}
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    {HurtigvalgValue !== "Start prosess" && (
                      <FormField
                        control={HistorikkForm.control}
                        name="date"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <p
                              className={`${
                                fieldState.error ? "text-red" : "text-black"
                              } mb-[6px] text-sm font-medium`}
                            >
                              Book {HurtigvalgValue}
                            </p>
                            <FormControl>
                              <div className="relative w-full">
                                <DateTimePickerComponent
                                  selectedDate={
                                    field.value ? field.value : null
                                  }
                                  onDateChange={(date: Date | null) => {
                                    if (date) {
                                      field.onChange(date);
                                    }
                                  }}
                                  className="border border-gray1 rounded-lg px-[14px] py-[10px] w-full"
                                  placeholderText="Pick a date & time"
                                  dateFormat="dd.MM.yyyy | HH:mm"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <div>
                      <FormField
                        control={HistorikkForm.control}
                        name="notat"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <p
                              className={`${
                                fieldState.error ? "text-red" : "text-black"
                              } mb-[6px] text-sm font-medium`}
                            >
                              Notat
                            </p>
                            <FormControl>
                              <div className="relative">
                                <TextArea
                                  placeholder="Fyll inn kommentar"
                                  {...field}
                                  className={`h-[100px] bg-white rounded-[8px] border text-black
                                  ${
                                    fieldState?.error
                                      ? "border-red"
                                      : "border-gray1"
                                  } `}
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
              )}

            <div className="flex justify-end w-full gap-5 items-center mt-8">
              <div onClick={() => form.reset()} >
                <Button
                  text="Tilbake"
                  className="border border-lightPurple bg-lightPurple text-primary text-base rounded-[8px] h-[48px] font-medium relative py-[10px] flex items-center gap-2 px-[50px]"
                />
              </div>
              <Button
                text="Lagre"
                className="border border-green2 bg-green2 text-white text-base rounded-[8px] h-[48px] font-medium relative px-[50px] py-[10px] flex items-center gap-2"
                type="submit"
              />
            </div>
          </form>
        </Form> */}
        <div>
          <h3 className="text-darkBlack text-lg font-semibold mb-5">Logg</h3>
          <table className="min-w-full rounded-md overflow-hidden">
            <thead className="bg-[#F9FAFB]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray">
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {logs && logs.length > 0 ? (
                logs.map((log: any, index) => {
                  return (
                    <tr className="border-b border-gray2" key={index}>
                      <td className="px-4 py-6 text-sm text-black font-medium">
                        {log?.createdAt || formatTimestamp(log?.date)}
                      </td>
                      <td className="px-4 py-6 text-sm text-black font-medium">
                        {log?.Hurtigvalg || log?.type}
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
                    <div className="text-center py-2 text-sm text-black">
                      No Logs Found
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isPopupOpen && (
        <Modal isOpen={true} onClose={handlePopup}>
          <div className="bg-white p-6 rounded-lg w-full sm:w-[500px] relative">
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
            />
          </div>
        </Modal>
      )}
    </>
  );
};
