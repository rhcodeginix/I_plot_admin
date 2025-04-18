import React, { useEffect } from "react";
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
}> = ({
  fetchLogs,
  fetchHusmodellData,
  handlePopup,
  SelectHistoryValue,
  setSelectHistoryValue,
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

  return (
    <>
      <h3 className="text-2xl mb-4 text-darkBlack font-semibold">
        Legg til oppfølging
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
                        Tittel
                      </p>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Skriv inn Tittel"
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
                        Book
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
                            placeholderText="Pick a date & time"
                            dateFormat="dd.MM.yyyy | HH:mm"
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
            <div onClick={() => form.reset()} className="w-1/2 sm:w-auto">
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
