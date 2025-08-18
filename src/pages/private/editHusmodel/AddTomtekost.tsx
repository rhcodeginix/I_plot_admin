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
import { Input } from "../../../components/ui/input";

const formSchema = z.object({
  TomtekostID: z.string(),
  Headline: z.string().min(1, {
    message: "Headline må bestå av minst 2 tegn.",
  }),
  MerInformasjon: z.string().min(1, {
    message: "MerInformasjon må bestå av minst 2 tegn.",
  }),
  pris: z
    .string()
    .min(1, {
      message: "Pris må bestå av minst 1 tegn.",
    })
    .nullable(),
  IncludingOffer: z.boolean().optional(),
});

export const AddTomtekost: React.FC<{
  product: any;
  formValue: any;
}> = ({ product, formValue }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      TomtekostID: "",
      Headline: "",
      MerInformasjon: "",
      pris: "",
      IncludingOffer: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>, e: any) => {
    e.preventDefault();

    data.TomtekostID = new Date().toISOString();
    const existingByggekostnader = formValue.getValues("Tomtekost") || [];
    existingByggekostnader.push(data);

    const updatedByggekostnader = existingByggekostnader.filter(
      (item: any) => item.TomtekostID
    );

    updatedByggekostnader.length &&
      formValue.setValue("Tomtekost", updatedByggekostnader, {
        shouldValidate: true,
        shouldDirty: true,
      });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <div className="flex flex-col gap-[18px]">
            <div>
              <FormField
                name={`Headline`}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <p
                      className={`${
                        fieldState.error ? "text-red" : "text-black"
                      } mb-[6px] text-sm font-medium`}
                    >
                      Heading
                    </p>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Skriv inn Heading"
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
            <div className="grid grid-cols-2 gap-6">
              <div>
                <FormField
                  control={form.control}
                  name={`MerInformasjon`}
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } mb-[6px] text-sm font-medium`}
                      >
                        Mer informasjon
                      </p>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Skriv inn Mer informasjon"
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
                  name={`pris`}
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-2 mb-[6px]">
                        <p
                          className={`${
                            fieldState.error ? "text-red" : "text-black"
                          } text-sm font-medium`}
                        >
                          Pris fra
                        </p>
                        <div className="flex items-center gap-3 text-black text-sm font-medium">
                          inkl. i tilbud
                          <div className="toggle-container">
                            <input
                              type="checkbox"
                              id="toggleTomtekSwitch1"
                              className="toggle-input"
                              checked={form.watch(`IncludingOffer`) || false}
                              name={`IncludingOffer`}
                              onChange={(e: any) => {
                                const checkedValue = e.target.checked;
                                form.setValue(`IncludingOffer`, checkedValue);
                                if (checkedValue) {
                                  form.setValue(`pris`, null);
                                } else {
                                  form.setValue(`pris`, "");
                                }
                              }}
                            />
                            <label
                              htmlFor="toggleTomtekSwitch1"
                              className="toggle-label"
                            ></label>
                          </div>
                        </div>
                      </div>
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
                                  name: `pris`,
                                  value: value.replace(/\D/g, "")
                                    ? new Intl.NumberFormat("no-NO").format(
                                        Number(value.replace(/\D/g, ""))
                                      )
                                    : "",
                                },
                              })
                            }
                            value={field.value === null ? "-" : field.value}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex justify-end items-center gap-4">
              <div onClick={() => form.reset()} >
                <Button
                  text="Avbryt"
                  className="border border-gray2 text-black text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                />
              </div>
              <div onClick={form.handleSubmit(onSubmit)}>
                <Button
                  text="Lagre"
                  className="border border-primary bg-primary text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                />
              </div>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};
