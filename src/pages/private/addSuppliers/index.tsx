import { ChevronRight, Plus, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AddSuppliersForm } from "./addSuppliersForm";
import { useEffect, useState } from "react";
import { CreateNewOffice } from "./createOffice";
import { OfficesTable } from "./OfficesTable";
import { OfficesUserTable } from "./OfficeUserTable";
import Button from "../../../components/common/button";
import Modal from "../../../components/common/modal";
import { AddUserPerOffice } from "./addNewUser";

export const AddSuppliers = () => {
  const [activeTab, setActiveTab] = useState<
    "Leverandører" | "Legg til kontor" | "Kontorliste"
  >("Leverandører");
  const navigate = useNavigate();
  const [editId, setEditId] = useState(null);

  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;

  useEffect(() => {
    if (editId && activeTab !== "Legg til kontor") {
      setEditId(null);
    }
  }, [activeTab]);

  const [isUserPopup, setIsUserPopup] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRefetch, setIsRefetch] = useState(false);

  useEffect(() => {
    if (!isUserPopup) {
      navigate(`/edit-til-leverandor/${id}`);
    }
  }, [isUserPopup]);

  return (
    <>
      <div className="px-4 md:px-6 pt-6 pb-16 flex flex-col gap-4 md:gap-6">
        <div className="flex items-center gap-1.5 md:gap-3">
          <Link
            to={"/Leverandorer"}
            className="text-gray text-xs md:text-sm font-medium"
          >
            Leverandører
          </Link>
          <ChevronRight className="text-gray2 w-4 h-4" />
          <span className="text-primary text-xs md:text-sm font-medium">
            Legg til nye leverandører
          </span>
        </div>
        {id && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-2">
            <div className="flex gap-1.5">
              {["Leverandører", "Legg til kontor", "Kontorliste"]
                .filter(Boolean)
                .map((tab) => (
                  <button
                    key={tab}
                    onClick={() =>
                      setActiveTab(
                        tab as
                          | "Leverandører"
                          | "Legg til kontor"
                          | "Kontorliste"
                      )
                    }
                    className={`px-2 md:px-4 py-2 text-sm font-medium ${
                      activeTab === tab
                        ? "border-b-2 border-purple text-purple"
                        : "text-gray-500"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
            </div>
          </div>
        )}
        {activeTab === "Leverandører" && (
          <>
            <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
              Legg til leverandør
            </h1>
            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 lg:gap-8">
              <div className="w-max">
                <h5 className="text-black text-sm font-medium">
                  Partnerdetaljer
                </h5>
                <p className="text-gray text-sm whitespace-nowrap">
                  Legg til bilder og persondetaljer
                </p>
              </div>
              <div className="w-full shadow-shadow2 rounded-lg overflow-hidden relative">
                <AddSuppliersForm />
              </div>
            </div>
          </>
        )}
        {activeTab === "Legg til kontor" && (
          <>
            <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
              Legg til kontor
            </h1>
            <div>
              <div className="w-full shadow-shadow2 rounded-lg overflow-hidden relative">
                <CreateNewOffice
                  editId={editId}
                  setEditId={setEditId}
                  setActiveTab={setActiveTab}
                />
              </div>
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-10 py-5 border-t border-gray1">
                  <h1 className="text-darkBlack font-medium text-lg md:text-xl desktop:text-2xl">
                    Liste over alle bruker
                  </h1>
                  <Button
                    text="Legg til ny bruker"
                    className="border border-purple bg-purple text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                    icon={<Plus className="text-white w-5 h-5" />}
                    onClick={() => setIsUserPopup(true)}
                  />
                </div>
                {editId && (
                  <OfficesUserTable
                    editId={editId}
                    isRefetch={isRefetch}
                    setIsRefetch={setIsRefetch}
                    setIsUserPopup={setIsUserPopup}
                  />
                )}
              </div>
            </div>
          </>
        )}
        {activeTab === "Kontorliste" && (
          <>
            <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
              Kontorliste
            </h1>
            <div>
              <OfficesTable setEditId={setEditId} setActiveTab={setActiveTab} />
            </div>
          </>
        )}
      </div>

      {isUserPopup && (
        <Modal
          onClose={() => {
            if (!isDropdownOpen) {
              setIsUserPopup(false);
            }
          }}
          isOpen={true}
        >
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-[90vw] md:w-[80vw] lg:w-[70vw] overflow-hidden max-h-[90vh] overflow-y-auto relative">
              <X
                className="text-primary absolute top-3 right-3 w-6 h-6 cursor-pointer"
                onClick={() => setIsUserPopup(false)}
              />
              <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px] p-4 laptop:p-6 pb-0 laptop:pb-0">
                Legg til bruker
              </h1>
              <AddUserPerOffice
                editId={editId}
                setIsUserPopup={setIsUserPopup}
                setDropdownOpen={setIsDropdownOpen}
                setIsRefetch={setIsRefetch}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
