import Img_line_bg from "../../../assets/images/Img_line_bg.png";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { useLocation } from "react-router-dom";
import Ic_check_green_icon from "../../../assets/images/Ic_check_green_icon.svg";
import Ic_Step_icon from "../../../assets/images/Ic_Step_icon.svg";
import { useEffect, useRef, useState } from "react";
import Ic_x_close from "../../../assets/images/Ic_x_close.svg";
import Ic_chevron_up from "../../../assets/images/Ic_chevron_up.svg";
import Ic_check from "../../../assets/images/Ic_check.svg";
import Ic_generelt from "../../../assets/images/Ic_generelt.svg";
import Ic_check_true from "../../../assets/images/Ic_check_true.svg";
import { formatDateToDDMMYYYY } from "../../../lib/utils";
// import NorkartMap from "../../../components/map";
import Eierinformasjon from "../plot/Eierinformasjon";
import GoogleMapNearByComponent from "../../../components/ui/map/nearbyBuiildingMap";
import HouseDetailPage from "../../../components/ui/houseDetail";
import { Building2, House } from "lucide-react";
import Tilpass from "./Tilpass";
import Ic_file from "../../../assets/images/Ic_file.svg";
import Ic_download_primary from "../../../assets/images/Ic_download_primary.svg";
import Ic_info_circle from "../../../assets/images/Ic_info_circle.svg";
import GoogleMapComponent from "../../../components/ui/map";
import Modal from "../../../components/common/modal";

export const BankleadsDetails = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  const [loading, setLoading] = useState(false);
  // const [imgLoading, setImgLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [askData, setAskData] = useState<any | null>(null);
  const HouseModelData = data?.finalData?.husmodell;
  const plotData = data?.finalData?.plot;

  useEffect(() => {
    if (id) {
      setLoading(true);

      const fetchProperty = async () => {
        try {
          const plotDocRef = doc(db, "leads", id);
          const docSnap = await getDoc(plotDocRef);

          if (docSnap.exists()) {
            setData(docSnap.data());
          }
        } catch (error) {
          setLoading(false);
          console.error("Error fetching plot data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchProperty();
    }
  }, [id]);

  const lamdaDataFromApi = plotData?.lamdaDataFromApi;
  const CadastreDataFromApi = plotData?.CadastreDataFromApi;
  useEffect(() => {
    if (plotData?.additionalData?.answer) {
      try {
        const cleanAnswer = plotData?.additionalData?.answer;

        setAskData(cleanAnswer);
      } catch (error) {
        console.error("Error parsing additionalData.answer:", error);
        setAskData(null);
      }
    }
  }, [plotData?.additionalData]);
  const tabs: any = [
    { id: "Regulering", label: "Regulering" },
    ...(lamdaDataFromApi?.latestOwnership
      ? [{ id: "Eierinformasjon", label: "Eierinformasjon" }]
      : []),
    { id: "Bygninger", label: "Bygninger" },
    { id: "Plandokumenter", label: "Plandokumenter" },
    { id: "Dokumenter", label: "Dokumenter" },
    { id: "Planleggingsdokumenter", label: "Planleggingsdokumenter" },
    { id: "Dispensasjoner", label: "Dispensasjoner" },
    { id: "Kommuneplaner", label: "Kommuneplaner" },
  ];
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id);

  const BBOXData =
    CadastreDataFromApi?.cadastreApi?.response?.item?.geojson?.bbox;

  const isValidBBOX = Array.isArray(BBOXData) && BBOXData.length === 4;
  // const scrollContainerRef: any = useRef(null);

  // const scrollByAmount = 90;

  // const handleScrollUp = () => {
  //   if (scrollContainerRef.current) {
  //     scrollContainerRef.current.scrollBy({
  //       left: -scrollByAmount,
  //       behavior: "smooth",
  //     });
  //   }
  // };

  // const handleScrollDown = () => {
  //   if (scrollContainerRef.current) {
  //     scrollContainerRef.current.scrollBy({
  //       left: scrollByAmount,
  //       behavior: "smooth",
  //     });
  //   }
  // };
  const adjustedBBOX: any = isValidBBOX && [
    BBOXData[0] - 30,
    BBOXData[1] - 30,
    BBOXData[2] + 30,
    BBOXData[3] + 30,
  ];
  const [featureInfo, setFeatureInfo] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatureInfo = async () => {
      const url = `https://wms.geonorge.no/skwms1/wms.reguleringsplaner?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&QUERY_LAYERS=Planomrade_02,Arealformal_02&LAYERS=Planomrade_02,Arealformal_02&INFO_FORMAT=text/html&CRS=EPSG:25833&BBOX=${BBOXData[0]},${BBOXData[1]},${BBOXData[2]},${BBOXData[3]}&WIDTH=800&HEIGHT=600&I=400&J=300`;

      try {
        const response = await fetch(url);
        const data = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/html");
        const images = doc.querySelectorAll("img");
        images.forEach((img) => img.remove());
        const cleanedHTML = doc.body.innerHTML;
        setFeatureInfo(cleanedHTML);
      } catch (error) {
        console.error("Error fetching feature info:", error);
        setFeatureInfo("<p>Error loading data</p>");
      }
    };
    if (isValidBBOX) {
      fetchFeatureInfo();
    }
  }, [isValidBBOX, BBOXData]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const images: any = isValidBBOX
    ? [
        {
          id: 1,
          src: `https://wms.geonorge.no/skwms1/wms.reguleringsplaner?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=Planomrade_02,Arealformal_02,Grenser_og_juridiske_linjer_02&STYLES=default,default,default&CRS=EPSG:25833&BBOX=${adjustedBBOX[0]},${adjustedBBOX[1]},${adjustedBBOX[2]},${adjustedBBOX[3]}&WIDTH=800&HEIGHT=600&FORMAT=image/png`,
          alt: "Reguleringsplan image",
        },
        {
          id: 2,
          src: `https://wms.geonorge.no/skwms1/wms.matrikkelkart?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=MatrikkelKart&STYLES=default&CRS=EPSG:25833&BBOX=${adjustedBBOX[0]},${adjustedBBOX[1]},${adjustedBBOX[2]},${adjustedBBOX[3]}&WIDTH=1024&HEIGHT=768&FORMAT=image/png`,
          alt: "Matrikkelkart image",
        },
      ]
    : [];

  // const [selectedImage, setSelectedImage] = useState<any>(null);

  // useEffect(() => {
  //   if (!selectedImage && images.length > 0) {
  //     setSelectedImage(images[0]);
  //   }
  // }, [images, selectedImage]);
  // const handleImageClick = (image: any) => {
  //   if (selectedImage?.id === image?.id) {
  //     setImgLoading(false);
  //   } else {
  //     setImgLoading(true);
  //   }
  //   setSelectedImage(image);
  // };

  const [isOpen, setIsOpen] = useState<any>("Eiendomsinformasjon");

  const toggleAccordion = (key: string) => {
    setIsOpen((prev: any) => (prev === key ? "" : key));
  };

  const allTabs: any = [
    ...(plotData && plotData?.CadastreDataFromApi
      ? [
          {
            id: "Eiendomsinformasjon",
            label: "Eiendomsinformasjon",
            icon: <Building2 className="w-4 h-4 lg:w-6 lg:h-6" />,
          },
        ]
      : []),
    ...(HouseModelData
      ? [
          {
            id: `house`,
            label: `${HouseModelData?.Husdetaljer?.husmodell_name}`,
            icon: <House className="w-4 h-4 lg:w-6 lg:h-6" />,
          },
        ]
      : []),
  ];
  const [activeAllTab, setActiveAllTab] = useState<string>(allTabs[0]?.id);
  useEffect(() => {
    setActiveAllTab(allTabs[0]?.id);
  }, [data]);

  const [BoxData, setBoxData] = useState<any>(null);
  const [Documents, setDocuments] = useState<any>(null);
  const [results, setResult] = useState<any>(null);
  const [PlanDocuments, setPlanDocuments] = useState<any>(null);
  const [exemptions, setExemptions] = useState<any>(null);
  const [KommunePlan, setKommunePlan] = useState<any>(null);
  const [documentLoading, setDocumentLoading] = useState(true);
  const [KommuneLoading, setKommuneLoading] = useState(true);
  const [KommuneRule, setKommuneRule] = useState<any>(null);
  const [KommuneRuleLoading, setKommuneRuleLoading] = useState<any>(false);
  const [otherDocumentInput, setOtherDocumentInput] = useState<any>(null);

  useEffect(() => {
    const fetchPlotData = async () => {
      if (!CadastreDataFromApi) return;

      try {
        const response = await fetch(
          "https://d8t0z35n2l.execute-api.eu-north-1.amazonaws.com/prod/bya",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: `https://wms.geonorge.no/skwms1/wms.reguleringsplaner?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&QUERY_LAYERS=Planomrade_02,Arealformal_02&LAYERS=Planomrade_02,Arealformal_02&INFO_FORMAT=text/html&CRS=EPSG:25833&BBOX=${BBOXData[0]},${BBOXData[1]},${BBOXData[2]},${BBOXData[3]}&WIDTH=800&HEIGHT=600&I=400&J=300`,
              plot_size_m2:
                lamdaDataFromApi?.eiendomsInformasjon?.basisInformasjon
                  ?.areal_beregnet ?? 0,
            }),
          }
        );

        const json = await response.json();
        setBoxData(json);

        if (!json?.plan_link) {
          setDocuments({});
          setKommunePlan({});
          setPlanDocuments([]);
          setExemptions([]);
          setResult({});
          setKommuneLoading(false);
          setOtherDocumentInput({});
          return;
        }

        const apis = [
          {
            name: "resolve",
            url: "https://iplotnor-areaplanner.hf.space/resolve",
            body: {
              step1_url: json.plan_link,
              api_token: process.env.REACT_APP_DOCUMENT_TOKEN,
            },
          },
          {
            name: "other-documents",
            url: "https://iplotnor-areaplanner.hf.space/other-documents",
            body: {
              step1_url: json.plan_link,
              api_token: process.env.REACT_APP_DOCUMENT_TOKEN,
            },
          },
        ];

        const apisResults = await Promise.all(apis.map((c) => makeApiCall(c)));

        const resolveResult: any = apisResults.find(
          (r) => r.name === "resolve"
        );
        const otherDocsResult = apisResults.find(
          (r) => r.name === "other-documents"
        );

        if (!resolveResult.success || !otherDocsResult?.success) {
          setDocuments({});
          setKommunePlan({});
          setPlanDocuments([]);
          setExemptions([]);
          setOtherDocumentInput({});
          setResult({});
          setKommuneLoading(false);
          return;
        }
        setDocuments(resolveResult.data);
        setPlanDocuments(otherDocsResult?.data?.planning_treatments ?? []);
        setExemptions(otherDocsResult?.data?.exemptions ?? []);
        setOtherDocumentInput(otherDocsResult?.data?.inputs ?? {});

        const internalPlanId = resolveResult.data?.inputs?.internal_plan_id;
        if (!internalPlanId) {
          return;
        }

        const plansDocRef = doc(db, "mintomt_plans", String(internalPlanId));
        const existingDoc = await getDoc(plansDocRef);

        if (existingDoc.exists()) {
          const data = existingDoc.data();
          setDocuments(data?.resolve ?? {});
          setKommunePlan(data?.kommuneplanens ?? {});
          // setPlanDocuments(data["other-documents"]?.planning_treatments ?? []);
          // setExemptions(data["other-documents"]?.exemptions ?? []);
          // setOtherDocumentInput(data["other-documents"]?.inputs ?? {});
          setResult(data?.extract_json_direct_gpt?.data ?? {});

          setKommuneLoading(false);

          if (data?.kommuneplanens?.rule_book?.link && !data?.kommune_rules) {
            const kommuneRuleRes = await fetch(
              "https://iplotnor-norwaypropertyagent.hf.space/extract_rules",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  url: data.kommuneplanens.rule_book.link,
                }),
              }
            );

            const kommuneRuleJson = await kommuneRuleRes.json();

            await updateDoc(plansDocRef, {
              kommune_rules: kommuneRuleJson,
              updatedAt: new Date().toISOString(),
            });

            setKommuneRule(kommuneRuleJson ?? {});
          } else {
            setKommuneRule(data?.kommune_rules ?? {});
          }

          setKommuneRuleLoading(false);
          return;
        }

        if (
          resolveResult.data?.rule_book &&
          resolveResult.data?.rule_book?.link
        ) {
          const apiCalls = [
            {
              name: "extract_json_direct_gpt",
              url: "https://iplotnor-norwaypropertyagent.hf.space/extract_json_direct_gpt",
              body: {
                pdf_url: resolveResult.data?.rule_book?.link,
                plot_size_m2:
                  lamdaDataFromApi?.eiendomsInformasjon?.basisInformasjon
                    ?.areal_beregnet ?? 0,
              },
            },
            {
              name: "kommuneplanens",
              url: "https://iplotnor-areaplanner.hf.space/kommuneplanens",
              body: {
                coordinates_url: json.plan_link,
                knr: `${lamdaDataFromApi?.searchParameters?.kommunenummer}`,
                gnr: `${lamdaDataFromApi?.searchParameters?.gardsnummer}`,
                bnr: `${lamdaDataFromApi?.searchParameters?.bruksnummer}`,
                api_token: `${process.env.REACT_APP_DOCUMENT_TOKEN}`,
                debug_mode: true,
              },
            },
            // {
            //   name: "other-documents",
            //   url: "https://iplotnor-areaplanner.hf.space/other-documents",
            //   body: {
            //     step1_url: json.plan_link,
            //     api_token: `${process.env.REACT_APP_DOCUMENT_TOKEN}`,
            //   },
            // },
          ];

          const otherResults = await Promise.all(
            apiCalls.map((c) => makeApiCall(c))
          );

          const firebaseData: any = {
            resolve: resolveResult.data,
          };
          otherResults.forEach((r) => {
            if (r.success) firebaseData[r.name] = r.data;
          });

          otherResults.forEach((r) => {
            if (r.success) {
              if (r.name === "extract_json_direct_gpt") {
                setResult(r?.data?.data);
              }
              if (r.name === "kommuneplanens") {
                setKommunePlan(r.data);
                setKommuneLoading(false);
              }
              // if (r.name === "other-documents") {
              //   setPlanDocuments(r.data?.planning_treatments ?? []);
              //   setExemptions(r.data?.exemptions ?? []);
              //   setOtherDocumentInput(r.data?.inputs ?? {});
              // }
            }
          });

          let kommuneRulesArr: any;
          if (firebaseData?.kommuneplanens?.rule_book?.link) {
            const kommuneRule = await fetch(
              "https://iplotnor-norwaypropertyagent.hf.space/extract_rules",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  url: firebaseData.kommuneplanens.rule_book.link,
                }),
              }
            );

            const kommuneRuleJson = await kommuneRule.json();

            kommuneRulesArr = kommuneRuleJson;
            setKommuneRule(kommuneRuleJson ?? {});
            setKommuneRuleLoading(false);
          }

          const kommunePlanId =
            firebaseData?.kommuneplanens?.kommuneplan_info?.id;
          const kommunePlansDocRef = doc(
            db,
            "kommune_plans",
            String(kommunePlanId)
          );
          const existingKommuneDoc = await getDoc(kommunePlansDocRef);

          const uniquekommuneId = String(kommunePlanId);

          if (!existingKommuneDoc.exists()) {
            await setDoc(kommunePlansDocRef, {
              id: uniquekommuneId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              data: firebaseData?.kommuneplanens,
            });
          }

          const uniqueId = String(internalPlanId);

          if (!existingDoc.exists()) {
            await setDoc(plansDocRef, {
              id: uniqueId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              documents: { ...resolveResult.data },
              kommune_rules: kommuneRulesArr,
              ...firebaseData,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching plot data:", error);
      } finally {
      }
    };

    fetchPlotData();
  }, [CadastreDataFromApi]);

  const makeApiCall = async (apiCall: any, timeout = 500000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(apiCall.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiCall.body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `${apiCall.name} request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      switch (apiCall.name) {
        case "extract_json_direct_gpt":
          setResult(data?.data?.data ?? {});
          break;

        case "kommuneplanens":
          setKommunePlan(data ?? {});
          setKommuneLoading(false);
          break;

        // case "other-documents":
        //   setPlanDocuments(data?.planning_treatments ?? []);
        //   setOtherDocumentInput(data?.inputs ?? {});
        //   setExemptions(data?.exemptions ?? []);
        //   break;
      }

      return {
        name: apiCall.name,
        success: true,
        data: data,
        error: null,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        console.error(`${apiCall.name} API timed out after ${timeout}ms`);
      } else {
        console.error(`${apiCall.name} API failed:`, error);
      }

      switch (apiCall.name) {
        case "extract_json_direct_gpt":
          setResult({});
          break;

        case "kommuneplanens":
          setKommunePlan({});
          setKommuneLoading(false);
          break;

        // case "other-documents":
        //   setPlanDocuments([]);
        //   setOtherDocumentInput({});
        //   setExemptions([]);
        //   break;
      }

      return {
        name: apiCall.name,
        success: false,
        data: null,
        error: error.message || error,
      };
    }
  };

  useEffect(() => {
    if (PlanDocuments) {
      setDocumentLoading(false);
    }
  }, [PlanDocuments]);

  const handleDownload = async (filePath: any) => {
    if (!filePath?.link) return;

    try {
      if (!filePath?.link) {
        console.error("File path is missing!");
        return;
      }

      const link = document.createElement("a");
      link.href = filePath.link;
      link.setAttribute(
        "download",
        filePath?.name?.toLowerCase().includes("unknown")
          ? filePath?.link?.split("/").pop()?.split("?")[0] || "download.pdf"
          : filePath?.name || "download.pdf"
      );
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.warn("CORS blocked, opening in new tab instead.");
      window.open(filePath.link, "_blank");
    }
  };

  const handleDownloads = async (filePath: any) => {
    if (!filePath?.id) {
      console.error("File ID is missing!");
      return;
    }
    let finalData: any;
    try {
      const response = await fetch(
        `https://api.arealplaner.no/api/kunder/${otherDocumentInput?.tenant}/dokumenter/${filePath.id}`,
        {
          headers: {
            "x-waapi-token": process.env.REACT_APP_DOCUMENT_TOKEN || "",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch document info");

      const data = await response.json();

      if (!data?.direkteUrl) {
        console.error("Direct URL for file is missing!");
        return;
      }
      finalData = data;

      const fileResponse = await fetch(data.direkteUrl, {
        headers: {
          "x-waapi-token": process.env.REACT_APP_DOCUMENT_TOKEN || "",
        },
      });

      if (!fileResponse.ok) throw new Error("Failed to fetch file");

      const blob = await fileResponse.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        filePath?.name?.toLowerCase().includes("unknown")
          ? data.direkteUrl.split("/").pop()?.split("?")[0] || "download.pdf"
          : filePath?.name || "download.pdf"
      );
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(finalData.direkteUrl, "_blank");
    }
  };

  const DocumentCard = ({
    doc,
    handleDownload,
  }: {
    doc: any;
    handleDownload: (doc: any) => void;
  }) => (
    <div className="border border-gray2 rounded-lg p-2 md:p-3 bg-[#F9FAFB] flex items-center justify-between relative w-full">
      <div className="flex items-center gap-2.5 md:gap-4 truncate w-[calc(100%-60px)] md:w-[calc(100%-65px)]">
        <div className="border-[4px] border-lightGreen rounded-full flex items-center justify-center">
          <div className="bg-lightGreen w-7 h-7 rounded-full flex justify-center items-center">
            <img src={Ic_file} alt="file" />
          </div>
        </div>
        <h5 className="text-darkBlack text-xs md:text-sm font-medium truncate">
          {doc?.name?.toLowerCase().includes("unknown")
            ? doc?.link?.split("/").pop()?.split("?")[0]
            : doc?.name || "Loading..."}
        </h5>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 w-[52px] sm:w-[56px] md:w-auto">
        <img
          src={Ic_download_primary}
          alt="download"
          className="cursor-pointer w-5 h-5 md:w-6 md:h-6"
          onClick={() => {
            if (
              activeTab === "Planleggingsdokumenter" ||
              activeTab === "Dispensasjoner"
            ) {
              handleDownloads(doc);
            } else {
              handleDownload(doc);
            }
          }}
        />
      </div>
    </div>
  );

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleRuleDropdown = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  const dropdownRuleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRuleRef.current &&
        !dropdownRuleRef.current.contains(event.target as Node)
      ) {
        setOpenIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);

  const maxVisible = 4;
  const extraImages = images.length - maxVisible;

  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);

  const handleSingleModal = (index: number) => {
    setSelectedIndex(index);
    setZoom(1);
    setIsSingleModalOpen(true);
  };

  const handleSingleCloseModal = () => {
    setIsSingleModalOpen(false);
    setSelectedIndex(null);
    setZoom(1);
  };

  const [baseScale, setBaseScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!isSingleModalOpen || selectedIndex === null) return;

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
  }, [isSingleModalOpen, selectedIndex]);

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
      {plotData && plotData?.CadastreDataFromApi && (
        <div className="bg-lightGreen py-4 md:py-5 relative px-4 md:px-6">
          <img
            src={Img_line_bg}
            alt="line"
            className="absolute top-0 left-0 w-full h-full"
            style={{ zIndex: 1 }}
          />
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between relative gap-2"
            style={{ zIndex: 9 }}
          >
            <div>
              {loading ? (
                <div
                  className="w-[300px] h-[30px] rounded-md custom-shimmer mb-2"
                  style={{ borderRadius: "8px" }}
                ></div>
              ) : (
                <h2 className="text-black text-2xl md:text-[28px] desktop:text-[32px] font-semibold mb-2">
                  {CadastreDataFromApi?.presentationAddressApi?.response?.item
                    ?.formatted?.line1 || plotData?.getAddress?.adressetekst}
                </h2>
              )}
              {loading ? (
                <div
                  className="w-[300px] h-[30px] rounded-md custom-shimmer"
                  style={{ borderRadius: "8px" }}
                ></div>
              ) : (
                <p className="text-gray text-base md:text-lg desktop:text-xl">
                  {CadastreDataFromApi?.presentationAddressApi?.response?.item
                    ?.formatted?.line2 ||
                    `${plotData?.getAddress?.kommunenummer} ${plotData?.getAddress?.kommunenavn}`}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 md:gap-6">
              <div className="flex items-center gap-4">
                {loading ? (
                  <div
                    className="w-[100px] h-[20px] rounded-md custom-shimmer"
                    style={{ borderRadius: "8px" }}
                  ></div>
                ) : (
                  <div className="text-gray text-sm md:text-base">
                    Gnr:{" "}
                    <span className="text-black font-semibold">
                      {lamdaDataFromApi?.searchParameters?.gardsnummer}
                    </span>
                  </div>
                )}
                {loading ? (
                  <div
                    className="w-[100px] h-[20px] rounded-md custom-shimmer"
                    style={{ borderRadius: "8px" }}
                  ></div>
                ) : (
                  <div className="text-gray text-sm md:text-base">
                    Bnr:{" "}
                    <span className="text-black font-semibold">
                      {lamdaDataFromApi?.searchParameters?.bruksnummer}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {HouseModelData &&
        (!plotData || (plotData && !plotData?.CadastreDataFromApi)) && (
          <div className="py-4 flex flex-col laptop:flex-row laptop:items-center gap-4 laptop:justify-between bg-lightGreen px-4 md:px-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {loading ? (
                <div
                  className="w-full sm:w-[190px] h-[100px] rounded-lg custom-shimmer"
                  style={{ borderRadius: "8px" }}
                ></div>
              ) : (
                <div className="relative">
                  <img
                    src={HouseModelData?.Husdetaljer?.photo}
                    alt="house"
                    className="w-full sm:w-[190px] object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex flex-col items-start">
                {loading ? (
                  <div
                    className="w-full sm:w-[300px] h-[20px] rounded-lg custom-shimmer mb-2"
                    style={{ borderRadius: "8px" }}
                  ></div>
                ) : (
                  <h4 className="text-darkBlack font-medium text-base md:text-xl lg:text-2xl lg:leading-[30px] mb-2 one_line_elipse">
                    <span className="font-bold">
                      {HouseModelData?.Husdetaljer?.husmodell_name}
                    </span>
                  </h4>
                )}
                {loading ? (
                  <div
                    className="w-full sm:w-[300px] h-[20px] rounded-lg custom-shimmer mb-2"
                    style={{ borderRadius: "8px" }}
                  ></div>
                ) : (
                  <div className="hidden md:flex items-center gap-1 sm:gap-2 rounded-[50px] bg-[#cdfcdcca] py-2 px-3 whitespace-normal">
                    <img
                      src={Ic_Step_icon}
                      alt="icon"
                      className="w-4 sm:w-auto"
                    />
                    <div className="text-black text-xs md:text-sm lg:text-base whitespace-normal">
                      <span className="font-bold">
                        {HouseModelData?.Husdetaljer?.husmodell_name ||
                          "Modellen"}
                      </span>{" "}
                      er i samsvar med alle reguleringsbestemmelser.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      {HouseModelData &&
        (!plotData || (plotData && !plotData?.CadastreDataFromApi)) && (
          <div
            className="py-3 md:py-5 px-4 md:px-6"
            style={{
              boxShadow: "0px 1px 2px 0px #1018280F,0px 1px 3px 0px #1018281A",
            }}
          >
            <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap gap-2 md:gap-4 lg:justify-between">
              <div className="w-full sm:w-[31%] lg:w-[20%] flex items-start gap-2 sm:gap-3">
                <img src={Ic_check_green_icon} alt="check" />
                <div className="flex flex-col gap-1">
                  {loading ? (
                    <div
                      className="w-[180px] h-[20px] rounded-lg custom-shimmer"
                      style={{ borderRadius: "8px" }}
                    ></div>
                  ) : (
                    <p className="text-gray text-xs md:text-sm">
                      <span className="font-bold">
                        {HouseModelData?.Husdetaljer?.husmodell_name}
                      </span>{" "}
                      passer for
                    </p>
                  )}
                  {loading ? (
                    <div
                      className="w-[180px] h-[20px] rounded-lg custom-shimmer"
                      style={{ borderRadius: "8px" }}
                    ></div>
                  ) : (
                    <p className="text-black text-sm md:text-base font-medium">
                      {Array.isArray(HouseModelData?.Husdetaljer?.Tomtetype)
                        ? HouseModelData?.Husdetaljer?.Tomtetype.join(", ")
                        : HouseModelData?.Husdetaljer?.Tomtetype}
                    </p>
                  )}
                </div>
              </div>
              <div className="w-full sm:w-[31%] lg:w-[20%] flex items-start gap-2 sm:gap-3">
                <img src={Ic_check_green_icon} alt="check" />
                <div className="flex flex-col gap-1">
                  {loading ? (
                    <div
                      className="w-[180px] h-[20px] rounded-lg custom-shimmer"
                      style={{ borderRadius: "8px" }}
                    ></div>
                  ) : (
                    <p className="text-gray text-xs md:text-sm">
                      <span className="font-bold">
                        {HouseModelData?.Husdetaljer?.husmodell_name}
                      </span>{" "}
                      har
                    </p>
                  )}
                  {loading ? (
                    <div
                      className="w-[180px] h-[20px] rounded-lg custom-shimmer"
                      style={{ borderRadius: "8px" }}
                    ></div>
                  ) : (
                    <p className="text-black text-sm md:text-base font-medium">
                      Mønehøyde på {HouseModelData?.Husdetaljer?.Mønehøyde}{" "}
                      meter
                    </p>
                  )}
                </div>
              </div>
              <div className="w-full sm:w-[31%] lg:w-[20%] flex items-start gap-2 sm:gap-3">
                <img src={Ic_check_green_icon} alt="check" />
                <div className="flex flex-col gap-1">
                  {loading ? (
                    <div
                      className="w-[180px] h-[20px] rounded-lg custom-shimmer"
                      style={{ borderRadius: "8px" }}
                    ></div>
                  ) : (
                    <p className="text-gray text-xs md:text-sm">
                      <span className="font-bold">
                        {HouseModelData?.Husdetaljer?.husmodell_name}
                      </span>{" "}
                      har
                    </p>
                  )}
                  {loading ? (
                    <div
                      className="w-[180px] h-[20px] rounded-lg custom-shimmer"
                      style={{ borderRadius: "8px" }}
                    ></div>
                  ) : (
                    <p className="text-black text-sm md:text-base font-medium">
                      Gesimshøyde på {HouseModelData?.Husdetaljer?.Gesimshøyde}{" "}
                      meter
                    </p>
                  )}
                </div>
              </div>
              <div className="w-full sm:w-[31%] lg:w-[20%] flex items-start gap-2 sm:gap-3">
                <img src={Ic_check_green_icon} alt="check" />
                <div className="flex flex-col gap-1">
                  {loading ? (
                    <div
                      className="w-[180px] h-[20px] rounded-lg custom-shimmer"
                      style={{ borderRadius: "8px" }}
                    ></div>
                  ) : (
                    <p className="text-gray text-xs md:text-sm">
                      <span className="font-bold">
                        {HouseModelData?.Husdetaljer?.husmodell_name}
                      </span>{" "}
                      har en
                    </p>
                  )}
                  {loading ? (
                    <div
                      className="w-[180px] h-[20px] rounded-lg custom-shimmer"
                      style={{ borderRadius: "8px" }}
                    ></div>
                  ) : (
                    <p className="text-black text-sm md:text-base font-medium">
                      Grunnflate på {HouseModelData?.Husdetaljer?.BebygdAreal} m
                      <sup>2</sup>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      {plotData && plotData?.CadastreDataFromApi && (
        <div className="bg-[#125D56] py-5 relative px-4 md:px-6">
          {loading ? (
            <div
              className="w-full h-[30px] rounded-md custom-shimmer mb-2"
              style={{ borderRadius: "8px" }}
            ></div>
          ) : (
            <div className="flex flex-col sm:flex-row flex-wrap md:flex-nowrap gap-4 lg:gap-8 desktop:gap-[70px] justify-between">
              <div className="w-full sm:w-[48%] md:w-1/4 flex items-start gap-3">
                <img src={Ic_check_green_icon} alt="check" />
                <div className="flex flex-col gap-1">
                  <p className="text-white text-xs md:text-sm">Eiendommen er</p>
                  <p className="text-white text-sm md:text-base font-semibold">
                    ferdig regulert til boligformål
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-[48%] md:w-1/4 flex items-start gap-3">
                <img src={Ic_check_green_icon} alt="check" />
                <div className="flex flex-col gap-1">
                  <p className="text-white text-xs md:text-sm">
                    Eiendommen har en
                  </p>
                  <p className="text-white text-sm md:text-base font-semibold">
                    Utnyttelsesgrad på{" "}
                    {BoxData?.bya_percentage
                      ? BoxData?.bya_percentage
                      : results?.BYA?.rules?.[0]?.unit === "%"
                      ? results?.BYA?.rules?.[0]?.value
                      : (
                          (results?.BYA?.rules?.[0]?.value ?? 0) /
                            lamdaDataFromApi?.eiendomsInformasjon
                              ?.basisInformasjon?.areal_beregnet ?? 0 * 100
                        ).toFixed(2)}{" "}
                    %
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-[48%] md:w-1/4 flex items-start gap-3">
                <img src={Ic_check_green_icon} alt="check" />
                <div className="flex flex-col gap-1">
                  <p className="text-white text-xs md:text-sm">
                    Ekisterende BYA
                  </p>
                  <p className="text-white text-sm md:text-base font-semibold">
                    Utnyttelsesgrad på{" "}
                    {(() => {
                      const data =
                        CadastreDataFromApi?.buildingsApi?.response?.items?.map(
                          (item: any) => item?.builtUpArea
                        ) ?? [];

                      if (
                        lamdaDataFromApi?.eiendomsInformasjon?.basisInformasjon
                          ?.areal_beregnet
                      ) {
                        const totalData = data
                          ? data.reduce(
                              (acc: number, currentValue: number) =>
                                acc + currentValue,
                              0
                            )
                          : 0;

                        const result =
                          (totalData /
                            lamdaDataFromApi?.eiendomsInformasjon
                              ?.basisInformasjon?.areal_beregnet) *
                          100;
                        const formattedResult = result.toFixed(2);

                        return `${formattedResult}  %`;
                      } else {
                        return "0";
                      }
                    })()}
                  </p>
                  <p className="text-white text-xs md:text-sm">
                    Tilgjengelig BYA{" "}
                    {(() => {
                      const data =
                        CadastreDataFromApi?.buildingsApi?.response?.items?.map(
                          (item: any) => item?.builtUpArea
                        ) ?? [];

                      if (
                        askData?.bya_calculations?.results?.total_allowed_bya
                      ) {
                        const totalData = data
                          ? data.reduce(
                              (acc: number, currentValue: number) =>
                                acc + currentValue,
                              0
                            )
                          : 0;

                        const result =
                          (totalData /
                            lamdaDataFromApi?.eiendomsInformasjon
                              ?.basisInformasjon?.areal_beregnet) *
                          100;
                        const formattedResult: any = result.toFixed(2);

                        return `${(
                          (BoxData?.bya_percentage
                            ? BoxData?.bya_percentage
                            : results?.BYA?.rules?.[0]?.unit === "%"
                            ? results?.BYA?.rules?.[0]?.value
                            : (
                                (results?.BYA?.rules?.[0]?.value ?? 0) /
                                  lamdaDataFromApi?.eiendomsInformasjon
                                    ?.basisInformasjon?.areal_beregnet ??
                                0 * 100
                              ).toFixed(2)) - formattedResult
                        ).toFixed(2)} %`;
                      } else {
                        return "0";
                      }
                    })()}
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-[48%] md:w-1/4 flex items-start gap-3">
                <img src={Ic_check_green_icon} alt="check" />
                <div className="flex flex-col gap-1">
                  <p className="text-white text-xs md:text-sm">
                    Boligen kan ha en
                  </p>
                  <p className="text-white text-sm md:text-base font-semibold">
                    Grunnflate på{" "}
                    {
                      askData?.bya_calculations?.results
                        ?.available_building_area
                    }{" "}
                    m<sup>2</sup>
                  </p>
                  <p className="text-white text-xs md:text-sm">
                    Tilgjengelig{" "}
                    {BoxData?.bya_area_m2
                      ? BoxData?.bya_area_m2
                      : results?.BYA?.rules?.[0]?.unit === "%"
                      ? (
                          ((lamdaDataFromApi?.eiendomsInformasjon
                            ?.basisInformasjon?.areal_beregnet ?? 0) *
                            (results?.BYA?.rules?.[0]?.value ?? 0)) /
                          100
                        ).toFixed(2)
                      : results?.BYA?.rules?.[0]?.value}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="pt-6 flex flex-col gap-4 md:gap-6">
        <div>
          <div className="px-4 md:px-6 w-full sm:w-max">
            <div className="flex flex-nowrap border border-gray1 rounded-lg bg-gray3 p-[6px] mb-6 md:mb-[38px] overflow-x-auto overFlowScrollHidden">
              {allTabs.map((tab: any) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveAllTab(tab?.id)}
                  className={`min-w-max whitespace-nowrap px-2 lg:px-4 py-2 rounded-lg text-sm lg:text-base transition-colors duration-300 flex items-center gap-2 ${
                    activeAllTab === tab?.id
                      ? "bg-white font-medium text-primary shadow-shadow2"
                      : "text-black"
                  }`}
                >
                  {tab?.icon}
                  {tab?.label}
                </button>
              ))}
            </div>
          </div>
          <div
            className={`px-4 md:px-6 pb-16 ${
              activeAllTab === "Eiendomsinformasjon" ? "block" : "hidden"
            }`}
          >
            <div
              className="p-4 md:p-6 rounded-lg"
              style={{
                boxShadow:
                  "0px 2px 4px -2px #1018280F, 0px 4px 8px -2px #1018281A",
              }}
            >
              <div
                className="flex items-center justify-between gap-2 cursor-pointer"
                onClick={() => toggleAccordion("Eiendomsinformasjon")}
              >
                <h3 className="text-black text-lg md:text-xl desktop:text-2xl font-semibold">
                  Eiendomsinformasjon
                </h3>
                {isOpen === "Eiendomsinformasjon" ? (
                  <img src={Ic_chevron_up} alt="arrow" />
                ) : (
                  <img src={Ic_chevron_up} alt="arrow" className="rotate-180" />
                )}
              </div>
              <div
                className={`mt-6 ${
                  isOpen === "Eiendomsinformasjon" ? "block" : "hidden"
                }`}
              >
                <div className="flex flex-col desktop:flex-row gap-4 md:gap-6 desktop:gap-4 big:gap-6 justify-between">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 desktop:gap-4 big:gap-6">
                    <div className="bg-gray3 rounded-[8px] p-3 md:p-5 flex flex-col gap-3 md:gap-4">
                      <h2 className="text-black text-sm md:text-base desktop:text-lg font-semibold flex items-center gap-2">
                        Tomteopplysninger
                      </h2>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Areal beregnet
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {lamdaDataFromApi?.eiendomsInformasjon
                              ?.basisInformasjon?.areal_beregnet ? (
                              <>
                                {
                                  lamdaDataFromApi?.eiendomsInformasjon
                                    ?.basisInformasjon?.areal_beregnet
                                }{" "}
                                m<sup>2</sup>
                              </>
                            ) : (
                              "-"
                            )}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Etableringsårs dato
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {lamdaDataFromApi?.eiendomsInformasjon
                              ?.basisInformasjon?.etableringsdato
                              ? formatDateToDDMMYYYY(
                                  lamdaDataFromApi?.eiendomsInformasjon
                                    ?.basisInformasjon?.etableringsdato
                                )
                              : "-"}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Sist oppdatert
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {lamdaDataFromApi?.eiendomsInformasjon
                              ?.basisInformasjon?.sist_oppdatert
                              ? formatDateToDDMMYYYY(
                                  lamdaDataFromApi?.eiendomsInformasjon?.basisInformasjon?.sist_oppdatert.split(
                                    "T"
                                  )[0]
                                )
                              : "-"}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Tomtens totale BYA
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {askData?.bya_calculations?.results
                              ?.total_allowed_bya ? (
                              <>
                                {
                                  askData?.bya_calculations?.results
                                    ?.total_allowed_bya
                                }{" "}
                                m<sup>2</sup>
                              </>
                            ) : (
                              "-"
                            )}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Er registrert land
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {CadastreDataFromApi?.cadastreApi?.response?.item
                              .isRegisteredLand === "Ja" ||
                            CadastreDataFromApi?.cadastreApi?.response?.item
                              .isRegisteredLand === true ? (
                              <img src={Ic_check} alt="check" />
                            ) : (
                              <img src={Ic_x_close} alt="check" />
                            )}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Festenummer
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {lamdaDataFromApi?.eiendomsInformasjon
                              ?.basisInformasjon?.festenummer
                              ? lamdaDataFromApi?.eiendomsInformasjon
                                  ?.basisInformasjon?.festenummer
                              : "-"}
                          </h5>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray3 rounded-[8px] p-3 md:p-5 flex flex-col gap-3 md:gap-4">
                      <h2 className="text-black text-sm md:text-base desktop:text-lg font-semibold flex items-center gap-2">
                        Kommunale data
                      </h2>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Kommune
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {
                              CadastreDataFromApi?.presentationAddressApi
                                ?.response?.item?.municipality?.municipalityName
                            }
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Kommunenummer
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {lamdaDataFromApi?.eiendomsInformasjon?.kommune_info
                              ?.kommunenr
                              ? lamdaDataFromApi?.eiendomsInformasjon
                                  ?.kommune_info?.kommunenr
                              : "-"}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Gårdsnummer
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {lamdaDataFromApi?.eiendomsInformasjon?.kommune_info
                              ?.gaardsnummer
                              ? lamdaDataFromApi?.eiendomsInformasjon
                                  ?.kommune_info?.gaardsnummer
                              : "-"}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Bruksnummer
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {lamdaDataFromApi?.eiendomsInformasjon?.kommune_info
                              ?.bruksnummer
                              ? lamdaDataFromApi?.eiendomsInformasjon
                                  ?.kommune_info?.bruksnummer
                              : "-"}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Seksjonsnummer
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {lamdaDataFromApi?.eiendomsInformasjon?.kommune_info
                              ?.seksjonsnr
                              ? lamdaDataFromApi?.eiendomsInformasjon
                                  ?.kommune_info?.seksjonsnr
                              : "-"}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">Fylke</p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {CadastreDataFromApi?.cadastreApi?.response?.item
                              .municipality?.regionName
                              ? CadastreDataFromApi?.cadastreApi?.response?.item
                                  .municipality?.regionName
                              : "-"}
                          </h5>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray3 rounded-[8px] p-3 md:p-5 flex flex-col gap-3 md:gap-4">
                      <h2 className="text-black text-sm md:text-base desktop:text-lg font-semibold flex items-center gap-2">
                        Eiendomsstatus
                      </h2>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Kan selges
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {CadastreDataFromApi?.cadastreApi?.response?.item
                              .canBeSold === true ||
                            CadastreDataFromApi?.cadastreApi?.response?.item
                              .canBeSold === "Ja" ? (
                              <img src={Ic_check} alt="check" />
                            ) : (
                              <img src={Ic_x_close} alt="check" />
                            )}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Kan belånes
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {CadastreDataFromApi?.cadastreApi?.response?.item
                              .canBeMortgaged === true ||
                            CadastreDataFromApi?.cadastreApi?.response?.item
                              .canBeMortgaged === "Ja" ? (
                              <img src={Ic_check} alt="check" />
                            ) : (
                              <img src={Ic_x_close} alt="check" />
                            )}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Har bygning
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {CadastreDataFromApi?.cadastreApi?.response?.item
                              .hasBuilding === true ||
                            CadastreDataFromApi?.cadastreApi?.response?.item
                              .hasBuilding === "Ja" ? (
                              <img src={Ic_check} alt="check" />
                            ) : (
                              <img src={Ic_x_close} alt="check" />
                            )}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Har fritidsbolig
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {CadastreDataFromApi?.cadastreApi?.response?.item
                              .hasHolidayHome === true ||
                            CadastreDataFromApi?.cadastreApi?.response?.item
                              .hasHolidayHome === "Ja" ? (
                              <img src={Ic_check} alt="check" />
                            ) : (
                              <img src={Ic_x_close} alt="check" />
                            )}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Har bolig
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {CadastreDataFromApi?.cadastreApi?.response?.item
                              .hasHousing === true ||
                            CadastreDataFromApi?.cadastreApi?.response?.item
                              .hasHousing === "Ja" ? (
                              <img src={Ic_check} alt="check" />
                            ) : (
                              <img src={Ic_x_close} alt="check" />
                            )}
                          </h5>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray3 rounded-[8px] p-3 md:p-5 flex flex-col gap-3 md:gap-4">
                      <h2 className="text-black text-sm md:text-base desktop:text-lg font-semibold flex items-center gap-2">
                        Parkeringsinformasjon
                      </h2>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Parkering reservert plass
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {askData?.bya_calculations?.results?.parking
                              ?.required_spaces ? (
                              <>
                                {
                                  askData?.bya_calculations?.results?.parking
                                    ?.required_spaces
                                }{" "}
                                stk
                              </>
                            ) : (
                              "-"
                            )}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Parkering område per plass
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {askData?.bya_calculations?.results?.parking
                              ?.area_per_space ? (
                              <>
                                {
                                  askData?.bya_calculations?.results?.parking
                                    ?.area_per_space
                                }{" "}
                                m<sup>2</sup>
                              </>
                            ) : (
                              "-"
                            )}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Totalt parkeringsområde
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {askData?.bya_calculations?.results?.parking
                              ?.total_parking_area ? (
                              <>
                                {
                                  askData?.bya_calculations?.results?.parking
                                    ?.total_parking_area
                                }{" "}
                                m<sup>2</sup>
                              </>
                            ) : (
                              "-"
                            )}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Parkering er usikker
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {askData?.bya_calculations?.results?.parking
                              ?.is_uncertain === true ? (
                              <img src={Ic_check} alt="check" />
                            ) : (
                              <img src={Ic_x_close} alt="check" />
                            )}
                          </h5>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray3 rounded-[8px] p-3 md:p-5 flex flex-col gap-3 md:gap-4">
                      <h2 className="text-black text-sm md:text-base desktop:text-lg font-semibold flex items-center gap-2">
                        Ytterligere eiendomsforhold
                      </h2>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Har forurensning
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {CadastreDataFromApi?.cadastreApi?.response?.item
                              .hasSoilContamination === "Ja" ||
                            CadastreDataFromApi?.cadastreApi?.response?.item
                              .hasSoilContamination === true ? (
                              <img src={Ic_check} alt="check" />
                            ) : (
                              <img src={Ic_x_close} alt="check" />
                            )}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Har aktive festegrunner
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {CadastreDataFromApi?.cadastreApi?.response?.item
                              .hasActiveLeasedLand === "Ja" ||
                            CadastreDataFromApi?.cadastreApi?.response?.item
                              .hasActiveLeasedLand === true ? (
                              <img src={Ic_check} alt="check" />
                            ) : (
                              <img src={Ic_x_close} alt="check" />
                            )}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Inngår i samlet eiendom
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {CadastreDataFromApi?.cadastreApi?.response?.item
                              .includedInTotalRealEstate === "Ja" ||
                            CadastreDataFromApi?.cadastreApi?.response?.item
                              .includedInTotalRealEstate === true ? (
                              <img src={Ic_check} alt="check" />
                            ) : (
                              <img src={Ic_x_close} alt="check" />
                            )}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Kulturminner registrert
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {lamdaDataFromApi?.eiendomsInformasjon?.status
                              ?.kulturminner_registrert === "Ja" ||
                            lamdaDataFromApi?.eiendomsInformasjon?.status
                              ?.kulturminner_registrert === true ? (
                              <img src={Ic_check} alt="check" />
                            ) : (
                              <img src={Ic_x_close} alt="check" />
                            )}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Grunnforurensning
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {lamdaDataFromApi?.eiendomsInformasjon?.status
                              ?.grunnforurensning === "Ja" ||
                            lamdaDataFromApi?.eiendomsInformasjon?.status
                              ?.grunnforurensning === true ? (
                              <img src={Ic_check} alt="check" />
                            ) : (
                              <img src={Ic_x_close} alt="check" />
                            )}
                          </h5>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray3 rounded-[8px] p-3 md:p-5 flex flex-col gap-3 md:gap-4">
                      <h2 className="text-black text-sm md:text-base desktop:text-lg font-semibold flex items-center gap-2">
                        Spesielle registreringer
                      </h2>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Sammenslåtte tomter
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {CadastreDataFromApi?.cadastreApi?.response?.item
                              .numberOfPlots === "Ja" ||
                            CadastreDataFromApi?.cadastreApi?.response?.item
                              .numberOfPlots === true ? (
                              <img src={Ic_check} alt="check" />
                            ) : (
                              <img src={Ic_x_close} alt="check" />
                            )}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Tinglyst
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {lamdaDataFromApi?.eiendomsInformasjon
                              ?.basisInformasjon?.tinglyst === "Ja" ||
                            lamdaDataFromApi?.eiendomsInformasjon
                              ?.basisInformasjon?.tinglyst === true ? (
                              <img src={Ic_check} alt="check" />
                            ) : (
                              <img src={Ic_x_close} alt="check" />
                            )}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Ugyldig
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            <img src={Ic_check} alt="check" />
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Oppmåling ikke fullført
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {lamdaDataFromApi?.eiendomsInformasjon?.status
                              ?.oppmaling_ikke_fullfort === "Ja" ||
                            lamdaDataFromApi?.eiendomsInformasjon?.status
                              ?.oppmaling_ikke_fullfort === true ? (
                              <img src={Ic_check} alt="check" />
                            ) : (
                              <img src={Ic_x_close} alt="check" />
                            )}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Mangler grenseoppmerking
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {lamdaDataFromApi?.eiendomsInformasjon?.status
                              ?.mangler_grensepunktmerking === "Ja" ||
                            lamdaDataFromApi?.eiendomsInformasjon?.status
                              ?.mangler_grensepunktmerking === true ? (
                              <img src={Ic_check} alt="check" />
                            ) : (
                              <img src={Ic_x_close} alt="check" />
                            )}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs md:text-sm text-gray">
                            Under sammenslåing
                          </p>
                          <h5 className="text-sm md:text-base text-black font-medium">
                            {lamdaDataFromApi?.eiendomsInformasjon?.status
                              ?.under_sammenslaing === "Ja" ||
                            (lamdaDataFromApi?.eiendomsInformasjon?.status
                              ?.under_sammenslaing ===
                              "Ja") ===
                              true ? (
                              <img src={Ic_check} alt="check" />
                            ) : (
                              <img src={Ic_x_close} alt="check" />
                            )}
                          </h5>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[12px] overflow-hidden h-[300px] desktop:h-auto w-full desktop:w-[407px]">
                    {loading ? (
                      <div
                        className="w-full h-full rounded-md custom-shimmer"
                        style={{ borderRadius: "8px" }}
                      ></div>
                    ) : (
                      <>
                        {lamdaDataFromApi?.coordinates
                          ?.convertedCoordinates && (
                          // <NorkartMap
                          //   coordinates={
                          //     lamdaDataFromApi?.coordinates?.convertedCoordinates
                          //   }
                          // />
                          <GoogleMapComponent
                            coordinates={
                              lamdaDataFromApi?.coordinates
                                ?.convertedCoordinates
                            }
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="p-4 md:p-6 rounded-lg mt-[44px]"
              style={{
                boxShadow:
                  "0px 2px 4px -2px #1018280F, 0px 4px 8px -2px #1018281A",
              }}
            >
              <div
                className="flex items-center justify-between gap-2 cursor-pointer"
                onClick={() => toggleAccordion("Arkitekturplan")}
              >
                {loading ? (
                  <div className="w-[100px] h-[20px] rounded-lg custom-shimmer"></div>
                ) : (
                  <h3 className="text-black text-lg md:text-xl desktop:text-2xl font-semibold">
                    Arkitekturplan
                  </h3>
                )}
                {isOpen === "Arkitekturplan" ? (
                  <img src={Ic_chevron_up} alt="arrow" />
                ) : (
                  <img src={Ic_chevron_up} alt="arrow" className="rotate-180" />
                )}
              </div>
              <div
                className={`mt-6 ${
                  isOpen === "Arkitekturplan" ? "block" : "hidden"
                }`}
              >
                <div className="relative w-full">
                  <div className="gap-4 md:gap-6 lg:gap-8 grid grid-cols-2 md:grid-cols-4">
                    {images
                      .slice(0, maxVisible)
                      .map((image: any, index: number) => {
                        const isLast =
                          index === maxVisible - 1 &&
                          images.length > maxVisible;
                        return (
                          <div
                            key={index}
                            className="relative cursor-pointer rounded-[12px] overflow-hidden"
                            onClick={() => handleSingleModal(index)}
                          >
                            <img
                              src={image.src}
                              alt={image.alt}
                              className="w-full h-full object-cover border border-[#7D89B033]"
                            />
                            {isLast && (
                              <div
                                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xl font-bold"
                                onClick={isLast ? handleOpenModal : undefined}
                              >
                                +{extraImages}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full mt-8 md:mt-[44px]">
              <div className="flex border-b border-[#DDDDDD] overflow-x-auto overflowXAuto">
                {tabs.map((tab: any) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`px-3 md:px-4 py-2 text-black border-b-[3px] text-sm md:text-base desktop:text-lg transition-colors duration-300 ${
                      activeTab === tab?.id
                        ? "border-primary font-semibold"
                        : "border-transparent"
                    }`}
                  >
                    {tab?.label}
                  </button>
                ))}
              </div>
              <div className="pt-5 md:pt-8">
                {activeTab === "Regulering" && (
                  <>
                    <div className="flex flex-col md:flex-row gap-5 lg:gap-9 desktop:gap-[60px]">
                      <div className="relative w-full md:w-1/2">
                        <div className="flex flex-col gap-5 lg:gap-9">
                          <h2 className="text-black text-lg md:text-xl lg:text-2xl desktop:text-[28px] font-semibold">
                            Reguleringsplan
                          </h2>
                          {results ? (
                            <>
                              {Object.keys(results).length > 0 ? (
                                <>
                                  {Object.entries(results)
                                    .filter(
                                      ([_, value]: any) =>
                                        value?.rules && value.rules.length > 0
                                    )
                                    .map((item: any, index: number) => {
                                      return (
                                        <div key={index}>
                                          <div className="flex gap-2 items-center mb-4 lg:mb-6">
                                            <img src={Ic_generelt} alt="logo" />
                                            <h2 className="text-black text-base md:text-lg lg:text-xl desktop:text-2xl font-semibold">
                                              {item[0]}
                                            </h2>
                                          </div>

                                          <div className="flex flex-col gap-2 md:gap-3">
                                            {item?.[1]?.rules?.map(
                                              (rule: any, idx: number) => (
                                                <div
                                                  className="flex items-start gap-2 md:gap-3 text-gray text-sm lg:text-base"
                                                  key={idx}
                                                >
                                                  <img
                                                    src={Ic_check_true}
                                                    alt="logo"
                                                  />
                                                  <span>
                                                    {rule?.norwegian_text
                                                      ? rule.norwegian_text
                                                      : rule.rule_name}
                                                  </span>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                </>
                              ) : (
                                <div>Ingen regel funnet!</div>
                              )}
                            </>
                          ) : (
                            <>
                              {Array.from({ length: 4 }).map(
                                (_: any, index: number) => (
                                  <div key={index}>
                                    <div className="flex gap-2 items-center mb-4 lg:mb-6">
                                      <div className="w-[100px] h-[20px] rounded-lg custom-shimmer"></div>
                                      <div className="w-[100px] h-[20px] rounded-lg custom-shimmer"></div>
                                    </div>

                                    <div className="flex flex-col gap-2 md:gap-3">
                                      <div className="w-full h-[25px] rounded-lg custom-shimmer"></div>
                                      <div className="w-full h-[25px] rounded-lg custom-shimmer"></div>
                                      <div className="w-full h-[25px] rounded-lg custom-shimmer"></div>
                                    </div>
                                  </div>
                                )
                              )}
                            </>
                          )}
                        </div>

                        {loading ? (
                          <div
                            className="w-1/2 h-[300px] rounded-md custom-shimmer"
                            style={{ borderRadius: "8px" }}
                          ></div>
                        ) : (
                          <div className="relative w-full md:w-1/2">
                            {/* <div className="w-full flex flex-col gap-4 md:gap-8 items-center mt-7 md:mt-[55px]">
                              <div className="rounded-[12px] overflow-hidden w-full relative border border-[#7D89B0] h-[450px] md:h-[590px]">
                                {imgLoading && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-10">
                                    <div className="spinner-border animate-spin border-t-4 border-b-4 border-blue-500 w-12 h-12 border-solid rounded-full"></div>
                                  </div>
                                )}
                                <img
                                  src={selectedImage?.src}
                                  alt={selectedImage?.alt}
                                  className="h-full w-full"
                                  onLoad={() => setImgLoading(false)}
                                  onError={() => setImgLoading(false)}
                                />
                                <div
                                  className="absolute top-0 left-[4px] flex items-center justify-center h-full"
                                  style={{
                                    zIndex: 99999,
                                  }}
                                >
                                  <div
                                    className={`bg-white h-[44px] w-[44px] rounded-full flex items-center justify-center ${
                                      selectedImage?.id === images[0]?.id
                                        ? "opacity-50"
                                        : "opacity-100"
                                    }`}
                                    style={{
                                      boxShadow:
                                        "0px 2px 4px -2px #1018280F, 0px 4px 8px -2px #1018281A",
                                    }}
                                    onClick={() => {
                                      if (selectedImage?.id !== images[0]?.id) {
                                        const currentIndex = images.findIndex(
                                          (img) => img.id === selectedImage.id
                                        );
                                        setImgLoading(true);

                                        const nextIndex = currentIndex - 1;
                                        if (nextIndex >= 0) {
                                          setSelectedImage(images[nextIndex]);
                                          handleScrollUp();
                                        }
                                      }
                                    }}
                                  >
                                    <img
                                      src={Ic_chevron_right}
                                      alt="arrow"
                                      className={`${
                                        selectedImage?.id !== images[0]?.id &&
                                        "cursor-pointer"
                                      } rotate-180`}
                                    />
                                  </div>
                                </div>
                                <div
                                  className={`absolute bottom-0 right-[4px] flex items-center justify-center h-full`}
                                  style={{
                                    zIndex: 99999,
                                  }}
                                >
                                  <div
                                    className={`bg-white h-[44px] w-[44px] rounded-full flex items-center justify-center ${
                                      selectedImage?.id ===
                                      images[images.length - 1]?.id
                                        ? "opacity-50"
                                        : "opacity-100"
                                    }`}
                                    style={{
                                      boxShadow:
                                        "0px 2px 4px -2px #1018280F, 0px 4px 8px -2px #1018281A",
                                    }}
                                    onClick={() => {
                                      if (
                                        selectedImage?.id !==
                                        images[images.length - 1]?.id
                                      ) {
                                        const currentIndex = images.findIndex(
                                          (img: any) =>
                                            img.id === selectedImage.id
                                        );
                                        setImgLoading(true);

                                        const nextIndex = currentIndex + 1;
                                        if (nextIndex < images.length) {
                                          setSelectedImage(images[nextIndex]);
                                        }
                                        handleScrollDown();
                                      }
                                    }}
                                  >
                                    <img
                                      src={Ic_chevron_right}
                                      alt="arrow"
                                      className={`${
                                        selectedImage?.id !==
                                          images[images.length - 1]?.id &&
                                        "cursor-pointer"
                                      }`}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="relative w-full flex justify-center">
                                <div
                                  className="gap-4 md:gap-8 flex overflow-x-auto overFlowScrollHidden"
                                  ref={scrollContainerRef}
                                >
                                  {images.map((image, index) => (
                                    <div
                                      className="relative min-w-[90px] max-w-[90px]"
                                      key={index}
                                    >
                                      <img
                                        src={image.src}
                                        alt={image.alt}
                                        className={`h-[90px] w-full rounded-[12px] cursor-pointer ${
                                          selectedImage?.id === image?.id
                                            ? "border-2 border-primary"
                                            : "border border-[#7D89B033]"
                                        }`}
                                        style={{
                                          zIndex: 999,
                                        }}
                                        onClick={() => handleImageClick(image)}
                                      />
                                    </div>
                                  ))}
                                </div>
                                {images.length > 5 && (
                                  <div
                                    className="absolute top-0 right-0 h-[90px] w-[90px]"
                                    style={{
                                      zIndex: 9999,
                                      background:
                                        "linear-gradient(-90deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 90.63%)",
                                    }}
                                  ></div>
                                )}
                                {images.length > 5 && (
                                  <div
                                    className="absolute top-0 left-0 h-[90px] w-[90px]"
                                    style={{
                                      zIndex: 9999,
                                      background:
                                        "linear-gradient(90deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 90.63%)",
                                    }}
                                  ></div>
                                )}
                                {images.length > 5 && (
                                  <div
                                    className="absolute top-0 left-0 flex items-center justify-center h-full"
                                    style={{
                                      zIndex: 99999,
                                    }}
                                  >
                                    <img
                                      src={Ic_chevron_right}
                                      alt="arrow"
                                      className={`${
                                        selectedImage?.id !== images[0]?.id
                                          ? "cursor-pointer opacity-100"
                                          : "opacity-50"
                                      } rotate-180`}
                                      onClick={() => {
                                        if (
                                          selectedImage?.id !== images[0]?.id
                                        ) {
                                          const currentIndex = images.findIndex(
                                            (img) => img.id === selectedImage.id
                                          );
                                          setImgLoading(true);

                                          const nextIndex = currentIndex - 1;
                                          if (nextIndex >= 0) {
                                            setSelectedImage(images[nextIndex]);
                                            handleScrollUp();
                                          }
                                        }
                                      }}
                                    />
                                  </div>
                                )}
                                {images.length > 5 && (
                                  <div
                                    className="absolute top-0 right-0 flex items-center justify-center h-full"
                                    style={{
                                      zIndex: 99999,
                                    }}
                                  >
                                    <img
                                      src={Ic_chevron_right}
                                      alt="arrow"
                                      className={`${
                                        selectedImage?.id !==
                                        images[images.length - 1]?.id
                                          ? "cursor-pointer opacity-100"
                                          : "opacity-50"
                                      }`}
                                      onClick={() => {
                                        if (
                                          selectedImage?.id !==
                                          images[images.length - 1]?.id
                                        ) {
                                          const currentIndex = images.findIndex(
                                            (img) => img.id === selectedImage.id
                                          );
                                          setImgLoading(true);

                                          const nextIndex = currentIndex + 1;
                                          if (nextIndex < images.length) {
                                            setSelectedImage(images[nextIndex]);
                                          }
                                          handleScrollDown();
                                        }
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div> */}
                          </div>
                        )}
                      </div>
                      <div className="relative w-full md:w-1/2">
                        <div className="flex flex-col gap-5 lg:gap-9">
                          <h2 className="text-black text-lg md:text-xl lg:text-2xl desktop:text-[28px] font-semibold">
                            Kommuneplan
                          </h2>
                          {KommuneRule && !KommuneRuleLoading ? (
                            <>
                              {KommuneRule?.rules?.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                  {KommuneRule?.rules.map(
                                    (item: any, index: number) => {
                                      return (
                                        <div
                                          key={index}
                                          className="relative"
                                          ref={dropdownRuleRef}
                                        >
                                          <div className="flex items-start gap-2 md:gap-3 text-gray text-sm lg:text-base">
                                            <img
                                              src={Ic_check_true}
                                              alt="check"
                                            />
                                            <span>{item?.rule}</span>
                                            <img
                                              src={Ic_info_circle}
                                              alt="info"
                                              className="cursor-pointer"
                                              onClick={() =>
                                                toggleRuleDropdown(index)
                                              }
                                            />
                                          </div>
                                          {openIndex === index && (
                                            <div className="top-3 z-100 bg-white shadow-shadow1 p-3 rounded-lg text-sm text-gray absolute right-0 w-auto max-w-64">
                                              {item.description}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              ) : (
                                <div>Ingen regel funnet!</div>
                              )}
                            </>
                          ) : (
                            <>
                              {Array.from({ length: 4 }).map(
                                (_: any, index: number) => (
                                  <div key={index}>
                                    <div className="flex gap-2 items-center mb-4 lg:mb-6">
                                      <div className="w-[100px] h-[20px] rounded-lg custom-shimmer"></div>
                                      <div className="w-[100px] h-[20px] rounded-lg custom-shimmer"></div>
                                    </div>

                                    <div className="flex flex-col gap-2 md:gap-3">
                                      <div className="w-full h-[25px] rounded-lg custom-shimmer"></div>
                                      <div className="w-full h-[25px] rounded-lg custom-shimmer"></div>
                                      <div className="w-full h-[25px] rounded-lg custom-shimmer"></div>
                                    </div>
                                  </div>
                                )
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {activeTab === "Eierinformasjon" && (
                  <Eierinformasjon data={lamdaDataFromApi?.latestOwnership} />
                )}
                {activeTab === "Bygninger" && (
                  <>
                    {loading ? (
                      <div
                        className="w-full h-[300px] rounded-md custom-shimmer"
                        style={{ borderRadius: "8px" }}
                      ></div>
                    ) : (
                      <>
                        {CadastreDataFromApi?.buildingsApi?.response?.items
                          .length > 0 ? (
                          <>
                            <div className="flex items-center justify-between">
                              <h2 className="text-black text-lg md:text-xl desktop:text-2xl font-semibold mb-4 md:mb-6">
                                Eksisterende bebyggelse
                              </h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 desktop:grid-cols-4 gap-4 lg:gap-6 mb-8 md:mb-16">
                              {CadastreDataFromApi?.buildingsApi?.response?.items.map(
                                (item: any, index: number) => (
                                  <div
                                    className="bg-gray3 rounded-[8px] p-3 lg:p-5 flex flex-col gap-2 lg:gap-4"
                                    key={index}
                                  >
                                    <div className="flex flex-col gap-2 lg:gap-4">
                                      <div className="w-full h-[177px] rounded-[8px]">
                                        <GoogleMapNearByComponent
                                          coordinates={
                                            item?.position?.geometry
                                              ?.coordinates
                                          }
                                        />
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <h3 className="text-black font-semibold text-base md:text-lg truncate">
                                          {item?.typeOfBuilding?.text}
                                        </h3>
                                        <p className="text-xs md:text-sm text-gray">
                                          {item?.buildingStatus?.text}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-[2px]">
                                      <div className="text-gray text-xs md:text-sm">
                                        Antall etasjer:{" "}
                                        <span className="text-black font-medium text-sm md:text-base">
                                          {item?.numberOfFloors}
                                        </span>
                                      </div>
                                      <div className="text-gray text-xs md:text-sm">
                                        Bruksareal:{" "}
                                        <span className="text-black font-medium text-sm md:text-base">
                                          {item?.totalFloorSpace} m<sup>2</sup>
                                        </span>
                                      </div>
                                      <div className="text-gray text-xs md:text-sm">
                                        Rammetillatelse:{" "}
                                        <span className="text-black font-medium text-sm md:text-base">
                                          {formatDateToDDMMYYYY(
                                            item?.registeredApprovedDate
                                              ?.timestamp
                                          )}
                                        </span>
                                      </div>
                                      <div className="text-gray text-xs md:text-sm">
                                        Igangsettelse:{" "}
                                        <span className="text-black font-medium text-sm md:text-base">
                                          {formatDateToDDMMYYYY(
                                            item?.approvedDate?.timestamp
                                          )}
                                        </span>
                                      </div>
                                      <div className="text-gray text-xs md:text-sm">
                                        Midleritidg bruk:{" "}
                                        <span className="text-black font-medium text-sm md:text-base">
                                          {formatDateToDDMMYYYY(
                                            item?.usedDate?.timestamp
                                          )}
                                        </span>
                                      </div>
                                      <div className="text-gray text-xs md:text-sm">
                                        Ferdigattest:{" "}
                                        <span className="text-black font-medium text-sm md:text-base">
                                          {formatDateToDDMMYYYY(
                                            item?.buildingStatusHistory[0]
                                              ?.buildingStatusRegisteredDate
                                              ?.timestamp
                                          )}
                                        </span>
                                      </div>
                                      <div className="text-gray text-xs md:text-sm">
                                        Bebygd areal (BYA):{" "}
                                        <span className="text-black font-medium text-sm md:text-base">
                                          {item?.builtUpArea} m<sup>2</sup>
                                        </span>
                                      </div>
                                      <div className="text-gray font-bold text-xs md:text-sm">
                                        Bygningen utgjør{" "}
                                        {(() => {
                                          const builtUpArea = item?.builtUpArea;
                                          const totalAllowedBya =
                                            askData?.bya_calculations?.results
                                              ?.total_allowed_bya;

                                          if (
                                            builtUpArea &&
                                            totalAllowedBya > 0
                                          ) {
                                            return `${(
                                              (builtUpArea / totalAllowedBya) *
                                              100
                                            ).toFixed(2)} %`;
                                          }

                                          return "0";
                                        })()}{" "}
                                        av BYA
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </>
                        ) : (
                          <p>Ingen bygningsdata funnet.</p>
                        )}
                      </>
                    )}
                  </>
                )}
                {activeTab === "Plandokumenter" && (
                  <>
                    {loading ? (
                      <div
                        className="w-full h-[300px] rounded-md custom-shimmer"
                        style={{ borderRadius: "8px" }}
                      ></div>
                    ) : (
                      <>
                        {isValidBBOX && featureInfo && (
                          <div>
                            <div
                              dangerouslySetInnerHTML={{ __html: featureInfo }}
                              style={{
                                width: "100%",
                                height: "820px",
                              }}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
                {activeTab === "Dokumenter" && (
                  <>
                    {!Documents ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Array.from({ length: 6 }).map(
                            (_: any, index: number) => (
                              <div
                                key={index}
                                className="border flex items-center gap-2 border-[#ECE9FE] bg-white rounded-[50px] text-xs md:text-sm cursor-pointer"
                              >
                                <div className="w-full h-[50px] rounded-lg custom-shimmer"></div>
                              </div>
                            )
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        {(() => {
                          const allDocs = [
                            Documents?.rule_book,
                            ...(Documents?.planning_documents || []),
                          ];

                          const filteredDocs = allDocs.filter(
                            (doc) => doc && doc.link
                          );

                          return filteredDocs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {filteredDocs.map((doc, index) => (
                                <DocumentCard
                                  key={index}
                                  doc={doc}
                                  handleDownload={handleDownload}
                                />
                              ))}
                            </div>
                          ) : (
                            <div>Ingen dokumenter funnet!</div>
                          );
                        })()}
                      </>
                    )}
                  </>
                )}
                {activeTab === "Planleggingsdokumenter" && (
                  <>
                    {documentLoading ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Array.from({ length: 6 }).map(
                            (_: any, index: number) => (
                              <div
                                key={index}
                                className="border flex items-center gap-2 border-[#ECE9FE] bg-white rounded-[50px] text-xs md:text-sm cursor-pointer"
                              >
                                <div className="w-full h-[50px] rounded-lg custom-shimmer"></div>
                              </div>
                            )
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        {(() => {
                          const filteredPlanDocs =
                            PlanDocuments?.filter(
                              (doc: any) => doc && doc.link
                            ) || [];

                          return filteredPlanDocs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {filteredPlanDocs.map(
                                (doc: any, index: number) => (
                                  <DocumentCard
                                    key={index}
                                    doc={doc}
                                    handleDownload={handleDownload}
                                  />
                                )
                              )}
                            </div>
                          ) : (
                            <div>Ingen dokumenter funnet!</div>
                          );
                        })()}
                      </>
                    )}
                  </>
                )}
                {activeTab === "Dispensasjoner" && (
                  <>
                    {documentLoading ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Array.from({ length: 6 }).map(
                            (_: any, index: number) => (
                              <div
                                key={index}
                                className="border flex items-center gap-2 border-[#ECE9FE] bg-white rounded-[50px] text-xs md:text-sm cursor-pointer"
                              >
                                <div className="w-full h-[50px] rounded-lg custom-shimmer"></div>
                              </div>
                            )
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        {(() => {
                          const filteredExemptions =
                            exemptions?.filter((doc: any) => doc && doc.link) ||
                            [];

                          return filteredExemptions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {filteredExemptions.map(
                                (doc: any, index: number) => (
                                  <DocumentCard
                                    key={index}
                                    doc={doc}
                                    handleDownload={handleDownload}
                                  />
                                )
                              )}
                            </div>
                          ) : (
                            <div>Ingen dokumenter funnet!</div>
                          );
                        })()}
                      </>
                    )}
                  </>
                )}
                {activeTab === "Kommuneplaner" && (
                  <>
                    {KommuneLoading ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Array.from({ length: 6 }).map(
                            (_: any, index: number) => (
                              <div
                                key={index}
                                className="border flex items-center gap-2 border-[#ECE9FE] bg-white rounded-[50px] text-xs md:text-sm cursor-pointer"
                              >
                                <div className="w-full h-[50px] rounded-lg custom-shimmer"></div>
                              </div>
                            )
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        {(() => {
                          const allDocs = [
                            KommunePlan?.rule_book,
                            ...(KommunePlan?.planning_documents || []),
                          ];
                          const filteredDocs =
                            allDocs?.filter((doc: any) => doc && doc.link) ||
                            [];

                          return filteredDocs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {filteredDocs.map((doc: any, index: number) => (
                                <DocumentCard
                                  key={index}
                                  doc={doc}
                                  handleDownload={handleDownload}
                                />
                              ))}
                            </div>
                          ) : (
                            <div>Ingen dokumenter funnet!</div>
                          );
                        })()}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className={`${activeAllTab === "house" ? "block" : "hidden"}`}>
            <div className="px-4 md:px-6">
              <HouseDetailPage id={HouseModelData?.id} />
            </div>

            {data?.stored && <Tilpass data={data} />}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal isOpen={false} onClose={() => setIsModalOpen(false)}>
          <div className="bg-white p-4 md:p-7 rounded-lg max-w-[85vw] md:max-w-4xl w-full relative h-[80vh] overflow-y-auto">
            <button
              className="absolute top-2 md:top-3 right-0 md:right-3"
              onClick={() => setIsModalOpen(false)}
            >
              <img src={Ic_x_close} alt="close" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image: any, index: number) => (
                <img
                  key={index}
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-auto rounded-[12px]"
                />
              ))}
            </div>
          </div>
        </Modal>
      )}

      {isSingleModalOpen && selectedIndex !== null && (
        <Modal onClose={() => setIsSingleModalOpen(false)} isOpen={false}>
          <div className="bg-white p-4 md:p-7 rounded-lg max-w-[85vw] md:max-w-5xl w-full relative">
            <button
              className="absolute top-2 md:top-3 right-0 md:right-3"
              onClick={() => handleSingleCloseModal()}
            >
              <img src={Ic_x_close} alt="close" />
            </button>

            <div className="flex gap-4 mb-4">
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

            <div
              ref={containerRef}
              className="relative overflow-hidden max-h-[80vh] max-w-[90vw] border border-gray rounded-lg touch-none flex items-center justify-center"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                ref={imgRef}
                src={images[selectedIndex].src}
                alt={images[selectedIndex].alt}
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
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
