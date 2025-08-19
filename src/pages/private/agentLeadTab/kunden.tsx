import { Trash2, UserRoundCheck } from "lucide-react";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import {
  fetchAdminDataByEmail,
  fetchBankLeadData,
  phoneNumberValidations,
} from "../../../lib/utils";
import { parsePhoneNumber } from "react-phone-number-input";
import { InputMobile } from "../../../components/ui/inputMobile";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { useLocation, useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import ApiUtils from "../../../api";

export type KundenHandle = {
  validateForm: () => Promise<boolean>;
};

export const Kunden = forwardRef<
  KundenHandle,
  { setActiveTab: (tab: number) => void }
>(({ setActiveTab }, ref) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  const [offices, setOffices] = useState<{ [key: number]: any[] }>({});

  const formSchema = z.object({
    Kundeinformasjon: z
      .array(
        z
          .object({
            mobileNummer: z.string().refine(
              (value) => {
                const parsedNumber = parsePhoneNumber(value);
                const countryCode = parsedNumber?.countryCallingCode
                  ? `+${parsedNumber.countryCallingCode}`
                  : "";
                const phoneNumber = parsedNumber?.nationalNumber || "";
                if (countryCode !== "+47") {
                  return false;
                }
                const validator = phoneNumberValidations[countryCode];
                return validator ? validator(phoneNumber) : false;
              },
              {
                message:
                  "Vennligst skriv inn et gyldig telefonnummer for det valgte landet.",
              }
            ),
            f_name: z.string().min(1, {
              message: "Fornavn må bestå av minst 2 tegn.",
            }),
            l_name: z.string().min(1, {
              message: "Etternavn må bestå av minst 2 tegn.",
            }),
            Adresse: z.string().min(1, {
              message: "Adresse må bestå av minst 2 tegn.",
            }),
            EPost: z
              .string()
              .email({
                message: "Vennligst skriv inn en gyldig e-postadresse.",
              })
              .min(1, { message: "E-posten må være på minst 2 tegn." }),
            dato: z.string().optional(),
            Personnummer: z.string().optional(),
            supplier: z.string().min(1, {
              message: "Leverandør må velges",
            }),
            // office: z.string().min(1, {
            //   message: "Kontor må velges",
            // }),
            office: z.string().optional(),
            Kundetype: z
              .string()
              .min(1, { message: "Kundetype må spesifiseres." }),
          })
          .superRefine((data, ctx: any) => {
            const index = Number(ctx.path[1]);

            const passedOffices = offices;
            const hasOffices = passedOffices?.[index]?.length > 0;

            if (data.supplier && hasOffices && !data.office) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Kontor må velges",
                path: ["office"],
              });
            }
          })
      )
      .min(1, "Minst ett produkt er påkrevd."),
  });

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Kundeinformasjon: [
        {
          mobileNummer: "",
          f_name: "",
          l_name: "",
          Adresse: "",
          EPost: "",
          dato: "",
          Personnummer: "",
          Kundetype: "",
          supplier: "",
          office: "",
        },
      ],
    },
  });
  const [permission, setPermission] = useState<any>(null);
  const [createData, setCreateData] = useState<any>(null);
  const [office, setOffice] = useState<any>(null);
  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();
      if (data) {
        setCreateData(data);
        const finalSupData = data?.supplier;
        setPermission(finalSupData);
        if (finalSupData || data?.office) {
          const updatedFields = form
            .getValues("Kundeinformasjon")
            .map((item: any) => ({
              ...item,
              supplier: finalSupData || "",
              office: data?.office || "",
            }));

          form.reset({
            Kundeinformasjon: updatedFields,
          });
        }
        if (data?.office) {
          setOffice(data?.office);
        }
      }
    };

    getData();
  }, []);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "Kundeinformasjon",
  });
  const [phoneCallApiData, setPhoneCallApiData] = useState<any>();

  useEffect(() => {
    if (!id) {
      return;
    }

    const getData = async () => {
      const data = await fetchBankLeadData(id);
      console.log(data);

      if (data && data?.Kunden) {
        if (data?.Kunden?.phoneCallApiData) {
          setPhoneCallApiData(data?.Kunden?.phoneCallApiData);
        }

        if (data.Kunden?.Kundeinformasjon) {
          const formattedInfo: any[] = [];

          data.Kunden.Kundeinformasjon.forEach((info: any, index: number) => {
            const formattedItem: any = {};
            Object.entries(info).forEach(([key, value]: any) => {
              if (value !== undefined && value !== null) {
                formattedItem[key] = value;
              }
            });
            formattedInfo.push(formattedItem);
          });

          form.setValue(`Kundeinformasjon`, formattedInfo);
        }
      }
    };

    getData();
  }, [id]);

  const addProduct = () => {
    append({
      mobileNummer: "",
      f_name: "",
      l_name: "",
      Adresse: "",
      EPost: "",
      dato: "",
      Personnummer: "",
      Kundetype: "",
      supplier: "",
      office: "",
    } as any);
  };
  const removeProduct = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setActiveTab(1);

    try {
      const formatDate = (date: Date) => {
        return date
          .toLocaleString("sv-SE", { timeZone: "UTC" })
          .replace(",", "");
      };

      const uniqueId = id ? id : uuidv4();
      const docRef = doc(db, "bank_leads", uniqueId);

      const BankData = {
        ...data,
        id: uniqueId,
        ...(phoneCallApiData ? { phoneCallApiData } : {}),
      };

      if (id) {
        await updateDoc(docRef, {
          Kunden: BankData,
          updatedAt: formatDate(new Date()),
        });
        toast.success("Lagret", {
          position: "top-right",
        });
        navigate(`/edit-agent-leads/${uniqueId}`);
        setActiveTab(1);
      } else {
        await setDoc(docRef, {
          Kunden: BankData,
          updatedAt: formatDate(new Date()),
          createdAt: formatDate(new Date()),
          createDataBy: {
            email: createData?.email,
            photo: createData?.photo,
            name: createData?.f_name
              ? `${createData?.f_name} ${createData?.l_name}`
              : createData?.name,
          },
          supplierId: permission ?? null,
          created_by: createData?.id,
          // status: "Sent",
          status: "Ikke sendt",
        });
        toast.success("Added successfully", { position: "top-right" });
        navigate(`/edit-agent-leads/${uniqueId}`);
        setActiveTab(1);
      }
    } catch (error) {
      console.error("Firestore operation failed:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
      });
    }
  };

  useImperativeHandle(ref, () => ({
    validateForm: async () => {
      let isValid = false;

      await form.handleSubmit(async (data) => {
        await onSubmit(data);
        isValid = true;
      })();

      return isValid;
    },
  }));

  const handlePhoneChange = async (phoneNumber: string, index: number) => {
    if (phoneNumber) {
      try {
        const response = await ApiUtils.handleLookup(phoneNumber);

        if (response) {
          setPhoneCallApiData(response);
          form.setValue(
            `Kundeinformasjon.${index}.f_name`,
            response?.contacts[0]?.firstName
          );
          form.setValue(
            `Kundeinformasjon.${index}.l_name`,
            response?.contacts[0]?.lastName
          );
          form.setValue(
            `Kundeinformasjon.${index}.Adresse`,
            response?.contacts[0]?.geography?.address?.addressString
          );
        }
      } catch (error: any) {
        console.error(error);
      }
    }
  };
  const [suppliers, setSuppliers] = useState([]);

  const fetchSuppliersData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "suppliers"));
      let data: any = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching husmodell data:", error);
    }
  };

  useEffect(() => {
    fetchSuppliersData();
  }, []);

  const fetchOfficeData = async (supplierId: string, idx: number) => {
    try {
      let querySnapshot;
      if (supplierId) {
        const officeQuery = query(
          collection(db, "office"),
          where("data.supplier", "==", supplierId)
        );
        querySnapshot = await getDocs(officeQuery);
      } else {
        querySnapshot = await getDocs(collection(db, "office"));
      }

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOffices((prev) => ({
        ...prev,
        [idx]: data,
      }));
    } catch (error) {
      console.error("Error fetching office data:", error);
    }
  };

  useEffect(() => {
    fields.forEach((_, index) => {
      const supplierId = form.watch(`Kundeinformasjon.${index}.supplier`);
      if (supplierId) {
        fetchOfficeData(supplierId, index);
      }
    });
  }, [fields, form.watch("Kundeinformasjon")]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <div
            className="mx-4 md:mx-8 lg:mx-10 rounded-lg"
            style={{
              boxShadow: "0px 1px 2px 0px #1018280F, 0px 1px 3px 0px #1018281A",
            }}
          >
            <div className="py-2.5 md:py-4 px-3 md:px-5 flex items-center gap-3 border-b border-[#E8E8E8]">
              <UserRoundCheck />
              <span className="text-sm md:text-base desktop:text-lg font-semibold">
                Registrering av kunde
              </span>
            </div>
            <div className="bg-[#F6F4F2] py-2 md:py-3 px-3 md:px-5 text-sm font-semibold">
              Informasjon om oppdragsgiver
            </div>
            <div className="p-3 md:p-6 mb-6 z-40 relative">
              <div className="flex flex-col gap-4 md:gap-8">
                {fields.map((product, index) => {
                  return (
                    <div key={product.id}>
                      <div className="flex flex-col gap-4 md:gap-6">
                        <div className="flex items-center gap-2 justify-between">
                          {index === 0 ? (
                            <div>
                              <h3 className="text-base font-semibold mb-1.5">
                                Kundeinformasjon ({index + 1})
                              </h3>
                              <p className="text-sm text-[#4D4D4D]">
                                Oppdragsnummeret blir automatisk tildelt i Vitec
                                ved signering av oppdragsavtalen.
                              </p>
                            </div>
                          ) : (
                            <div>
                              <h3 className="text-base font-semibold mb-1.5">
                                Kundeinformasjon ({index + 1})
                              </h3>
                              <p className="text-sm text-[#4D4D4D]">
                                Kunde {index + 1} skal være medlånstaker .
                              </p>
                            </div>
                          )}
                          {index !== 0 && (
                            <div
                              className={`w-max whitespace-nowrap flex items-center gap-1 font-medium text-[#D4121E] cursor-pointer`}
                              onClick={() => {
                                removeProduct(index);
                              }}
                            >
                              <Trash2 />
                            </div>
                          )}
                        </div>
                        <div>
                          <FormField
                            control={form.control}
                            name={`Kundeinformasjon.${index}.mobileNummer`}
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <p
                                  className={`${
                                    fieldState.error ? "text-red" : ""
                                  } mb-[6px] text-sm`}
                                >
                                  Mobilnummer
                                </p>
                                <FormControl>
                                  <div className="relative flex flex-col sm:flex-row gap-1.5 sm:items-center">
                                    <InputMobile
                                      placeholder="Skriv inn Telefon"
                                      {...field}
                                      className={`bg-white w-full sm:w-max rounded-[8px] border text-black
                              ${
                                fieldState?.error
                                  ? "border-red"
                                  : "border-gray1"
                              } `}
                                      type="tel"
                                    />
                                    <div
                                      className="border-primary border-2 rounded-lg py-2 px-3 text-primary font-semibold cursor-pointer h-10 md:h-12 flex items-center justify-center text-sm md:text-base"
                                      onClick={() =>
                                        handlePhoneChange(field.value, index)
                                      }
                                    >
                                      Søk på telefonummer
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <FormField
                              control={form.control}
                              name={`Kundeinformasjon.${index}.f_name`}
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <p
                                    className={`${
                                      fieldState.error ? "text-red" : ""
                                    } mb-[6px] text-sm`}
                                  >
                                    Fornavn
                                  </p>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        placeholder="Skriv inn Fornavn"
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
                          <div>
                            <FormField
                              control={form.control}
                              name={`Kundeinformasjon.${index}.l_name`}
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <p
                                    className={`${
                                      fieldState.error ? "text-red" : ""
                                    } mb-[6px] text-sm`}
                                  >
                                    Etternavn
                                  </p>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        placeholder="Skriv inn Etternavn"
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                          <div>
                            <FormField
                              control={form.control}
                              name={`Kundeinformasjon.${index}.Adresse`}
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <p
                                    className={`${
                                      fieldState.error ? "text-red" : ""
                                    } mb-[6px] text-sm`}
                                  >
                                    Adresse
                                  </p>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        placeholder="Skriv inn Adresse"
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
                          <div>
                            <FormField
                              control={form.control}
                              name={`Kundeinformasjon.${index}.mobileNummer`}
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <p
                                    className={`${
                                      fieldState.error ? "text-red" : ""
                                    } mb-[6px] text-sm`}
                                  >
                                    Mobilnummer
                                  </p>
                                  <FormControl>
                                    <div className="relative flex gap-1.5 items-center">
                                      <InputMobile
                                        placeholder="Skriv inn Telefon"
                                        {...field}
                                        className={`bg-white rounded-[8px] border text-black
                              ${
                                fieldState?.error
                                  ? "border-red"
                                  : "border-gray1"
                              } `}
                                        type="tel"
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
                              name={`Kundeinformasjon.${index}.EPost`}
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <p
                                    className={`${
                                      fieldState.error ? "text-red" : ""
                                    } mb-[6px] text-sm`}
                                  >
                                    E-post
                                  </p>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        placeholder="Skriv inn E-post"
                                        {...field}
                                        className={`bg-white rounded-[8px] border text-black
                                          ${
                                            fieldState?.error
                                              ? "border-red"
                                              : "border-gray1"
                                          } `}
                                        type="email"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                          <div>
                            <FormField
                              control={form.control}
                              name={`Kundeinformasjon.${index}.dato`}
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <p
                                    className={`${
                                      fieldState.error ? "text-red" : ""
                                    } mb-[6px] text-sm`}
                                  >
                                    Fødselsdato
                                  </p>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        placeholder="Skriv inn Fødselsdato"
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
                              name={`Kundeinformasjon.${index}.Personnummer`}
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <p
                                    className={`${
                                      fieldState.error ? "text-red" : ""
                                    } mb-[6px] text-sm`}
                                  >
                                    Personnummer
                                  </p>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        placeholder="Skriv inn Personnummer"
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
                              name={`Kundeinformasjon.${index}.Kundetype`}
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <p
                                    className={`${
                                      fieldState.error
                                        ? "text-red"
                                        : "text-black"
                                    } mb-[6px] text-sm font-medium`}
                                  >
                                    Kundetype
                                  </p>
                                  <FormControl>
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
                                        <SelectValue placeholder="Velg kundetype" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white">
                                        <SelectGroup>
                                          <SelectItem value="Privatperson">
                                            Privatperson
                                          </SelectItem>
                                          <SelectItem value="Selskap">
                                            Selskap
                                          </SelectItem>
                                        </SelectGroup>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          {!office && (
                            <div>
                              <FormField
                                control={form.control}
                                name={`Kundeinformasjon.${index}.supplier`}
                                render={({ field, fieldState }) => (
                                  <FormItem>
                                    <p
                                      className={`${
                                        fieldState.error
                                          ? "text-red"
                                          : "text-black"
                                      } mb-[6px] text-sm font-medium`}
                                    >
                                      Leverandører
                                    </p>
                                    <FormControl>
                                      <div className="relative">
                                        <Select
                                          onValueChange={(value) => {
                                            field.onChange(value);

                                            form.setValue(
                                              `Kundeinformasjon.${index}.office`,
                                              ""
                                            );

                                            fetchOfficeData(value, index);
                                          }}
                                          value={field.value}
                                        >
                                          <SelectTrigger
                                            className={`bg-white rounded-[8px] border text-black ${
                                              fieldState?.error
                                                ? "border-red"
                                                : "border-gray1"
                                            } `}
                                          >
                                            <SelectValue placeholder="Select Leverandører" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-white">
                                            <SelectGroup>
                                              {suppliers?.map(
                                                (sup: any, idx) => (
                                                  <SelectItem
                                                    value={sup?.id}
                                                    key={idx}
                                                  >
                                                    {sup?.company_name}
                                                  </SelectItem>
                                                )
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
                          )}
                          {!office && (
                            <div>
                              <FormField
                                control={form.control}
                                name={`Kundeinformasjon.${index}.office`}
                                render={({ field, fieldState }) => (
                                  <FormItem>
                                    <p
                                      className={`${
                                        fieldState.error
                                          ? "text-red"
                                          : "text-black"
                                      } mb-[6px] text-sm font-medium`}
                                    >
                                      Kontor
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
                                            className={`bg-white rounded-[8px] border text-black ${
                                              fieldState?.error
                                                ? "border-red"
                                                : "border-gray1"
                                            } `}
                                          >
                                            <SelectValue placeholder="Select Kontor" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-white">
                                            <SelectGroup>
                                              {(offices[index] || []).map(
                                                (off: any, idx) => (
                                                  <SelectItem
                                                    value={off.id}
                                                    key={idx}
                                                  >
                                                    {off?.data?.name}
                                                  </SelectItem>
                                                )
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
                          )}
                        </div>

                        {index !== fields.length - 1 && (
                          <div className={`border-t border-gray2`}></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mb-8 mx-4 md:mx-8 lg:mx-10">
            <div
              className="text-white rounded-lg w-max bg-primary font-medium justify-center text-base flex items-center gap-1 cursor-pointer h-full px-4 py-[10px]"
              onClick={addProduct}
            >
              + Legg til medlåntaker
            </div>
          </div>
          <div className="flex justify-end w-full gap-5 items-center sticky bottom-0 bg-white z-50 border-t border-gray2 p-4 left-0">
            <Button
              text="Tilbake"
              className="border border-gray2 text-black text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
              onClick={() => navigate("/agent-leads")}
            />
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
});
