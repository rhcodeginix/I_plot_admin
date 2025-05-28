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
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { fetchAdminData, fetchAdminDataByEmail } from "../../../lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { X } from "lucide-react";

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
});

export const CreateNewOffice: React.FC<{
  setIsOfficePopup: any;
  setDropdownOpen: (open: boolean) => void;
}> = ({ setIsOfficePopup, setDropdownOpen }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  const [suppliers, setSuppliers] = useState([]);
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

  const fetchSuppliersData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "suppliers"));
      const data: any = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching husmodell data:", error);
    }
  };

  useEffect(() => {
    fetchSuppliersData();
  }, []);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const formatDate = (date: Date) => {
        return date
          .toLocaleString("sv-SE", { timeZone: "UTC" })
          .replace(",", "");
      };

      const uniqueId = id ? id : uuidv4();
      const husmodellDocRef = doc(db, "office", uniqueId);

      if (id) {
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
            name: createData?.name,
          },
        });
        toast.success("Added successfully", { position: "top-right" });
      }
      setIsOfficePopup(false);
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <div className="p-5 laptop:p-6">
            <div className="flex items-center gap-2 justify-between mb-6">
              <h4 className="text-darkBlack text-xl font-semibold">
                Opprett nytt kontor
              </h4>
              <X
                className="text-primary cursor-pointer"
                onClick={() => setIsOfficePopup(false)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
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
              <div>
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        Leverandører
                      </p>
                      <FormControl>
                        <div className="relative">
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                            }}
                            value={field.value}
                            onOpenChange={(open) => {
                              setIsDropdownOpen(open);
                              setDropdownOpen(open);
                            }}
                            open={isDropdownOpen}
                          >
                            <SelectTrigger
                              className={`bg-white rounded-[8px] border text-black
                              ${
                                fieldState?.error
                                  ? "border-red"
                                  : "border-gray1"
                              } `}
                            >
                              <SelectValue placeholder="Select Leverandører" />
                            </SelectTrigger>
                            <SelectContent
                              className="bg-white"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <SelectGroup>
                                {suppliers?.map((sup: any, index) => {
                                  return (
                                    <SelectItem value={sup?.id} key={index}>
                                      {sup?.company_name}
                                    </SelectItem>
                                  );
                                })}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
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
            <div onClick={() => form.reset()}>
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
