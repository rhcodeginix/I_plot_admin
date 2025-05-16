import { Link, useLocation, useNavigate } from "react-router-dom";
import Ic_logo from "../assets/images/Ic_logo.svg";
import Ic_bell from "../assets/images/Ic_bell.svg";
import Ic_search from "../assets/images/Ic_search.svg";
import Ic_settings from "../assets/images/Ic_settings.svg";
import Ic_chevron_up from "../assets/images/Ic_chevron_up.svg";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { fetchAdminDataByEmail } from "../lib/utils";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [loginUser, setLoginUser] = useState(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  useEffect(() => {
    const user: any = sessionStorage.getItem("Iplot_admin");
    setLoginUser(user);
  }, [loginUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem("Iplot_admin");
      setIsDropdownOpen(false);
      navigate("/login");
      toast.success("Logout successfully", { position: "top-right" });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  const [isPhoto, setIsPhoto] = useState(null);

  const [HusmodellPermission, setHusmodellPermission] = useState<any>(null);
  const email = sessionStorage.getItem("Iplot_admin");

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();
      if (data) {
        setIsPhoto(data?.photo);

        const husmodellData = data?.modulePermissions?.find(
          (item: any) => item.name === "Husmodell"
        );
        setHusmodellPermission(husmodellData?.permissions);
      }
    };

    getData();
  }, []);
  return (
    <>
      <div
        className="px-6 py-4 flex items-center border-b border-gray2 justify-between sticky top-0 bg-white"
        style={{
          zIndex: 999,
        }}
      >
        <Link to={"/"}>
          <img src={Ic_logo} alt="logo" />
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to={"/dashboard"}
            className={`text-base font-medium py-2 px-3 rounded-[6px] ${
              currentPath === "/dashboard"
                ? "bg-lightPurple text-primary"
                : "text-black"
            }`}
          >
            Dashboard
          </Link>
          <Link
            to={"/Leverandorer"}
            className={`text-base font-medium py-2 px-3 rounded-[6px] ${
              currentPath === "/Leverandorer" ||
              currentPath.startsWith("/edit-til-leverandor/") ||
              currentPath === "/legg-til-leverandor"
                ? "bg-lightPurple text-primary"
                : "text-black"
            }`}
          >
            Leverandører
          </Link>
          {(email === "andre.finger@gmail.com" ||
            HusmodellPermission?.add === true ||
            HusmodellPermission?.delete === true ||
            HusmodellPermission?.edit === true) && (
            <Link
              to={"/Husmodeller"}
              className={`text-base font-medium py-2 px-3 rounded-[6px] ${
                currentPath === "/Husmodeller" ||
                currentPath.startsWith("/se-husmodell/") ||
                currentPath === "/add-husmodell" ||
                currentPath.startsWith("/edit-husmodell/")
                  ? "bg-lightPurple text-primary"
                  : "text-black"
              }`}
            >
              Husmodeller
            </Link>
          )}
          {loginUser && loginUser === "andre.finger@gmail.com" && (
            <Link
              to={"/Brukeradministrasjon"}
              className={`text-base font-medium py-2 px-3 rounded-[6px] ${
                currentPath === "/Brukeradministrasjon" ||
                currentPath.startsWith("/edit-til-bruker") ||
                currentPath.startsWith("/legg-til-bruker")
                  ? "bg-lightPurple text-primary"
                  : "text-black"
              }`}
            >
              Brukeradministrasjon
            </Link>
          )}
          {email === "andre.finger@gmail.com" && (
            <Link
              to={"/my-leads"}
              className={`text-base font-medium py-2 px-3 rounded-[6px] ${
                currentPath === "/my-leads" ||
                currentPath.startsWith("/my-leads-details/")
                  ? "bg-lightPurple text-primary"
                  : "text-black"
              }`}
            >
              Min Lead
            </Link>
          )}
          <Link
            to={"/bank-leads"}
            className={`text-base font-medium py-2 px-3 rounded-[6px] ${
              currentPath === "/bank-leads" ||
              currentPath.startsWith("/add-bank-leads") ||
              currentPath.startsWith("/edit-bank-leads/") ||
              currentPath.startsWith("/bank-leads-detail/")
                ? "bg-lightPurple text-primary"
                : "text-black"
            }`}
          >
            Bank Leads
          </Link>
          {loginUser && loginUser === "andre.finger@gmail.com" && (
            <Link
              to={"/leads"}
              className={`text-base font-medium py-2 px-3 rounded-[6px] ${
                currentPath === "/leads" ||
                currentPath.startsWith("/leads-detail")
                  ? "bg-lightPurple text-primary"
                  : "text-black"
              }`}
            >
              Leads
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4 relative">
          <div className="flex items-center gap-1">
            <div className="h-[40px] w-[40px] flex items-center justify-center">
              <img src={Ic_search} alt="search" />
            </div>
            <div className="h-[40px] w-[40px] flex items-center justify-center">
              <img src={Ic_settings} alt="setting" />
            </div>
            <div className="h-[40px] w-[40px] flex items-center justify-center">
              <img src={Ic_bell} alt="bell" />
            </div>
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={toggleDropdown}
          >
            {isPhoto && (
              <div className="h-[40px] w-[40px]">
                <img src={isPhoto} alt="profile" className="rounded-full" />
              </div>
            )}
            <img src={Ic_chevron_up} alt="arrow" className="rotate-180" />
          </div>
          {isDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white shadow-shadow1 rounded-md shadow-lg p-2 top-10 border border-gray2"
              ref={dropdownRef}
            >
              <Link
                to={"/login"}
                className="block px-4 py-2 text-sm hover:bg-lightPurple text-black w-full text-left cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
