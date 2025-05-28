/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Img_pdf from "../../../assets/images/Img_pdf.png";
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
import { TextArea } from "../../../components/ui/textarea";
import { useLocation } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../../config/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import toast from "react-hot-toast";
import { Input } from "../../../components/ui/input";

const formSchema = z.object({
  photo: z
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
  full_fort_date: z.string().min(1, "Fullført den er påkrevd"),
});

export const AddComment: React.FC<{
  SelectIndex: any;
  setIsModalOpen: any;
  getData: any;
}> = ({ SelectIndex, setIsModalOpen, getData }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;

  useEffect(() => {
    const fetchExistingComment = async () => {
      if (!id) return;

      const docRef = doc(db, "bank_leads", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const commentData = data?.Fremdriftsplan?.[SelectIndex]?.comment;

        if (commentData) {
          form.setValue("text", commentData.text || "");
          form.setValue("full_fort_date", commentData.full_fort_date || "");
          form.setValue("photo", commentData.photo || []);
        }
      }
    };

    fetchExistingComment();
  }, [id, SelectIndex]);

  const filephotoPhotoInputRef = React.useRef<HTMLInputElement | null>(null);
  const uploadPhoto: any = form.watch("photo");

  const handleFileUpload = async (files: FileList, fieldName: any) => {
    if (!files.length) return;

    const currentImages = Array.isArray(uploadPhoto) ? uploadPhoto : [];
    let newImages = [...currentImages];

    const uploadPromises = Array.from(files).map(async (file) => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB.", {
          position: "top-right",
        });
        return null;
      }

      const extension = file.name.split(".").pop()?.toLowerCase();

      const isPdf = extension === "pdf";
      const fileType = isPdf ? "documents" : "images";
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

  const handlephotoFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      await handleFileUpload(event.target.files, "photo");
    }
  };

  const handlephotoClick = () => {
    filephotoPhotoInputRef.current?.click();
  };

  const handlephotoDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      await handleFileUpload(event.dataTransfer.files, "photo");
    }
  };

  const handlephotoDragOver = (event: React.DragEvent<HTMLDivElement>) => {
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
          [`Fremdriftsplan.${SelectIndex}.comment`]: data,
          updatedAt: formatDate(new Date()),
        };

        updatePayload[`Fremdriftsplan.${SelectIndex}.status`] = "Sent";

        await updateDoc(bankDocRef, updatePayload);

        toast.success("Lagret", {
          position: "top-right",
        });
        getData();
      }

      setIsModalOpen(false);
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
          <h2 className="text-darkBlack text-xl font-semibold p-5 border-b border-[#DCDFEA]">
            Grunnarbeider: Kommentar fra utbygger
          </h2>
          <div className="mb-5 p-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <FormField
                  control={form.control}
                  name={`full_fort_date`}
                  render={({ field, fieldState }: any) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : ""
                        } mb-[6px] text-sm`}
                      >
                        Dato fullført av entreprepenør
                      </p>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Skriv inn Dato fullført av entreprepenør"
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
              <div className="flex items-center gap-5 col-span-2">
                <FormField
                  control={form.control}
                  name="photo"
                  render={({ fieldState }) => (
                    <FormItem className="w-max">
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        Bilder fra jobben:
                      </p>
                      <FormControl>
                        <div className="flex items-center gap-5 w-full">
                          <div className="relative w-full">
                            <div
                              className="border border-gray2 rounded-[8px] px-3 laptop:px-6 py-4 flex justify-center items-center flex-col gap-3 cursor-pointer w-full"
                              onDragOver={handlephotoDragOver}
                              onClick={handlephotoClick}
                              onDrop={handlephotoDrop}
                            >
                              <img src={Ic_upload_photo} alt="upload" />
                              <p className="text-gray text-sm text-center truncate w-full">
                                <span className="text-primary font-medium truncate">
                                  Klikk for opplasting
                                </span>{" "}
                                eller dra-og-slipp
                              </p>
                              <p className="text-gray text-sm text-center truncate w-full">
                                SVG, PNG, JPG, PDF or GIF (maks. 800x400px)
                              </p>
                              <input
                                type="file"
                                ref={filephotoPhotoInputRef}
                                className="hidden"
                                accept=".svg, .png, .jpg, .jpeg, .gif, .pdf"
                                onChange={handlephotoFileChange}
                                name="photo"
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
                  {uploadPhoto && (
                    <div className="mt-5 flex items-center gap-5 flex-wrap">
                      {uploadPhoto?.map((file: string, index: number) => {
                        const isPdf = file.toLowerCase().includes(".pdf");
                        return (
                          <div
                            className="relative h-[140px] w-[140px]"
                            key={index}
                          >
                            <img
                              src={isPdf ? Img_pdf : file}
                              alt={isPdf ? "PDF file" : "Uploaded image"}
                              className="object-cover w-full h-full rounded-lg"
                            />
                            <div
                              className="absolute top-2 right-2 bg-[#FFFFFFCC] rounded-[12px] p-[6px] cursor-pointer"
                              onClick={() => {
                                const updatedFiles = uploadPhoto.filter(
                                  (_: any, i: number) => i !== index
                                );
                                form.setValue("photo", updatedFiles);
                              }}
                            >
                              <img src={Ic_delete_purple} alt="delete" />
                            </div>
                          </div>
                        );
                      })}
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
              onClick={() => setIsModalOpen(false)}
            />
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
