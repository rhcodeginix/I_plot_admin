import { Link, useLocation, useNavigate } from "react-router-dom";
import Ic_logo from "../assets/images/Ic_logo.svg";
import Ic_chevron_up from "../assets/images/Ic_chevron_up.svg";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { fetchAdminDataByEmail } from "../lib/utils";
import { Menu, X } from "lucide-react";

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
    const user: any = localStorage.getItem("Iplot_admin");
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
      localStorage.removeItem("Iplot_admin");
      setIsDropdownOpen(false);
      navigate("/login");
      toast.success("Logout successfully", { position: "top-right" });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  const [isPhoto, setIsPhoto] = useState(null);

  const [HusmodellPermission, setHusmodellPermission] = useState<any>(null);
  const [Role, setRole] = useState<any>(null);
  const [Supplier, setSupplier] = useState<any>(null);
  const [name, setName] = useState<any>(null);
  const email = localStorage.getItem("Iplot_admin");

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();

      if (data) {
        if (data?.role) {
          setRole(data?.role);
        }

        setIsPhoto(data?.photo);
        setName(data?.name || data?.f_name);

        if (data?.supplier) {
          setSupplier(data?.supplier);
        }
        const husmodellData = data?.modulePermissions?.find(
          (item: any) => item.name === "Husmodell"
        );
        setHusmodellPermission(husmodellData?.permissions);
      }
    };

    getData();
  }, []);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };
  return (
    <>
      <div
        className="px-4 md:px-6 py-4 flex items-center border-b border-gray2 justify-between sticky top-0 bg-white"
        style={{
          zIndex: 999,
        }}
      >
        <div className="flex items-center gap-2">
          <Menu
            onClick={toggleDrawer}
            className="desktop:hidden text-primary"
          />

          <Link to={"/"}>
            <img
              src={Ic_logo}
              alt="logo"
              className="w-[90px] md:w-[120px] big:w-auto"
            />
          </Link>
        </div>

        <div className="hidden desktop:flex items-center gap-0.5">
          {Role && Role !== "Bankansvarlig" && Role !== "Agent" && (
            <Link
              to={"/dashboard"}
              className={`text-base font-medium py-2 px-2 big:px-3 rounded-[6px] ${
                currentPath === "/dashboard"
                  ? "bg-lightPurple text-primary"
                  : "text-black"
              }`}
            >
              Dashboard
            </Link>
          )}
          {email === "andre.finger@gmail.com" && (
            <Link
              to={"/Leverandorer"}
              className={`text-base font-medium py-2 px-2 big:px-3 rounded-[6px] ${
                currentPath === "/Leverandorer" ||
                currentPath.startsWith("/edit-til-leverandor/") ||
                currentPath === "/legg-til-leverandor"
                  ? "bg-lightPurple text-primary"
                  : "text-black"
              }`}
            >
              Leverandører
            </Link>
          )}
          {email === "andre.finger@gmail.com" && (
            <Link
              to={"/events"}
              className={`text-base font-medium py-2 px-2 big:px-3 rounded-[6px] ${
                currentPath === "/events"
                  ? "bg-lightPurple text-primary"
                  : "text-black"
              }`}
            >
              Kontosammendrag
            </Link>
          )}
          {(email === "andre.finger@gmail.com" ||
            HusmodellPermission?.add === true ||
            HusmodellPermission?.delete === true ||
            HusmodellPermission?.edit === true) &&
            (!Role || (Role !== "Bankansvarlig" && Role !== "Agent")) && (
              <Link
                to={"/Husmodeller"}
                className={`text-base font-medium py-2 px-2 big:px-3 rounded-[6px] ${
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
          {/* {((loginUser && loginUser === "andre.finger@gmail.com") ||
            (Role && Role === "Agent")) && (
            <Link
              to={"/Brukeradministrasjon"}
              className={`text-base font-medium py-2 px-2 big:px-3 rounded-[6px] ${
                currentPath === "/Brukeradministrasjon" ||
                currentPath.startsWith("/edit-user") ||
                currentPath.startsWith("/edit-bank-user") ||
                currentPath.startsWith("/edit-agent-user") ||
                currentPath.startsWith("/legg-user") ||
                currentPath.startsWith("/add-agent-user") ||
                currentPath.startsWith("/add-bank-user")
                  ? "bg-lightPurple text-primary"
                  : "text-black"
              }`}
            >
              Brukeradministrasjon
            </Link>
          )} */}
          {(loginUser === "andre.finger@gmail.com" ||
            (loginUser !== "andre.finger@gmail.com" &&
              Supplier === "065f9498-6cdb-469b-8601-bb31114d7c95") ||
            (Role && Role !== "Bankansvarlig" && Role !== "Agent")) && (
            <Link
              to={"/my-leads"}
              className={`text-base font-medium py-2 px-2 big:px-3 rounded-[6px] ${
                currentPath === "/my-leads" ||
                currentPath === "/add-lead" ||
                currentPath.startsWith("/my-leads-details/")
                  ? "bg-lightPurple text-primary"
                  : "text-black"
              }`}
            >
              Tilbudsforespørsler
            </Link>
          )}
          {Role && Role !== "Bankansvarlig" && Role !== "Agent" && (
            <Link
              to={"/agent-leads"}
              className={`text-base font-medium py-2 px-2 big:px-3 rounded-[6px] ${
                currentPath === "/agent-leads" ||
                currentPath.startsWith("/add-agent-leads") ||
                currentPath.startsWith("/edit-agent-leads/") ||
                currentPath.startsWith("/agent-leads-detail/")
                  ? "bg-lightPurple text-primary"
                  : "text-black"
              }`}
            >
              Finansiering
            </Link>
          )}
          {Role && (Role === "Bankansvarlig" || Role === "Agent") && (
            <Link
              to={"/bank-leads"}
              className={`text-base font-medium py-2 px-2 big:px-3 rounded-[6px] ${
                currentPath === "/bank-leads" ||
                currentPath.startsWith("/bank-leads-detail") ||
                currentPath.startsWith("/add-bank-leads") ||
                currentPath.startsWith("/edit-bank-leads/")
                  ? "bg-lightPurple text-primary"
                  : "text-black"
              }`}
            >
              Tips til bank
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2 md:gap-3 relative">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={toggleDropdown}
          >
            {isPhoto ? (
              <div className="w-8 h-8 md:h-[40px] md:w-[40px]">
                <img src={isPhoto} alt="profile" className="rounded-full" />
              </div>
            ) : (
              <div className="w-8 h-8 md:h-[40px] md:w-[40px] flex items-center justify-center border border-primary bg-lightPurple rounded-full">
                {name?.[0]}
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
              <Link
                to={"/Brukeradministrasjon"}
                className="block px-4 py-2 text-sm hover:bg-lightPurple text-black w-full text-left cursor-pointer"
              >
                Brukeradministrasjon
              </Link>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          transition: "transform 1s, box-shadow 1s",
          transform: isDrawerOpen ? "translateX(0)" : "translateX(-100%)",
          background: isDrawerOpen ? "rgba(0, 0, 0, 0.6)" : "",
          zIndex: 999999,
        }}
        className={`fixed top-0 left-0 w-full h-screen z-50`}
      >
        <div className="bg-white h-full px-4 sm:px-5 md:px-8 lg:px-10 big:px-[120px] w-[85%]">
          <div className="flex items-center justify-between py-4 mb-4">
            <div className="gap-[12px] flex items-center">
              <img
                src={Ic_logo}
                alt="logo"
                className="w-[90px] md:w-[120px] big:w-auto"
              />
            </div>
            <button onClick={toggleDrawer} className="text-3xl">
              <X className="text-primary" />
            </button>
          </div>
          <div className="flex flex-col items-start font-medium gap-3">
            {Role && Role !== "Bankansvarlig" && Role !== "Agent" && (
              <Link
                to={"/dashboard"}
                className={`text-base font-medium py-2 px-2 big:px-3 rounded-[6px] ${
                  currentPath === "/dashboard"
                    ? "bg-lightPurple text-primary"
                    : "text-black"
                }`}
              >
                Dashboard
              </Link>
            )}
            {email === "andre.finger@gmail.com" && (
              <Link
                to={"/Leverandorer"}
                className={`text-base font-medium py-2 px-2 big:px-3 rounded-[6px] ${
                  currentPath === "/Leverandorer" ||
                  currentPath.startsWith("/edit-til-leverandor/") ||
                  currentPath === "/legg-til-leverandor"
                    ? "bg-lightPurple text-primary"
                    : "text-black"
                }`}
              >
                Leverandører
              </Link>
            )}
            {email === "andre.finger@gmail.com" && (
              <Link
                to={"/events"}
                className={`text-base font-medium py-2 px-2 big:px-3 rounded-[6px] ${
                  currentPath === "/events"
                    ? "bg-lightPurple text-primary"
                    : "text-black"
                }`}
              >
                Kontosammendrag
              </Link>
            )}
            {(email === "andre.finger@gmail.com" ||
              HusmodellPermission?.add === true ||
              HusmodellPermission?.delete === true ||
              HusmodellPermission?.edit === true) &&
              (!Role || (Role !== "Bankansvarlig" && Role !== "Agent")) && (
                <Link
                  to={"/Husmodeller"}
                  className={`text-base font-medium py-2 px-2 big:px-3 rounded-[6px] ${
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
            {/* {((loginUser && loginUser === "andre.finger@gmail.com") ||
            (Role && Role === "Agent")) && (
            <Link
              to={"/Brukeradministrasjon"}
              className={`text-base font-medium py-2 px-2 big:px-3 rounded-[6px] ${
                currentPath === "/Brukeradministrasjon" ||
                currentPath.startsWith("/edit-user") ||
                currentPath.startsWith("/edit-bank-user") ||
                currentPath.startsWith("/edit-agent-user") ||
                currentPath.startsWith("/legg-user") ||
                currentPath.startsWith("/add-agent-user") ||
                currentPath.startsWith("/add-bank-user")
                  ? "bg-lightPurple text-primary"
                  : "text-black"
              }`}
            >
              Brukeradministrasjon
            </Link>
          )} */}
            {(loginUser === "andre.finger@gmail.com" ||
              (loginUser !== "andre.finger@gmail.com" &&
                Supplier === "065f9498-6cdb-469b-8601-bb31114d7c95") ||
              (Role && Role !== "Bankansvarlig" && Role !== "Agent")) && (
              <Link
                to={"/my-leads"}
                className={`text-base font-medium py-2 px-2 big:px-3 rounded-[6px] ${
                  currentPath === "/my-leads" ||
                  currentPath === "/add-lead" ||
                  currentPath.startsWith("/my-leads-details/")
                    ? "bg-lightPurple text-primary"
                    : "text-black"
                }`}
              >
                Tilbudsforespørsler
              </Link>
            )}
            {Role && Role !== "Bankansvarlig" && Role !== "Agent" && (
              <Link
                to={"/agent-leads"}
                className={`text-base font-medium py-2 px-2 big:px-3 rounded-[6px] ${
                  currentPath === "/agent-leads" ||
                  currentPath.startsWith("/add-agent-leads") ||
                  currentPath.startsWith("/edit-agent-leads/") ||
                  currentPath.startsWith("/agent-leads-detail/")
                    ? "bg-lightPurple text-primary"
                    : "text-black"
                }`}
              >
                Finansiering
              </Link>
            )}
            {Role && (Role === "Bankansvarlig" || Role === "Agent") && (
              <Link
                to={"/bank-leads"}
                className={`text-base font-medium py-2 px-2 big:px-3 rounded-[6px] ${
                  currentPath === "/bank-leads" ||
                  currentPath.startsWith("/bank-leads-detail") ||
                  currentPath.startsWith("/add-bank-leads") ||
                  currentPath.startsWith("/edit-bank-leads/")
                    ? "bg-lightPurple text-primary"
                    : "text-black"
                }`}
              >
                Tips til bank
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
