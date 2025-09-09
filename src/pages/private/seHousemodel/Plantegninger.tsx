import React, { useEffect, useRef, useState } from "react";
import Ic_close from "../../../assets/images/Ic_close.svg";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "../../../components/common/modal";

const Plantegninger: React.FC<{ husmodellData: any; loading: any }> = ({
  loading,
  husmodellData,
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="relative">
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {loading ? (
          <>
            <div
              className="w-full h-[100px] rounded-lg custom-shimmer mb-2"
              style={{ borderRadius: "8px" }}
            ></div>
            <div
              className="w-full h-[100px] rounded-lg custom-shimmer mb-2"
              style={{ borderRadius: "8px" }}
            ></div>
            <div
              className="w-full h-[100px] rounded-lg custom-shimmer mb-2"
              style={{ borderRadius: "8px" }}
            ></div>
          </>
        ) : (
          <>
            {husmodellData?.PlantegningerFasader &&
              husmodellData?.PlantegningerFasader?.map(
                (item: string, index: number) => {
                  return (
                    <img
                      src={item}
                      alt="map"
                      className="w-full cursor-pointer"
                      key={index}
                      onClick={() => {
                        setSelectedImage(item);
                        setIsOpen(true);
                      }}
                    />
                  );
                }
              )}
          </>
        )}
      </div>

      {isOpen && selectedImage && (
        <Modal isOpen={true} onClose={() => setIsOpen(false)}>
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
                  className="absolute z-50 left-0 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 md:p-3 rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const previousIndex =
                      (husmodellData?.PlantegningerFasader.indexOf(
                        selectedImage
                      ) -
                        1 +
                        husmodellData?.PlantegningerFasader.length) %
                      husmodellData?.PlantegningerFasader.length;
                    setSelectedImage(
                      husmodellData?.PlantegningerFasader[previousIndex]
                    );
                  }}
                >
                  <ChevronLeft className="text-white" />
                </button>
                <button
                  className="absolute z-50 right-0 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 md:p-3 rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const nextIndex =
                      (husmodellData?.PlantegningerFasader.indexOf(
                        selectedImage
                      ) +
                        1) %
                      husmodellData?.PlantegningerFasader.length;
                    setSelectedImage(
                      husmodellData?.PlantegningerFasader[nextIndex]
                    );
                  }}
                >
                  <ChevronRight className="text-white" />
                </button>
                <div className="flex gap-2 mt-4 overflow-x-auto w-full justify-center">
                  {husmodellData?.PlantegningerFasader?.map(
                    (img: string, i: number) => (
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
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Plantegninger;
