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
import { useEffect } from "react";

const formSchema = z.object({
  Kategorinavn: z.string().min(1, {
    message: "Kategorinavn må bestå av minst 2 tegn.",
  }),
  isSelected: z.boolean().optional(),
});

export const AddNewSubCat: React.FC<{
  onClose: any;
  formData: any;
  activeTabData: any;
  setCategory: any;
  editIndex?: any;
  // defaultValue?: string;
  editData?: any;
}> = ({
  onClose,
  formData,
  activeTabData,
  setCategory,
  editIndex,
  // defaultValue,
  editData,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // defaultValues: {
    //   Kategorinavn: defaultValue || "",
    // },
  });

  useEffect(() => {
    if (editData?.navn) {
      form.setValue("Kategorinavn", editData?.navn);
    }
    if (editData?.isSelected) {
      form.setValue("isSelected", editData?.isSelected);
    }
  }, [form, editData?.navn, editData?.isSelected]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    onClose();

    const updatedName = data.Kategorinavn;

    const existingCategories =
      formData.getValues(`hovedkategorinavn.${activeTabData}.Kategorinavn`) ||
      [];

    if (editIndex !== null && existingCategories[editIndex]) {
      const updatedCategories = [...existingCategories];
      updatedCategories[editIndex].navn = updatedName;
      updatedCategories[editIndex].isSelected = data?.isSelected ?? false;

      setCategory((prev: any) => {
        const updatedCategory = [...prev];
        updatedCategory[activeTabData] = {
          ...updatedCategory[activeTabData],
          Kategorinavn: updatedCategories,
          isSelected: data.isSelected ?? false,
        };
        return updatedCategory;
      });

      formData.setValue(
        `hovedkategorinavn.${activeTabData}.Kategorinavn`,
        updatedCategories,
        { shouldValidate: true }
      );
      // formData.setValue(
      //   `hovedkategorinavn.${activeTabData}.isSelected`,
      //   formData.getValues(`hovedkategorinavn.${activeTabData}.isSelected`) ??
      //     false,
      //   { shouldValidate: true }
      // );
    } else {
      const newSubCategory = {
        navn: updatedName,
        isSelected: data?.isSelected ?? false,
        produkter: [],
      };
      setCategory((prev: any) => {
        const updatedCategory = [...prev];
        updatedCategory[activeTabData] = {
          ...updatedCategory[activeTabData],
          Kategorinavn: [...existingCategories, newSubCategory],
          isSelected: data.isSelected ?? false,
        };
        return updatedCategory;
      });
      // formData.setValue(
      //   `hovedkategorinavn.${activeTabData}.Kategorinavn`,
      //   [...existingCategories, newSubCategory],
      //   { shouldValidate: true }
      // );
    }
    // formData.setValue(
    //   `hovedkategorinavn.${activeTabData}.isSelected`,
    //   data.isSelected ?? false,
    //   { shouldValidate: true }
    // );
  };
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative w-full"
        >
          <div>
            <FormField
              control={form.control}
              name="Kategorinavn"
              render={({ field, fieldState }) => (
                <FormItem>
                  <p
                    className={`${
                      fieldState.error ? "text-red" : "text-black"
                    } mb-[6px] text-sm font-medium`}
                  >
                    Kategorinavn
                  </p>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Skriv inn Kategorinavn"
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
              name={`isSelected`}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative flex items-center gap-2 mt-3">
                      <input
                        className={`bg-white rounded-[8px] accent-primary border text-black
                                  ${
                                    fieldState?.error
                                      ? "border-red"
                                      : "border-gray1"
                                  } h-4 w-4`}
                        type="radio"
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          if (isChecked) {
                            form.setValue("isSelected", isChecked);
                          }
                        }}
                        checked={field.value}
                      />
                      <p
                        className={`${
                          fieldState.error ? "text-red" : "text-black"
                        } text-sm font-medium`}
                      >
                        Is mandatory
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end w-full gap-5 items-center left-0 mt-8">
            <div onClick={() => form.reset()}>
              <Button
                text="Avbryt"
                className="border border-lightPurple bg-lightPurple text-purple text-sm rounded-[8px] h-[40px] font-medium relative px-12 py-2 flex items-center gap-2"
              />
            </div>
            <Button
              text="Lagre"
              className="border border-purple bg-purple text-white text-sm rounded-[8px] h-[40px] font-medium relative px-12 py-2 flex items-center gap-2"
              type="submit"
            />
          </div>
        </form>
      </Form>
    </>
  );
};
