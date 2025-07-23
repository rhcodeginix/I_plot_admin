/* eslint-disable react-hooks/exhaustive-deps */
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
import Ic_upload_photo from "../../../assets/images/Ic_upload_photo.svg";
import Ic_delete_purple from "../../../assets/images/Ic_delete_purple.svg";
import Img_pdf from "../../../assets/images/Img_pdf.png";
import { TextArea } from "../../../components/ui/textarea";
import { useLocation } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../../config/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import toast from "react-hot-toast";
import { Input } from "../../../components/ui/input";

const formSchema: any = z.object({
  pdf: z
    .array(
      z.union([
        z
          .instanceof(File)
          .refine(
            (file: any) => file === null || file.size <= 10 * 1024 * 1024,
            {
              message: "Filstørrelsen må være mindre enn 10 MB.",
            }
          ),
        z.string(),
      ])
    )
    .min(1, "Minst ett bilde kreves."),
  text: z.string().min(1, {
    message: "text må bestå av minst 2 tegn.",
  }),
  paid_date: z.string().min(1, "Dato utbetalt er påkrevd"),
  pris: z.string().min(1, {
    message: "Pris må bestå av minst 1 tegn.",
  }),
});

export const Payment: React.FC<{
  SelectIndex: any;
  setIsPDFModalOpen: any;
  getData: any;
}> = ({ SelectIndex, setIsPDFModalOpen, getData }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;

  useEffect(() => {
    const fetchExistingPayment = async () => {
      if (!id) return;

      const docRef = doc(db, "bank_leads", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const paymentData = data?.Fremdriftsplan?.[SelectIndex]?.payment;

        if (paymentData) {
          form.setValue("text", paymentData.text || "");
          form.setValue("paid_date", paymentData.paid_date || "");
          form.setValue("pris", paymentData.pris || "");
          form.setValue("pdf", paymentData.pdf || []);
        }
      }
    };

    fetchExistingPayment();
  }, [id, SelectIndex]);

  const filepdfInputRef = React.useRef<HTMLInputElement | null>(null);
  const uploadpdf: any = form.watch("pdf");
  const [status, setStatus] = useState("");

  const handleFileUpload = async (files: FileList, fieldName: any) => {
    if (!files.length) return;

    const currentImages = Array.isArray(uploadpdf) ? uploadpdf : [];
    let newImages = [...currentImages];

    const uploadPromises = Array.from(files).map(async (file) => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB.", {
          position: "top-right",
        });
        return null;
      }

      const fileType = "documents";
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `${fileType}/${fileName}`);

      try {
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error("Error uploading file:", error);
        return null;
      }
    });

    const uploadedUrls = (await Promise.all(uploadPromises)).filter(
      Boolean
    ) as string[];

    if (uploadedUrls.length) {
      newImages = [...newImages, ...uploadedUrls];
      form.setValue(fieldName, newImages);
      form.clearErrors(fieldName);
    }
  };

  const handlepdfFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      await handleFileUpload(event.target.files, "pdf");
    }
  };

  const handlepdfClick = () => {
    filepdfInputRef.current?.click();
  };

  const handlepdfDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      await handleFileUpload(event.dataTransfer.files, "pdf");
    }
  };

  const handlepdfDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const formatDate = (date: Date) => {
        return date
          .toLocaleString("sv-SE", { timeZone: "UTC" })
          .replace(",", "");
      };

      if (id) {
        const bankDocRef = doc(db, "bank_leads", String(id));

        const updatePayload: any = {
          [`Fremdriftsplan.${SelectIndex}.payment`]: data,
          updatedAt: formatDate(new Date()),
        };
        updatePayload[`Fremdriftsplan.${SelectIndex}.status`] = status;

        await updateDoc(bankDocRef, updatePayload);

        toast.success("Lagret", {
          position: "top-right",
        });
        getData();
      }

      setIsPDFModalOpen(false);
      setStatus("");
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
          <h2 className="text-darkBlack text-base md:text-lg lg:text-xl font-semibold p-3 md:p-5 border-b border-[#DCDFEA]">
            Grunnarbeider: Svar til utbygger
          </h2>
          <div className="mb-5 p-3 md:p-5">
            <div className="flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-5">
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        Legg igjen utfyllende tekst til banken:
                      </p>
                      <FormControl>
                        <div className="relative">
                          <TextArea
                            placeholder="Beskrivelse ...."
                            {...field}
                            className={`h-[160px] bg-white rounded-[8px] border text-black
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
              <div>
                <FormField
                  control={form.control}
                  name="pris"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        Pris fra
                      </p>
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
                            type="text"
                            onChange={({ target: { value } }: any) =>
                              field.onChange({
                                target: {
                                  name: "pris",
                                  value: value.replace(/\D/g, "")
                                    ? new Intl.NumberFormat("no-NO").format(
                                        Number(value.replace(/\D/g, ""))
                                      )
                                    : "",
                                },
                              })
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
                  name={`paid_date`}
                  render={({ field, fieldState }: any) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : ""
                        } mb-[6px] text-sm`}
                      >
                        Forventet oppstart
                      </p>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Skriv inn Forventet oppstart"
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
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5 col-span-2">
                <FormField
                  control={form.control}
                  name="pdf"
                  render={({ fieldState }) => (
                    <FormItem className="w-full md:w-max">
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        Bilder fra jobben:
                      </p>
                      <FormControl>
                        <div className="flex items-center gap-3 md:gap-5 w-full">
                          <div className="relative w-full">
                            <div
                              className="border border-gray2 rounded-[8px] px-3 laptop:px-6 py-4 flex justify-center items-center flex-col gap-3 cursor-pointer w-full"
                              onDragOver={handlepdfDragOver}
                              onClick={handlepdfClick}
                              onDrop={handlepdfDrop}
                            >
                              <img src={Ic_upload_photo} alt="upload" />
                              <p className="text-gray text-xs md:text-sm text-center truncate w-full">
                                <span className="text-primary font-medium truncate">
                                  Klikk for opplasting
                                </span>{" "}
                                eller dra-og-slipp
                              </p>
                              <p className="text-gray text-xs md:text-sm text-center truncate w-full">
                                PDF (maks. 800x400px)
                              </p>
                              <input
                                type="file"
                                ref={filepdfInputRef}
                                className="hidden"
                                accept=".pdf"
                                onChange={handlepdfFileChange}
                                name="pdf"
                              />
                            </div>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  {uploadpdf && (
                    <div className="flex items-center gap-3 md:gap-5 flex-wrap">
                      {uploadpdf?.map((_file: any, index: number) => (
                        <div
                          className="relative h-[130px] md:h-[140px] w-[130px] md:w-[140px]"
                          key={index}
                        >
                          <img
                            src={Img_pdf}
                            alt="logo"
                            className="object-cover w-full h-full rounded-lg"
                          />
                          <div
                            className="absolute top-2 right-2 bg-[#FFFFFFCC] rounded-[12px] p-[6px] cursor-pointer"
                            onClick={() => {
                              const updatedFiles = uploadpdf.filter(
                                (_: any, i: number) => i !== index
                              );
                              form.setValue("pdf", updatedFiles);
                            }}
                          >
                            <img src={Ic_delete_purple} alt="delete" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end w-full gap-5 items-center sticky bottom-0 bg-white z-50 border-t border-gray2 p-4 left-0">
            <Button
              text="Avbryt"
              className="border border-gray2 text-black text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
              onClick={() => setIsPDFModalOpen(false)}
            />
            <Button
              text="Avvis"
              className="border border-[#A20000] bg-[#A20000] text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
              type="submit"
              onClick={() => {
                setStatus("Reject");
              }}
            />
            <Button
              text="Godkjenn"
              className="border border-[#099250] bg-[#099250] text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
              type="submit"
              onClick={() => {
                setStatus("Approve");
              }}
            />
          </div>
        </form>
      </Form>
    </>
  );
};
