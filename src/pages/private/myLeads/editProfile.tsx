import React, { useEffect } from "react";
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
import { z } from "zod";
import toast from "react-hot-toast";
import { db } from "../../../config/firebaseConfig";
import { useLocation } from "react-router-dom";
import { Timestamp, doc, updateDoc } from "firebase/firestore";
import { Input } from "../../../components/ui/input";
import { parsePhoneNumber } from "react-phone-number-input";
import {
  formatNorwegianPhone,
  phoneNumberValidations,
} from "../../../lib/utils";
import { InputMobile } from "../../../components/ui/inputMobile";

const formSchema = z.object({
  email: z
    .string()
    .email({ message: "Vennligst skriv inn en gyldig e-postadresse." })
    .min(1, { message: "E-posten må være på minst 2 tegn." }),
  name: z.string().min(1, {
    message: "Navn må bestå av minst 2 tegn.",
  }),
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
  adresse: z.string().optional(),
});

export const EditProfile: React.FC<{
  getLeadData: any;
  handlePopup: any;
  leadData: any;
}> = ({ getLeadData, handlePopup, leadData }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  function removePlus(phone: string): string {
    return phone.replace("+", "");
  }
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (data) {
      data.telefon = removePlus(data.telefon);
    }

    if (
      data.adresse === "" ||
      !data.adresse ||
      data.adresse === undefined ||
      data.adresse === null
    ) {
      delete data.adresse;
    }

    try {
      try {
        await updateDoc(doc(db, "leads_from_supplier", String(id)), {
          updatedAt: Timestamp.now(),
          "leadData.name": data.name,
          "leadData.email": data.email,
          "leadData.telefon": data.telefon,
          "leadData.adresse": data.adresse ?? "",
        });

        await getLeadData();
        handlePopup();
        toast.success("Updated Successfully.", {
          position: "top-right",
        });
        form.reset();
      } catch (error) {
        console.error("Firestore operation failed:", error);
        toast.error("Something went wrong. Please try again.", {
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

  useEffect(() => {
    if (leadData) {
      form.setValue("name", leadData?.leadData?.name);
      form.setValue(
        "email",
        leadData?.leadData?.email || leadData?.leadData?.epost
      );
      form.setValue(
        "telefon",
        leadData?.leadData?.telefon &&
          formatNorwegianPhone(leadData?.leadData?.telefon)
      );
      form.setValue("adresse", leadData?.leadData?.adresse);
    }
  }, [leadData, form]);

  return (
    <>
      <h3 className="text-lg md:text-xl desktop:text-2xl mb-4 text-darkBlack font-semibold">
        Rediger profil
      </h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <div className="">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <FormField
                  control={form.control}
                  name="name"
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
                            placeholder="Skriv inn navnet ditt"
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
                  name="email"
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
                  name="telefon"
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
              <div>
                <FormField
                  control={form.control}
                  name="adresse"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        Anleggsadresse
                      </p>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Skriv inn anleggsadresse"
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
          <div className="flex justify-end w-full gap-5 items-center mt-8">
            <div onClick={() => form.reset()}>
              <Button
                text="Tilbake"
                className="border border-lightGreen bg-lightGreen text-primary text-base rounded-[8px] h-[48px] font-medium relative py-[10px] flex items-center gap-2 px-[50px]"
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
    </>
  );
};
