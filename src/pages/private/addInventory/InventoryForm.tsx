/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from "react";
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
import Ic_delete_green from "../../../assets/images/Ic_delete_green.svg";
import { Plus, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { TextArea } from "../../../components/ui/textarea";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../../../config/firebaseConfig";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { fetchAdminDataByEmail, fetchInventoryData } from "../../../lib/utils";

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

const formSchema = z.object({
  navn: z.string().min(1, "Kategorinavn må bestå av minst 1 tegn."),
  produkter: z.array(productSchema).min(1, "Minst ett produkt er påkrevd."),
  isSelected: z.boolean().optional(),
});

export const InventoryForm: React.FC = () => {
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

  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id: any = pathSegments.length > 2 ? pathSegments[2] : null;
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
      isSelected: false,
    },
  });

  useEffect(() => {
    if (!id) {
      return;
    }
    const getData = async () => {
      const data = await fetchInventoryData(id);
      if (data && data.data) {
        Object.entries(data.data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            form.setValue(key as any, value);
          }
        });
      }
    };

    getData();
  }, [form, id]);

  const propagateToHouseModels = async (
    categoryId: string,
    newCategoryData: any
  ) => {
    const houseModelsSnap = await getDocs(collection(db, "house_model"));

    for (const houseDoc of houseModelsSnap.docs) {
      const husData = houseDoc.data();

      if (!husData.Huskonfigurator) continue;

      let updated = false;

      const hovedkategorinavn = husData.Huskonfigurator.hovedkategorinavn.map(
        (mainCat: any) => {
          const updatedKategorinavn = mainCat.Kategorinavn.map(
            (subCat: any) => {
              if (subCat.id === categoryId) {
                updated = true;
                return {
                  ...subCat,
                  ...newCategoryData,
                };
              }
              return subCat;
            }
          );
          return { ...mainCat, Kategorinavn: updatedKategorinavn };
        }
      );

      if (updated) {
        await updateDoc(doc(db, "house_model", houseDoc.id), {
          "Huskonfigurator.hovedkategorinavn": hovedkategorinavn,
        });
      }
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const formatDate = (date: Date) => {
        return date
          .toLocaleString("sv-SE", { timeZone: "UTC" })
          .replace(",", "");
      };

      const uniqueId = id ? id : uuidv4();
      const inventoryDocRef = doc(db, "inventory", uniqueId);

      const inventoryData = {
        ...data,
        id: uniqueId,
      };

      if (id) {
        await updateDoc(inventoryDocRef, {
          data: inventoryData,
          updatedAt: formatDate(new Date()),
          updated_by: createData?.id,
        });

        await propagateToHouseModels(uniqueId, inventoryData);

        toast.success("Lagret", {
          position: "top-right",
        });
      } else {
        await setDoc(inventoryDocRef, {
          data: inventoryData,
          updatedAt: formatDate(new Date()),
          createdAt: formatDate(new Date()),
          created_by: createData?.id,
          updated_by: createData?.id,
        });
        toast.success("Added successfully", { position: "top-right" });
      }

      navigate(`/inventory`);
    } catch (error) {
      console.error("Firestore operation failed:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
      });
    }
  };

  const file3DInputRef = React.useRef<HTMLInputElement | null>(null);

  const { prepend, remove } = useFieldArray({
    control: form.control,
    name: `produkter`,
  });

  const addProductAtIndex = () => {
    prepend({
      Produktnavn: "",
      Hovedbilde: [],
      pris: "",
      IncludingOffer: false,
      Produktbeskrivelse: "",
    });
  };

  const handle3DClick = useCallback(() => file3DInputRef.current?.click(), []);
  const handle3DDragOver = useCallback(
    (event: any) => event.preventDefault(),
    []
  );

  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(
    null
  );

  const produkter = form.watch(`produkter`);

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

    form.setValue(`produkter`, updatedProducts);

    setDraggingProductIndex(null);
    setDragOverProductIndex(null);
  };
  const removeProduct = (index: number) => {
    if (produkter.length > 1) {
      remove(index);
    }
  };
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6 mb-16 items-center">
            <div>
              <FormField
                control={form.control}
                name={`navn`}
                render={({ field, fieldState }) => {
                  return (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        Kategorinavn
                      </p>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Skriv inn Kategorinavn"
                            {...field}
                            className={`bg-white rounded-[8px] border text-black
                                          ${
                                            fieldState?.error
                                              ? "border-red"
                                              : "border-gray1"
                                          } `}
                            type="text"
                            value={field.value}
                          />
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
                name={`isSelected`}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative flex items-center gap-2 mt-3">
                        <input
                          className={`bg-white rounded-[8px] accent-primary border text-black
                                  ${
                                    fieldState?.error
                                      ? "border-red"
                                      : "border-gray1"
                                  } h-4 w-4`}
                          type="checkbox"
                          onChange={(e) => field.onChange(e.target.checked)}
                          checked={field.value}
                        />
                        <p
                          className={`${
                            fieldState.error ? "text-red" : "text-black"
                          } text-sm font-medium`}
                        >
                          Is mandatory
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div
              className="text-primary font-semibold text-base flex items-center gap-1 cursor-pointer h-full justify-end col-span-2"
              onClick={() => addProductAtIndex()}
            >
              <Plus />
              Legg til annet produkt
            </div>
            <div className="flex flex-col gap-4 md:gap-8 col-span-2">
              {produkter?.map((_product, index) => {
                const upload3DPhoto = form.watch(
                  `produkter.${index}.Hovedbilde`
                );
                return (
                  <div
                    className="flex flex-col gap-4 md:gap-8 cursor-move"
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
                      className="flex flex-col gap-4 md:gap-[18px] p-3 md:p-4 rounded-lg bg-white"
                      style={{
                        boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                      }}
                    >
                      <div className="flex items-center gap-2 md:gap-3 justify-between">
                        <h4 className="text-darkBlack text-sm md:text-base font-semibold">
                          Produktdetaljer
                        </h4>
                        <div
                          className={`flex text-sm md:text-base items-center gap-1 font-medium ${
                            produkter.length === 1
                              ? "text-gray cursor-not-allowed text-opacity-55"
                              : "text-primary cursor-pointer"
                          }`}
                          onClick={() => {
                            if (produkter.length > 1) {
                              removeProduct(index);
                            }
                          }}
                        >
                          <X className="h-4 w-4 md:h-6 md:w-6" /> Slett produkt
                        </div>
                      </div>
                      <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <FormField
                            control={form.control}
                            name={`produkter.${index}.Produktnavn`}
                            render={({ field, fieldState }) => {
                              const initialValue =
                                form.getValues(
                                  `produkter.${index}.Produktnavn`
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
                            name={`produkter.${index}.Hovedbilde`}
                            render={() => {
                              const fieldPath: any = `produkter.${index}.Hovedbilde`;
                              const initialValue = form.watch(fieldPath) || [];

                              const handleFileChange = async (
                                files: FileList | null
                              ) => {
                                if (files) {
                                  let newImages: any = [
                                    ...(initialValue || []),
                                  ];

                                  for (let i = 0; i < files.length; i++) {
                                    const file: any = files[i];

                                    if (file.size > 5 * 1024 * 1024) {
                                      toast.error(
                                        "Image size must be less than 5MB.",
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
                            name={`produkter.${index}.pris`}
                            render={({ field, fieldState }) => {
                              const initialValue = form.getValues(
                                `produkter.${index}.pris`
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
                                          id={`produkter.${index}.IncludingOffer`}
                                          className="toggle-input"
                                          checked={
                                            form.watch(
                                              `produkter.${index}.IncludingOffer`
                                            ) || false
                                          }
                                          name={`produkter.${index}.IncludingOffer`}
                                          onChange={(e: any) => {
                                            const checkedValue =
                                              e.target.checked;
                                            form.setValue(
                                              `produkter.${index}.IncludingOffer`,
                                              checkedValue
                                            );
                                            if (checkedValue) {
                                              form.setValue(
                                                `produkter.${index}.pris`,
                                                null
                                              );
                                            } else {
                                              form.setValue(
                                                `produkter.${index}.pris`,
                                                ""
                                              );
                                            }
                                          }}
                                        />
                                        <label
                                          htmlFor={`produkter.${index}.IncludingOffer`}
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
                                        disable={form.watch(
                                          `produkter.${index}.IncludingOffer`
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
                                              name: `produkter.${index}.pris`,
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
                          <div className="flex items-center gap-3 md:gap-5">
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
                                      `produkter.${index}.Hovedbilde`,
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
                                      const updatedFiles = upload3DPhoto.filter(
                                        (_, i) => i !== imgIndex
                                      );
                                      form.setValue(
                                        `produkter.${index}.Hovedbilde`,
                                        updatedFiles
                                      );
                                    }}
                                  >
                                    <img src={Ic_delete_green} alt="delete" />
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
                          name={`produkter.${index}.Produktbeskrivelse`}
                          render={({ field, fieldState }) => {
                            const initialValue =
                              form.getValues(
                                `produkter.${index}.Produktbeskrivelse`
                              ) || "";
                            return (
                              <FormItem>
                                <p
                                  className={`${
                                    fieldState.error ? "text-red" : "text-black"
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
            </div>
          </div>
          <div className="flex justify-end w-full gap-2.5 md:gap-5 items-center fixed bottom-0 bg-white z-50 border-t border-gray2 p-3 md:p-4 left-0">
            <div className="flex items-center gap-3 md:gap-5">
              <div
                onClick={() => {
                  form.reset();
                }}
              >
                <Button
                  text="Avbryt"
                  className="border border-lightGreen bg-lightGreen text-primary text-sm rounded-[8px] h-[40px] font-medium relative px-10 py-2 flex items-center gap-2"
                />
              </div>
              <Button
                text="Lagre"
                className="border border-primary bg-primary text-white text-sm rounded-[8px] h-[40px] font-medium relative px-10 py-2 flex items-center gap-2"
                type="submit"
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};
