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
import { Input } from "../../../components/ui/input";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import bcrypt from "bcryptjs";
import { db, storage } from "../../../config/firebaseConfig";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { fetchAdminData } from "../../../lib/utils";
import Modal from "../../../components/common/modal";
import { ChevronRight } from "lucide-react";

const formSchema = z.object({
  photo: z.union([
    z
      .instanceof(File)
      .refine((file: any) => file === null || file.size <= 10 * 1024 * 1024, {
        message: "Filstørrelsen må være mindre enn 10 MB.",
      }),
    z.string(),
  ]),
  f_name: z.string().min(1, {
    message: "Fornavn må bestå av minst 2 tegn.",
  }),
  l_name: z.string().min(1, {
    message: "Etternavn må bestå av minst 2 tegn.",
  }),
  email: z
    .string()
    .email({ message: "Vennligst skriv inn en gyldig e-postadresse." })
    .min(1, { message: "E-posten må være på minst 2 tegn." }),
  password: z
    .string()
    .min(8, { message: "Passordet må være minst 8 tegn langt." })
    .regex(/[A-Z]/, {
      message: "Passordet må inneholde minst én stor bokstav.",
    })
    .regex(/[a-z]/, {
      message: "Passordet må inneholde minst én liten bokstav.",
    })
    .regex(/[0-9]/, { message: "Passordet må inneholde minst ett tall." })
    .regex(/[@$!%*?&]/, {
      message: "Passordet må inneholde minst ett spesialtegn.",
    }),
});

function hashPassword(password: any) {
  if (bcrypt.getRounds(password)) {
    return password;
  }

  return bcrypt.hashSync(password, 10);
}

export const AddBankUserForm = () => {
  const form = useForm<z.infer<ReturnType<any>>>({
    resolver: zodResolver(formSchema),
  });

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  const navigate = useNavigate();
  const [isPopup, setIsPopup] = useState(false);

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
      const adminDocRef = doc(db, "admin", data.email);
      const adminSnap = await getDoc(adminDocRef);
      const uniqueId = id ? id : uuidv4();
      const hashedPassword = hashPassword(data.password);

      if (id) {
        await updateDoc(adminDocRef, {
          ...data,
          id: uniqueId,
          password: hashedPassword,
          updatedAt: new Date(),
          role: "Bankansvarlig",
        });
        toast.success("Lagret", {
          position: "top-right",
        });
        if (hashedPassword === data.password) {
          setIsPopup(false);
          navigate(`/Brukeradministrasjon`);
        } else {
          setIsPopup(true);
        }
      } else {
        if (!adminSnap.exists()) {
          await setDoc(adminDocRef, {
            ...data,
            id: uniqueId,
            role: "Bankansvarlig",
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          await fetch(
            "https://nh989m12uk.execute-api.eu-north-1.amazonaws.com/prod/banklead",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                action: "send-login",
                email: data.email,
                firstName: data.f_name,
                lastName: data.l_name,
                password: data.password,
                link: "https://admin.mintomt.no/",
                company: "Mintomt",
              }),
            }
          );
          toast.success("Admin created successfully!", {
            position: "top-right",
          });
          setIsPopup(true);
        } else {
          toast.error("Already Added!", { position: "top-right" });
        }
      }
    } catch (error) {
      console.error("Firestore operation failed:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
      });
    }
  };

  useEffect(() => {
    if (!id) {
      return;
    }
    const getData = async () => {
      const data = await fetchAdminData(id);
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          if (key === "password") form.setValue(key as any, value);

          if (value !== undefined && value !== null)
            form.setValue(key as any, value);
        });
      }
    };

    getData();
  }, [form, id]);

  const handleConfirmPopup = () => {
    if (isPopup) {
      setIsPopup(false);
    } else {
      setIsPopup(true);
    }
  };

  return (
    <>
      <div className="px-6 pt-6 pb-16 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Link
            to={"/Brukeradministrasjon"}
            className="text-gray text-sm font-medium"
          >
            Brukere
          </Link>
          <ChevronRight className="text-gray2 w-4 h-4" />
          <span className="text-primary text-sm font-medium">
            Legg til nye brukere
          </span>
        </div>
        <h1 className="text-darkBlack font-medium text-[30px]">
          Legg til bruker
        </h1>
        <div className="flex items-start gap-8">
          <div className="w-max">
            <h5 className="text-black text-sm font-medium whitespace-nowrap mr-16">
              Brukerdetaljer
            </h5>
          </div>
          <div className="w-full shadow-shadow2 rounded-lg overflow-hidden relative">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
                <div className="p-5 laptop:p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 flex gap-6 items-center">
                      <div className="w-1/2">
                        <FormField
                          control={form.control}
                          name="photo"
                          render={() => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <div
                                    className="border border-gray2 rounded-[8px] px-3 laptop:px-6 py-4 flex justify-center items-center flex-col gap-3 cursor-pointer"
                                    onDragOver={handleDragOver}
                                    onClick={handleClick}
                                    onDrop={handleDrop}
                                  >
                                    <img src={Ic_upload_photo} alt="upload" />
                                    <p className="text-gray text-sm text-center truncate w-full">
                                      <span className="text-primary font-medium truncate">
                                        Klikk for opplasting
                                      </span>{" "}
                                      eller dra-og-slipp
                                    </p>
                                    <p className="text-gray text-sm text-center truncate w-full">
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
                      <div className="w-1/2">
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
                        name="f_name"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <p
                              className={`${
                                fieldState.error ? "text-red" : "text-black"
                              } mb-[6px] text-sm font-medium`}
                            >
                              Fornavn
                            </p>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="Skriv inn Fornavn"
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
                        name="l_name"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <p
                              className={`${
                                fieldState.error ? "text-red" : "text-black"
                              } mb-[6px] text-sm font-medium`}
                            >
                              Etternavn
                            </p>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="Skriv inn Etternavn"
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
                        name="password"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <p
                              className={`${
                                fieldState.error ? "text-red" : "text-black"
                              } mb-[6px] text-sm font-medium`}
                            >
                              Passord
                            </p>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="Skriv inn Passord"
                                  {...field}
                                  className={`bg-white rounded-[8px] border text-black
                                          ${
                                            fieldState?.error
                                              ? "border-red"
                                              : "border-gray1"
                                          } `}
                                  type="password"
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
                <div className="flex justify-end w-full gap-5 items-center sticky bottom-0 bg-white z-50 border-t border-gray2 p-4">
                  <div onClick={() => form.reset()} className="w-1/2 sm:w-auto">
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
          </div>
        </div>
      </div>

      {isPopup && (
        <Modal onClose={handleConfirmPopup} isOpen={true}>
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex gap-2 items-center">
                <p className="text-lg font-bold">E-post:</p>
                <span className="text-base">{form.getValues("email")}</span>
              </div>
              <div className="flex gap-2 items-center">
                <p className="text-lg font-bold">Password:</p>
                <span className="text-base">{form.getValues("password")}</span>
              </div>
              <br />
              <p>
                <span className="font-semibold">Note:</span> Dette er din e-post
                og passord. vennligst send dette passordet til denne brukeren.
              </p>
              <div className="flex justify-center mt-5 w-full gap-5 items-center">
                <div
                  onClick={() => setIsPopup(false)}
                  className="w-1/2 sm:w-auto"
                >
                  <Button
                    text="Avbryt"
                    className="border border-gray2 text-black text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                  />
                </div>
                <div onClick={() => navigate(`/Brukeradministrasjon`)}>
                  <Button
                    text="Bekrefte"
                    className="border border-purple bg-purple text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
