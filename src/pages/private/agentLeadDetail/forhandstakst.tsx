import React, { useEffect, useState } from "react";
import Button from "../../../components/common/button";
import { useLocation } from "react-router-dom";
import { fetchBankLeadData } from "../../../lib/utils";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../../config/firebaseConfig";
import Img_opp from "../../../assets/images/Img_opp.png";
import Img_opp_icon from "../../../assets/images/Img_opp_icon.png";
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
import toast from "react-hot-toast";
import Ic_file from "../../../assets/images/Ic_file.svg";
import Ic_upload_blue_img from "../../../assets/images/Ic_upload_blue_img.svg";
import { getDownloadURL, ref as reff, uploadBytes } from "firebase/storage";
import Ic_delete_purple from "../../../assets/images/Ic_delete_purple.svg";
import FileInfo from "../../../components/FileInfo";
import Modal from "../../../components/common/modal";
import { Input } from "../../../components/ui/input";

const formSchema = z
  .object({
    documents: z
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
      .optional(),
    advance_quote: z
      .string({
        required_error: "Påkrevd",
      })
      .min(1, "Påkrevd"),

    Kommentar: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.advance_quote !== "Nei, jeg ønsker ikke forhåndstakst") {
      if (!data.Kommentar || data.Kommentar.trim().length < 2) {
        ctx.addIssue({
          path: ["Kommentar"],
          code: z.ZodIssueCode.custom,
          message: "Kommentar til megler må bestå av minst 2 tegn.",
        });
      }
    }
  });

export const Forhandstakst: React.FC<{
  setActiveTab: any;
  bankData: any;
  getData: any;
}> = ({ setActiveTab, bankData, getData }) => {
  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      advance_quote: "Ja, jeg ønsker forhåndstakst",
    },
  });

  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;

  useEffect(() => {
    if (!id) {
      return;
    }

    const getData = async () => {
      const data = await fetchBankLeadData(id);
      if (data && data.Forhandstakst) {
        Object.entries(data.Forhandstakst).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            form.setValue(key as any, value);
          }
        });
      }
    };

    getData();
  }, [id]);
  const [finalData, setFinalData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const husmodellDocRef = doc(
          db,
          "house_model",
          String(bankData?.plotHusmodell?.house?.housemodell)
        );
        const husmodellDocSnap = await getDoc(husmodellDocRef);

        if (husmodellDocSnap.exists()) {
          setFinalData(husmodellDocSnap.data());
        } else {
          console.error("No document found for husmodell ID.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (bankData?.plotHusmodell?.house?.housemodell) {
      fetchData();
    }
  }, [bankData]);
  const plotData = bankData?.plotHusmodell?.plot;
  const houseData = bankData?.plotHusmodell?.house;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const finalData = {
      ...data,
    };
    if (data.documents !== undefined) {
      finalData.documents = data.documents;
    } else {
      delete finalData.documents;
    }
    if (data.Kommentar !== undefined) {
      finalData.Kommentar = data.Kommentar;
    } else {
      delete finalData.Kommentar;
    }

    try {
      const docRef = doc(db, "bank_leads", String(id));
      const BankData = {
        ...finalData,
        id: id,
      };
      const formatDate = (date: Date) => {
        return date
          .toLocaleString("sv-SE", { timeZone: "UTC" })
          .replace(",", "");
      };
      await updateDoc(docRef, {
        Forhandstakst: BankData,
        updatedAt: formatDate(new Date()),
      });
      toast.success("Lagret", { position: "top-right" });
      setActiveTab(2);
      getData();
    } catch (error) {
      console.error("Firestore operation failed:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
      });
    }
  };

  const fileDocumentsInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleDocumentsClick = () => {
    fileDocumentsInputRef.current?.click();
  };
  const handleDocumentsDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  const documents: any = form.watch("documents");

  const handleDocumentUpload = async (files: FileList, fieldName: any) => {
    if (!files.length) return;

    let newImages = [...(documents || [])];

    const uploadPromises = Array.from(files).map(async (file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB.", {
          position: "top-right",
        });
        return null;
      }

      const fileType = "documents";
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = reff(storage, `${fileType}/${fileName}`);

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
  const handleDocumentsDrop = async (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      await handleDocumentUpload(event.dataTransfer.files, "documents");
    }
  };

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index);
    setShowConfirm(true);
  };

  const handleDocumentsFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      await handleDocumentUpload(event.target.files, "documents");
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setDeleteIndex(null);
  };

  const handleConfirmPopup = () => {
    if (showConfirm) {
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteIndex !== null) {
      const updatedFiles = documents.filter(
        (_: any, i: number) => i !== deleteIndex
      );
      form.setValue("documents", updatedFiles);
    }
    setShowConfirm(false);
    setDeleteIndex(null);
  };

  const advanceQuote = form.watch("advance_quote");

  function norwegianToNumber(str: any) {
    if (typeof str !== "string") return 0;
    return Number(str.replace(/\s/g, ""));
  }

  const sum =
    norwegianToNumber(plotData?.tomtekostnader) +
    norwegianToNumber(houseData?.byggekostnader);

  function numberToNorwegian(num: any) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <div
            className="mx-4 md:mx-6 lg:mx-10 rounded-lg mb-28"
            style={{
              boxShadow: "0px 1px 2px 0px #1018280F, 0px 1px 3px 0px #1018281A",
            }}
          >
            <div
              style={{
                background: `url(${Img_opp})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              className="px-3 md:px-5 py-4 md:py-7 flex gap-3.5 md:gap-[40px] items-center"
            >
              <img src={Img_opp_icon} alt="opp" />
              <p className="text-white text-base md:text-lg lg:text-xl">
                Ønsker du en kostnadsfri forhåndstakst fra{" "}
                <span className="font-bold">Eie Eiendomsmegling</span>?
              </p>
            </div>
            <div className="p-3 md:p-5">
              <div className="pt-4 md:pt-8 text-base md:text-lg lg:text-xl text-darkBlack font-semibold mb-3 md:mb-5">
                Ønsker du å innhente en kostnadsfri forhåndstakst fra Eie
                Eiendomsmegling?
              </div>
              <p className="text-[#5D6B98] text-xs md:text-sm mb-3 md:mb-5">
                Med en forhåndstakst fra Eie Eiendomsmegling øker
                sannsynligheten for at kunden får byggelånsfinansiering.
              </p>
              <div className="mb-3 md:mb-5">
                <FormField
                  control={form.control}
                  name={`advance_quote`}
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center gap-3 md:gap-5">
                          <div
                            className="relative flex items-center gap-2 cursor-pointer"
                            onClick={() =>
                              form.setValue(
                                "advance_quote",
                                "Ja, jeg ønsker forhåndstakst"
                              )
                            }
                          >
                            <input
                              className={`bg-white rounded-[8px] border text-black
          ${
            fieldState?.error ? "border-red" : "border-gray1"
          } h-4 w-4 accent-primary`}
                              type="radio"
                              value={"Ja, jeg ønsker forhåndstakst"}
                              onChange={(e) => {
                                form.setValue("advance_quote", e.target.value);
                              }}
                              checked={
                                field.value === "Ja, jeg ønsker forhåndstakst"
                              }
                            />
                            <p
                              className={`${
                                field.value === "Ja, jeg ønsker forhåndstakst"
                                  ? "text-darkBlack"
                                  : "text-[#5D6B98]"
                              } text-sm md:text-base`}
                            >
                              Ja, jeg ønsker forhåndstakst
                            </p>
                          </div>

                          <div
                            className="relative flex items-center gap-2 cursor-pointer"
                            onClick={() =>
                              form.setValue(
                                "advance_quote",
                                "Nei, jeg ønsker ikke forhåndstakst"
                              )
                            }
                          >
                            <input
                              className={`bg-white rounded-[8px] border text-black
          ${
            fieldState?.error ? "border-red" : "border-gray1"
          } h-4 w-4 accent-primary`}
                              type="radio"
                              value={"Nei, jeg ønsker ikke forhåndstakst"}
                              onChange={(e) => {
                                form.setValue("advance_quote", e.target.value);
                              }}
                              checked={
                                field.value ===
                                "Nei, jeg ønsker ikke forhåndstakst"
                              }
                            />
                            <p
                              className={`${
                                field.value ===
                                "Nei, jeg ønsker ikke forhåndstakst"
                                  ? "text-darkBlack"
                                  : "text-[#5D6B98]"
                              } text-sm md:text-base`}
                            >
                              Nei, jeg ønsker ikke forhåndstakst
                            </p>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {advanceQuote === "Ja, jeg ønsker forhåndstakst" ? (
                <>
                  <div className="text-sm md:text-base desktop:text-lg font-medium text-darkBlack">
                    Informasjon om kunden
                  </div>
                  <div className="py-3 md:py-5 flex flex-col lg:grid grid-cols-2 gap-4 lg:gap-6">
                    {bankData &&
                      bankData?.Kunden?.Kundeinformasjon.length &&
                      bankData?.Kunden?.Kundeinformasjon.map(
                        (item: any, index: number) => {
                          return (
                            <div className="flex flex-col gap-2" key={index}>
                              <div className="flex gap-2 md:gap-3 items-center">
                                <div className="w-[120px] md:w-[150px] text-[#5D6B98] text-sm md:text-base">
                                  Type
                                </div>
                                <div className="w-[calc(100%-120px)] md:w-[calc(100%-150px)] text-[#000000] font-semibold text-sm md:text-base">
                                  {item?.Kundetype}
                                </div>
                              </div>
                              <div className="flex gap-2 md:gap-3 items-center">
                                <div className="w-[120px] md:w-[150px] text-[#5D6B98] text-sm md:text-base">
                                  Navn:
                                </div>
                                <div className="w-[calc(100%-120px)] md:w-[calc(100%-150px)] text-[#000000] font-semibold text-sm md:text-base">
                                  {item?.f_name} {item?.l_name}
                                </div>
                              </div>
                              <div className="flex gap-2 md:gap-3 items-center">
                                <div className="w-[120px] md:w-[150px] text-[#5D6B98] text-sm md:text-base">
                                  Adresse:
                                </div>
                                <div className="w-[calc(100%-120px)] md:w-[calc(100%-150px)] text-[#000000] font-semibold text-sm md:text-base">
                                  {item?.Adresse}
                                </div>
                              </div>
                              <div className="flex gap-2 md:gap-3 items-center">
                                <div className="w-[120px] md:w-[150px] text-[#5D6B98] text-sm md:text-base">
                                  Mobil:
                                </div>
                                <div className="w-[calc(100%-120px)] md:w-[calc(100%-150px)] text-[#000000] font-semibold text-sm md:text-base">
                                  {item?.mobileNummer}
                                </div>
                              </div>
                              <div className="flex gap-2 md:gap-3 items-center">
                                <div className="w-[120px] md:w-[150px] text-[#5D6B98] text-sm md:text-base">
                                  E-post:
                                </div>
                                <div className="w-[calc(100%-120px)] md:w-[calc(100%-150px)] text-[#000000] font-semibold text-sm md:text-base">
                                  {item?.EPost}
                                </div>
                              </div>
                              <div className="flex gap-2 md:gap-3 items-center">
                                <div className="w-[120px] md:w-[150px] text-[#5D6B98] text-sm md:text-base">
                                  Fødselsdato:
                                </div>
                                <div className="w-[calc(100%-120px)] md:w-[calc(100%-150px)] text-[#000000] font-semibold text-sm md:text-base">
                                  {item?.dato}
                                </div>
                              </div>
                              <div className="flex gap-2 md:gap-3 items-center">
                                <div className="w-[120px] md:w-[150px] text-[#5D6B98] text-sm md:text-base">
                                  Personnummer:
                                </div>
                                <div className="w-[calc(100%-120px)] md:w-[calc(100%-150px)] text-[#000000] font-semibold text-sm md:text-base">
                                  {item?.Personnummer}
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                  </div>
                  <div className="border-t border-[#DCDFEA]"></div>
                  <div className="text-sm md:text-base desktop:text-lg font-medium text-darkBlack pt-3 md:pt-5">
                    Informasjon om tomten
                  </div>
                  <div className="py-3 md:py-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2 md:gap-3 items-center">
                        <div className="w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">Adresse:</div>
                        <div className="w-full text-[#000000] font-semibold text-sm md:text-base">
                          {plotData?.address}
                        </div>
                      </div>
                      <div className="flex gap-2 md:gap-3 items-center">
                        <div className="w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                          Kunden eier tomten allerede:
                        </div>
                        <div className="w-full text-[#000000] font-semibold text-sm md:text-base">
                          {plotData?.alreadyHavePlot
                            ? plotData?.alreadyHavePlot
                            : "Nei"}
                        </div>
                      </div>
                      <div className="flex gap-2 md:gap-3 items-center">
                        <div className="w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                          Totale tomtekostnader:
                        </div>
                        <div className="w-full text-[#000000] font-semibold text-sm md:text-base">
                          kr {plotData?.tomtekostnader}
                        </div>
                      </div>
                      <div className="flex gap-2 md:gap-3 items-center">
                        <div className="w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                          Kommentar:
                        </div>
                        <div className="w-full text-[#000000] font-semibold text-sm md:text-base">
                          {plotData?.Kommentar}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-[#DCDFEA]"></div>
                  <div className="text-sm md:text-base desktop:text-lg font-medium text-darkBlack pt-3 md:pt-5">
                    Informasjon om husmodellen
                  </div>
                  <div className="py-3 md:py-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2 md:gap-3 items-center">
                        <div className="w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                          Husmodell
                        </div>
                        <div className="w-full text-[#000000] font-semibold text-sm md:text-base">
                          {finalData?.Husdetaljer?.husmodell_name}
                        </div>
                      </div>
                      <div className="flex gap-2 md:gap-3 items-center">
                        <div className="w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                          Totale byggekostnader:
                        </div>
                        <div className="w-full text-[#000000] font-semibold text-sm md:text-base">
                          kr {houseData?.byggekostnader}
                        </div>
                      </div>
                      <div className="flex gap-3 items-center mb-3">
                        <div className="w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                          Kommentar:
                        </div>
                        <div className="w-full text-[#000000] font-semibold text-sm md:text-base">
                          {houseData?.Kommentar}
                        </div>
                      </div>
                      <div className="bg-[#F9F9FB] rounded-lg py-2 md:py-3 px-2 md:px-4 flex flex-col gap-2 md:gap-3">
                        <div className="flex gap-2 md:gap-3 items-center">
                          <div className="w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                            Sum tomtekostnader
                          </div>
                          <div className="w-full text-darkBlack font-medium text-sm md:text-base">
                            kr {plotData?.tomtekostnader}{" "}
                            <span className="text-[#5D6B98] font-normal">
                              (prosjektregnskapet oversendes megler)
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 md:gap-3 items-center">
                          <div className="w-[200px] md:w-[300px] text-[#5D6B98] text-sm md:text-base">
                            Sum byggkostnader
                          </div>
                          <div className="w-full text-darkBlack font-medium text-sm md:text-base">
                            kr {houseData?.byggekostnader}{" "}
                            <span className="text-[#5D6B98] font-normal">
                              (prosjektregnskapet oversende banken)
                            </span>
                          </div>
                        </div>
                        <div className="border-t border-[#EAECF0] w-full"></div>
                        <div className="flex gap-2 md:gap-3 items-center">
                          <div className="w-[200px] md:w-[300px] text-[#5D6B98] font-medium text-base md:text-lg lg:text-xl">
                            Totale kostnader
                          </div>
                          <div className="w-full text-darkBlack font-bold text-base md:text-lg lg:text-xl">
                            kr {numberToNorwegian(sum)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-[#DCDFEA]"></div>
                  <div className="py-3 md:py-5">
                    <h4 className="text-darkBlack font-semibold text-base md:text-lg lg:text-xl mb-3 md:mb-5">
                      Last opp informasjon til megler
                    </h4>
                    <p className="text-[#5D6B98] text-xs md:text-sm mb-3 md:mb-5">
                      Jo bedre dokumentasjon du deler med megler, jo bedre
                      grunnlag har megler til å sette en god forhåndstakst. Last
                      gjerne opp byggetegninger, pristilbud, link til
                      Finn-annonse, plantegninger med mer.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <FormField
                        control={form.control}
                        name="documents"
                        render={() => (
                          <FormItem className="w-full">
                            <FormControl>
                              <div className="flex items-center gap-3 md:gap-5 w-full">
                                <div
                                  className="relative w-full p-2 md:p-3 rounded-lg"
                                  style={{
                                    boxShadow:
                                      "0px 2px 4px -2px #1018280F, 0px 4px 8px -2px #1018281A",
                                  }}
                                >
                                  <div
                                    className="border border-gray2 rounded-[8px] px-3 border-dashed laptop:px-6 py-3 md:py-4 flex justify-center items-center flex-col gap-2 md:gap-3 cursor-pointer w-full"
                                    onDragOver={handleDocumentsDragOver}
                                    onClick={handleDocumentsClick}
                                    onDrop={handleDocumentsDrop}
                                  >
                                    <img
                                      src={Ic_upload_blue_img}
                                      alt="upload"
                                    />
                                    <div className="flex items-center gap-2 md:gap-3">
                                      <span className="text-[#7839EE] border-2 border-[#7839EE] rounded-[40px] py-2 px-3 md:px-4 font-medium whitespace-nowrap text-sm md:text-base">
                                        Last opp
                                      </span>
                                      <p className="text-[#111322] text-xs md:text-sm text-center truncate w-full">
                                        Slipp fil for å laste opp her
                                      </p>
                                    </div>
                                    <p className="text-gray text-xs md:text-sm text-center truncate w-full">
                                      Filformater: kun PDF, max 5 MB
                                    </p>
                                    <input
                                      type="file"
                                      ref={fileDocumentsInputRef}
                                      className="hidden"
                                      accept=".pdf"
                                      onChange={handleDocumentsFileChange}
                                      name="documents"
                                      multiple
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
                        <p
                          className={`text-black mb-[6px] text-sm font-medium`}
                        >
                          Dokumenter
                        </p>
                        {documents && documents.length > 0 ? (
                          <div className="flex flex-col items-center gap-2 md:gap-3">
                            {documents?.map((file: any, index: number) => (
                              <div
                                className="border border-gray2 rounded-lg p-2 md:p-3 bg-[#F9FAFB] flex items-center justify-between relative w-full gap-2"
                                key={index}
                              >
                                <div className="flex items-start gap-3 md:gap-4 truncate">
                                  <div className="border-[4px] border-lightPurple rounded-full flex items-center justify-center">
                                    <div className="bg-darkPurple w-7 h-7 rounded-full flex justify-center items-center">
                                      <img src={Ic_file} alt="file" />
                                    </div>
                                  </div>
                                  <FileInfo file={file} />
                                </div>
                                <div>
                                  <div
                                    className="bg-[#FFFFFFCC] rounded-[12px] p-[6px] cursor-pointer w-8 h-8"
                                    onClick={() => handleDeleteClick(index)}
                                  >
                                    <img src={Ic_delete_purple} alt="delete" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray">No documents found!</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-[#DCDFEA]"></div>
                  <div className="pt-3 md:pt-5">
                    <h4 className="text-darkBlack text-sm md:text-base desktop:text-lg font-medium mb-4">
                      Har du ytterligere informasjon som kan være lurt å dele
                      med megler?
                    </h4>
                    <p className="text-[#5D6B98] text-sm mb-4">
                      Beskriv gjerne antatt standard; vannbåren varme, parkett
                      etc. og eventuelt annet som du mener er av meglers
                      interesse.
                    </p>
                    <div>
                      <FormField
                        control={form.control}
                        name={`Kommentar`}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <p
                              className={`${
                                fieldState.error ? "text-red" : ""
                              } mb-[6px] text-sm`}
                            >
                              Kommentar til megler:
                            </p>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="Skriv her..."
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
                </>
              ) : (
                <p className="text-darkBlack text-sm md:text-base desktop:text-lg font-medium">
                  Du kan bestille kostnadsfri forhåndstakst sendere ved å gå inn
                  på dette leadet etter at du har sendt inn til banken.
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end w-full gap-5 items-center fixed bottom-0 bg-white z-50 border-t border-gray2 p-4 left-0">
            <div onClick={() => setActiveTab(2)}>
              <Button
                text="Tilbake"
                className="border border-gray2 text-black text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
              />
            </div>
            <Button
              text="Neste"
              className="border border-purple bg-purple text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
              type="submit"
            />
          </div>
        </form>
      </Form>

      {showConfirm && (
        <Modal onClose={handleConfirmPopup} isOpen={true}>
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg">
              <p className="mb-4">Er du sikker på at du vil slette?</p>
              <div className="flex justify-center gap-4">
                <div onClick={handleCancelDelete}>
                  <Button
                    text="Avbryt"
                    className="border border-gray2 text-black text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                  />
                </div>
                <Button
                  text="Bekrefte"
                  className="border border-purple bg-purple text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                  onClick={handleConfirmDelete}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
