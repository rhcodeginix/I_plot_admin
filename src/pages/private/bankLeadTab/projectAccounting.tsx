import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../../config/firebaseConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "../../../components/Spinner";
import Button from "../../../components/common/button";
import Ic_file from "../../../assets/images/Ic_file.svg";
import Ic_upload_blue_img from "../../../assets/images/Ic_upload_blue_img.svg";
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
import { getDownloadURL, ref as reff, uploadBytes } from "firebase/storage";
import Ic_delete_purple from "../../../assets/images/Ic_delete_purple.svg";
import FileInfo from "../../../components/FileInfo";
import Modal from "../../../components/common/modal";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { fetchBankLeadData } from "../../../lib/utils";

const formSchema = z.object({
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
});

export type ProjectAccountingHandle = {
  validateForm: () => Promise<boolean>;
};

export const ProjectAccounting = forwardRef<
  ProjectAccountingHandle,
  { setActiveTab: (tab: number) => void }
>(({ setActiveTab }, ref) => {
  const form = useForm<any>({
    resolver: zodResolver(formSchema),
  });
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  const [loading, setLoading] = useState(true);

  const [finalData, setFinalData] = useState<any>(null);
  const husmodellData = finalData?.Prisliste;
  const [houseId, setHouseId] = useState<String | null>(null);

  const [editingPriceIndex, setEditingPriceIndex] = useState<number | null>(
    null
  );
  const [editedPrices, setEditedPrices] = useState<{ [key: number]: string }>(
    {}
  );
  const [editingHeadlineIndex, setEditingHeadlineIndex] = useState<
    number | null
  >(null);
  const [editedHeadlines, setEditedHeadlines] = useState<{
    [key: number]: string;
  }>({});

  const [editingHeadlineTomIndex, setEditingHeadlineTomIndex] = useState<
    number | null
  >(null);
  const [editedHeadlinesTom, setEditedHeadlinesTom] = useState<{
    [key: number]: string;
  }>({});

  const [editingPriceTomIndex, setEditingPriceTomIndex] = useState<
    number | null
  >(null);
  const [editedPricesTom, setEditedPricesTom] = useState<{
    [key: number]: string;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const husmodellDocRef = doc(db, "house_model", String(houseId));
        const husmodellDocSnap = await getDoc(husmodellDocRef);

        if (husmodellDocSnap.exists()) {
          setFinalData(husmodellDocSnap.data());
          setLoading(false);
        } else {
          console.error("No document found for husmodell ID.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (houseId) {
      fetchData();
    }
  }, [houseId]);

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

  const [showModal, setShowModal] = useState(false);
  const [newCostType, setNewCostType] = useState<
    "tomtekost" | "byggekost" | null
  >(null);

  const [newCost, setNewCost] = useState({
    Headline: "",
    pris: "",
    IncludingOffer: false,
  });

  const openModal = (type: "tomtekost" | "byggekost") => {
    setNewCostType(type);
    setShowModal(true);
    setNewCost({
      Headline: "",
      pris: "",
      IncludingOffer: false,
    });
  };

  const handleModalPopup = () => {
    if (showModal) {
      setShowModal(false);
    } else {
      setShowModal(true);
    }
  };

  const [newTomtekostList, setNewTomtekostList] = useState<any>([]);
  const [newByggekostList, setNewByggekostList] = useState<any>([]);
  const [apiData, setApiData] = useState<any>();

  const [TomtekostHusmodell, setTomtekostHusmodell] = useState<any>({
    Tomtekost: [],
  });

  useEffect(() => {
    if (husmodellData?.Tomtekost) {
      const data = {
        IncludingOffer: false,
        pris: "0",
        TomtekostID: new Date().toISOString().split("T")[0],
        Headline: "Tomtekjøp",
      };

      setTomtekostHusmodell((prevState: any) => ({
        Tomtekost: [...prevState.Tomtekost, ...husmodellData?.Tomtekost, data],
      }));
    }
  }, []);

  const [ByggekostnaderHusmodell, setByggekostnaderHusmodell] = useState<any>({
    Byggekostnader: [],
  });

  useEffect(() => {
    if (husmodellData?.Byggekostnader) {
      const data = {
        IncludingOffer: false,
        pris: "0",
        ByggekostnaderID: new Date().toISOString().split("T")[0],
        Headline: "Kundens tilvalg",
      };

      setByggekostnaderHusmodell((prevState: any) => ({
        Byggekostnader: [
          ...prevState.Byggekostnader,
          ...husmodellData?.Byggekostnader,
          data,
        ],
      }));
    }
  }, [husmodellData?.Byggekostnader]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const updatedByggekostnader = (
      apiData
        ? apiData?.Byggekostnader
        : ByggekostnaderHusmodell?.Byggekostnader || []
    ).map((item: any, index: number) => ({
      ...item,
      pris: editedPrices[index] ? editedPrices[index] : item.pris,
      Headline: editedHeadlines[index] ? editedHeadlines[index] : item.Headline,
    }));

    const newByggekostnaderFormatted = newByggekostList.map((item: any) => ({
      ...item,
      pris: item.pris,
    }));

    const updatedTomtekost = (
      apiData ? apiData?.Tomtekost : TomtekostHusmodell?.Tomtekost || []
    ).map((item: any, index: number) => ({
      ...item,
      pris: editedPricesTom[index] ? editedPricesTom[index] : item.pris,
      Headline: editedHeadlinesTom[index]
        ? editedHeadlinesTom[index]
        : item.Headline,
    }));

    const newTomtekostFormatted = newTomtekostList.map((item: any) => ({
      ...item,
      pris: item.pris,
    }));

    const updatedHusmodellData = {
      ...(apiData ? apiData?.Tomtekost : TomtekostHusmodell),
      Byggekostnader: [...updatedByggekostnader, ...newByggekostnaderFormatted],
      Tomtekost: [...updatedTomtekost, ...newTomtekostFormatted],
    };

    const finalData = {
      ...data,
      husmodellData: updatedHusmodellData,
      houseId: houseId,
    };
    if (data.documents !== undefined) {
      finalData.documents = data.documents;
    } else {
      delete finalData.documents;
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
        ProjectAccount: BankData,
        updatedAt: formatDate(new Date()),
      });
      toast.success("Updated successfully", { position: "top-right" });

      navigate(`/edit-bank-leads/${id}`);
      setActiveTab(3);
    } catch (error) {
      console.error("Firestore operation failed:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
      });
    }
  };

  const handleSubmitNewCost = () => {
    const newItem = {
      ...newCost,
      [newCostType === "tomtekost" ? "TomtekostID" : "ByggekostID"]:
        new Date().toISOString(),
    };

    if (newCostType === "tomtekost") {
      setNewTomtekostList((prev: any[]) => [...prev, newItem]);
    } else if (newCostType === "byggekost") {
      setNewByggekostList((prev: any[]) => [...prev, newItem]);
    }

    setShowModal(false);
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const getData = async () => {
      const data = await fetchBankLeadData(id);

      if (data && data.plotHusmodell) {
        setHouseId(String(data.plotHusmodell?.house?.housemodell));
      }

      if (data && data?.ProjectAccount) {
        if (
          data?.plotHusmodell?.house?.housemodell ===
          data?.ProjectAccount?.houseId
        ) {
          Object.entries(data.ProjectAccount).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              form.setValue(key as any, value);
            }
          });
          setApiData(data?.ProjectAccount?.husmodellData);
        }
      }

      setLoading(false);
    };

    getData();
  }, [form, id, houseId]);

  const parsePrice = (value: any): number => {
    if (!value) return 0;
    return parseFloat(
      String(value).replace(/\s/g, "").replace(/\./g, "").replace(",", ".")
    );
  };

  const Byggekostnader =
    apiData?.Byggekostnader ?? ByggekostnaderHusmodell?.Byggekostnader ?? [];
  const Tomtekost = apiData?.Tomtekost ?? TomtekostHusmodell?.Tomtekost ?? [];

  const totalPrisOfByggekostnader = [
    ...Byggekostnader,
    ...newByggekostList,
  ].reduce((acc: number, prod: any, index: number) => {
    const value =
      index < Byggekostnader.length
        ? editedPrices[index] ?? prod.pris
        : prod.pris;
    return acc + parsePrice(value);
  }, 0);

  const formattedNumberOfByggekostnader =
    totalPrisOfByggekostnader.toLocaleString("nb-NO");

  const totalPrisOfTomtekost = [...Tomtekost, ...newTomtekostList].reduce(
    (acc: number, prod: any, index: number) => {
      const value =
        index < Tomtekost.length
          ? editedPricesTom[index] ?? prod.pris
          : prod.pris;
      return acc + parsePrice(value);
    },
    0
  );

  const formattedNumber = totalPrisOfTomtekost.toLocaleString("nb-NO");

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

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
              <div className="px-6">
                <div className="p-5 pt-0 border-b border-[#DCDFEA] text-[#111322] text-xl font-semibold">
                  Økonomisk plan
                </div>
                <div>
                  <h4 className="p-6 pb-3 text-darkBlack font-semibold text-lg">
                    Har du allerede laget en økonomisk plan? Last den opp her.
                  </h4>

                  <div className="grid grid-cols-2 gap-6 mb-[62px]">
                    <FormField
                      control={form.control}
                      name="documents"
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
                                  onDragOver={handleDocumentsDragOver}
                                  onClick={handleDocumentsClick}
                                  onDrop={handleDocumentsDrop}
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
                      <p className={`text-black mb-[6px] text-sm font-medium`}>
                        Dokumenter
                      </p>
                      {documents && documents.length > 0 ? (
                        <div className="flex flex-col items-center gap-3">
                          {documents?.map((file: any, index: number) => (
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
              </div>

              <h4 className="px-6 pb-5 text-darkBlack font-semibold text-lg">
                Har du ikke laget en økonomisk plan? Fyll ut den økonomiske
                planen her:
              </h4>
              <div className="flex gap-6 px-6 mb-28">
                <div
                  className="w-1/2 p-4 border border-gray2 rounded-lg h-max"
                  style={{
                    boxShadow:
                      "0px 4px 6px -2px #10182808, 0px 12px 16px -4px #10182814",
                  }}
                >
                  <div className="text-center p-4 text-[#101828] font-medium text-lg bg-[#F9F9FB] mb-5 relative">
                    Byggekostnader
                    <Pencil className="text-primary absolute top-5 right-4" />
                  </div>
                  <div className="flex flex-col gap-5">
                    {(apiData
                      ? apiData?.Byggekostnader.length > 0
                      : ByggekostnaderHusmodell?.Byggekostnader?.length >
                        0) && (
                      <div className="flex flex-col gap-5">
                        {(apiData
                          ? apiData?.Byggekostnader
                          : ByggekostnaderHusmodell?.Byggekostnader
                        )?.map((item: any, index: number) => {
                          const isEditing = editingPriceIndex === index;
                          const isHeadlineEditing =
                            editingHeadlineIndex === index;

                          return (
                            <div
                              className="flex items-center gap-2 justify-between"
                              key={index}
                            >
                              <div className="flex items-center gap-2">
                                {/* <img src={Ic_info_circle} alt="icon" /> */}
                                {/* <p className="text-gray text-sm font-medium">
                                  {item?.Headline}
                                </p> */}
                                {isHeadlineEditing ? (
                                  <input
                                    type="text"
                                    value={
                                      editedHeadlines[index] ??
                                      item.Headline ??
                                      ""
                                    }
                                    onChange={(e) => {
                                      setEditedHeadlines({
                                        ...editedHeadlines,
                                        [index]: e.target.value,
                                      });
                                    }}
                                    onBlur={() => setEditingHeadlineIndex(null)}
                                    className="focus-within:outline-none placeholder:text-gray text-sm rounded-[8px] shadow-shadow1 border border-gray1 py-[6px] px-[10px] w-[400px]"
                                  />
                                ) : (
                                  <p
                                    className="text-gray text-sm font-medium cursor-pointer"
                                    onClick={() =>
                                      setEditingHeadlineIndex(index)
                                    }
                                  >
                                    {editedHeadlines[index]
                                      ? editedHeadlines[index]
                                      : item?.Headline}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                {isEditing ? (
                                  <input
                                    inputMode="numeric"
                                    type="text"
                                    value={
                                      editedPrices[index] ?? item.pris ?? ""
                                    }
                                    onChange={(e) => {
                                      setEditedPrices({
                                        ...editedPrices,
                                        [index]: e.target.value.replace(
                                          /\D/g,
                                          ""
                                        )
                                          ? new Intl.NumberFormat(
                                              "no-NO"
                                            ).format(
                                              Number(
                                                e.target.value.replace(
                                                  /\D/g,
                                                  ""
                                                )
                                              )
                                            )
                                          : "",
                                      });
                                    }}
                                    onBlur={() => setEditingPriceIndex(null)}
                                    className="focus-within:outline-none placeholder:text-gray rounded-[8px] shadow-shadow1 border border-gray1 py-[6px] px-[10px] w-[140px]"
                                  />
                                ) : (
                                  <h4
                                    className="text-black font-medium text-base cursor-pointer"
                                    onClick={() => setEditingPriceIndex(index)}
                                  >
                                    {editedPrices[index]
                                      ? `${editedPrices[index]} NOK`
                                      : item?.pris
                                      ? `${item.pris} NOK`
                                      : "inkl. i tilbud"}
                                  </h4>
                                )}
                                <Trash2
                                  className="text-red w-5 h-5 cursor-pointer"
                                  onClick={() => {
                                    const indexToDelete = index;
                                    if (apiData) {
                                      const updatedList =
                                        apiData.Byggekostnader.filter(
                                          (_: any, index: number) =>
                                            index !== indexToDelete
                                        );
                                      setApiData({
                                        ...apiData,
                                        Byggekostnader: updatedList,
                                      });
                                    } else {
                                      const updatedList =
                                        ByggekostnaderHusmodell?.Byggekostnader?.filter(
                                          (_: any, index: number) =>
                                            index !== indexToDelete
                                        ) || [];

                                      setByggekostnaderHusmodell({
                                        ...ByggekostnaderHusmodell,
                                        Byggekostnader: updatedList,
                                      });
                                    }

                                    const newEditedPrices = { ...editedPrices };
                                    const newEditedHeadlines = {
                                      ...editedHeadlines,
                                    };
                                    delete newEditedPrices[indexToDelete];
                                    delete newEditedHeadlines[indexToDelete];
                                    setEditedPrices(newEditedPrices);
                                    setEditedHeadlines(newEditedHeadlines);
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {newByggekostList?.map((item: any, index: number) => {
                      const isEditing = editingPriceIndex === index;

                      return (
                        <div
                          className="flex items-center gap-2 justify-between"
                          key={index}
                        >
                          <div className="flex items-center gap-2">
                            {/* <img src={Ic_info_circle} alt="icon" /> */}
                            <p className="text-gray text-sm font-medium">
                              {item?.Headline}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            {isEditing ? (
                              <input
                                inputMode="numeric"
                                type="text"
                                value={editedPrices[index] ?? item.pris ?? ""}
                                onChange={(e) => {
                                  setEditedPrices({
                                    ...editedPrices,
                                    [index]: e.target.value.replace(/\D/g, "")
                                      ? new Intl.NumberFormat("no-NO").format(
                                          Number(
                                            e.target.value.replace(/\D/g, "")
                                          )
                                        )
                                      : "",
                                  });
                                }}
                                onBlur={() => setEditingPriceIndex(null)}
                                className="focus-within:outline-none placeholder:text-gray rounded-[8px] shadow-shadow1 border border-gray1 py-[6px] px-[10px] w-[140px]"
                              />
                            ) : (
                              <h4
                                className="text-black font-medium text-base cursor-pointer"
                                onClick={() => setEditingPriceIndex(index)}
                              >
                                {editedPrices[index]
                                  ? `${editedPrices[index]} NOK`
                                  : item?.pris
                                  ? `${item.pris} NOK`
                                  : "inkl. i tilbud"}
                              </h4>
                            )}
                            <Trash2
                              className="text-red w-5 h-5 cursor-pointer"
                              onClick={() => {
                                const updatedList = newByggekostList.filter(
                                  (_: any, idx: number) => idx !== index
                                );
                                setNewByggekostList(updatedList);

                                const newEditedPrices = { ...editedPrices };
                                const newEditedHeadlines = {
                                  ...editedHeadlines,
                                };
                                delete newEditedPrices[index];
                                delete newEditedHeadlines[index];
                                setEditedPrices(newEditedPrices);
                                setEditedHeadlines(newEditedHeadlines);
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <div className="border-t border-gray2"></div>
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        {/* <img src={Ic_info_circle} alt="icon" /> */}
                        <p className="text-gray text-lg font-bold">
                          Sum byggkostnader
                        </p>
                      </div>
                      <h4 className="text-black font-bold text-base">
                        {formattedNumberOfByggekostnader} NOK
                      </h4>
                    </div>
                    <div className="flex items-center justify-center">
                      <div
                        className="bg-[#7839EE] rounded-[40px] py-[14px] px-5 flex items-center gap-2 cursor-pointer"
                        onClick={() => openModal("byggekost")}
                      >
                        <Plus className="text-white w-5 h-5" />
                        <span className="text-white font-medium">
                          Legg til ny byggekostnad
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="w-1/2 p-4 border border-gray2 rounded-lg h-max"
                  style={{
                    boxShadow:
                      "0px 4px 6px -2px #10182808, 0px 12px 16px -4px #10182814",
                  }}
                >
                  <div className="text-center p-4 text-[#101828] font-medium text-lg bg-[#F9F9FB] mb-5 relative">
                    Tomkostnader
                    <Pencil className="text-primary absolute top-5 right-4" />
                  </div>
                  <div className="flex flex-col gap-5">
                    {(apiData
                      ? apiData?.Tomtekost.length > 0
                      : TomtekostHusmodell?.Tomtekost.length > 0) &&
                      (apiData
                        ? apiData?.Tomtekost
                        : TomtekostHusmodell?.Tomtekost
                      )?.map((item: any, index: number) => {
                        const isEditing = editingPriceTomIndex === index;
                        const isHeadlineEditing =
                          editingHeadlineTomIndex === index;
                        return (
                          <div
                            className="flex items-center gap-2 justify-between"
                            key={index}
                          >
                            <div className="flex items-center gap-2">
                              {/* <img src={Ic_info_circle} alt="icon" /> */}

                              {isHeadlineEditing ? (
                                <input
                                  type="text"
                                  value={
                                    editedHeadlinesTom[index] ??
                                    item.Headline ??
                                    ""
                                  }
                                  onChange={(e) => {
                                    setEditedHeadlinesTom({
                                      ...editedHeadlinesTom,
                                      [index]: e.target.value,
                                    });
                                  }}
                                  onBlur={() =>
                                    setEditingHeadlineTomIndex(null)
                                  }
                                  className="focus-within:outline-none placeholder:text-gray text-sm rounded-[8px] shadow-shadow1 border border-gray1 py-[6px] px-[10px] w-[400px]"
                                />
                              ) : (
                                <p
                                  className="text-gray text-sm font-medium cursor-pointer"
                                  onClick={() =>
                                    setEditingHeadlineTomIndex(index)
                                  }
                                >
                                  {editedHeadlinesTom[index]
                                    ? editedHeadlinesTom[index]
                                    : item?.Headline}
                                </p>
                              )}
                            </div>
                            {isEditing ? (
                              <input
                                inputMode="numeric"
                                type="text"
                                value={
                                  editedPricesTom[index] ?? item.pris ?? ""
                                }
                                onChange={(e) => {
                                  setEditedPricesTom({
                                    ...editedPricesTom,
                                    [index]: e.target.value.replace(/\D/g, "")
                                      ? new Intl.NumberFormat("no-NO").format(
                                          Number(
                                            e.target.value.replace(/\D/g, "")
                                          )
                                        )
                                      : "",
                                  });
                                }}
                                onBlur={() => setEditingPriceTomIndex(null)}
                                className="focus-within:outline-none placeholder:text-gray rounded-[8px] shadow-shadow1 border border-gray1 py-[6px] px-[10px] w-[140px]"
                              />
                            ) : (
                              <h4
                                className="text-black font-medium text-base cursor-pointer"
                                onClick={() => setEditingPriceTomIndex(index)}
                              >
                                {editedPricesTom[index]
                                  ? `${editedPricesTom[index]} NOK`
                                  : item?.pris
                                  ? `${item.pris} NOK`
                                  : "inkl. i tilbud"}
                              </h4>
                            )}
                          </div>
                        );
                      })}

                    {newTomtekostList?.map((item: any, index: number) => {
                      const isEditing = editingPriceIndex === index;

                      return (
                        <div
                          className="flex items-center gap-2 justify-between"
                          key={index}
                        >
                          <div className="flex items-center gap-2">
                            {/* <img src={Ic_info_circle} alt="icon" /> */}
                            <p className="text-gray text-sm font-medium">
                              {item?.Headline}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {isEditing ? (
                              <input
                                inputMode="numeric"
                                type="text"
                                value={
                                  editedPricesTom[index] ?? item.pris ?? ""
                                }
                                onChange={(e) => {
                                  setEditedPricesTom({
                                    ...editedPricesTom,
                                    [index]: e.target.value.replace(/\D/g, "")
                                      ? new Intl.NumberFormat("no-NO").format(
                                          Number(
                                            e.target.value.replace(/\D/g, "")
                                          )
                                        )
                                      : "",
                                  });
                                }}
                                onBlur={() => setEditingPriceIndex(null)}
                                className="focus-within:outline-none placeholder:text-gray rounded-[8px] shadow-shadow1 border border-gray1 py-[6px] px-[10px] w-[140px]"
                              />
                            ) : (
                              <h4
                                className="text-black font-medium text-base cursor-pointer"
                                onClick={() => setEditingPriceIndex(index)}
                              >
                                {editedPricesTom[index]
                                  ? `${editedPricesTom[index]} NOK`
                                  : item?.pris
                                  ? `${item.pris} NOK`
                                  : "inkl. i tilbud"}
                              </h4>
                            )}

                            <Trash2
                              className="text-red w-5 h-5 cursor-pointer"
                              onClick={() => {
                                const updatedList = newTomtekostList.filter(
                                  (_: any, idx: number) => idx !== index
                                );
                                setNewTomtekostList(updatedList);

                                const newEditedPrices = { ...editedPricesTom };
                                const newEditedHeadlines = {
                                  ...editedHeadlines,
                                };
                                delete newEditedPrices[index];
                                delete newEditedHeadlines[index];
                                setEditedPricesTom(newEditedPrices);
                                setEditedHeadlinesTom(newEditedHeadlines);
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    <div className="border-t border-gray2"></div>
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        {/* <img src={Ic_info_circle} alt="icon" /> */}
                        <p className="text-gray text-lg font-bold">
                          Sum tomtekostnader
                        </p>
                      </div>
                      <h4 className="text-black font-bold text-base">
                        {formattedNumber} NOK
                      </h4>
                    </div>
                    <div className="flex items-center justify-center">
                      <div
                        className="bg-[#7839EE] rounded-[40px] py-[14px] px-5 flex items-center gap-2 cursor-pointer"
                        onClick={() => openModal("tomtekost")}
                      >
                        <Plus className="text-white w-5 h-5" />
                        <span className="text-white font-medium">
                          Legg til ny tomtekostnad
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end w-full gap-5 items-center fixed bottom-0 bg-white z-50 border-t border-gray2 p-4 left-0">
                <div
                  onClick={() => setActiveTab(1)}
                  className="w-1/2 sm:w-auto"
                >
                  <Button
                    text="Tilbake"
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

          {showConfirm && (
            <Modal onClose={handleConfirmPopup} isOpen={true}>
              <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                <div className="bg-white p-6 rounded-lg">
                  <p className="mb-4">Er du sikker på at du vil slette?</p>
                  <div className="flex justify-center gap-4">
                    <div
                      onClick={handleCancelDelete}
                      className="w-1/2 sm:w-auto"
                    >
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

          {showModal && (
            <Modal onClose={handleModalPopup} isOpen={true}>
              <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                <div className="bg-white p-6 rounded-xl w-[400px]">
                  <h2 className="text-xl font-semibold mb-4">
                    {newCostType === "tomtekost"
                      ? "Ny tomtekostnad"
                      : "Ny byggekostnad"}
                  </h2>
                  <input
                    type="text"
                    placeholder="Tittel"
                    value={newCost.Headline}
                    onChange={(e) =>
                      setNewCost({ ...newCost, Headline: e.target.value })
                    }
                    className="w-full mb-2 border border-gray1 p-2 rounded"
                  />

                  <input
                    type="text"
                    placeholder="Pris"
                    inputMode="numeric"
                    value={newCost.pris}
                    onChange={({ target: { value } }: any) =>
                      setNewCost({
                        ...newCost,

                        pris: value.replace(/\D/g, "")
                          ? new Intl.NumberFormat("no-NO").format(
                              Number(value.replace(/\D/g, ""))
                            )
                          : "",
                      })
                    }
                    className="w-full mb-4 border border-gray1 p-2 rounded"
                  />
                  <div className="flex justify-center gap-3">
                    <div onClick={() => setShowModal(false)}>
                      <Button
                        text="Avbryt"
                        className="border border-gray2 text-black text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                      />
                    </div>

                    <Button
                      text="Lagre"
                      className="border border-purple bg-purple text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                      onClick={handleSubmitNewCost}
                    />
                  </div>
                </div>
              </div>
            </Modal>
          )}
        </>
      )}
    </>
  );
});
