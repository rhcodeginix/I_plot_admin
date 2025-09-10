import React, { useEffect, useRef, useState } from "react";
import Ic_close from "../../../assets/images/Ic_close.svg";
import { doc, getDoc } from "firebase/firestore";
import Ic_download_primary from "../../../assets/images/Ic_download.svg";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { ChevronLeft, ChevronRight, File } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { db } from "../../../config/firebaseConfig";
import Modal from "../../common/modal";
import FileInfo from "../../FileInfo";

export function formatCurrency(value: number | string) {
  const number =
    typeof value === "string"
      ? Number(value.replace(/\s/g, "").replace(/kr/i, ""))
      : value;

  if (isNaN(Number(number))) return value;

  const formatted = new Intl.NumberFormat("no-NO", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 0,
  }).format(number);

  return `kr ${formatted}`;
}

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

const Illustrasjoner: React.FC<{ id: any }> = ({ id }) => {
  const [finalData, setFinalData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const textareaRef = useRef<any>(null);
  const husmodellData = finalData?.Husdetaljer;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [husmodellData?.OmHusmodellen]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const husmodellDocRef = doc(db, "house_model", String(id));
        const husmodellDocSnap = await getDoc(husmodellDocRef);

        if (husmodellDocSnap.exists()) {
          setFinalData(husmodellDocSnap.data());
        } else {
          console.error("No document found for plot or husmodell ID.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMode, setPopupMode] = useState<"single" | "gallery">("single");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = finalData?.Husdetaljer?.photo3D || [];

  const displayedImages = images.slice(0, 6);
  const extraImagesCount = images.length - 6;

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setPopupMode("single");
    setIsPopupOpen(true);
  };

  const handleGalleryClick = () => {
    setPopupMode("gallery");
    setIsPopupOpen(true);
  };

  const popup = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popup.current && !popup.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [zoom, setZoom] = useState(1);
  const [baseScale, setBaseScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!isPopupOpen || selectedImage === null) return;

    const container = containerRef.current;
    const img = imgRef.current;

    if (container && img) {
      const cRect = container.getBoundingClientRect();
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      if (imgW && imgH) {
        const cover = Math.max(cRect.width / imgW, cRect.height / imgH);
        setBaseScale(cover);
        setZoom(cover);
        setTranslateX(0);
        setTranslateY(0);
      }
    }
  }, [isPopupOpen, selectedImage]);

  const clampPosition = (x: number, y: number) => {
    if (!containerRef.current || !imgRef.current) return { x, y };

    const container = containerRef.current.getBoundingClientRect();
    const imgW = imgRef.current.naturalWidth * zoom;
    const imgH = imgRef.current.naturalHeight * zoom;

    const maxX = Math.max(0, (imgW - container.width) / 2);
    const maxY = Math.max(0, (imgH - container.height) / 2);

    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  };

  const handleZoomIn = () => setZoom((z) => z + 0.25);
  const handleZoomOut = () =>
    setZoom((z) => {
      const newZoom = Math.max(baseScale, z - 0.25);
      if (newZoom === baseScale) {
        setTranslateX(0);
        setTranslateY(0);
      }
      return newZoom;
    });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > baseScale) {
      setIsDragging(true);
      setStartX(e.clientX - translateX);
      setStartY(e.clientY - translateY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - startX;
    const newY = e.clientY - startY;
    const { x, y } = clampPosition(newX, newY);
    setTranslateX(x);
    setTranslateY(y);
  };

  const handleMouseUp = () => setIsDragging(false);
  return (
    <div className="relative">
      <>
        <div className="border border-[#DCDFEA] rounded-lg overflow-hidden">
          {loading ? (
            <div className="grid gap-3 md:gap-6 grid-cols-3 p-2 md:p-5">
              <div
                className="w-full h-[100px] rounded-lg custom-shimmer"
                style={{ borderRadius: "8px" }}
              ></div>
              <div
                className="w-full h-[100px] rounded-lg custom-shimmer"
                style={{ borderRadius: "8px" }}
              ></div>
              <div
                className="w-full h-[100px] rounded-lg custom-shimmer"
                style={{ borderRadius: "8px" }}
              ></div>
              <div
                className="w-full h-[100px] rounded-lg custom-shimmer"
                style={{ borderRadius: "8px" }}
              ></div>
            </div>
          ) : (
            <div
              className={`overflow-hidden max-h-0 p-2 md:p-5`}
              style={{
                maxHeight: "max-content",
                transition: "max-height 0.2s ease-out",
              }}
            >
              <div
                className={`gap-2 md:gap-4 lg:gap-6 flex flex-col desktop:flex-row ${
                  displayedImages.length < 4 ? "md:h-[400px]" : "md:h-[500px]"
                }`}
              >
                <div
                  className={`w-full h-full ${
                    husmodellData?.documents &&
                    husmodellData?.documents.length > 0
                      ? "desktop:w-2/3"
                      : "desktop:w-full"
                  } grid gap-3 md:gap-6 grid-cols-3
      ${displayedImages.length < 4 ? "grid-rows-1" : "grid-rows-2"}
    `}
                >
                  {displayedImages.map((image: any, index: number) => (
                    <div
                      key={index}
                      className="relative overflow-hidden h-full cursor-pointer"
                      onClick={() => {
                        if (index === 5 && extraImagesCount > 0) {
                          handleGalleryClick();
                        } else {
                          handleImageClick(image);
                        }
                      }}
                    >
                      <img
                        src={image}
                        alt="product"
                        className="w-full h-full object-cover rounded-lg"
                      />

                      {index === 5 && extraImagesCount > 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-35 flex items-center justify-center text-white text-base font-bold cursor-pointer rounded-lg">
                          +{extraImagesCount}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {husmodellData?.documents &&
                  husmodellData?.documents.length > 0 && (
                    <div className="w-full desktop:w-1/3 border border-gray2 shadow-shadow2 rounded-lg h-full">
                      <div className="px-3 md:px-4 py-3 md:py-5 border-b border-gray2 text-darkBlack text-sm md:text-base font-semibold">
                        Dokumenter
                      </div>
                      <div className="p-3 md:p-4 flex flex-col gap-2.5 md:gap-4 overflow-y-auto desktop:h-[calc(100%-65px)] overFlowAutoY">
                        {husmodellData?.documents.map(
                          (doc: any, index: number) => {
                            return (
                              <div
                                className="border border-gray2 rounded-lg p-2 md:p-3 bg-[#F9FAFB] flex items-center justify-between"
                                key={index}
                              >
                                <div className="flex items-start gap-2 md:gap-3 truncate">
                                  <div className="border-[4px] border-lightPurple rounded-full flex items-center justify-center">
                                    <div className="bg-darkPurple w-6 md:w-7 h-6 md:h-7 rounded-full flex justify-center items-center">
                                      <File className="text-primary w-4 h-4" />
                                    </div>
                                  </div>
                                  <FileInfo file={doc} />
                                </div>
                                <img
                                  src={Ic_download_primary}
                                  alt="download"
                                  className="cursor-pointer w-5 h-5 md:w-6 md:h-6"
                                  onClick={() => handleDownload(doc)}
                                />
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </>

      {isPopupOpen && (
        <Modal isOpen={true} onClose={() => setIsPopupOpen(false)}>
          <div
            className="bg-white p-2 md:p-6 rounded-lg w-full relative"
            ref={popup}
          >
            <button
              className="absolute top-2 md:top-3 right-0 md:right-3"
              onClick={() => setIsPopupOpen(false)}
            >
              <img src={Ic_close} alt="close" />
            </button>

            {popupMode === "single" && selectedImage && (
              // <div className="flex justify-center items-center w-full my-4 relative">
              //   <button
              //     className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full"
              //     onClick={() => {
              //       const previousIndex =
              //         (images.indexOf(selectedImage) - 1 + images.length) %
              //         images.length;
              //       setSelectedImage(images[previousIndex]);
              //     }}
              //   >
              //     &lt;
              //   </button>

              //   <div className="my-2">
              //     <img
              //       src={selectedImage}
              //       alt="Selected"
              //       className="h-auto w-full object-fill max-h-[80vh]"
              //     />
              //   </div>

              //   <button
              //     className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full"
              //     onClick={() => {
              //       const nextIndex =
              //         (images.indexOf(selectedImage) + 1) % images.length;
              //       setSelectedImage(images[nextIndex]);
              //     }}
              //   >
              //     &gt;
              //   </button>
              // </div>
              <div className="flex flex-col justify-center sm:w-full relative mt-5">
                <button
                  className="absolute z-50 left-0 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 md:p-3 rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const previousIndex =
                      (husmodellData?.photo3D.indexOf(selectedImage) -
                        1 +
                        husmodellData?.photo3D.length) %
                      husmodellData?.photo3D.length;
                    setSelectedImage(husmodellData?.photo3D[previousIndex]);
                  }}
                >
                  <ChevronLeft className="text-white" />
                </button>

                <div>
                  <div
                    ref={containerRef}
                    className="relative overflow-hidden h-[70vh] w-[90vw] lg:w-[70vw] border border-gray2 rounded-lg touch-none flex items-center justify-center"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={(e) => {
                      e.preventDefault();
                      if (e.deltaY < 0) {
                        setZoom((prev) => Math.min(prev + 0.2, 5));
                      } else {
                        setZoom((prev) => Math.max(prev - 0.2, 1));
                      }
                    }}
                  >
                    <img
                      ref={imgRef}
                      src={selectedImage}
                      alt={selectedImage}
                      draggable={false}
                      className="select-none"
                      style={{
                        cursor:
                          zoom > baseScale
                            ? isDragging
                              ? "grabbing"
                              : "grab"
                            : "default",
                        transform: `translate(${translateX}px, ${translateY}px) scale(${zoom})`,
                        transformOrigin: "center center",
                        transition: isDragging ? "none" : "transform 0.2s ease",
                        maxWidth: "none",
                        maxHeight: "none",
                      }}
                    />

                    <div className="flex gap-4 absolute bottom-3 right-3">
                      <button
                        onClick={handleZoomOut}
                        className="px-3 py-1 bg-darkGreen text-white rounded"
                      >
                        -
                      </button>
                      <button
                        onClick={handleZoomIn}
                        className="px-3 py-1 bg-darkGreen text-white rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  className="absolute z-50 right-0 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 md:p-3 rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const nextIndex =
                      (husmodellData?.photo3D.indexOf(selectedImage) + 1) %
                      husmodellData?.photo3D.length;
                    setSelectedImage(husmodellData?.photo3D[nextIndex]);
                  }}
                >
                  <ChevronRight className="text-white" />
                </button>
                <div className="flex gap-2 mt-4 overflow-x-auto w-full justify-center">
                  {husmodellData?.photo3D?.map((img: string, i: number) => (
                    <div key={i} className="shrink-0">
                      <img
                        src={img}
                        alt={`thumb-${i}`}
                        className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                          img === selectedImage
                            ? "border-primary"
                            : "border-gray2"
                        }`}
                        onClick={() => {
                          setSelectedImage(img);
                          setZoom(1);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {popupMode === "gallery" && (
              <div className="my-4 galleryImage max-w-[300px] sm:max-w-[500px] md:max-w-[700px] lg:max-w-4xl">
                <Swiper
                  spaceBetween={10}
                  slidesPerView={3}
                  breakpoints={{
                    280: {
                      slidesPerView: 1,
                    },
                    640: {
                      slidesPerView: 1,
                    },
                    768: {
                      slidesPerView: 2,
                    },
                    1024: {
                      slidesPerView: 3,
                    },
                  }}
                  navigation={images.length > 1}
                  modules={[Navigation, Pagination]}
                  className="custom-swiper w-full h-[200px] relative"
                  pagination={
                    images.length > 1
                      ? {
                          el: ".swiper-pagination",
                          clickable: true,
                        }
                      : false
                  }
                >
                  {images.map((image: any, index: number) => (
                    <SwiperSlide key={index}>
                      <img
                        src={image}
                        alt="product"
                        className="w-full h-full object-cover"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Illustrasjoner;
