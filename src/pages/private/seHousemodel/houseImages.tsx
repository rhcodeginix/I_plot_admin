import Ic_close from "../../../assets/images/Ic_close.svg";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Modal from "../../../components/common/modal";

export const HouseImages: React.FC<{ husmodellData: any }> = ({
  husmodellData,
}) => {
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
