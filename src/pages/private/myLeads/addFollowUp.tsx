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
import { z } from "zod";
import toast from "react-hot-toast";
import { db } from "../../../config/firebaseConfig";
import { useLocation } from "react-router-dom";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import DateTimePickerComponent from "../../../components/ui/datetimepicker";
import { TextArea } from "../../../components/ui/textarea";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  InspectionPanel,
  Mail,
  Phone,
  Video,
  Infinity,
  Shirt,
} from "lucide-react";

const formSchema = z.object({
  date: z.coerce.date({
    required_error: "Dato er påkrevd",
    invalid_type_error: "Ugyldig datoformat",
  }),
  notat: z
    .string({
      required_error: "Notat er påkrevd",
    })
    .min(2, { message: "Notat må bestå av minst 2 tegn." }),
  Hurtigvalg: z.string().optional(),
});

export const AddFollowupForm: React.FC<{
  fetchLogs: any;
  fetchHusmodellData: any;
  handlePopup: any;
  SelectHistoryValue: any;
  setSelectHistoryValue: any;
  setDropdownOpen: any;
}> = ({
  fetchLogs,
  fetchHusmodellData,
  handlePopup,
  SelectHistoryValue,
  setSelectHistoryValue,
  setDropdownOpen,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const finalData = {
        ...data,
        date: data.date ?? null,
        notat: data.notat ?? null,
      };
      try {
        const formatter = new Intl.DateTimeFormat("nb-NO", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        const subDocRef = doc(
          db,
          "leads_from_supplier",
          String(id),
          "history",
          String(id)
        );
        const subDocSnap = await getDoc(subDocRef);

        if (subDocSnap.exists()) {
          await updateDoc(subDocRef, {
            ...finalData,
            updatedAt: formatter.format(new Date()),
          });
          toast.success("Follow up updated.", {
            position: "top-right",
          });
        } else {
          await setDoc(subDocRef, {
            ...finalData,
            createdAt: formatter.format(new Date()),
            updatedAt: formatter.format(new Date()),
          });
          toast.success("Follow up created.", {
            position: "top-right",
          });
        }
        const now = new Date();

        const datePart = new Intl.DateTimeFormat("nb-NO", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(now);

        const timePart = new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(now);

        const formattedDateTime = `${datePart} | ${timePart}`;
        const logRef = collection(
          db,
          "leads_from_supplier",
          String(id),
          "followups"
        );

        await addDoc(logRef, {
          ...finalData,
          createdAt: formattedDateTime,
          updatedAt: formattedDateTime,
        });

        await updateDoc(doc(db, "leads_from_supplier", String(id)), {
          updatedAt: Timestamp.now(),
        });

        await fetchLogs();
        await fetchHusmodellData();
        handlePopup();
        form.reset();
        setSelectHistoryValue("");
      } catch (error) {
        console.error("Firestore operation failed:", error);
        toast.error("Something went wrong. Please try again.", {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Firestore operation failed:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
      });
    }
  };

  useEffect(() => {
    if (SelectHistoryValue) {
      form.setValue("Hurtigvalg", SelectHistoryValue);
    }
  }, [SelectHistoryValue, form]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <h3 className="text-lg md:text-xl desktop:text-2xl mb-4 text-darkBlack font-semibold">
        Legg til ny oppfølgning
      </h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <div className="">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <FormField
                  control={form.control}
                  name="Hurtigvalg"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        Legg til ny aktivitet
                      </p>
                      <FormControl>
                        <div className="relative">
                          {SelectHistoryValue ? (
                            <Input
                              placeholder="Hva gjelder det?"
                              {...field}
                              className={`bg-white rounded-[8px] border text-black
                                          ${
                                            fieldState?.error
                                              ? "border-red"
                                              : "border-gray1"
                                          } `}
                              type="text"
                              disable={SelectHistoryValue}
                            />
                          ) : (
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
                                <SelectValue placeholder="Velg ny aktivitet" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectGroup>
                                  <SelectItem value="Telefon">
                                    <div className="flex items-center gap-2">
                                      <Phone className="w-5 h-5" /> Telefon
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Møte">
                                    <div className="flex items-center gap-2">
                                      <Shirt className="w-5 h-5" />
                                      Møte
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Videomøte">
                                    <div className="flex items-center gap-2">
                                      <Video className="w-5 h-5" />
                                      Videomøte
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Befaring">
                                    <div className="flex items-center gap-2">
                                      <InspectionPanel className="w-5 h-5" />
                                      Befaring
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="E-post">
                                    <div className="flex items-center gap-2">
                                      <Mail className="w-5 h-5" />
                                      E-post
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Annet">
                                    <div className="flex items-center gap-2">
                                      <Infinity className="w-5 h-5" />
                                      Annet
                                    </div>
                                  </SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          )}
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
                  name="date"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        Sett oppfølgning til
                      </p>
                      <FormControl>
                        <div className="relative w-full">
                          <DateTimePickerComponent
                            selectedDate={field.value ? field.value : null}
                            onDateChange={(date: Date | null) => {
                              if (date) {
                                field.onChange(date);
                              }
                            }}
                            className="border border-gray1 rounded-lg px-[14px] py-[10px] w-full"
                            placeholderText="Velg tidspunkt/frist"
                            dateFormat="dd.MM.yyyy | HH:mm"
                            minDate={new Date()}
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
                  name="notat"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        Notat
                      </p>
                      <FormControl>
                        <div className="relative">
                          <TextArea
                            placeholder="Fyll inn kommentar"
                            {...field}
                            className={`h-[100px] bg-white rounded-[8px] border text-black
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
            </div>
          </div>
          <div className="flex justify-end w-full gap-5 items-center mt-8">
            <div onClick={() => form.reset()}>
              <Button
                text="Tilbake"
                className="border border-lightPurple bg-lightPurple text-primary text-base rounded-[8px] h-[48px] font-medium relative py-[10px] flex items-center gap-2 px-[50px]"
              />
            </div>
            <Button
              text="Lagre"
              className="border border-green2 bg-green2 text-white text-base rounded-[8px] h-[48px] font-medium relative px-[50px] py-[10px] flex items-center gap-2"
              type="submit"
            />
          </div>
        </form>
      </Form>
    </>
  );
};
