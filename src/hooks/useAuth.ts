import { useSelector } from "react-redux";

export const useAuth = () => {
  return useSelector<any, any>((state: any) => state.auth);
};

export const useIsAuthenticated = () => {
  const token = localStorage.getItem("Iplot_admin");
  return !!token;
};
