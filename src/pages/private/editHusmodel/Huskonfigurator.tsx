import React, { useEffect, useState } from "react";
import { Eksterior } from "./Eksterior";
import Modal from "../../../components/common/modal";
import { AddNewCat } from "./AddNewCat";
import Ic_trash from "../../../assets/images/Ic_trash.svg";
import Button from "../../../components/common/button";
import { useLocation } from "react-router-dom";
import { fetchHusmodellData } from "../../../lib/utils";
import { Pencil } from "lucide-react";

export const Huskonfigurator: React.FC<{ setActiveTab: any }> = ({
  setActiveTab,
}) => {
  const [activeTabData, setActiveTabData] = useState(0);
  const [AddCategory, setAddCategory] = useState(false);
  const [Category, setCategory] = useState<any>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editCategory, setEditCategory] = useState<null | {
    index: number;
    data: any;
  }>(null);

  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;

  useEffect(() => {
    if (!id) {
      return;
    }
    const getData = async () => {
      const data = await fetchHusmodellData(id);
      if (data && data.Huskonfigurator) {
        setCategory(data.Huskonfigurator.hovedkategorinavn);
      }
    };

    getData();
  }, [id]);

  const handleToggleSubCategoryPopup = () => {
    if (AddCategory) {
      setAddCategory(false);
      setEditCategory(null);
    } else {
      setAddCategory(true);
    }
  };
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedCategories = [...Category];
    const draggedItem = updatedCategories[draggedIndex];

    updatedCategories.splice(draggedIndex, 1);

    updatedCategories.splice(index, 0, draggedItem);

    setCategory(updatedCategories);
    setDraggedIndex(null);
  };

  return (
    <>
      <h3 className="text-darkBlack text-lg md:text-xl desktop:text-2xl font-semibold mb-8 px-6">
        Her konfigurerer du husmodellen
      </h3>
      <div className="flex gap-6 px-6 relative">
        <div className="w-[20%] flex flex-col bg-[#F9FAFB] p-3 pb-0 rounded-lg gap-3 h-full max-h-[690px] overflow-y-auto overFlowAutoY sticky top-[80px]">
          {Category.map((tab: any, index: number) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              className={`bg-white cursor-pointer rounded-lg flex items-center justify-between gap-2 px-5 ${
                activeTabData === index
                  ? "border-2 border-primary bg-lightPurple rounded-t-[12px]"
                  : "border border-gray2"
              }`}
              onClick={() => setActiveTabData(index)}
            >
              <div className="text-sm text-darkBlack py-3 flex items-center gap-2 font-semibold">
                <span className="w-5 h-5 rounded-full bg-lightPurple flex items-center justify-center text-darkBlack font-semibold text-xs">
                  {index + 1}
                </span>
                {tab.navn}
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditCategory({ index, data: tab });
                    setAddCategory(true);
                  }}
                >
                  <Pencil className="w-5 h-5 text-primary" />
                </div>

                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCategory((prev: any[]) =>
                      prev.filter((_, i) => i !== index)
                    );
                    setActiveTabData(0);
                  }}
                  className="w-5 h-5"
                >
                  <img src={Ic_trash} alt="delete" className="w-full h-full" />
                </div>
              </div>
            </div>
          ))}
          <div
            className="sticky bottom-0 mb-3 bg-purple border-gray2 rounded-lg p-3 flex items-center gap-2 text-white font-semibold text-sm cursor-pointer"
            onClick={() => setAddCategory(true)}
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-darkBlack text-xs font-semibold bg-white">
              +
            </div>
            Legg til nytt rom/kategori
          </div>
        </div>

        {Category.length > 0 ? (
          <div className="w-[80%] mb-[130px]">
            <Eksterior
              setActiveTab={setActiveTab}
              labelName={Category[activeTabData]?.navn || ""}
              Category={Category}
              activeTabData={activeTabData}
              setCategory={setCategory}
            />
          </div>
        ) : (
          <div className="w-full">
            <div
              className="text-purple font-semibold text-base cursor-pointer flex justify-end w-full"
              onClick={() => setActiveTab(2)}
            >
              Hopp over steget
            </div>
            <div className="flex justify-end w-full gap-5 items-center fixed bottom-0 bg-white z-50 border-t border-gray2 p-4 left-0">
              <div
                onClick={() => {
                  setActiveTab(0);
                }}
                
              >
                <Button
                  text="Avbryt"
                  className="border border-lightPurple bg-lightPurple text-purple text-sm rounded-[8px] h-[40px] font-medium relative px-10 py-2 flex items-center gap-2"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {AddCategory && (
        <Modal onClose={handleToggleSubCategoryPopup} isOpen={true}>
          <div className="bg-white relative rounded-[12px] p-6 md:m-0 w-full sm:w-[518px]">
            <h4 className="mb-[20px] text-darkBlack font-medium text-xl">
              Legg til ny underkategori
            </h4>
            <AddNewCat
              onClose={handleToggleSubCategoryPopup}
              setCategory={setCategory}
              editData={editCategory}
            />
          </div>
        </Modal>
      )}
    </>
  );
};
