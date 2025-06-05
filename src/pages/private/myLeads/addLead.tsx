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
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import toast from "react-hot-toast";
import { db } from "../../../config/firebaseConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { Timestamp, doc, setDoc, updateDoc } from "firebase/firestore";
import { Input } from "../../../components/ui/input";
import { parsePhoneNumber } from "react-phone-number-input";
import {
  fetchAdminDataByEmail,
  phoneNumberValidations,
} from "../../../lib/utils";
import { InputMobile } from "../../../components/ui/inputMobile";
import { useEffect, useState } from "react";

const formSchema = z.object({
  // lead_id: z.string().min(1, {
  //   message: "Lead id må bestå av minst 2 tegn.",
  // }),
  // leadSource: z.string().min(1, {
  //   message: "LeadSource må bestå av minst 2 tegn.",
  // }),
  // status: z.string().min(1, {
  //   message: "Status må bestå av minst 2 tegn.",
  // }),
  leadData: z.object({
    name: z.string().min(1, {
      message: "Navn må bestå av minst 2 tegn.",
    }),
    epost: z
      .string()
      .email({ message: "Vennligst skriv inn en gyldig e-postadresse." })
      .min(1, { message: "E-posten må være på minst 2 tegn." }),
    // kildeNy: z.string().min(1, {
    //   message: "KildeNy må bestå av minst 2 tegn.",
    // }),
    // notaterFørsteSamtale: z.string().min(1, {
    //   message: "NotaterFørsteSamtale må bestå av minst 2 tegn.",
    // }),
    // datoRegistrert: z.string().min(1, "DatoRegistrert den er påkrevd"),
    // people: z.string().min(1, {
    //   message: "People må bestå av minst 2 tegn.",
    // }),
    // statusKunde: z.string().min(1, {
    //   message: "StatusKunde må bestå av minst 2 tegn.",
    // }),
    telefon: z.string().refine(
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
  }),
});

export const AddLeadForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const location = useLocation();
  const navigate = useNavigate();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  function removePlus(phone: string): string {
    return phone.replace("+", "");
  }

  const [createData, setCreateData] = useState<any>(null);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();
      if (data) {
        setCreateData(data);
      }
    };

    getData();
  }, []);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (data) {
        data.leadData.telefon = removePlus(data.leadData.telefon);
      }

      const formatDate = (date: Date) => {
        return date
          .toLocaleString("sv-SE", { timeZone: "UTC" })
          .replace(",", "");
      };
      // const uniqueId = id ? id : data.lead_id;
      const uniqueId = id ? id : uuidv4();
      const husmodellDocRef = doc(db, "leads_from_supplier", uniqueId);

      if (id) {
        await updateDoc(husmodellDocRef, {
          ...data,
          updatedAt: formatDate(new Date()),
        });
        toast.success("Lagret", {
          position: "top-right",
        });
        navigate("/my-leads");
      } else {
        await setDoc(husmodellDocRef, {
          ...data,
          updatedAt: Timestamp.now(),
          createdAt: Timestamp.now(),
          supplierId: "065f9498-6cdb-469b-8601-bb31114d7c95",
          createDataBy: {
            email: createData?.email,
            photo: createData?.photo,
            name: createData?.name,
          },
        });
        toast.success("Added successfully", { position: "top-right" });
        navigate("/my-leads");
      }
    } catch (error) {
      console.error("Firestore operation failed:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
      });
    }
  };

  return (
    <>
      <div className="p-4 md:p-6">
        <h3 className="text-lg md:text-xl desktop:text-2xl mb-4 text-darkBlack font-semibold">
          Opprett nytt lead
        </h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
            <div className="">
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {/* <div>
                  <FormField
                    control={form.control}
                    name="lead_id"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <p
                          className={`${
                            fieldState.error ? "text-red" : "text-black"
                          } mb-[6px] text-sm font-medium`}
                        >
                          Lead-ID
                        </p>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Skriv inn potensiell ID"
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
                    name="leadSource"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <p
                          className={`${
                            fieldState.error ? "text-red" : "text-black"
                          } mb-[6px] text-sm font-medium`}
                        >
                          leadSource
                        </p>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Skriv inn leadSource"
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
                    name="status"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <p
                          className={`${
                            fieldState.error ? "text-red" : "text-black"
                          } mb-[6px] text-sm font-medium`}
                        >
                          Status
                        </p>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Skriv inn status"
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
                </div> */}
                <h3 className="col-span-2 text-darkBlack font-semibold text-xl">
                  Lead Data
                </h3>
                <div>
                  <FormField
                    control={form.control}
                    name="leadData.name"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <p
                          className={`${
                            fieldState.error ? "text-red" : "text-black"
                          } mb-[6px] text-sm font-medium`}
                        >
                          Navn
                        </p>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Skriv inn navn"
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
                    name="leadData.epost"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <p
                          className={`${
                            fieldState.error ? "text-red" : "text-black"
                          } mb-[6px] text-sm font-medium`}
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
                {/* <div>
                  <FormField
                    control={form.control}
                    name="leadData.kildeNy"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <p
                          className={`${
                            fieldState.error ? "text-red" : "text-black"
                          } mb-[6px] text-sm font-medium`}
                        >
                          KildeNy
                        </p>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Skriv inn kildeNy"
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
                    name="leadData.notaterFørsteSamtale"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <p
                          className={`${
                            fieldState.error ? "text-red" : "text-black"
                          } mb-[6px] text-sm font-medium`}
                        >
                          NotaterFørsteSamtale
                        </p>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Skriv inn notaterFørsteSamtale"
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
                    name="leadData.datoRegistrert"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <p
                          className={`${
                            fieldState.error ? "text-red" : "text-black"
                          } mb-[6px] text-sm font-medium`}
                        >
                          DatoRegistrert
                        </p>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Skriv inn datoRegistrert"
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
                    name="leadData.people"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <p
                          className={`${
                            fieldState.error ? "text-red" : "text-black"
                          } mb-[6px] text-sm font-medium`}
                        >
                          People
                        </p>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Skriv inn people"
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
                    name="leadData.statusKunde"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <p
                          className={`${
                            fieldState.error ? "text-red" : "text-black"
                          } mb-[6px] text-sm font-medium`}
                        >
                          StatusKunde
                        </p>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Skriv inn statusKunde"
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
                </div> */}
                <div>
                  <FormField
                    control={form.control}
                    name="leadData.telefon"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <p
                          className={`${
                            fieldState.error ? "text-red" : "text-black"
                          } mb-[6px] text-sm font-medium`}
                        >
                          Telefon
                        </p>
                        <FormControl>
                          <div className="relative">
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
              </div>
            </div>
            <div className="flex justify-end w-full gap-5 items-center mt-8">
              <div
                onClick={() => {
                  form.reset();
                  navigate("/my-leads");
                }}
              >
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
        </Form>
      </div>
    </>
  );
};
