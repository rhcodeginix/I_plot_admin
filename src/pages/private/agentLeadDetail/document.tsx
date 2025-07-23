import React, { useEffect, useState } from "react";
import Button from "../../../components/common/button";
import { useLocation } from "react-router-dom";
import { fetchBankLeadData } from "../../../lib/utils";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../../config/firebaseConfig";
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
import Ic_download_primary from "../../../assets/images/Ic_download_primary.svg";
import {
  getDownloadURL,
  getStorage,
  ref,
  ref as reff,
  uploadBytes,
} from "firebase/storage";
import Ic_trash from "../../../assets/images/Ic_trash.svg";
import FileInfo from "../../../components/FileInfo";
import Modal from "../../../components/common/modal";

const formSchema = z.object({
  Entreprenørgaranti: z
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
  Forsikringsbevis: z
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
  Kontrakt: z
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
});

export const Documenters: React.FC<{
  setActiveTab: any;
  getData: any;
}> = ({ setActiveTab, getData }) => {
  const form = useForm<any>({
    resolver: zodResolver(formSchema),
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
      if (data && data.Documenter) {
        Object.entries(data.Documenter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            form.setValue(key as any, value);
          }
        });
      }
    };

    getData();
  }, [id]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const finalData = {
      ...data,
    };
    if (data.Entreprenørgaranti !== undefined) {
      finalData.Entreprenørgaranti = data.Entreprenørgaranti;
    } else {
      delete finalData.Entreprenørgaranti;
    }
    if (data.Forsikringsbevis !== undefined) {
      finalData.Forsikringsbevis = data.Forsikringsbevis;
    } else {
      delete finalData.Forsikringsbevis;
    }
    if (data.Kontrakt !== undefined) {
      finalData.Kontrakt = data.Kontrakt;
    } else {
      delete finalData.Kontrakt;
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
        Documenter: BankData,
        updatedAt: formatDate(new Date()),
      });
      toast.success("Lagret", { position: "top-right" });
      setActiveTab(4);
      getData();
    } catch (error) {
      console.error("Firestore operation failed:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
      });
    }
  };

  const fileEntreprenørgarantiRef = React.useRef<HTMLInputElement | null>(null);

  const handleEntreprenørgarantiClick = () => {
    fileEntreprenørgarantiRef.current?.click();
  };
  const handleEntreprenørgarantiDragOver = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
  };
  const Entreprenørgaranti: any = form.watch("Entreprenørgaranti");

  const handleDocumentUpload = async (files: FileList, fieldName: any) => {
    if (!files.length) return;

    let newImages = [...(form.watch(fieldName) || [])];

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
  const handleEntreprenørgarantiDrop = async (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      await handleDocumentUpload(
        event.dataTransfer.files,
        "Entreprenørgaranti"
      );
    }
  };

  const fileForsikringsbevisRef = React.useRef<HTMLInputElement | null>(null);

  const handleForsikringsbevisClick = () => {
    fileForsikringsbevisRef.current?.click();
  };
  const handleForsikringsbevisDragOver = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
  };
  const Forsikringsbevis: any = form.watch("Forsikringsbevis");
  const handleForsikringsbevisDrop = async (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      await handleDocumentUpload(event.dataTransfer.files, "Forsikringsbevis");
    }
  };
  const handleForsikringsbevisFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      await handleDocumentUpload(event.target.files, "Forsikringsbevis");
    }
  };

  const fileKontraktRef = React.useRef<HTMLInputElement | null>(null);

  const handleKontraktClick = () => {
    fileKontraktRef.current?.click();
  };
  const handleKontraktDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  const Kontrakt: any = form.watch("Kontrakt");
  const handleKontraktDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      await handleDocumentUpload(event.dataTransfer.files, "Kontrakt");
    }
  };
  const handleKontraktFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      await handleDocumentUpload(event.target.files, "Kontrakt");
    }
  };

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deleteField, setDeleteField] = useState<string | null>(null);

  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index);
    setShowConfirm(true);
  };

  const handleEntreprenørgarantiFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      await handleDocumentUpload(event.target.files, "Entreprenørgaranti");
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setDeleteField(null);
    setDeleteIndex(null);
  };

  const handleConfirmPopup = () => {
    if (showConfirm) {
      setShowConfirm(false);
      setDeleteField(null);
    } else {
      setShowConfirm(true);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteIndex !== null && deleteField) {
      const updatedFiles = form
        .watch(deleteField)
        .filter((_: any, i: number) => i !== deleteIndex);
      form.setValue(deleteField, updatedFiles);
    }
    setShowConfirm(false);
    setDeleteIndex(null);
    setDeleteField(null);
  };

  const handleDownload = async (filePath: string) => {
    try {
      if (!filePath) {
        console.error("File path is missing!");
        return;
      }

      const storage = getStorage();
      const fileRef = ref(storage, filePath);
      const url = await getDownloadURL(fileRef);

      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = filePath.split("/").pop() || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

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
            <div className="p-5 border-b border-[#DCDFEA]">
              <div className="text-xl text-darkBlack font-semibold mb-2">
                Dokumentasjon
              </div>
              <p className="text-[#5D6B98] text-sm">
                Her laster du opp dokumentasjon som er relevant for prosjektet
              </p>
            </div>
            <div className="p-5 flex flex-col gap-5">
              <div>
                <h4 className="text-darkBlack text-sm md:text-base desktop:text-lg font-semibold mb-4">
                  Entreprenørgaranti
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="Entreprenørgaranti"
                    render={() => (
                      <FormItem className="w-full">
                        <FormControl>
                          <div className="flex items-center gap-5 w-full">
                            <div
                              className="relative w-full p-3 rounded-lg"
                              style={{
                                boxShadow:
                                  "0px 2px 4px -2px #1018280F, 0px 4px 8px -2px #1018281A",
                              }}
                            >
                              <div
                                className="border border-gray2 rounded-[8px] px-3 border-dashed laptop:px-6 py-4 flex justify-center items-center flex-col gap-3 cursor-pointer w-full"
                                onDragOver={handleEntreprenørgarantiDragOver}
                                onClick={handleEntreprenørgarantiClick}
                                onDrop={handleEntreprenørgarantiDrop}
                              >
                                <img src={Ic_upload_blue_img} alt="upload" />
                                <div className="flex items-center gap-3">
                                  <span className="text-[#7839EE] border-2 border-[#7839EE] rounded-[40px] py-2 px-4 font-medium whitespace-nowrap">
                                    Last opp
                                  </span>
                                  <p className="text-[#111322] text-sm text-center truncate w-full">
                                    Slipp fil for å laste opp her
                                  </p>
                                </div>
                                <p className="text-gray text-sm text-center truncate w-full">
                                  Filformater: kun PDF, max 5 MB
                                </p>
                                <input
                                  type="file"
                                  ref={fileEntreprenørgarantiRef}
                                  className="hidden"
                                  accept=".pdf"
                                  onChange={handleEntreprenørgarantiFileChange}
                                  name="Entreprenørgaranti"
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
                    <p className={`text-black mb-[6px] text-sm font-medium`}>
                      Dokumenter
                    </p>
                    {Entreprenørgaranti && Entreprenørgaranti.length > 0 ? (
                      <div className="flex flex-col items-center gap-3">
                        {Entreprenørgaranti?.map((file: any, index: number) => (
                          <div
                            className="border border-gray2 rounded-lg p-3 bg-[#F9FAFB] flex items-center justify-between relative w-full"
                            key={index}
                          >
                            <div className="flex items-start gap-4 truncate">
                              <div className="border-[4px] border-lightPurple rounded-full flex items-center justify-center">
                                <div className="bg-darkPurple w-7 h-7 rounded-full flex justify-center items-center">
                                  <img src={Ic_file} alt="file" />
                                </div>
                              </div>
                              <FileInfo file={file} />
                            </div>
                            <div className="flex items-center gap-6">
                              <img
                                src={Ic_trash}
                                alt="delete"
                                className="cursor-pointer"
                                onClick={() => {
                                  handleDeleteClick(index);
                                  setDeleteField("Entreprenørgaranti");
                                }}
                              />
                              <img
                                src={Ic_download_primary}
                                alt="download"
                                className="cursor-pointer"
                                onClick={() => handleDownload(file)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray">No Entreprenørgaranti found!</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="border-t border-[#DCDFEA]"></div>
              <div>
                <h4 className="text-darkBlack text-sm md:text-base desktop:text-lg font-semibold mb-4">
                  Forsikringsbevis
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="Forsikringsbevis"
                    render={() => (
                      <FormItem className="w-full">
                        <FormControl>
                          <div className="flex items-center gap-5 w-full">
                            <div
                              className="relative w-full p-3 rounded-lg"
                              style={{
                                boxShadow:
                                  "0px 2px 4px -2px #1018280F, 0px 4px 8px -2px #1018281A",
                              }}
                            >
                              <div
                                className="border border-gray2 rounded-[8px] px-3 border-dashed laptop:px-6 py-4 flex justify-center items-center flex-col gap-3 cursor-pointer w-full"
                                onDragOver={handleForsikringsbevisDragOver}
                                onClick={handleForsikringsbevisClick}
                                onDrop={handleForsikringsbevisDrop}
                              >
                                <img src={Ic_upload_blue_img} alt="upload" />
                                <div className="flex items-center gap-3">
                                  <span className="text-[#7839EE] border-2 border-[#7839EE] rounded-[40px] py-2 px-4 font-medium whitespace-nowrap">
                                    Last opp
                                  </span>
                                  <p className="text-[#111322] text-sm text-center truncate w-full">
                                    Slipp fil for å laste opp her
                                  </p>
                                </div>
                                <p className="text-gray text-sm text-center truncate w-full">
                                  Filformater: kun PDF, max 5 MB
                                </p>
                                <input
                                  type="file"
                                  ref={fileForsikringsbevisRef}
                                  className="hidden"
                                  accept=".pdf"
                                  onChange={handleForsikringsbevisFileChange}
                                  name="Forsikringsbevis"
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
                    <p className={`text-black mb-[6px] text-sm font-medium`}>
                      Dokumenter
                    </p>
                    {Forsikringsbevis && Forsikringsbevis.length > 0 ? (
                      <div className="flex flex-col items-center gap-3">
                        {Forsikringsbevis?.map((file: any, index: number) => (
                          <div
                            className="border border-gray2 rounded-lg p-3 bg-[#F9FAFB] flex items-center justify-between relative w-full"
                            key={index}
                          >
                            <div className="flex items-start gap-4 truncate">
                              <div className="border-[4px] border-lightPurple rounded-full flex items-center justify-center">
                                <div className="bg-darkPurple w-7 h-7 rounded-full flex justify-center items-center">
                                  <img src={Ic_file} alt="file" />
                                </div>
                              </div>
                              <FileInfo file={file} />
                            </div>
                            <div className="flex items-center gap-6">
                              <img
                                src={Ic_trash}
                                alt="delete"
                                className="cursor-pointer"
                                onClick={() => {
                                  handleDeleteClick(index);
                                  setDeleteField("Forsikringsbevis");
                                }}
                              />
                              <img
                                src={Ic_download_primary}
                                alt="download"
                                className="cursor-pointer"
                                onClick={() => handleDownload(file)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray">No Forsikringsbevis found!</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="border-t border-[#DCDFEA]"></div>
              <div>
                <h4 className="text-darkBlack text-sm md:text-base desktop:text-lg font-semibold mb-4">
                  Kontrakt{" "}
                  <span className="text-[#5D6B98]">(eks. NS-3425)</span>
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="Kontrakt"
                    render={() => (
                      <FormItem className="w-full">
                        <FormControl>
                          <div className="flex items-center gap-5 w-full">
                            <div
                              className="relative w-full p-3 rounded-lg"
                              style={{
                                boxShadow:
                                  "0px 2px 4px -2px #1018280F, 0px 4px 8px -2px #1018281A",
                              }}
                            >
                              <div
                                className="border border-gray2 rounded-[8px] px-3 border-dashed laptop:px-6 py-4 flex justify-center items-center flex-col gap-3 cursor-pointer w-full"
                                onDragOver={handleKontraktDragOver}
                                onClick={handleKontraktClick}
                                onDrop={handleKontraktDrop}
                              >
                                <img src={Ic_upload_blue_img} alt="upload" />
                                <div className="flex items-center gap-3">
                                  <span className="text-[#7839EE] border-2 border-[#7839EE] rounded-[40px] py-2 px-4 font-medium whitespace-nowrap">
                                    Last opp
                                  </span>
                                  <p className="text-[#111322] text-sm text-center truncate w-full">
                                    Slipp fil for å laste opp her
                                  </p>
                                </div>
                                <p className="text-gray text-sm text-center truncate w-full">
                                  Filformater: kun PDF, max 5 MB
                                </p>
                                <input
                                  type="file"
                                  ref={fileKontraktRef}
                                  className="hidden"
                                  accept=".pdf"
                                  onChange={handleKontraktFileChange}
                                  name="Kontrakt"
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
                    <p className={`text-black mb-[6px] text-sm font-medium`}>
                      Dokumenter
                    </p>
                    {Kontrakt && Kontrakt.length > 0 ? (
                      <div className="flex flex-col items-center gap-3">
                        {Kontrakt?.map((file: any, index: number) => (
                          <div
                            className="border border-gray2 rounded-lg p-3 bg-[#F9FAFB] flex items-center justify-between relative w-full"
                            key={index}
                          >
                            <div className="flex items-start gap-4 truncate">
                              <div className="border-[4px] border-lightPurple rounded-full flex items-center justify-center">
                                <div className="bg-darkPurple w-7 h-7 rounded-full flex justify-center items-center">
                                  <img src={Ic_file} alt="file" />
                                </div>
                              </div>
                              <FileInfo file={file} />
                            </div>
                            <div className="flex items-center gap-6">
                              <img
                                src={Ic_trash}
                                alt="delete"
                                onClick={() => {
                                  handleDeleteClick(index);
                                  setDeleteField("Kontrakt");
                                }}
                                className="cursor-pointer"
                              />
                              <img
                                src={Ic_download_primary}
                                alt="download"
                                className="cursor-pointer"
                                onClick={() => handleDownload(file)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray">No Kontrakt found!</p>
                    )}
                  </div>
                </div>
              </div>
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
