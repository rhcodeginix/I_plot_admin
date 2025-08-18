import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { z } from "zod";
import Ic_logo from "../../../assets/images/Ic_logo.svg";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/common/button";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import bcrypt from "bcryptjs";
import { fetchAdminDataByEmail } from "../../../lib/utils";

export const Login = () => {
  const navigate = useNavigate();

  const formSchema = z.object({
    email: z
      .string()
      .email({ message: "Vennligst skriv inn en gyldig e-postadresse." })
      .min(1, { message: "E-postadresse er påkrevd." }),

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const adminDocRef = doc(db, "admin", data.email);
      const adminSnap = await getDoc(adminDocRef);

      if (!adminSnap.exists()) {
        toast.error("Admin finnes ikke", { position: "top-right" });
      } else {
        const adminData = adminSnap.data();
        const storedPassword = adminData?.password;

        if (adminData?.supplier !== "9f523136-72ca-4bde-88e5-de175bc2fc71") {
          if (!storedPassword) {
            if (data.password) {
              const hashedPassword = bcrypt.hashSync(data.password, 10);
              await updateDoc(adminDocRef, { password: hashedPassword });

              toast.success("Logg inn", {
                position: "top-right",
              });
              localStorage.setItem("Iplot_admin", data.email);
              const loginUserData = await fetchAdminDataByEmail();
              if (loginUserData) {
                if (
                  loginUserData?.role &&
                  (loginUserData?.role === "Bankansvarlig" ||
                    loginUserData?.role === "Agent")
                ) {
                  navigate("/bank-leads");
                } else {
                  navigate("/dashboard");
                }
              }
            }
          } else {
            const isPasswordCorrect = bcrypt.compareSync(
              data.password,
              storedPassword
            );
            if (isPasswordCorrect) {
              toast.success("Logg inn", { position: "top-right" });
              localStorage.setItem("Iplot_admin", data.email);
              const loginUserData = await fetchAdminDataByEmail();
              if (loginUserData) {
                if (
                  loginUserData?.role &&
                  (loginUserData?.role === "Bankansvarlig" ||
                    loginUserData?.role === "Agent")
                ) {
                  navigate("/bank-leads");
                } else {
                  navigate("/dashboard");
                }
              }
            } else {
              toast.error("Incorrect password", { position: "top-right" });
            }
          }
        } else {
          toast.error("Vennligst logg inn som Bolig Partner-bruker.", {
            position: "top-right",
          });
        }
      }
    } catch (error) {
      console.error("Error during sign-in", error);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center h-screen">
        <div className="relative w-full max-w-[490px]">
          <div
            className="mx-4 bg-white p-7 w-full"
            style={{
              boxShadow:
                "0px 8px 8px -4px #10182808, 0px 20px 24px -4px #10182814",
            }}
          >
            <div className="flex justify-center mb-10">
              <img src={Ic_logo} alt="logo" />
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
                <div className="grid grid-cols-1 gap-6">
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
                <div className="flex justify-end w-full gap-5 items-center p-4">
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
          </div>
        </div>
      </div>
    </>
  );
};
