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
import { Input } from "../../../components/ui/input";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { db } from "../../../config/firebaseConfig";
import { useLocation } from "react-router-dom";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { fetchAdminDataByEmail } from "../../../lib/utils";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Navn må bestå av minst 2 tegn.",
  }),
  Adresse: z.string().min(1, {
    message: "Adresse må bestå av minst 2 tegn.",
  }),
  supplier: z.string().min(1, {
    message: "Leverandør må velges",
  }),
  is_financing: z.boolean(),
});

export const CreateNewOffice: React.FC<{
  editId: any;
  setEditId: any;
  setActiveTab: any;
}> = ({ editId, setEditId, setActiveTab }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      is_financing: false,
    },
  });

  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
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

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const formatDate = (date: Date) => {
        return date
          .toLocaleString("sv-SE", { timeZone: "UTC" })
          .replace(",", "");
      };

      const uniqueId = editId ? editId : uuidv4();
      const husmodellDocRef = doc(db, "office", uniqueId);

      if (editId) {
        await updateDoc(husmodellDocRef, {
          data,
          id: uniqueId,
          updatedAt: formatDate(new Date()),
        });
        toast.success("Lagret", {
          position: "top-right",
        });
      } else {
        await setDoc(husmodellDocRef, {
          data,
          id: uniqueId,
          updatedAt: formatDate(new Date()),
          createdAt: formatDate(new Date()),
          createDataBy: {
            email: createData?.email,
            photo: createData?.photo,
            name: createData?.f_name
              ? `${createData?.f_name} ${createData?.l_name}`
              : createData?.name,
          },
        });
        toast.success("Added successfully", { position: "top-right" });
      }
      setEditId(null);
      setActiveTab("Kontorliste");
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

    form.setValue("supplier", id);
    if (editId) {
      const getData = async () => {
        try {
          const q = query(collection(db, "office"), where("id", "==", editId));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0];
            const data = docRef.data();

            if (data) {
              form.setValue("Adresse", data?.data?.Adresse);
              form.setValue("name", data?.data?.name);
              form.setValue("is_financing", data?.data?.is_financing);
            }
          } else {
            console.error("No document found for ID:", id);
            return null;
          }
        } catch (error) {
          console.error("Error fetching admin data:", error);
        }
      };
      getData();
    }
  }, [form, id, editId]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <div className="p-4 md:p-5 laptop:p-6">
            <div className="flex flex-col md:grid grid-cols-2 gap-4 lg:gap-6">
              <div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        Navn
                      </p>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Skriv inn Navn"
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
              <div className="col-span-2">
                <div>
                  <FormField
                    control={form.control}
                    name="is_financing"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              id="is_financing"
                              checked={field.value}
                              onChange={field.onChange}
                              className="accent-primary h-[18px] w-[18px]"
                            />
                            <label
                              htmlFor="is_financing"
                              className="text-sm md:text-base"
                            >
                              Er finansieringsavtalen signert?
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
              className="border border-primary bg-primary text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
              type="submit"
            />
          </div>
        </form>
      </Form>
    </>
  );
};
