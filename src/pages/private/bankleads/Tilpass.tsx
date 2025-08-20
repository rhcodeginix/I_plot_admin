import React, { useEffect, useRef, useState } from "react";
import Ic_info_circle from "../../../assets/images/Ic_info_circle.svg";
import Ic_close_darkgreen from "../../../assets/images/Ic_close.svg";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import Button from "../../../components/common/button";
import { formatCurrency } from "../../../lib/utils";

const Tilpass: React.FC<{
  data: any;
}> = ({ data }) => {
  const husmodell = data?.finalData?.husmodell;

  const Huskonfigurator = husmodell?.Huskonfigurator?.hovedkategorinavn || [];
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  useEffect(() => {
    setTimeout(() => {
      document.querySelector(".swiper-pagination")?.classList.add("active");
    }, 100);
  }, []);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDrawerProduct, setSelectedDrawerProduct] = useState<any>(null);
  const [custHouse, setCustHouse] = useState<any>(null);

  useEffect(() => {
    setCustHouse(JSON.parse(data?.stored));
  }, [data]);

  const openDrawer = (product: any) => {
    setSelectedDrawerProduct(product);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedDrawerProduct(null);
  };
  const textareaRef = useRef<any>(null);
  useEffect(() => {
    setSelectedCategory(0);
  }, [selectedTab]);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [selectedDrawerProduct]);

  const [selectedProducts, setSelectedProducts] = useState<any>({});

  useEffect(() => {
    if (Huskonfigurator?.length > 0) {
      const defaultSelectedProducts: any = {};

      Huskonfigurator.forEach((selectedTab: any, index: number) => {
        if (selectedTab.isSelected && selectedTab.Kategorinavn?.length > 0) {
          selectedTab.Kategorinavn.forEach(
            (categoryItem: any, categoryIndex: number) => {
              if (
                categoryItem?.isSelected === true &&
                categoryItem.produkter?.length > 0
              ) {
                const product = categoryItem.produkter[0];
                const key = `${index}-${categoryIndex}`;

                defaultSelectedProducts[key] = {
                  category: index,
                  subCategory: categoryIndex,
                  product,
                  index: 0,
                };
              }
            }
          );
        }
      });

      setSelectedProducts(defaultSelectedProducts);
    }
  }, [Huskonfigurator]);

  useEffect(() => {
    if (data?.stored) {
      try {
        const parsed = JSON.parse(data?.stored);

        if (Array.isArray(parsed)) {
          const mappedProducts: any = {};
          parsed.forEach((item) => {
            const key = `${item.category}-${item.subCategory}`;
            mappedProducts[key] = item;
          });

          setSelectedProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Failed to parse stored", error);
      }
    }
  }, [data?.stored]);

  const totalCustPris = custHouse
    ? custHouse?.reduce(
        (sum: any, item: any) =>
          sum + Number(item?.product?.pris.replace(/\s/g, "")),
        0
      )
    : 0;

  const husPris = Number(husmodell?.Husdetaljer?.pris?.replace(/\s/g, "")) || 0;

  const totalPrice = totalCustPris + husPris;

  return (
    <>
      <div className="px-4 md:px-6 py-5 md:py-8">
        <h3 className="text-darkBlack text-lg md:text-xl desktop:text-2xl font-semibold mb-[22px]">
          Her gjør du dine tilpasninger:
        </h3>
        {Huskonfigurator?.length > 0 ? (
          <div className="flex flex-col md:flex-row gap-6 relative">
            <div className="md:hidden flex gap-2 overflow-x-auto">
              {Huskonfigurator.map((item: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 cursor-pointer border-2 font-medium rounded-lg flex items-center gap-1 my-1 flex-none ${
                    selectedTab === index
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                  onClick={() => setSelectedTab(index)}
                  style={{
                    boxShadow:
                      "0px 1px 2px 0px #1018280F, 0px 1px 3px 0px #1018281A",
                  }}
                >
                  <div className="w-4 md:w-6 h-4 md:h-6">
                    <div
                      className={`w-4 md:w-6 h-4 md:h-6 rounded-full flex items-center justify-center text-xs ${
                        selectedTab === index
                          ? "bg-green text-white"
                          : "bg-lightGreen2 text-darkBlack"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>
                  <div className="text-black text-xs md:text-sm font-medium">
                    {item?.navn}
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full hidden md:w-[27%] md:flex flex-col gap-3 max-h-[calc(100vh-200px)] sticky top-[88px] overflow-y-auto overFlowYAuto">
              {Huskonfigurator.map((item: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 lg:p-4 cursor-pointer border-2 font-medium rounded-lg flex items-start gap-2 ${
                    selectedTab === index
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                  onClick={() => setSelectedTab(index)}
                  style={{
                    boxShadow:
                      "0px 1px 2px 0px #1018280F, 0px 1px 3px 0px #1018281A",
                  }}
                >
                  <div className="w-6 h-6">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mt-1 ${
                        selectedTab === index
                          ? "bg-green text-white"
                          : "bg-lightGreen2 text-darkBlack"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>
                  <div>
                    <span className="text-black text-sm font-medium mb-2">
                      {item?.navn}
                    </span>
                    <p className="text-gray text-xs md:text-sm">
                      {item?.Beskrivelse}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full md:w-[73%] border h-max border-[#DCDFEA] rounded-lg overflow-hidden">
              <div className="flex items-center justify-between gap-1.5 md:gap-3 p-3 md:p-5 border-b border-[#DCDFEA]">
                <h3 className="text-darkBlack text-base md:text-lg desktop:text-xl font-semibold one_line_elipse">
                  {Huskonfigurator[selectedTab]?.navn}
                </h3>
                {selectedTab < Huskonfigurator.length - 1 && (
                  <Button
                    text="Hopp over steget"
                    className={`border-2 border-primary text-primary text-xs sm:text-sm md:text-sm rounded-[40px] w-max h-[36px] md:h-[36px] lg:h-[36px] font-semibold relative`}
                    onClick={() => {
                      setSelectedTab(selectedTab + 1);
                    }}
                  />
                )}
              </div>
              {Huskonfigurator[selectedTab]?.Kategorinavn?.length > 0 ? (
                <>
                  <div className="bg-[#F9F9FB] border-[#EFF1F5] border rounded-lg m-3 md:m-6 p-[6px] flex items-center gap-1 md:gap-2 overflow-x-auto overFlowScrollHidden">
                    {Huskonfigurator[selectedTab]?.Kategorinavn.map(
                      (catItem: any, catIndex: number) => {
                        return (
                          <div
                            key={catIndex}
                            className={`py-2 px-3 text-xs md:text-sm rounded-lg cursor-pointer whitespace-nowrap ${
                              selectedCategory === catIndex
                                ? "bg-white text-primary font-medium shadow-shadow4"
                                : "bg-transparent text-black"
                            }`}
                            onClick={() => setSelectedCategory(catIndex)}
                          >
                            {catItem?.navn}
                          </div>
                        );
                      }
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 big:grid-cols-4 gap-3 md:gap-4 desktop:gap-6 p-3 md:p-5 desktop:p-6 pt-0">
                    {Huskonfigurator[selectedTab]?.Kategorinavn[
                      selectedCategory
                    ]?.produkter?.length > 0 &&
                      Huskonfigurator[selectedTab]?.Kategorinavn[
                        selectedCategory
                      ]?.produkter.map((product: any, index: number) => {
                        const key = `${selectedTab}-${selectedCategory}`;

                        const isSelected =
                          selectedProducts[key]?.product?.Produktnavn ===
                            product.Produktnavn &&
                          selectedProducts[key]?.product?.pris ===
                            product.pris &&
                          selectedProducts[key]?.product?.IncludingOffer ===
                            product.IncludingOffer &&
                          selectedProducts[key]?.product?.Produktbeskrivelse ===
                            product.Produktbeskrivelse;

                        return (
                          <div
                            key={index}
                            className="bg-gray3 rounded-lg p-3 flex flex-col justify-between cursor-pointer"
                            onClick={(e: any) => {
                              if (
                                !e.target.closest(".swiper-button-next") &&
                                !e.target.closest(".swiper-button-prev")
                              ) {
                                openDrawer(product);
                              }
                            }}
                          >
                            <div>
                              <div className="w-full h-[158px] mb-3 relative">
                                {product?.Hovedbilde?.length > 0 && (
                                  <Swiper
                                    navigation={
                                      product?.Hovedbilde?.length > 1
                                        ? true
                                        : false
                                    }
                                    modules={[Navigation, Pagination]}
                                    className="custom-swiper w-full h-[158px] relative"
                                    pagination={
                                      product?.Hovedbilde?.length > 1
                                        ? {
                                            el: ".swiper-pagination",
                                            clickable: false,
                                          }
                                        : false
                                    }
                                    style={{ zIndex: 99 }}
                                  >
                                    {product?.Hovedbilde.map(
                                      (img: string, index: number) => (
                                        <SwiperSlide
                                          key={index}
                                          className="w-full h-[158px]"
                                        >
                                          <img
                                            src={img}
                                            alt="info"
                                            className="h-full w-full object-cover rounded-lg"
                                          />
                                        </SwiperSlide>
                                      )
                                    )}
                                  </Swiper>
                                )}
                                <div
                                  className="w-[28px] h-[28px] rounded-full flex items-center justify-center cursor-pointer absolute top-2 right-2 bg-white"
                                  style={{ zIndex: 9999 }}
                                  onClick={() => openDrawer(product)}
                                >
                                  <img src={Ic_info_circle} alt="icon" />
                                </div>
                              </div>
                              <h3 className="text-darkBlack font-medium text-sm md:text-base lg:text-lg truncate">
                                {product?.Produktnavn}
                              </h3>
                              <p className="text-darkBlack text-xs md:text-sm two_line_elipse mb-1.5 md:mb-3">
                                {product?.Produktbeskrivelse}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 justify-between">
                              <div>
                                <span className="text-gray text-xs mb-1">
                                  Pris fra:
                                </span>
                                <h5 className="text-black font-medium text-sm md:text-base">
                                  {product?.IncludingOffer === true
                                    ? "Standard"
                                    : product?.pris === 0
                                    ? "Kostnadsfritt"
                                    : formatCurrency(product?.pris)}
                                </h5>
                              </div>
                              <Button
                                text={isSelected ? "Valgt" : "Velg"}
                                className={`border-2 text-primary ${
                                  isSelected
                                    ? "border-green bg-lightGreen2"
                                    : "border-[#B9C0D4]"
                                } text-xs sm:text-sm md:text-sm rounded-[40px] w-max h-[36px] md:h-[36px] lg:h-[36px] font-semibold relative`}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </>
              ) : (
                <div className="text-gray">Ingen kategorier tilgjengelig</div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center py-3 text-lg">
            Du har ikke noe alternativ.
          </p>
        )}
      </div>
      <div
        className="px-4 md:px-6 sticky bottom-0 bg-white py-4"
        style={{
          boxShadow:
            "0px -4px 6px -2px #10182808, 0px -12px 16px -4px #10182814",
          zIndex: 9999,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex gap-6 w-max">
            <div>
              <p className="text-gray text-xs md:text-sm mb-1">Dine tillegg</p>
              <h4 className="text-darkBlack font-semibold text-base md:text-lg lg:text-xl">
                {totalCustPris ? formatCurrency(totalCustPris) : "kr 0"}
              </h4>
            </div>
            <div>
              <p className="text-gray text-xs md:text-sm mb-1">
                Din pris med tilvalg
              </p>
              <h4 className="text-darkBlack font-semibold text-base md:text-lg lg:text-xl">
                {formatCurrency(totalPrice)}
              </h4>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-40 visible" : "opacity-0 invisible"
        }`}
        style={{ zIndex: 999999 }}
        onClick={closeDrawer}
      ></div>
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-[80%] lg:w-1/2 bg-white shadow-lg transition-transform duration-700 transform z-[999999] ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedDrawerProduct && (
          <div>
            <div className="py-4 px-4 md:px-8 flex items-center justify-between gap-6 border-b border-[#DCDFEA]">
              <h2 className="text-base md:text-lg desktop:text-xl font-semibold text-darkBlack">
                {selectedDrawerProduct?.Produktnavn}
              </h2>
              <button onClick={closeDrawer}>
                <img src={Ic_close_darkgreen} alt="close" />
              </button>
            </div>
            <div className="py-4 px-4 md:px-8">
              <div className="grid grid-cols-2 gap-4 mb-4 md:mb-6">
                {selectedDrawerProduct?.Hovedbilde?.map(
                  (img: any, index: number) => (
                    <img
                      src={img}
                      alt="product"
                      className="h-[181px] w-full object-cover"
                      key={index}
                    />
                  )
                )}
              </div>
              <textarea
                value={selectedDrawerProduct?.Produktbeskrivelse}
                className="text-base text-gray h-full focus-within:outline-none resize-none w-full"
                ref={textareaRef}
                readOnly
              ></textarea>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Tilpass;
