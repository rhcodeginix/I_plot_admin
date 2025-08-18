import React, { useEffect, useState } from "react";
import Button from "../../../components/common/button";
import { useLocation } from "react-router-dom";
import { fetchBankLeadData } from "../../../lib/utils";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import toast from "react-hot-toast";
import Ic_file from "../../../assets/images/Ic_file.svg";
import Ic_download_primary from "../../../assets/images/Ic_download_primary.svg";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import Ic_trash from "../../../assets/images/Ic_trash.svg";
import FileInfo from "../../../components/FileInfo";
import Modal from "../../../components/common/modal";

export const Documenters: React.FC<{
  getData: any;
}> = ({ getData }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  const [Entreprenørgaranti, setEntreprenørgaranti] = useState([]);
  const [Forsikringsbevis, setForsikringsbevis] = useState([]);
  const [Kontrakt, setKontrakt] = useState([]);

  useEffect(() => {
    if (!id) {
      return;
    }

    const getData = async () => {
      const data = await fetchBankLeadData(id);

      if (data && data.Documenter) {
        setEntreprenørgaranti(data?.Documenter?.Entreprenørgaranti);
        setForsikringsbevis(data?.Documenter?.Forsikringsbevis);
        setKontrakt(data?.Documenter?.Kontrakt);
      }
    };

    getData();
  }, [id]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deleteField, setDeleteField] = useState<string | null>(null);

  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index);
    setShowConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setDeleteField(null);
    setDeleteIndex(null);
  };

  const handleConfirmPopup = () => {
    if (showConfirm) {
      setShowConfirm(false);
      setDeleteField(null);
    } else {
      setShowConfirm(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteIndex !== null && deleteField && id) {
      try {
        let finalField;
        let setterFunction;

        if (deleteField === "Entreprenørgaranti") {
          finalField = Entreprenørgaranti;
          setterFunction = setEntreprenørgaranti;
        } else if (deleteField === "Forsikringsbevis") {
          finalField = Forsikringsbevis;
          setterFunction = setForsikringsbevis;
        } else if (deleteField === "Kontrakt") {
          finalField = Kontrakt;
          setterFunction = setKontrakt;
        }

        if (finalField && Array.isArray(finalField) && finalField.length > 0) {
          const updatedFiles = finalField.filter(
            (_: any, i: number) => i !== deleteIndex
          );

          const docRef = doc(db, "bank_leads", id);
          await updateDoc(docRef, {
            [`Documenter.${deleteField}`]: updatedFiles,
          });

          if (setterFunction) {
            setterFunction(updatedFiles);
          }

          toast.success("Deleted successfully", {
            position: "top-right",
          });
          getData();
        }
      } catch (error) {
        console.error("Error deleting file:", error);
        toast.error("Failed to delete file. Please try again.");
      }
    }

    setShowConfirm(false);
    setDeleteIndex(null);
    setDeleteField(null);
  };

  const handleDownload = async (filePath: string) => {
    try {
      if (!filePath) {
        console.error("File path is missing!");
        return;
      }

      const storage = getStorage();
      const fileRef = ref(storage, filePath);
      const url = await getDownloadURL(fileRef);

      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = filePath.split("/").pop() || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <>
      <div className="mx-4 md:mx-6 lg:mx-10 mb-28">
        <div className="flex flex-col gap-4 md:gap-5">
          <div className="rounded-lg border-[#DCDFEA] border">
            <h4 className="text-darkBlack text-base md:text-lg lg:text-xl font-semibold p-3 md:p-5 border-b border-[#DCDFEA]">
              Entreprenørgaranti
            </h4>
            <div className="p-3 md:p-5">
              {Entreprenørgaranti && Entreprenørgaranti.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
                  {Entreprenørgaranti?.map((file: any, index: number) => (
                    <div
                      className="border border-gray2 rounded-lg p-2 md:p-3 bg-[#F9FAFB] flex items-center justify-between relative w-full"
                      key={index}
                    >
                      <div className="flex items-start gap-2.5 md:gap-4 truncate w-[calc(100%-60px)] md:w-[calc(100%-65px)]">
                        <div className="border-[4px] border-lightGreen rounded-full flex items-center justify-center">
                          <div className="bg-lightGreen w-7 h-7 rounded-full flex justify-center items-center">
                            <img src={Ic_file} alt="file" />
                          </div>
                        </div>
                        <FileInfo file={file} />
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 w-[52px] sm:w-[56px] md:w-auto">
                        <img
                          src={Ic_trash}
                          alt="delete"
                          className="cursor-pointer w-5 h-5 md:w-6 md:h-6"
                          onClick={() => {
                            handleDeleteClick(index);
                            setDeleteField("Entreprenørgaranti");
                          }}
                        />
                        <img
                          src={Ic_download_primary}
                          alt="download"
                          className="cursor-pointer w-5 h-5 md:w-6 md:h-6"
                          onClick={() => handleDownload(file)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray">No Entreprenørgaranti found!</p>
              )}
            </div>
          </div>
          <div className="rounded-lg border-[#DCDFEA] border">
            <h4 className="text-darkBlack text-base md:text-lg lg:text-xl font-semibold p-3 md:p-5 border-b border-[#DCDFEA]">
              Forsikringsbevis
            </h4>
            <div className="p-3 md:p-5">
              {Forsikringsbevis && Forsikringsbevis.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
                  {Forsikringsbevis?.map((file: any, index: number) => (
                    <div
                      className="border border-gray2 rounded-lg p-2 md:p-3 bg-[#F9FAFB] flex items-center justify-between relative w-full"
                      key={index}
                    >
                      <div className="flex items-start gap-2.5 md:gap-4 truncate">
                        <div className="border-[4px] border-lightGreen rounded-full flex items-center justify-center">
                          <div className="bg-lightGreen w-7 h-7 rounded-full flex justify-center items-center">
                            <img src={Ic_file} alt="file" />
                          </div>
                        </div>
                        <FileInfo file={file} />
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                        <img
                          src={Ic_trash}
                          alt="delete"
                          className="cursor-pointer w-5 h-5 md:w-6 md:h-6"
                          onClick={() => {
                            handleDeleteClick(index);
                            setDeleteField("Forsikringsbevis");
                          }}
                        />
                        <img
                          src={Ic_download_primary}
                          alt="download"
                          className="cursor-pointer w-5 h-5 md:w-6 md:h-6"
                          onClick={() => handleDownload(file)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray">No Forsikringsbevis found!</p>
              )}
            </div>
          </div>
          <div className="rounded-lg border-[#DCDFEA] border">
            <h4 className="text-darkBlack text-base md:text-lg lg:text-xl font-semibold p-3 md:p-5 border-b border-[#DCDFEA]">
              Kontrakt <span className="text-[#5D6B98]">(eks. NS-3425)</span>
            </h4>
            <div className="p-3 md:p-5">
              {Kontrakt && Kontrakt.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
                  {Kontrakt?.map((file: any, index: number) => (
                    <div
                      className="border border-gray2 rounded-lg p-2 md:p-3 bg-[#F9FAFB] flex items-center justify-between relative w-full"
                      key={index}
                    >
                      <div className="flex items-start gap-2.5 md:gap-4 truncate">
                        <div className="border-[4px] border-lightGreen rounded-full flex items-center justify-center">
                          <div className="bg-lightGreen w-7 h-7 rounded-full flex justify-center items-center">
                            <img src={Ic_file} alt="file" />
                          </div>
                        </div>
                        <FileInfo file={file} />
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                        <img
                          src={Ic_trash}
                          alt="delete"
                          onClick={() => {
                            handleDeleteClick(index);
                            setDeleteField("Kontrakt");
                          }}
                          className="cursor-pointer w-5 h-5 md:w-6 md:h-6"
                        />
                        <img
                          src={Ic_download_primary}
                          alt="download"
                          className="cursor-pointer w-5 h-5 md:w-6 md:h-6"
                          onClick={() => handleDownload(file)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray">No Kontrakt found!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <Modal onClose={handleConfirmPopup} isOpen={true}>
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg">
              <p className="mb-4">Er du sikker på at du vil slette?</p>
              <div className="flex justify-center gap-4">
                <div onClick={handleCancelDelete}>
                  <Button
                    text="Avbryt"
                    className="border border-gray2 text-black text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                  />
                </div>
                <Button
                  text="Bekrefte"
                  className="border border-primary bg-primary text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                  onClick={handleConfirmDelete}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
