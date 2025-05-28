import React, { useEffect, useState } from "react";
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
import { Input } from "../../../components/ui/input";
import { X } from "lucide-react";
import { AddByggkostnader } from "./AddByggkostnader";
import { AddTomtekost } from "./AddTomtekost";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchHusmodellData } from "../../../lib/utils";

const formSchema = z.object({
  ByggekostnaderInfo: z.string().min(1, {
    message: "Byggekostnader Informasjon må bestå av minst 2 tegn.",
  }),
  Byggekostnader: z
    .array(
      z.object({
        byggkostnaderID: z.string(),
        Headline: z.string().min(1, {
          message: "Headline må bestå av minst 2 tegn.",
        }),
        MerInformasjon: z.string().min(1, {
          message: "MerInformasjon må bestå av minst 2 tegn.",
        }),
        pris: z
          .string()
          .min(1, {
            message: "Pris må bestå av minst 1 tegn.",
          })
          .nullable(),
        IncludingOffer: z.boolean().optional(),
      })
    )
    .min(1, "Minst ett produkt er påkrevd."),
  tomtekostnaderInfo: z.string().min(1, {
    message: "Tomtekostnader Informasjon må bestå av minst 2 tegn.",
  }),
  Tomtekost: z
    .array(
      z.object({
        TomtekostID: z.string(),
        Headline: z.string().min(1, {
          message: "Headline må bestå av minst 2 tegn.",
        }),
        MerInformasjon: z.string().min(1, {
          message: "MerInformasjon må bestå av minst 2 tegn.",
        }),
        pris: z
          .string()
          .min(1, {
            message: "Pris må bestå av minst 1 tegn.",
          })
          .nullable(),
        IncludingOffer: z.boolean().optional(),
      })
    )
    .min(1, "Minst ett produkt er påkrevd."),
});

export const Prisliste: React.FC<{ setActiveTab: any }> = ({
  setActiveTab,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ByggekostnaderInfo: "",
      Byggekostnader: [
        {
          byggkostnaderID: "",
          Headline: "",
          MerInformasjon: "",
          pris: "",
          IncludingOffer: false,
        },
      ],
      tomtekostnaderInfo: "",
      Tomtekost: [
        {
          TomtekostID: "",
          Headline: "",
          MerInformasjon: "",
          pris: "",
          IncludingOffer: false,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "Byggekostnader",
  });

  const {
    fields: TomtekostFields,
    append: TomtekostAppend,
    remove: TomtekostRemove,
  } = useFieldArray({
    control: form.control,
    name: "Tomtekost",
  });

  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id: any = pathSegments.length > 2 ? pathSegments[2] : null;
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      return;
    }
    const getData = async () => {
      const data = await fetchHusmodellData(id);
      if (data && data.Prisliste) {
        Object.entries(data.Prisliste).forEach(([key, value]) => {
          if (value !== undefined && value !== null)
            form.setValue(key as any, value);
        });
      }
    };

    getData();
  }, [form, id]);

  const addProduct = () => {
    append({
      byggkostnaderID: "",
      Headline: "",
      MerInformasjon: "",
      pris: "",
      IncludingOffer: false,
    });
  };

  const addTomtekostProduct = () => {
    TomtekostAppend({
      TomtekostID: "",
      Headline: "",
      MerInformasjon: "",
      pris: "",
      IncludingOffer: false,
    });
  };

  const removeTomtekostProduct = (index: number) => {
    if (TomtekostFields.length > 1) {
      TomtekostRemove(index);
    }
  };
  const removeProduct = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const husmodellDocRef = doc(db, "house_model", id);

      const husdetaljerData = {
        ...data,
        id: id,
      };
      const formatDate = (date: Date) => {
        return date
          .toLocaleString("sv-SE", { timeZone: "UTC" })
          .replace(",", "");
      };
      await updateDoc(husmodellDocRef, {
        Prisliste: husdetaljerData,
        updatedAt: formatDate(new Date()),
      });
      toast.success("Lagret", { position: "top-right" });

      navigate(`/Husmodeller`);
    } catch (error) {
      console.error("Firestore operation failed:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
      });
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 170;
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };
  const [currentDiv, setCurrentDiv] = useState("byggekostnader");

  useEffect(() => {
    const handleWheelScroll = () => {
      const sections = ["byggekostnader", "tomkostnader"];
      let closestSection = currentDiv;
      let minDistance = Infinity;

      sections.forEach((id) => {
        const section = document.getElementById(id);
        if (section) {
          const rect = section.getBoundingClientRect();
          const distance = Math.abs(rect.top - 170);

          if (distance < minDistance) {
            minDistance = distance;
            closestSection = id;
          }
        }
      });

      if (closestSection !== currentDiv) {
        setCurrentDiv(closestSection);
      }
    };

    window.addEventListener("wheel", handleWheelScroll);
    return () => {
      window.removeEventListener("wheel", handleWheelScroll);
    };
  }, [currentDiv]);

  const Byggekostnader = form.watch("Byggekostnader");

  const totalPrisOfByggekostnader = Byggekostnader
    ? Byggekostnader.reduce((acc, prod) => {
        const numericValue = prod.pris
          ?.replace(/\s/g, "")
          .replace(/\./g, "")
          .replace(",", ".");
        return acc + (numericValue ? parseFloat(numericValue) : 0);
      }, 0)
    : 0;

  const Tomtekost = form.watch("Tomtekost");

  const totalPrisOfTomtekost = Tomtekost
    ? Tomtekost.reduce((acc, prod) => {
        const numericValue = prod.pris
          ?.replace(/\s/g, "")
          .replace(/\./g, "")
          .replace(",", ".");
        return acc + (numericValue ? parseFloat(numericValue) : 0);
      }, 0)
    : 0;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <div className="w-full bg-white sticky top-[70px] md:top-[80px] shadow-shadow1 py-2 z-50">
            <div className="bg-lightPurple flex items-center gap-2 rounded-lg p-[6px] mx-4 md:mx-6 w-max">
              <div
                className={`cursor-pointer px-5 py-2 text-sm rounded-lg ${
                  currentDiv === "byggekostnader" &&
                  "font-semibold bg-white shadow-shadow2"
                }`}
                onClick={() => {
                  scrollToSection("byggekostnader");
                  setCurrentDiv("byggekostnader");
                }}
              >
                Byggekostnader
              </div>
              <div
                className={`cursor-pointer px-5 py-2 text-sm rounded-lg ${
                  currentDiv === "tomkostnader" &&
                  "font-semibold bg-white shadow-shadow2"
                }`}
                onClick={() => {
                  scrollToSection("tomkostnader");
                  setCurrentDiv("tomkostnader");
                }}
              >
                Tomkostnader
              </div>
            </div>
          </div>
          <div className="p-4 md:p-6 mb-10 md:mb-14 desktop:mb-20 relative">
            <div className="flex flex-col gap-5 desktop:gap-8">
              <div
                className="flex flex-col lg:flex-row gap-5 desktop:gap-8"
                id="byggekostnader"
              >
                <div className="w-full lg:w-[30%] desktop:w-[20%]">
                  <h5 className="text-black text-sm font-medium">
                    Byggekostnader
                  </h5>
                  <p className="text-gray text-sm whitespace-nowrap truncate">
                    Update photos and House details.
                  </p>
                </div>
                <div className="w-full lg:w-[70%] desktop:w-[80%] shadow-shadow2 px-4 lg:px-6 py-4 md:py-5 rounded-lg flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <h5 className="text-black font-semibold text-base">
                      Sum byggkostnader
                    </h5>
                    <div className="flex flex-col md:grid grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <FormField
                          control={form.control}
                          name="ByggekostnaderInfo"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <p
                                className={`${
                                  fieldState.error ? "text-red" : "text-black"
                                } mb-[6px] text-sm font-medium`}
                              >
                                Mer informasjon
                              </p>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder="Skriv inn Mer informasjon"
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
                      <div className="text-darkBlack text-right font-bold text-lg md:text-xl desktop:text-2xl">
                        {totalPrisOfByggekostnader} NOK
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray2"></div>
                  <div className="flex flex-col gap-5 desktop:gap-8">
                    {fields.map((product, index) => {
                      return (
                        <div key={product.id}>
                          {product.byggkostnaderID ? (
                            <div className="flex flex-col gap-4 md:gap-[18px]">
                              <div className="flex items-center gap-1.5 md:gap-3 justify-between">
                                <div className="w-full">
                                  <FormField
                                    control={form.control}
                                    name={`Byggekostnader.${index}.Headline`}
                                    render={({ field, fieldState }) => (
                                      <FormItem>
                                        <p
                                          className={`${
                                            fieldState.error
                                              ? "text-red"
                                              : "text-black"
                                          } mb-[6px] text-sm font-medium`}
                                        >
                                          Heading
                                        </p>
                                        <FormControl>
                                          <div className="relative">
                                            <Input
                                              placeholder="Skriv inn Heading"
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
                                <div
                                  className={`w-max text-sm md:text-base whitespace-nowrap flex items-center gap-1 font-medium ${
                                    fields.length === 1
                                      ? "text-gray cursor-not-allowed text-opacity-55"
                                      : "text-purple cursor-pointer"
                                  }`}
                                  onClick={() => {
                                    if (fields.length > 1) {
                                      removeProduct(index);
                                    }
                                  }}
                                >
                                  <X className="w-4 h-4 md:w-6 md:h-6" /> Slett
                                  produkt
                                </div>
                              </div>
                              <div className="flex flex-col md:grid grid-cols-2 gap-4 md:gap-6">
                                <div>
                                  <FormField
                                    control={form.control}
                                    name={`Byggekostnader.${index}.MerInformasjon`}
                                    render={({ field, fieldState }) => (
                                      <FormItem>
                                        <p
                                          className={`${
                                            fieldState.error
                                              ? "text-red"
                                              : "text-black"
                                          } mb-[6px] text-sm font-medium`}
                                        >
                                          Mer informasjon
                                        </p>
                                        <FormControl>
                                          <div className="relative">
                                            <Input
                                              placeholder="Skriv inn Mer informasjon"
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
                                    name={`Byggekostnader.${index}.pris`}
                                    render={({ field, fieldState }) => (
                                      <FormItem>
                                        <div className="flex items-center justify-between gap-2 mb-[6px]">
                                          <p
                                            className={`${
                                              fieldState.error
                                                ? "text-red"
                                                : "text-black"
                                            } text-sm font-medium`}
                                          >
                                            Pris fra
                                          </p>
                                          <div className="flex items-center gap-3 text-black text-sm font-medium">
                                            inkl. i tilbud
                                            <div className="toggle-container">
                                              <input
                                                type="checkbox"
                                                id={`toggleSwitch${product.id}`}
                                                className="toggle-input"
                                                checked={
                                                  form.watch(
                                                    `Byggekostnader.${index}.IncludingOffer`
                                                  ) || false
                                                }
                                                name={`Byggekostnader.${index}.IncludingOffer`}
                                                onChange={(e: any) => {
                                                  const checkedValue =
                                                    e.target.checked;
                                                  form.setValue(
                                                    `Byggekostnader.${index}.IncludingOffer`,
                                                    checkedValue
                                                  );
                                                  if (checkedValue) {
                                                    form.setValue(
                                                      `Byggekostnader.${index}.pris`,
                                                      null
                                                    );
                                                  } else {
                                                    form.setValue(
                                                      `Byggekostnader.${index}.pris`,
                                                      ""
                                                    );
                                                  }
                                                }}
                                              />
                                              <label
                                                htmlFor={`toggleSwitch${product.id}`}
                                                className="toggle-label"
                                              ></label>
                                            </div>
                                          </div>
                                        </div>
                                        <FormControl>
                                          <div className="relative">
                                            <Input
                                              placeholder="Skriv inn Pris fra"
                                              {...field}
                                              className={`bg-white rounded-[8px] border text-black
                                        ${
                                          fieldState?.error
                                            ? "border-red"
                                            : "border-gray1"
                                        } `}
                                              inputMode="numeric"
                                              disabled={form.watch(
                                                `Byggekostnader.${index}.IncludingOffer`
                                              )}
                                              type="text"
                                              onChange={({
                                                target: { value },
                                              }: any) =>
                                                field.onChange({
                                                  target: {
                                                    name: `Byggekostnader.${index}.pris`,
                                                    value: value.replace(
                                                      /\D/g,
                                                      ""
                                                    )
                                                      ? new Intl.NumberFormat(
                                                          "no-NO"
                                                        ).format(
                                                          Number(
                                                            value.replace(
                                                              /\D/g,
                                                              ""
                                                            )
                                                          )
                                                        )
                                                      : "",
                                                  },
                                                })
                                              }
                                              value={
                                                field.value === null
                                                  ? "-"
                                                  : field.value
                                              }
                                            />
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                              {index === fields.length - 1 && (
                                <div className={`border-t border-gray2`}></div>
                              )}
                            </div>
                          ) : (
                            <AddByggkostnader
                              product={product}
                              formValue={form}
                            />
                          )}
                        </div>
                      );
                    })}

                    <div className="flex justify-end">
                      <div
                        className="text-white rounded-lg w-max bg-purple font-medium justify-center text-base flex items-center gap-1 cursor-pointer h-full px-4 py-[10px]"
                        onClick={addProduct}
                      >
                        + Legg til ny byggekostnad
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="flex flex-col lg:flex-row gap-5 desktop:gap-8"
                id="tomkostnader"
              >
                <div className="w-full lg:w-[30%] desktop:w-[20%]">
                  <h5 className="text-black text-sm font-medium">
                    Tomkostnader
                  </h5>
                  <p className="text-gray text-sm whitespace-nowrap truncate">
                    Update photos and House details.
                  </p>
                </div>
                <div className="w-full lg:w-[70%] desktop:w-[80%] shadow-shadow2 px-4 lg:px-6 py-4 md:py-5 rounded-lg flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <h5 className="text-black font-semibold text-base">
                      Sum tomtekostnader
                    </h5>
                    <div className="flex flex-col md:grid grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <FormField
                          control={form.control}
                          name="tomtekostnaderInfo"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <p
                                className={`${
                                  fieldState.error ? "text-red" : "text-black"
                                } mb-[6px] text-sm font-medium`}
                              >
                                Mer informasjon
                              </p>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder="Skriv inn Mer informasjon"
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
                      <div className="text-darkBlack text-right font-bold text-lg md:text-xl desktop:text-2xl">
                        {totalPrisOfTomtekost} NOK
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray2"></div>
                  <div className="flex flex-col gap-5 desktop:gap-8">
                    {TomtekostFields.map((product, index) => {
                      return (
                        <div key={product.id}>
                          {product.TomtekostID ? (
                            <div className="flex flex-col gap-4 md:gap-[18px]">
                              <div className="flex items-center gap-1.5 md:gap-3 justify-between">
                                <div className="w-full">
                                  <FormField
                                    control={form.control}
                                    name={`Tomtekost.${index}.Headline`}
                                    render={({ field, fieldState }) => (
                                      <FormItem>
                                        <p
                                          className={`${
                                            fieldState.error
                                              ? "text-red"
                                              : "text-black"
                                          } mb-[6px] text-sm font-medium`}
                                        >
                                          Heading
                                        </p>
                                        <FormControl>
                                          <div className="relative">
                                            <Input
                                              placeholder="Skriv inn Heading"
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
                                <div
                                  className={`flex text-sm md:text-base whitespace-nowrap w-max items-center gap-1 font-medium ${
                                    TomtekostFields.length === 1
                                      ? "text-gray cursor-not-allowed text-opacity-55"
                                      : "text-purple cursor-pointer"
                                  }`}
                                  onClick={() => {
                                    if (TomtekostFields.length > 1) {
                                      removeTomtekostProduct(index);
                                    }
                                  }}
                                >
                                  <X className="w-4 h-4 md:w-6 md:h-6" /> Slett
                                  produkt
                                </div>
                              </div>
                              <div className="flex flex-col md:grid grid-cols-2 gap-4 md:gap-6">
                                <div>
                                  <FormField
                                    control={form.control}
                                    name={`Tomtekost.${index}.MerInformasjon`}
                                    render={({ field, fieldState }) => (
                                      <FormItem>
                                        <p
                                          className={`${
                                            fieldState.error
                                              ? "text-red"
                                              : "text-black"
                                          } mb-[6px] text-sm font-medium`}
                                        >
                                          Mer informasjon
                                        </p>
                                        <FormControl>
                                          <div className="relative">
                                            <Input
                                              placeholder="Skriv inn Mer informasjon"
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
                                    name={`Tomtekost.${index}.pris`}
                                    render={({ field, fieldState }) => (
                                      <FormItem>
                                        <div className="flex items-center justify-between gap-2 mb-[6px]">
                                          <p
                                            className={`${
                                              fieldState.error
                                                ? "text-red"
                                                : "text-black"
                                            } text-sm font-medium`}
                                          >
                                            Pris fra
                                          </p>
                                          <div className="flex items-center gap-3 text-black text-sm font-medium">
                                            inkl. i tilbud
                                            <div className="toggle-container">
                                              <input
                                                type="checkbox"
                                                id={`toggleSwitch${product.id}`}
                                                className="toggle-input"
                                                checked={
                                                  form.watch(
                                                    `Tomtekost.${index}.IncludingOffer`
                                                  ) || false
                                                }
                                                name={`Tomtekost.${index}.IncludingOffer`}
                                                onChange={(e: any) => {
                                                  const checkedValue =
                                                    e.target.checked;
                                                  form.setValue(
                                                    `Tomtekost.${index}.IncludingOffer`,
                                                    checkedValue
                                                  );
                                                  if (checkedValue) {
                                                    form.setValue(
                                                      `Tomtekost.${index}.pris`,
                                                      null
                                                    );
                                                  } else {
                                                    form.setValue(
                                                      `Tomtekost.${index}.pris`,
                                                      ""
                                                    );
                                                  }
                                                }}
                                              />
                                              <label
                                                htmlFor={`toggleSwitch${product.id}`}
                                                className="toggle-label"
                                              ></label>
                                            </div>
                                          </div>
                                        </div>
                                        <FormControl>
                                          <div className="relative">
                                            <Input
                                              placeholder="Skriv inn Pris fra"
                                              {...field}
                                              className={`bg-white rounded-[8px] border text-black
                                        ${
                                          fieldState?.error
                                            ? "border-red"
                                            : "border-gray1"
                                        } `}
                                              inputMode="numeric"
                                              disabled={form.watch(
                                                `Tomtekost.${index}.IncludingOffer`
                                              )}
                                              type="text"
                                              onChange={({
                                                target: { value },
                                              }: any) =>
                                                field.onChange({
                                                  target: {
                                                    name: `Tomtekost.${index}.pris`,
                                                    value: value.replace(
                                                      /\D/g,
                                                      ""
                                                    )
                                                      ? new Intl.NumberFormat(
                                                          "no-NO"
                                                        ).format(
                                                          Number(
                                                            value.replace(
                                                              /\D/g,
                                                              ""
                                                            )
                                                          )
                                                        )
                                                      : "",
                                                  },
                                                })
                                              }
                                              value={
                                                field.value === null
                                                  ? "-"
                                                  : field.value
                                              }
                                            />
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                              {index === TomtekostFields.length - 1 && (
                                <div className={`border-t border-gray2`}></div>
                              )}
                            </div>
                          ) : (
                            <AddTomtekost product={product} formValue={form} />
                          )}
                        </div>
                      );
                    })}

                    <div className="flex justify-end">
                      <div
                        className="text-white rounded-lg w-max bg-purple font-medium justify-center text-base flex items-center gap-1 cursor-pointer h-full px-4 py-[10px]"
                        onClick={addTomtekostProduct}
                      >
                        + Legg til ny tomtekost
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end w-full gap-5 items-center sticky bottom-0 bg-white z-50 border-t border-gray2 p-4 left-0">
            <div onClick={() => setActiveTab(1)}>
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
