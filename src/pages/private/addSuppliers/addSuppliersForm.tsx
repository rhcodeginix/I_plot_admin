import React, { useEffect, useState } from "react";
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
import Ic_upload_photo from "../../../assets/images/Ic_upload_photo.svg";
import { v4 as uuidv4 } from "uuid";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { z } from "zod";
import toast from "react-hot-toast";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../../../config/firebaseConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { InputMobile } from "../../../components/ui/inputMobile";
import { parsePhoneNumber } from "react-phone-number-input";
import {
  fetchAdminDataByEmail,
  fetchSupplierData,
  phoneNumberValidations,
} from "../../../lib/utils";

const formSchema = z.object({
  photo: z.union([
    z
      .instanceof(File)
      .refine((file: any) => file === null || file.size <= 10 * 1024 * 1024, {
        message: "Filstørrelsen må være mindre enn 10 MB.",
      }),
    z.string(),
  ]),
  company_name: z.string().min(1, {
    message: "Firmanavn må bestå av minst 2 tegn.",
  }),
  Orgnr: z.number().min(1, {
    message: "Orgnr må bestå av minst 1 tegn.",
  }),
  Nettside: z
    .string()
    .min(1, { message: "Nettside må bestå av minst 1 tegn." })
    .regex(
      /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?(\/.*)?$/,
      { message: "Vennligst skriv inn en gyldig URL." }
    ),
  Adresse: z.string().min(6, {
    message: "Adresse må bestå av minst 6 tegn.",
  }),
  Telefon: z.string().refine(
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
  EPost: z
    .string()
    .email({ message: "Vennligst skriv inn en gyldig e-postadresse." })
    .min(1, { message: "E-posten må være på minst 2 tegn." }),
  Kontaktperson: z.string().min(1, {
    message: "Kontaktperson må bestå av minst 2 tegn.",
  }),
  KontaktpersonEPost: z
    .string()
    .email({
      message: "Vennligst skriv inn en gyldig Kontaktperson e-postadresse.",
    })
    .min(1, { message: "Kontaktperson e-posten må være på minst 2 tegn." }),
  KontaktpersonMobil: z.string().refine(
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
  type_partner: z.string().min(1, { message: "Type partner må spesifiseres." }),
  cpo: z.string().min(1, { message: "CPO must må spesifiseres." }),
  cpl: z.string().min(1, { message: "CPL must må spesifiseres." }),
});

export const AddSuppliersForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  const navigate = useNavigate();
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
  useEffect(() => {
    if (!id) {
      return;
    }
    const getData = async () => {
      const data = await fetchSupplierData(id);
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null)
            form.setValue(key as any, value);
        });
      }
    };

    getData();
  }, [form, id]);

  const uploadFile = async (file: File, fieldName: any) => {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB.", {
        position: "top-right",
      });
      return;
    }
    const fileType = "images";
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `${fileType}/${fileName}`);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      form.setValue(fieldName, url);
      form.clearErrors(fieldName);
    } catch (error) {
      console.error(`Error uploading file for ${fieldName}:`, error);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files[0]) {
      await uploadFile(files[0], "photo");
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files[0]) {
      await uploadFile(files[0], "photo");
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  const uploadPhoto = form.watch("photo");

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (data.Nettside && !/^https?:\/\//i.test(data.Nettside)) {
        data.Nettside = `https://${data.Nettside}`;
      }

      const formatter = new Intl.DateTimeFormat("nb-NO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const uniqueId = id ? id : uuidv4();
      const supplierDocRef = doc(db, "suppliers", uniqueId);

      if (id) {
        await updateDoc(supplierDocRef, {
          ...data,
          id: uniqueId,
          updatedAt: formatter.format(new Date()),
        });
        toast.success("Lagret", {
          position: "top-right",
        });
      } else {
        await setDoc(supplierDocRef, {
          ...data,
          id: uniqueId,
          updatedAt: formatter.format(new Date()),
          createdAt: formatter.format(new Date()),
          Produkter: 0,
          createDataBy: {
            email: createData?.email,
            photo: createData?.photo,
            name: createData?.name,
          },
        });
        toast.success("Added successfully", { position: "top-right" });
      }

      navigate(`/Leverandorer`);
    } catch (error) {
      console.error("Firestore operation failed:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <div className="p-4 md:p-5 laptop:p-6">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 md:gap-6">
              <div className="md:col-span-2 flex flex-col md:flex-row gap-4 md:gap-6 md:items-center">
                <div className="w-full md:w-1/2">
                  <FormField
                    control={form.control}
                    name="photo"
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <div
                              className="border border-gray2 rounded-[8px] px-3 laptop:px-6 py-4 flex justify-center items-center flex-col gap-2 md:gap-3 cursor-pointer"
                              onDragOver={handleDragOver}
                              onClick={handleClick}
                              onDrop={handleDrop}
                            >
                              <img src={Ic_upload_photo} alt="upload" />
                              <p className="text-gray text-xs md:text-sm text-center truncate w-full">
                                <span className="text-primary font-medium truncate">
                                  Klikk for opplasting
                                </span>{" "}
                                eller dra-og-slipp
                              </p>
                              <p className="text-gray text-xs md:text-sm text-center truncate w-full">
                                SVG, PNG, JPG or GIF (maks. 800x400px)
                              </p>
                              <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".svg, .png, .jpg, .jpeg, .gif"
                                onChange={handleFileChange}
                                name="photo"
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-full md:w-1/2">
                  {typeof uploadPhoto === "string" && (
                    <img
                      src={uploadPhoto}
                      alt="logo"
                      height="140px"
                      width="140px"
                    />
                  )}
                </div>
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        Selskapsnavn
                      </p>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Skriv inn Selskapsnavn"
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
                  name="Orgnr"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        Orgnr:
                      </p>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Skriv inn Orgnr"
                            {...field}
                            className={`bg-white rounded-[8px] border text-black
                                          ${
                                            fieldState?.error
                                              ? "border-red"
                                              : "border-gray1"
                                          } `}
                            type="number"
                            onChange={(e: any) =>
                              field.onChange(Number(e.target.value) || "")
                            }
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
                  name="Nettside"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        Nettside
                      </p>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Skriv inn Nettside"
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
                  name="Adresse"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
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
                  name="Telefon"
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
                  name="EPost"
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
                  name="Kontaktperson"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        Kontaktperson
                      </p>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Skriv inn Kontaktperson"
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
                  name="KontaktpersonEPost"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        Kontaktperson e-post
                      </p>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Skriv inn Kontaktperson e-post"
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
                  name="KontaktpersonMobil"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        Kontaktperson mobil
                      </p>
                      <FormControl>
                        <div className="relative">
                          <InputMobile
                            placeholder="Skriv inn Kontaktperson mobil"
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
                  name="type_partner"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        Type partner
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
                            <SelectValue placeholder="Enter Type partner" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectGroup>
                              <SelectItem value="Hytteprodusent">
                                Hytteprodusent
                              </SelectItem>
                              <SelectItem value="Boligprodusent">
                                Boligprodusent
                              </SelectItem>
                              <SelectItem value="Hytte og boligprodusent">
                                Hytte og boligprodusent
                              </SelectItem>
                              <SelectItem value="Bank">Bank</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="cpo"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        CPO (Cost per Order)
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
                            <SelectValue placeholder="Enter CPO (Cost per Order)" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectGroup>
                              <SelectItem value="0 NOK">0 NOK</SelectItem>
                              <SelectItem value="14.900 NOK">
                                14.900 NOK
                              </SelectItem>
                              <SelectItem value="19.900 NOK">
                                19.900 NOK
                              </SelectItem>
                              <SelectItem value="24.900 NOK">
                                24.900 NOK
                              </SelectItem>
                              <SelectItem value="29.900 NOK">
                                29.900 NOK
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
              <div>
                <FormField
                  control={form.control}
                  name="cpl"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        Cost per Lead
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
                            <SelectValue placeholder="Enter Cost per Lead" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectGroup>
                              <SelectItem value="0 NOK">0 NOK</SelectItem>
                              <SelectItem value="249 NOK">249 NOK</SelectItem>
                              <SelectItem value="499 NOK">499 NOK</SelectItem>
                              <SelectItem value="749 NOK">749 NOK</SelectItem>
                              <SelectItem value="999 NOK">999 NOK</SelectItem>
                              <SelectItem value="1249 NOK">1249 NOK</SelectItem>
                              <SelectItem value="1490 NOK">1490 NOK</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end w-full gap-5 items-center sticky bottom-0 bg-white z-50 border-t border-gray2 p-4">
            <div onClick={() => form.reset()}>
              <Button
                text="Avbryt"
                className="border border-gray2 text-black text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
              />
            </div>
            <Button
              text="Lagre"
              className="border border-purple bg-purple text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
              type="submit"
            />
          </div>
        </form>
      </Form>
    </>
  );
};
