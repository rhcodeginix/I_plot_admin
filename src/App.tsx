import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export const App = () => {
  const params = new URLSearchParams(window.location.search);
  const email = params.get("email");

  if (email) {
    localStorage.setItem("Iplot_admin", email);

    params.delete("email");
    const newUrl =
      window.location.pathname +
      (params.toString() ? `?${params.toString()}` : "");
    window.history.replaceState({}, "", newUrl);
  }
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        toastOptions={{
          style: {
            zIndex: 999999999,
          },
        }}
      />
      <RouterProvider router={routes} />
    </QueryClientProvider>
  );
};
