import Ic_download_primary from "../../../assets/images/Ic_download_primary.svg";
import Ic_close from "../../../assets/images/Ic_close.svg";
import { ChevronLeft, ChevronRight, File } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { formatCurrency } from "../../../lib/utils";
import Modal from "../../../components/common/modal";
import FileInfo from "../../../components/FileInfo";
import { getDownloadURL, getStorage, ref } from "firebase/storage";

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
export const Husdetaljer: React.FC<{ husmodellData: any; loading: any }> = ({
  husmodellData,
  loading,
}) => {
  const getEmbedUrl = (url: string) => {
    const videoId = url.split("v=")[1]?.split("&")[0];
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=0&disablekb=1&fs=0`
      : "";
  };

  const [isOpen, setIsOpen] = useState(false);

  const images = husmodellData?.photo3D || [];
  const displayedImages = images.slice(0, 6);
  const extraImagesCount = images.length - 6;

  const handlePopup = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const popup = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popup.current && !popup.current.contains(event.target as Node)) {
        setIsOpen(false);
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
    if (!isOpen || selectedImage === null) return;

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
  }, [isOpen, selectedImage]);

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
    <>
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:h-[333px] mb-6 md:mb-9 desktop:mb-[74px]">
        {loading ? (
          <div
            className="w-full md:w-2/3 h-full rounded-md custom-shimmer"
            style={{ borderRadius: "8px" }}
          ></div>
        ) : (
          <div className="w-full md:w-2/3 h-full">
            <h4 className="mb-2 md:mb-4 text-darkBlack text-sm md:text-base desktop:text-lg font-semibold">
              Illustrasjoner
            </h4>
            <div className="h-[calc(100%-40px)]">
              <div className="grid grid-cols-3 gap-2 md:gap-6 h-full">
                {displayedImages.map((image: any, index: number) => (
                  <div
                    key={index}
                    className="relative overflow-hidden h-[100px] md:h-[130px] lg:h-full w-full"
                  >
                    <img
                      src={image}
                      alt="product"
                      className="w-full h-full object-cover rounded-lg"
                      onClick={() => {
                        setSelectedImage(image);
                        setIsOpen(true);
                      }}
                    />

                    {index === 5 && extraImagesCount > 0 && (
                      <div
                        className="absolute inset-0 bg-black bg-opacity-35 flex items-center justify-center text-white text-base font-bold cursor-pointer rounded-lg"
                        onClick={() => {
                          setIsOpen(true);
                          setSelectedImage(null);
                        }}
                      >
                        +{extraImagesCount}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {loading ? (
          <div
            className="w-full md:w-1/3 h-full rounded-md custom-shimmer"
            style={{ borderRadius: "8px" }}
          ></div>
        ) : (
          <div className="w-full md:w-1/3 border border-gray2 shadow-shadow2 rounded-lg h-full">
            <div className="px-3 md:px-4 py-3 md:py-5 border-b border-gray2 text-darkBlack text-sm md:text-base font-semibold">
              Dokumenter
            </div>
            <div className="p-3 md:p-4 flex flex-col gap-4 overflow-y-auto h-[calc(100%-65px)] overFlowAutoY">
              {husmodellData?.documents &&
              husmodellData?.documents.length > 0 ? (
                husmodellData?.documents.map((doc: any, index: number) => {
                  return (
                    <div
                      className="border border-gray2 rounded-lg p-3 bg-[#F9FAFB] flex items-center justify-between"
                      key={index}
                    >
                      <div className="flex items-start gap-3 truncate">
                        <div className="border-[4px] border-lightGreen rounded-full flex items-center justify-center">
                          <div className="bg-lightGreen w-7 h-7 rounded-full flex justify-center items-center">
                            <File className="text-primary w-4 h-4" />
                          </div>
                        </div>
                        <FileInfo file={doc} />
                      </div>
                      <img
                        src={Ic_download_primary}
                        alt="download"
                        className="cursor-pointer"
                        onClick={() => handleDownload(doc)}
                      />
                    </div>
                  );
                })
              ) : (
                <>
                  <p>Ingen dokument funnet.</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="w-full flex flex-col md:flex-row gap-6 lg:gap-[60px] mt-8">
        <div className="w-full md:w-[43%]">
          {loading ? (
            <div
              className="w-[300px] h-[30px] rounded-md custom-shimmer mb-6"
              style={{ borderRadius: "8px" }}
            ></div>
          ) : (
            <h4 className="text-darkBlack mb-4 md:mb-6 font-semibold text-lg md:text-xl desktop:text-2xl">
              {husmodellData?.husmodell_name}
            </h4>
          )}
          <div className="relative">
            {loading ? (
              <div
                className="w-full h-[262px] rounded-md custom-shimme"
                style={{ borderRadius: "8px" }}
              ></div>
            ) : (
              <img
                src={husmodellData?.photo}
                alt="product-1"
                className="w-full h-[262px] object-cover rounded-[12px] overflow-hidden"
              />
            )}
          </div>
          <div className="my-4 md:my-5 flex items-center justify-between gap-1">
            <div className="flex flex-col gap-2">
              <p className="text-gray text-sm md:text-base">Pris fra</p>
              {loading ? (
                <div
                  className="w-[300px] h-[30px] rounded-md custom-shimmer"
                  style={{ borderRadius: "8px" }}
                ></div>
              ) : (
                <h4 className="text-base md:text-lg desktop:text-xl font-semibold text-darkBlack">
                  {husmodellData?.pris && formatCurrency(husmodellData?.pris)}
                </h4>
              )}
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {loading ? (
                <div
                  className="w-[300px] h-[30px] rounded-md custom-shimmer"
                  style={{ borderRadius: "8px" }}
                ></div>
              ) : (
                <div className="text-gray text-xs md:text-sm">
                  <span className="text-darkBlack font-semibold">
                    {husmodellData?.BRATotal}
                  </span>{" "}
                  m<sup>2</sup>
                </div>
              )}
              <div className="h-[12px] w-[1px] border-l border-gray"></div>
              {loading ? (
                <div
                  className="w-[300px] h-[30px] rounded-md custom-shimmer"
                  style={{ borderRadius: "8px" }}
                ></div>
              ) : (
                <div className="text-gray text-xs md:text-sm">
                  <span className="text-darkBlack font-semibold">
                    {husmodellData?.Soverom}
                  </span>{" "}
                  soverom
                </div>
              )}
              <div className="h-[12px] w-[1px] border-l border-gray"></div>
              {loading ? (
                <div
                  className="w-[300px] h-[30px] rounded-md custom-shimmer"
                  style={{ borderRadius: "8px" }}
                ></div>
              ) : (
                <div className="text-gray text-xs md:text-sm">
                  <span className="text-darkBlack font-semibold">
                    {husmodellData?.Bad}
                  </span>{" "}
                  bad
                </div>
              )}
            </div>
          </div>
          <div className="w-full flex flex-col sm:flex-row gap-4 md:flex-col lg:flex-row lg:gap-8 mb-8 md:mb-[60px]">
            <div className="w-full lg:w-1/2 border-t-2 border-b-0 border-l-0 border-r-0 border-primary pt-3 md:pt-4">
              <table className="table-auto border-0 w-full text-left property_detail_tbl">
                <tbody>
                  <tr>
                    <td className="text-left pb-3 md:pb-4 text-gray text-sm whitespace-nowrap">
                      BRA total (bruksareal)
                    </td>
                    {loading ? (
                      <div
                        className="w-[300px] h-[30px] rounded-md custom-shimmer"
                        style={{ borderRadius: "8px" }}
                      ></div>
                    ) : (
                      <td className="text-left pb-3 md:pb-4 text-darkBlack text-sm font-semibold whitespace-nowrap">
                        {husmodellData?.BRATotal} m<sup>2</sup>
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className="text-left pb-3 md:pb-4 text-gray text-sm whitespace-nowrap">
                      BRA bolig
                    </td>
                    {loading ? (
                      <div
                        className="w-[300px] h-[30px] rounded-md custom-shimmer"
                        style={{ borderRadius: "8px" }}
                      ></div>
                    ) : (
                      <td className="text-left pb-3 md:pb-4 text-darkBlack text-sm font-semibold whitespace-nowrap">
                        {husmodellData?.BebygdAreal} m<sup>2</sup>
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className="text-left pb-3 md:pb-4 text-gray text-sm whitespace-nowrap">
                      GUA (Gulvareal):
                    </td>
                    {loading ? (
                      <div
                        className="w-[300px] h-[30px] rounded-md custom-shimmer"
                        style={{ borderRadius: "8px" }}
                      ></div>
                    ) : (
                      <td className="text-left pb-3 md:pb-4 text-darkBlack text-sm font-semibold whitespace-nowrap">
                        {husmodellData?.PRom} m<sup>2</sup>
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className="text-left pb-3 md:pb-4 text-gray text-sm whitespace-nowrap">
                      Bebygd areal (BYA)
                    </td>
                    {loading ? (
                      <div
                        className="w-[300px] h-[30px] rounded-md custom-shimmer"
                        style={{ borderRadius: "8px" }}
                      ></div>
                    ) : (
                      <td className="text-left pb-3 md:pb-4 text-darkBlack text-sm font-semibold whitespace-nowrap">
                        {husmodellData?.BebygdAreal} m<sup>2</sup>
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className="text-left pb-3 md:pb-4 text-gray text-sm whitespace-nowrap">
                      Lengde
                    </td>
                    {loading ? (
                      <div
                        className="w-[300px] h-[30px] rounded-md custom-shimmer"
                        style={{ borderRadius: "8px" }}
                      ></div>
                    ) : (
                      <td className="text-left pb-3 md:pb-4 text-darkBlack text-sm font-semibold whitespace-nowrap">
                        {husmodellData?.Lengde}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className="text-left pb-3 md:pb-4 text-gray text-sm whitespace-nowrap">
                      Bredde
                    </td>
                    {loading ? (
                      <div
                        className="w-[300px] h-[30px] rounded-md custom-shimmer"
                        style={{ borderRadius: "8px" }}
                      ></div>
                    ) : (
                      <td className="text-left pb-3 md:pb-4 text-darkBlack text-sm font-semibold whitespace-nowrap">
                        {husmodellData?.Bredde}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className="text-left pb-3 md:pb-4 text-gray text-sm whitespace-nowrap">
                      Soverom
                    </td>
                    {loading ? (
                      <div
                        className="w-[300px] h-[30px] rounded-md custom-shimmer"
                        style={{ borderRadius: "8px" }}
                      ></div>
                    ) : (
                      <td className="text-left pb-3 md:pb-4 text-darkBlack text-sm font-semibold whitespace-nowrap">
                        {husmodellData?.Soverom}
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="w-full lg:w-1/2 border-t-2 border-b-0 border-l-0 border-r-0 border-primary pt-3 md:pt-4">
              <table className="table-auto border-0 w-full text-left property_detail_tbl">
                <tbody>
                  <tr>
                    <td className="text-left pb-3 md:pb-4 text-gray text-sm whitespace-nowrap">
                      Bad
                    </td>
                    {loading ? (
                      <div
                        className="w-[300px] h-[30px] rounded-md custom-shimmer"
                        style={{ borderRadius: "8px" }}
                      ></div>
                    ) : (
                      <td className="text-left pb-3 md:pb-4 text-darkBlack text-sm font-semibold whitespace-nowrap">
                        {husmodellData?.Bad}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className="text-left pb-3 md:pb-4 text-gray text-sm whitespace-nowrap">
                      Innvendig bod
                    </td>
                    {loading ? (
                      <div
                        className="w-[300px] h-[30px] rounded-md custom-shimmer"
                        style={{ borderRadius: "8px" }}
                      ></div>
                    ) : (
                      <td className="text-left pb-3 md:pb-4 text-darkBlack text-sm font-semibold whitespace-nowrap">
                        {husmodellData?.InnvendigBod}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className="text-left pb-3 md:pb-4 text-gray text-sm whitespace-nowrap">
                      Energimerking
                    </td>
                    {loading ? (
                      <div
                        className="w-[300px] h-[30px] rounded-md custom-shimmer"
                        style={{ borderRadius: "8px" }}
                      ></div>
                    ) : (
                      <td className="text-left pb-3 md:pb-4 text-darkBlack text-sm font-semibold whitespace-nowrap">
                        {husmodellData?.Energimerking}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className="text-left pb-3 md:pb-4 text-gray text-sm whitespace-nowrap">
                      Tilgjengelig bolig
                    </td>
                    {loading ? (
                      <div
                        className="w-[300px] h-[30px] rounded-md custom-shimmer"
                        style={{ borderRadius: "8px" }}
                      ></div>
                    ) : (
                      <td className="text-left pb-3 md:pb-4 text-darkBlack text-sm font-semibold whitespace-nowrap">
                        {husmodellData?.TilgjengeligBolig}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className="text-left pb-3 md:pb-4 text-gray text-sm whitespace-nowrap">
                      Tomtetype
                    </td>
                    {loading ? (
                      <div
                        className="w-[300px] h-[30px] rounded-md custom-shimmer"
                        style={{ borderRadius: "8px" }}
                      ></div>
                    ) : (
                      <td className="text-left pb-3 md:pb-4 text-darkBlack text-sm font-semibold whitespace-nowrap">
                        {Array.isArray(husmodellData?.Tomtetype)
                          ? husmodellData.Tomtetype.join(", ")
                          : husmodellData?.Tomtetype}
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <h2 className="mb-6 text-darkBlack text-lg md:text-xl desktop:text-2xl font-semibold">
            Plantegninger og fasader
          </h2>
          {loading ? (
            <div
              className="w-full h-[300px] rounded-md custom-shimmer"
              style={{ borderRadius: "8px" }}
            ></div>
          ) : (
            <img
              src={husmodellData?.PlantegningerFasader[0]}
              alt="map"
              className="w-full"
            />
          )}
        </div>
        <div className="w-full md:w-[57%]">
          {loading ? (
            <div
              className="w-[300px] h-[30px] rounded-md custom-shimmer mb-4"
              style={{ borderRadius: "8px" }}
            ></div>
          ) : (
            <h2 className="text-darkBlack text-lg md:text-xl desktop:text-2xl font-semibold mb-2 md:mb-4 truncate">
              {husmodellData?.Hustittel}
            </h2>
          )}
          <div className="flex flex-col gap-4 mb-8 md:mb-[60px]">
            {loading ? (
              <div
                className="w-full h-[100px] rounded-md custom-shimmer"
                style={{ borderRadius: "8px" }}
              ></div>
            ) : (
              <p className="text-sm md:text-base text-gray h-full focus-within:outline-none resize-none">
                {husmodellData?.OmHusmodellen}
              </p>
            )}
          </div>
          {loading ? (
            <div
              className="w-[300px] h-[30px] rounded-md custom-shimmer mb-4"
              style={{ borderRadius: "8px" }}
            ></div>
          ) : (
            <h2 className="text-darkBlack text-lg md:text-xl desktop:text-2xl font-semibold mb-4">
              {husmodellData?.TittelVideo}
            </h2>
          )}

          {husmodellData?.VideoLink && (
            <div
              style={{
                width: "100%",
                height: "400px",
              }}
            >
              {loading ? (
                <div
                  className="w-full h-[30px] rounded-md custom-shimmer"
                  style={{ borderRadius: "8px" }}
                ></div>
              ) : (
                <iframe
                  width="100%"
                  height="100%"
                  src={getEmbedUrl(husmodellData?.VideoLink)}
                  frameBorder="0"
                  allowFullScreen
                  title={husmodellData?.TittelVideo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                ></iframe>
              )}
            </div>
          )}
        </div>
      </div>

      {isOpen && !selectedImage && (
        <Modal isOpen={true} onClose={handlePopup}>
          <div
            className="bg-white p-6 rounded-lg max-w-4xl w-full relative h-[90vh] overflow-y-auto"
            ref={popup}
          >
            <button
              className="absolute top-3 right-3"
              onClick={() => setIsOpen(false)}
            >
              <img src={Ic_close} alt="close" />
            </button>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-4">
              {images.map((image: any, index: number) => (
                <img
                  key={index}
                  src={image}
                  alt="product"
                  className="w-full h-[150px] md:h-[200px] cursor-pointer"
                  onClick={() => {
                    setSelectedImage(image);
                    setIsOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        </Modal>
      )}

      {isOpen && selectedImage && (
        <Modal isOpen={true} onClose={handlePopup}>
          <div
            className="bg-white p-3 md:p-6 rounded-lg w-full relative"
            ref={popup}
          >
            <button
              className="absolute top-2 md:top-3 right-0 md:right-3"
              onClick={() => setIsOpen(false)}
            >
              <img src={Ic_close} alt="close" />
            </button>

            {selectedImage && (
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
          </div>
        </Modal>
      )}
    </>
  );
};
