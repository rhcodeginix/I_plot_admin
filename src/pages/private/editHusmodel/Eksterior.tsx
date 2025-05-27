/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import Ic_upload_photo from "../../../assets/images/Ic_upload_photo.svg";
import { Input } from "../../../components/ui/input";
import Ic_delete_purple from "../../../assets/images/Ic_delete_purple.svg";
import Ic_x_circle from "../../../assets/images/Ic_x_circle.svg";
import { Pencil, Plus, X } from "lucide-react";
import Modal from "../../../components/common/modal";
import { AddNewSubCat } from "./AddNewSubCat";
import { TextArea } from "../../../components/ui/textarea";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../../../config/firebaseConfig";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";

const fileSchema = z.union([
  z
    .instanceof(File)
    .refine((file: any) => file === null || file.size <= 10 * 1024 * 1024, {
      message: "Filstørrelsen må være mindre enn 10 MB.",
    }),
  z.string(),
]);

const productSchema = z.object({
  Produktnavn: z.string().min(1, "Produktnavn må bestå av minst 1 tegn."),
  Hovedbilde: z.array(fileSchema).min(1, "Minst én fil må lastes opp."),
  pris: z.string().nullable(),
  IncludingOffer: z.boolean().optional(),
  Produktbeskrivelse: z
    .string()
    .min(1, "Produktbeskrivelse må bestå av minst 1 tegn."),
});

const categorySchema = z.object({
  navn: z.string().min(1, "Kategorinavn må bestå av minst 1 tegn."),
  produkter: z.array(productSchema).min(1, "Minst ett produkt er påkrevd."),
});

const mainCategorySchema = z.object({
  navn: z.string().min(1, "Hovedkategorinavn må bestå av minst 1 tegn."),
  Beskrivelse: z.string().min(1, "Beskrivelse må bestå av minst 1 tegn."),
  Kategorinavn: z.array(categorySchema),
  isSelected: z.boolean().optional(),
});

const formSchema = z.object({
  hovedkategorinavn: z.array(mainCategorySchema),
});

export const Eksterior: React.FC<{
  setActiveTab: any;
  labelName: any;
  Category: any;
  activeTabData: any;
  setCategory: any;
}> = ({ setActiveTab, labelName, Category, activeTabData, setCategory }) => {
  const [activeSubTabData, setActiveSubTabData] = useState(0);

  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id: any = pathSegments.length > 2 ? pathSegments[2] : null;
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hovedkategorinavn: [
        {
          navn: "",
          Beskrivelse: "",
          Kategorinavn: [
            {
              navn: "",
              produkter: [
                {
                  Produktnavn: "",
                  Hovedbilde: [],
                  pris: "",
                  IncludingOffer: false,
                  Produktbeskrivelse: "",
                },
              ],
            },
          ],
        },
      ],
    },
  });

  const produkter = form.watch(
    `hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter`
  );

  const { fields, insert, remove } = useFieldArray({
    control: form.control,
    name: `hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter`,
  });

  const addProductAtIndex = (index: number) => {
    insert(index + 1, {
      Produktnavn: "",
      Hovedbilde: [],
      pris: "",
      IncludingOffer: false,
      Produktbeskrivelse: "",
    });
  };

  const removeProduct = (index: number) => {
    if (produkter.length > 1) {
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
        Huskonfigurator: husdetaljerData,
        updatedAt: formatDate(new Date()),
      });
      toast.success("Lagret", { position: "top-right" });

      navigate(`/edit-husmodell/${id}`);
      setActiveTab(2);
    } catch (error) {
      console.error("Firestore operation failed:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
      });
    }
  };

  const [AddSubCategory, setAddSubCategory] = useState(false);

  useEffect(() => {
    form.setValue("hovedkategorinavn", Category);
  }, [form, Category]);

  const prevProductsRef = useRef<any[]>([]);

  useEffect(() => {
    const updatedProducts = form.watch(
      `hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter`
    );

    if (!updatedProducts) return;

    if (
      JSON.stringify(prevProductsRef.current) !==
      JSON.stringify(updatedProducts)
    ) {
      setCategory((prev: any[]) => {
        const updatedCategories = [...prev];

        if (
          updatedCategories[activeTabData]?.Kategorinavn?.[activeSubTabData]
        ) {
          updatedCategories[activeTabData].Kategorinavn[
            activeSubTabData
          ].produkter = updatedProducts?.map((product: any, _index: number) => {
            return {
              Produktnavn: product.Produktnavn || "",
              Hovedbilde: product.Hovedbilde || [],
              pris: product.pris || "",
              IncludingOffer: product.IncludingOffer || false,
              Produktbeskrivelse: product.Produktbeskrivelse || "",
            };
          });
        }

        return updatedCategories;
      });

      prevProductsRef.current = updatedProducts;
    }
  }, [
    JSON.stringify(
      form.watch(
        `hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter`
      )
    ),
  ]);

  const handleToggleSubCategoryPopup = () => {
    if (AddSubCategory) {
      setAddSubCategory(false);
    } else {
      setAddSubCategory(true);
    }
  };
  const file3DInputRef = React.useRef<HTMLInputElement | null>(null);

  const handle3DClick = useCallback(() => file3DInputRef.current?.click(), []);
  const handle3DDragOver = useCallback(
    (event: any) => event.preventDefault(),
    []
  );

  const produkterPris = form.watch(`hovedkategorinavn`);

  const totalPris =
    produkterPris?.reduce((katAcc, kategori) => {
      return (
        katAcc +
        (kategori?.Kategorinavn?.reduce((acc, category) => {
          return (
            acc +
            (category?.produkter?.reduce((prodAcc, product) => {
              const numericValue = product.pris
                ?.replace(/\s/g, "")
                .replace(/\./g, "")
                .replace(",", ".");

              return prodAcc + (numericValue ? parseFloat(numericValue) : 0);
            }, 0) || 0)
          );
        }, 0) || 0)
      );
    }, 0) || 0;

  const hovedkategorinavn = (() => {
    const categories =
      form.getValues("hovedkategorinavn")?.[activeTabData]?.Kategorinavn || [];

    const filteredCategories = categories.filter((item: any) => {
      if (!item?.navn) {
        return false;
      }

      const hasNavn = item.navn.trim() !== "";
      const hasSubTabNavn = item?.[activeSubTabData]?.navn?.trim() !== "";

      return hasNavn || hasSubTabNavn;
    });

    return filteredCategories.length > 0 ? filteredCategories : [];
  })();

  const [draggingProductIndex, setDraggingProductIndex] = useState<
    number | null
  >(null);
  const [dragOverProductIndex, setDragOverProductIndex] = useState<
    number | null
  >(null);
  const handleDrop = () => {
    if (
      draggingProductIndex === null ||
      dragOverProductIndex === null ||
      draggingProductIndex === dragOverProductIndex
    ) {
      return;
    }

    const updatedProducts = [...produkter];
    const draggedItem = updatedProducts[draggingProductIndex];
    updatedProducts.splice(draggingProductIndex, 1);
    updatedProducts.splice(dragOverProductIndex, 0, draggedItem);

    form.setValue(
      `hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter`,
      updatedProducts
    );

    setDraggingProductIndex(null);
    setDragOverProductIndex(null);
  };

  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(
    null
  );
  const [editSubCatIndex, setEditSubCatIndex] = useState<number | null>(null);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="text-darkBlack font-semibold text-xl">
                {labelName}
              </h4>
              <h5
                className="text-purple font-semibold text-base cursor-pointer"
                onClick={() => setActiveTab(2)}
              >
                Hopp over steget
              </h5>
            </div>
            <FormField
              key={activeTabData}
              control={form.control}
              name={`hovedkategorinavn.${activeTabData}.Beskrivelse`}
              render={({ field, fieldState }) => {
                const wordCount =
                  field?.value && typeof field.value === "string"
                    ? field?.value?.trim().split(/\s+/).length
                    : 0;
                const maxWords = 20;

                return (
                  <FormItem>
                    <p
                      className={`${
                        fieldState.error ? "text-red" : "text-black"
                      } mb-[6px] text-sm font-medium`}
                    >
                      Beskrivelse
                    </p>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Skriv inn Beskrivelse"
                          {...field}
                          className={`bg-white rounded-[8px] border text-black ${
                            fieldState.error ? "border-red" : "border-gray1"
                          }`}
                          type="text"
                          onChange={(e: any) => {
                            const words = e?.target?.value?.trim().split(/\s+/);
                            if (words.length <= maxWords) {
                              field.onChange(e.target.value);
                              setCategory((prev: any) => {
                                const updatedCategory = [...prev];
                                updatedCategory[activeTabData] = {
                                  ...updatedCategory[activeTabData],
                                  Beskrivelse: e.target.value,
                                };
                                return updatedCategory;
                              });
                            }
                          }}
                        />
                        <div className="flex justify-end text-xs font-medium mt-[6px] text-black">
                          {wordCount}/{maxWords}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                );
              }}
            />
            <div className="mt-2 border-b border-gray2 flex items-center gap-6 h-[48px] mb-8">
              {hovedkategorinavn?.length > 0 && (
                <div className="flex items-center gap-4 overflow-x-auto overflowXAuto">
                  {hovedkategorinavn?.map((cat: any, index: number) => (
                    <div
                      key={index}
                      className={`cursor-pointer font-semibold gap-1 h-full flex items-center border-b-[3px] text-darkBlack py-3 px-5 whitespace-nowrap ${
                        activeSubTabData === index
                          ? "border-primary font-semibold"
                          : "border-transparent"
                      }`}
                      onClick={() => setActiveSubTabData(index)}
                    >
                      <span className="text-sm">{cat.navn}</span>
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditSubCatIndex(index);
                          setAddSubCategory(true);
                        }}
                      >
                        <Pencil className="w-5 h-5 text-primary" />
                      </div>
                      <img
                        src={Ic_x_circle}
                        alt="close"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const updatedCategories = hovedkategorinavn.filter(
                            (_, i) => i !== index
                          );

                          setCategory((prev: any) => {
                            const updatedCategory = [...prev];
                            updatedCategory[activeTabData] = {
                              ...updatedCategory[activeTabData],
                              Kategorinavn: updatedCategories,
                            };
                            return updatedCategory;
                          });

                          form.setValue(
                            `hovedkategorinavn.${activeTabData}.Kategorinavn`,
                            updatedCategories,
                            { shouldValidate: true }
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div
                className="text-purple font-semibold text-sm flex items-center gap-1 cursor-pointer h-full whitespace-nowrap"
                onClick={() => setAddSubCategory(true)}
              >
                <Plus />
                Legg til kategori
              </div>
            </div>
            {hovedkategorinavn?.length > 0 && (
              <div className="flex flex-col gap-8">
                {produkter?.map((_product, index) => {
                  const upload3DPhoto = form.watch(
                    `hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter.${index}.Hovedbilde`
                  );
                  return (
                    <div
                      className="flex flex-col gap-8 cursor-move"
                      key={index}
                      draggable
                      onDragStart={() => setDraggingProductIndex(index)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverProductIndex(index);
                      }}
                      onDrop={() => handleDrop()}
                    >
                      <div
                        className="flex flex-col gap-[18px] p-4 rounded-lg bg-white"
                        style={{
                          boxShadow:
                            "0px 2px 4px -2px #1018280F, 0px 4px 8px -2px #1018281A",
                        }}
                      >
                        <div className="flex items-center gap-3 justify-between">
                          <h4 className="text-darkBlack text-base font-semibold">
                            Produktdetaljer
                          </h4>
                          <div
                            className={`flex items-center gap-1 font-medium ${
                              produkter.length === 1
                                ? "text-gray cursor-not-allowed text-opacity-55"
                                : "text-purple cursor-pointer"
                            }`}
                            onClick={() => {
                              if (produkter.length > 1) {
                                removeProduct(index);
                              }
                            }}
                          >
                            <X /> Slett produkt
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <FormField
                              control={form.control}
                              name={`hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter.${index}.Produktnavn`}
                              render={({ field, fieldState }) => {
                                const initialValue =
                                  form.getValues(
                                    `hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter.${index}.Produktnavn`
                                  ) || "";
                                return (
                                  <FormItem>
                                    <p
                                      className={`${
                                        fieldState.error
                                          ? "text-red"
                                          : "text-black"
                                      } mb-[6px] text-sm font-medium`}
                                    >
                                      Produktnavn
                                    </p>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          placeholder="Skriv inn Produktnavn"
                                          {...field}
                                          className={`bg-white rounded-[8px] border text-black
                                          ${
                                            fieldState?.error
                                              ? "border-red"
                                              : "border-gray1"
                                          } `}
                                          type="text"
                                          value={initialValue ?? ""}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />
                          </div>
                          <div className="row-span-2">
                            <FormField
                              control={form.control}
                              name={`hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter.${index}.Hovedbilde`}
                              render={() => {
                                const fieldPath: any = `hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter.${index}.Hovedbilde`;
                                const initialValue =
                                  form.watch(fieldPath) || [];

                                const handleFileChange = async (
                                  files: FileList | null
                                ) => {
                                  if (files) {
                                    let newImages: any = [
                                      ...(initialValue || []),
                                    ];

                                    for (let i = 0; i < files.length; i++) {
                                      const file: any = files[i];

                                      if (file.size > 2 * 1024 * 1024) {
                                        toast.error(
                                          "Image size must be less than 2MB.",
                                          {
                                            position: "top-right",
                                          }
                                        );
                                        continue;
                                      }
                                      const fileType = "images";
                                      const timestamp = new Date().getTime();
                                      const fileName = `${timestamp}_${file?.name}`;

                                      const storageRef = ref(
                                        storage,
                                        `${fileType}/${fileName}`
                                      );

                                      const snapshot = await uploadBytes(
                                        storageRef,
                                        file
                                      );

                                      const url = await getDownloadURL(
                                        snapshot.ref
                                      );

                                      newImages.push(url);

                                      form.setValue(fieldPath, newImages);
                                      form.clearErrors(fieldPath);
                                    }
                                  }
                                };

                                return (
                                  <FormItem className="w-full">
                                    <FormControl>
                                      <div className="flex items-center gap-5 w-full">
                                        <div className="relative w-full">
                                          <div
                                            className="border border-gray2 rounded-[8px] px-3 laptop:px-6 py-4 flex justify-center items-center flex-col gap-3 cursor-pointer w-full"
                                            onDragOver={handle3DDragOver}
                                            onClick={handle3DClick}
                                            onDrop={(event) => {
                                              event.preventDefault();
                                              handleFileChange(
                                                event.dataTransfer.files
                                              );
                                            }}
                                          >
                                            <img
                                              src={Ic_upload_photo}
                                              alt="upload"
                                            />
                                            <p className="text-gray text-sm text-center truncate w-full">
                                              <span className="text-primary font-medium truncate">
                                                Klikk for opplasting
                                              </span>{" "}
                                              eller dra-og-slipp
                                            </p>
                                            <p className="text-gray text-sm text-center truncate w-full">
                                              SVG, PNG, JPG or GIF (maks.
                                              800x400px)
                                            </p>
                                            <input
                                              type="file"
                                              ref={file3DInputRef}
                                              className="hidden"
                                              multiple
                                              accept="image/png, image/jpeg, image/svg+xml, image/gif"
                                              onChange={(event) =>
                                                handleFileChange(
                                                  event.target.files
                                                )
                                              }
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />
                          </div>
                          <div>
                            <FormField
                              control={form.control}
                              name={`hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter.${index}.pris`}
                              render={({ field, fieldState }) => {
                                const initialValue = form.getValues(
                                  `hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter.${index}.pris`
                                );
                                return (
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
                                            id={`toggleSwitch.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter.${index}.IncludingOffer`}
                                            className="toggle-input"
                                            checked={
                                              form.watch(
                                                `hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter.${index}.IncludingOffer`
                                              ) || false
                                            }
                                            name={`hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter.${index}.IncludingOffer`}
                                            onChange={(e: any) => {
                                              const checkedValue =
                                                e.target.checked;
                                              form.setValue(
                                                `hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter.${index}.IncludingOffer`,
                                                checkedValue
                                              );
                                              if (checkedValue) {
                                                form.setValue(
                                                  `hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter.${index}.pris`,
                                                  null
                                                );
                                              } else {
                                                form.setValue(
                                                  `hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter.${index}.pris`,
                                                  ""
                                                );
                                              }
                                            }}
                                          />
                                          <label
                                            htmlFor={`toggleSwitch.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter.${index}.IncludingOffer`}
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
                                            `hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter.${index}.IncludingOffer`
                                          )}
                                          type="text"
                                          onChange={({
                                            target: { value },
                                          }: any) => {
                                            let cleaned = value
                                              .replace(/[^\d-]/g, "")
                                              .replace(/(?!^)-/g, "");

                                            const isNegative =
                                              cleaned.startsWith("-");

                                            const numericPart = cleaned.replace(
                                              /-/g,
                                              ""
                                            );

                                            let formatted = "";

                                            if (numericPart) {
                                              formatted = new Intl.NumberFormat(
                                                "no-NO"
                                              ).format(Number(numericPart));
                                              if (isNegative) {
                                                formatted = "-" + formatted;
                                              }
                                            } else {
                                              formatted = isNegative ? "-" : "";
                                            }

                                            field.onChange({
                                              target: {
                                                name: `hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter.${index}.pris`,
                                                value: formatted,
                                              },
                                            });
                                          }}
                                          value={
                                            initialValue === null
                                              ? "-"
                                              : initialValue
                                          }
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          {upload3DPhoto && (
                            <div className="mt-5 flex items-center gap-5">
                              {upload3DPhoto?.map(
                                (file: any, imgIndex: number) => (
                                  <div
                                    className="relative h-[140px] w-[140px]"
                                    key={imgIndex}
                                    draggable
                                    onDragStart={() =>
                                      setDraggedImageIndex(imgIndex)
                                    }
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => {
                                      if (
                                        draggedImageIndex === null ||
                                        draggedImageIndex === imgIndex
                                      )
                                        return;

                                      const newOrder = [...upload3DPhoto];
                                      const draggedItem =
                                        newOrder[draggedImageIndex];
                                      newOrder.splice(draggedImageIndex, 1);
                                      newOrder.splice(imgIndex, 0, draggedItem);

                                      form.setValue(
                                        `hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter.${index}.Hovedbilde`,
                                        newOrder
                                      );
                                      setDraggedImageIndex(null);
                                    }}
                                  >
                                    <img
                                      src={file}
                                      alt="logo"
                                      className="object-cover h-full w-full rounded-lg"
                                    />
                                    <div
                                      className="absolute top-2 right-2 bg-[#FFFFFFCC] rounded-[12px] p-[6px] cursor-pointer"
                                      onClick={() => {
                                        const updatedFiles =
                                          upload3DPhoto.filter(
                                            (_, i) => i !== imgIndex
                                          );
                                        form.setValue(
                                          `hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter.${index}.Hovedbilde`,
                                          updatedFiles
                                        );
                                      }}
                                    >
                                      <img
                                        src={Ic_delete_purple}
                                        alt="delete"
                                      />
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <FormField
                            control={form.control}
                            name={`hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter.${index}.Produktbeskrivelse`}
                            render={({ field, fieldState }) => {
                              const initialValue =
                                form.getValues(
                                  `hovedkategorinavn.${activeTabData}.Kategorinavn.${activeSubTabData}.produkter.${index}.Produktbeskrivelse`
                                ) || "";
                              return (
                                <FormItem>
                                  <p
                                    className={`${
                                      fieldState.error
                                        ? "text-red"
                                        : "text-black"
                                    } mb-[6px] text-sm font-medium`}
                                  >
                                    Produktbeskrivelse
                                  </p>
                                  <FormControl>
                                    <div className="relative">
                                      <TextArea
                                        placeholder="Skriv inn Produktbeskrivelse"
                                        {...field}
                                        className={`h-[130px] bg-white rounded-[8px] border text-black
                                  ${
                                    fieldState?.error
                                      ? "border-red"
                                      : "border-gray1"
                                  } `}
                                        value={initialValue}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div
                  className="text-purple font-semibold text-base flex items-center gap-1 cursor-pointer h-full"
                  onClick={() => addProductAtIndex(fields.length - 1)}
                >
                  <Plus />
                  Legg til annet produkt
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between w-full gap-5 items-center fixed bottom-0 bg-white z-50 border-t border-gray2 p-4 left-0">
            <div className="flex items-center gap-4">
              <span className="text-gray text-base mb-4">Totalpris</span>
              <div>
                <h3 className="mb-[2px] text-darkBlack font-semibold text-lg md:text-xl desktop:text-2xl">
                  {totalPris} NOK
                </h3>
                <h6 className="text-purple text-sm font-semibold">
                  Se oppstilling
                </h6>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div
                onClick={() => {
                  setActiveTab(0);
                }}
                
              >
                <Button
                  text="Avbryt"
                  className="border border-lightPurple bg-lightPurple text-purple text-sm rounded-[8px] h-[40px] font-medium relative px-10 py-2 flex items-center gap-2"
                />
              </div>
              <Button
                text="Lagre"
                className="border border-purple bg-purple text-white text-sm rounded-[8px] h-[40px] font-medium relative px-10 py-2 flex items-center gap-2"
                type="submit"
              />
            </div>
          </div>
        </form>
      </Form>
      {AddSubCategory && (
        <Modal onClose={handleToggleSubCategoryPopup} isOpen={true}>
          <div className="bg-white relative rounded-[12px] p-6 md:m-0 w-full sm:w-[518px]">
            <h4 className="mb-[20px] text-darkBlack font-medium text-xl">
              {editSubCatIndex !== null
                ? "Rediger underkategori"
                : "Legg til ny underkategori"}
            </h4>
            {/* <AddNewSubCat
              onClose={handleToggleSubCategoryPopup}
              formData={form}
              activeTabData={activeTabData}
              setCategory={setCategory}
            /> */}
            <AddNewSubCat
              onClose={() => {
                setAddSubCategory(false);
                setEditSubCatIndex(null);
              }}
              formData={form}
              activeTabData={activeTabData}
              setCategory={setCategory}
              editIndex={editSubCatIndex}
              defaultValue={
                editSubCatIndex !== null
                  ? hovedkategorinavn[editSubCatIndex]?.navn || ""
                  : ""
              }
            />
          </div>
        </Modal>
      )}
    </>
  );
};
