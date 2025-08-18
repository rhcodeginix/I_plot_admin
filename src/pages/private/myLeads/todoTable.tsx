/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import Ic_download from "../../../assets/images/Ic_download.svg";
import * as XLSX from "xlsx";
import DatePickerComponent from "../../../components/ui/datepicker";
import { Ellipsis, Loader2, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Ic_search from "../../../assets/images/Ic_search.svg";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import {
  convertToFullDateString,
  fetchAdminData,
  fetchAdminDataByEmail,
  fetchHusmodellData,
  formatDateOnly,
  formatTimestamp,
} from "../../../lib/utils";
import { HouseModelCell } from "./houseRow";
import { StatusCell } from "./statusRow";
import { BrokerCell } from "./brokerRow";
import { monthMap } from "./myLeadsDetail";
import { TodoDateCell } from "./todoDate";
import { NoteCell } from "./noteRow";

const calculateDateRange = (range: string) => {
  const currentDate = new Date();
  let startDate: Date;
  let endDate: Date = currentDate;

  switch (range) {
    case "12 måneder":
      startDate = new Date(currentDate);
      startDate.setFullYear(currentDate.getFullYear() - 1);
      break;
    case "30 dager":
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 30);
      break;
    case "7 dager":
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 7);
      break;
    case "24 timer":
      startDate = new Date(currentDate);
      startDate.setHours(currentDate.getHours() - 24);
      break;
    default:
      return null;
  }

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};

export const TODOTable = () => {
  const [selectedDate1, setSelectedDate1] = useState<Date | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [page, setPage] = useState(1);
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState<string | null>(
    null
  );

  const email = localStorage.getItem("Iplot_admin");
  const [LoginUserId, setLoginUserId] = useState<any>(null);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();

      if (data) {
        if (data?.id) {
          setLoginUserId(data?.id);
        }
      }
    };

    getData();
  }, []);

  const fetchLeadsData = async () => {
    setIsLoading(true);
    try {
      const assignedModelsSnapshot = await getDocs(
        query(
          collectionGroup(db, "preferred_house_model"),
          where("Tildelt", "==", String(LoginUserId))
        )
      );

      const leadIds = Array.from(
        new Set(
          assignedModelsSnapshot.docs.map((doc) => doc.ref.parent.parent?.id)
        )
      );

      if (leadIds.length === 0) {
        setFilteredData([]);
        return;
      }

      const leadDocs: any = await Promise.all(
        leadIds.map((leadId) =>
          getDocs(
            collection(db, "leads_from_supplier", String(leadId), "followups")
          ).then((followupsSnapshot) => {
            const followups = followupsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            followups.sort((a, b) => {
              const getTimestamp = (item: any): number => {
                if (typeof item.updatedAt === "string") {
                  const [datePart, timePart] = item.updatedAt
                    .split("|")
                    .map((s: string) => s.trim());
                  const [day, monthName, year] = datePart.split(" ");
                  const engMonth =
                    monthMap[monthName.toLowerCase()] || monthName;
                  const dateStr = `${engMonth} ${day}, ${year} ${timePart}`;
                  return new Date(dateStr).getTime();
                } else if (item.updatedAt?.toMillis) {
                  return item.updatedAt.toMillis();
                } else {
                  return item.date?.seconds ? item.date.seconds * 1000 : 0;
                }
              };
              return getTimestamp(b) - getTimestamp(a);
            });

            return getDoc(doc(db, "leads_from_supplier", String(leadId))).then(
              (leadDoc) => ({
                id: String(leadId),
                ...leadDoc.data(),
                followups: followups[0] || [],
              })
            );
          })
        )
      );

      leadDocs.sort((a: any, b: any) => {
        const getTimestamp = (item: any): number => {
          const updatedAt = item.followups?.updatedAt;
          if (typeof updatedAt === "string") {
            const [datePart, timePart] = updatedAt
              .split("|")
              .map((s: string) => s.trim());
            const [day, monthName, year] = datePart.split(" ");
            const engMonth = monthMap[monthName.toLowerCase()] || monthName;
            const dateStr = `${engMonth} ${day}, ${year} ${timePart}`;
            return new Date(dateStr).getTime();
          } else if (updatedAt?.toMillis) {
            return updatedAt.toMillis();
          } else {
            return item.followups?.date?.seconds
              ? item.followups.date.seconds * 1000
              : 0;
          }
        };
        return getTimestamp(b) - getTimestamp(a);
      });

      setLeads(leadDocs);
    } catch (error) {
      console.error("Error fetching fast leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const [allLogMap, setAllLogMap] = useState<Record<string, any[]>>({});
  useEffect(() => {
    setIsLoading(true);
    const fetchLogs = async () => {
      const logMap: Record<string, any[]> = {};

      await Promise.all(
        leads.map(async (model: any) => {
          const logsCollectionRef = collection(
            db,
            "leads_from_supplier",
            String(model.id),
            "followups"
          );

          try {
            const logsSnapshot = await getDocs(logsCollectionRef);
            const fetchedLogs = logsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            const getTimestamp = (item: any): number => {
              const updatedAt = item?.updatedAt;
              if (typeof updatedAt === "string") {
                const [datePart, timePart] = updatedAt
                  .split("|")
                  .map((s: string) => s.trim());
                const [day, monthName, year] = datePart.split(" ");
                const engMonth = monthMap[monthName.toLowerCase()] || monthName;
                const dateStr = `${engMonth} ${day}, ${year} ${timePart}`;
                const parsed = new Date(dateStr).getTime();
                return isNaN(parsed) ? 0 : parsed;
              } else if (updatedAt?.toMillis) {
                return updatedAt.toMillis();
              } else {
                return item?.date?.seconds ? item.date.seconds * 1000 : 0;
              }
            };

            fetchedLogs.sort((a, b) => getTimestamp(b) - getTimestamp(a));
            logMap[model.id] = fetchedLogs;
          } catch (error) {
            console.error("Failed to fetch logs:", error);
          }
        })
      );

      setAllLogMap(logMap);
      setIsLoading(false);
    };

    if (leads.length > 0) {
      fetchLogs();
    }
  }, [leads]);
  useEffect(() => {
    const filterLeads = async () => {
      const search = searchTerm.toLowerCase();
      setIsLoading(true);

      const results = await Promise.all(
        leads.map(async (model: any) => {
          const leadSource = model?.leadSource?.toLowerCase();
          const leadKilde = model?.leadData?.kilde?.toLowerCase();
          const leadName = model?.leadData?.name?.toLowerCase();

          let matchesSearch =
            leadSource?.includes(search) ||
            leadKilde?.includes(search) ||
            leadName?.includes(search);

          if (!matchesSearch) return null;

          const modelDate: any = convertToFullDateString(model.createdAt);

          if (selectedDate1 !== null) {
            const matchDate = modelDate === formatDateOnly(selectedDate1);
            if (!matchDate) return null;
          }

          if (selectedDateRange !== null) {
            const { startDate, endDate }: any =
              calculateDateRange(selectedDateRange);
            const isWithinDateRange =
              modelDate >= startDate && modelDate <= endDate;
            if (!isWithinDateRange) return null;
          }

          if (selectedFilter === "Fremtidige oppgaver") {
            const logs = Array.isArray(allLogMap?.[model.id])
              ? allLogMap[model.id]
              : [];
            const firstLog = logs?.[0];

            const futureTimestamp = firstLog?.date?.seconds
              ? new Date(firstLog.date.seconds * 1000)
              : null;

            const now = new Date();

            if (futureTimestamp && futureTimestamp > now) {
              return model;
            } else {
              return null;
            }
          }

          if (selectedFilter === "Til oppfølgning") {
            const logs = Array.isArray(allLogMap?.[model.id])
              ? allLogMap[model.id]
              : [];
            const firstLog = logs?.[0];

            if (
              firstLog?.type === "initial" ||
              firstLog?.Hurtigvalg === "initial" ||
              firstLog?.type === "Signert" ||
              firstLog?.Hurtigvalg === "Signert"
            ) {
              return null;
            }

            const logDate = firstLog?.date?.seconds
              ? new Date(firstLog.date.seconds * 1000)
              : null;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const isTodayOrPast =
              logDate && logDate.setHours(0, 0, 0, 0) <= today.getTime();

            if (isTodayOrPast) {
              return model;
            } else {
              return null;
            }
          }
          if (selectedFilter === "Avsluttede leads") {
            const logs = Array.isArray(allLogMap?.[model.id])
              ? allLogMap[model.id]
              : [];
            const firstLog = logs?.[0];

            if (
              firstLog?.type === "Signert" ||
              firstLog?.Hurtigvalg === "Signert"
            ) {
              return model;
            } else {
              return null;
            }
          }

          return model;
        })
      );

      const cleaned = results.filter(Boolean);
      setFilteredData(cleaned);
      setIsLoading(false);
    };

    if (Object.keys(allLogMap).length > 0) {
      filterLeads();
    }
  }, [
    leads,
    searchTerm,
    selectedDate1,
    selectedDateRange,
    selectedFilter,
    allLogMap,
  ]);

  useEffect(() => {
    if (LoginUserId) {
      fetchLeadsData();
    }
  }, [LoginUserId]);
  const fetchPreferredFollowUp = async (id: any) => {
    if (!id) return;

    const logsCollectionRef = collection(
      db,
      "leads_from_supplier",
      String(id),
      "followups"
    );

    try {
      const logsSnapshot = await getDocs(logsCollectionRef);

      const fetchedLogs: any = logsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const getTimestamp = (item: any): number => {
        const updatedAt = item?.updatedAt;

        if (typeof updatedAt === "string") {
          const [datePart, timePart] = updatedAt
            .split("|")
            .map((s: string) => s.trim());
          const [day, monthName, year] = datePart.split(" ");
          const engMonth = monthMap[monthName.toLowerCase()] || monthName;
          const dateStr = `${engMonth} ${day}, ${year} ${timePart}`;
          const parsed = new Date(dateStr).getTime();
          return isNaN(parsed) ? 0 : parsed;
        } else if (updatedAt?.toMillis) {
          return updatedAt.toMillis();
        } else {
          return item?.date?.seconds ? item.date.seconds * 1000 : 0;
        }
      };
      fetchedLogs.sort((a: any, b: any) => getTimestamp(b) - getTimestamp(a));

      return fetchedLogs;
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  const [preferredFollow, setPreferredFollow] = useState<any>(new Map());

  useEffect(() => {
    const loadPreferredHouses = async () => {
      const newMap = new Map();

      for (const row of filteredData) {
        const id = row?.id;
        if (id) {
          const logs = await fetchPreferredFollowUp(id);
          newMap.set(id, logs || []);
        }
      }

      setPreferredFollow(newMap);
    };

    loadPreferredHouses();
  }, [filteredData, sortDirection]);

  const fetchPreferredHouse = async (id: any) => {
    if (!id) return;

    const subDocRef = doc(
      db,
      "leads_from_supplier",
      String(id),
      "preferred_house_model",
      String(id)
    );

    const subDocSnap = await getDoc(subDocRef);

    if (subDocSnap.exists()) {
      return subDocSnap.data();
    }
  };

  const [finalDataMap, setFinalDataMap] = useState<Map<string, any>>(new Map());
  const [finalBrokerDataMap, setFinalBrokerDataMap] = useState<
    Map<string, any>
  >(new Map());

  const fetchAndCacheHouseModel = async (id: string) => {
    const data = await fetchPreferredHouse(id);
    if (data?.Husmodell?.[0]) {
      const houseData = await fetchHusmodellData(data.Husmodell[0]);
      if (houseData && houseData.Husdetaljer) {
        setFinalDataMap((prev) => new Map(prev).set(id, houseData));
      }
    }
  };

  const fetchAndCacheBroker = async (id: string) => {
    const data = await fetchPreferredHouse(id);
    if (data?.Tildelt) {
      const adminData = await fetchAdminData(data?.Tildelt);
      if (adminData) {
        setFinalBrokerDataMap((prev) => new Map(prev).set(id, adminData));
      }
    }
  };

  useEffect(() => {
    filteredData.forEach((row) => {
      if (row.id && !finalDataMap.has(row.id)) {
        fetchAndCacheHouseModel(row.id);
        fetchAndCacheBroker(row.id);
      }
    });
  }, [filteredData]);
  const getSortableValue = (row: any, column: string) => {
    let val = row.leadData;

    switch (column) {
      case "Aktivitet": {
        const id = row?.id;
        const logs = preferredFollow.get(String(id));
        if (!logs || logs.length === 0) return "ubehandlet";
        const firstLog = logs[0];
        const status =
          firstLog?.Hurtigvalg === "initial" || firstLog?.type === "initial"
            ? "ubehandlet"
            : firstLog?.Hurtigvalg || firstLog?.type;
        return typeof status === "string" ? status.toLowerCase() : status;
      }
      case "Siste dato": {
        const id = row?.id;
        const logs = preferredFollow.get(String(id));
        if (!logs || logs.length === 0) return 0;
        const firstLog = logs[0];

        return formatTimestamp(firstLog?.date) ?? 0;
      }
      case "Kunde":
        if (val?.name === null || val?.name === undefined) return "";
        if (typeof val?.name === "string") return val?.name.toLowerCase();
        if (typeof val?.name === "number") return val?.name;
        return val?.name ?? "";
      case "Husmodell": {
        const dataForRow = finalDataMap.get(row.id);
        return dataForRow?.Husdetaljer?.husmodell_name?.toLowerCase() ?? "";
      }
      case "Broker": {
        const dataForRow = finalBrokerDataMap.get(row.id);
        return (
          (dataForRow?.f_name.toLowerCase() ||
            dataForRow?.l_name.toLowerCase() ||
            dataForRow?.name.toLowerCase()) ??
          ""
        );
      }
      case "Anleggsadresse":
        if (val?.adresse === null || val?.adresse === undefined) return "";
        if (typeof val?.adresse === "string") return val?.adresse.toLowerCase();
        if (typeof val?.adresse === "number") return val?.adresse;
        return val?.adresse ?? "";
      case "Siste aktivitet": {
        const id = row?.id;
        const logs = preferredFollow.get(String(id));
        if (!logs || logs.length === 0)
          return val?.notaterFørsteSamtale?.toLowerCase() ?? "";
        const firstLog = logs[0];
        const status = firstLog?.notat || firstLog?.notes;
        return typeof status === "string" ? status.toLowerCase() : status;
      }
      default:
        return "";
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = getSortableValue(a, sortColumn);
      const bValue = getSortableValue(b, sortColumn);
      if (aValue === bValue) return 0;

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  }, [filteredData, sortColumn, sortDirection, preferredFollow]);

  const columns = useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        accessorKey: "Aktivitet",
        header: "Aktivitet",
        cell: ({ row }) => <StatusCell id={row.original.id} />,
      },
      {
        accessorKey: "kunde",
        header: "Kunde",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 w-max">
            <div className="w-8 h-8 rounded-full border border-gray1 bg-gray3 flex items-center justify-center">
              {row.original.leadData.name[0]}
            </div>
            <div>
              <Link
                to={`/my-leads-details/${row.original.id}`}
                className="font-medium text-primary text-sm mb-[2px]"
              >
                {row.original.leadData.name}
              </Link>
              <p className="text-xs text-gray">
                {row.original.leadData.email || row.original.leadData?.epost}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "Husmodell",
        header: "Husmodell",
        cell: ({ row }) => <HouseModelCell id={row.original.id} />,
      },
      {
        accessorKey: "Broker",
        header: "Broker",
        cell: ({ row }) => <BrokerCell id={row.original.id} />,
      },
      {
        accessorKey: "adresse",
        header: "Anleggsadresse",
        cell: ({ row }) =>
          row.original.leadData?.adresse ? (
            <p className="text-black text-sm font-medium w-max">
              {row.original.leadData?.adresse}
            </p>
          ) : (
            <p className="text-center">-</p>
          ),
      },
      {
        accessorKey: "Siste aktivitet",
        header: "Siste aktivitet",
        cell: ({ row }) => (
          <NoteCell
            id={row.original.id}
            rowData={row.original.leadData?.notaterFørsteSamtale}
          />
        ),
      },
      {
        id: "handling",
        header: "Handling",
        cell: () => (
          <button className="h-8 w-8 flex items-center justify-center">
            <Ellipsis className="h-4 w-4 text-gray-500" />
          </button>
        ),
      },
    ];

    const updatedColumn: ColumnDef<any> = {
      accessorKey: "Siste dato",
      header: "Siste dato",

      cell: ({ row }) => (
        <TodoDateCell id={row.original.id} date={row.original.updatedAt} />
      ),
    };

    baseColumns.splice(1, 0, updatedColumn);

    return baseColumns;
  }, [email, navigate, page, selectedFilter]);

  const pageSize = 10;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page]);

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },
    pageCount: Math.ceil(sortedData.length / pageSize),
    manualPagination: true,
    onPaginationChange: (updater: any) => {
      if (typeof updater === "function") {
        const newState = updater({
          pageIndex: page - 1,
          pageSize,
        });
        setPage(newState.pageIndex + 1);
      }
    },
  });
  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sortedData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads From Supplier");

    XLSX.writeFile(wb, "leads_from_supplier.xlsx");
  };
  return (
    <>
      <div className="px-4 md:px-6 pt-6 pb-16 flex flex-col gap-4 md:gap-6">
        <div className="flex lg:items-center flex-col lg:flex-row gap-2 justify-between">
          <div className="shadow-shadow1 border border-gray1 rounded-[8px] flex w-max">
            <div
              className={`p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm cursor-pointer ${
                selectedDateRange === "12 måneder" && "bg-gray2"
              }`}
              onClick={() => setSelectedDateRange("12 måneder")}
            >
              12 måneder
            </div>
            <div
              className={`p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm border border-t-0 border-b-0 border-gray1 cursor-pointer ${
                selectedDateRange === "30 dager" && "bg-gray2"
              }`}
              onClick={() => setSelectedDateRange("30 dager")}
            >
              30 dager
            </div>
            <div
              className={`p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm cursor-pointer border-r border-gray1 ${
                selectedDateRange === "7 dager" && "bg-gray2"
              }`}
              onClick={() => setSelectedDateRange("7 dager")}
            >
              7 dager
            </div>
            <div
              className={`p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm cursor-pointer ${
                selectedDateRange === "24 timer" && "bg-gray2"
              }`}
              onClick={() => setSelectedDateRange("24 timer")}
            >
              24 timer
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
            <DatePickerComponent
              selectedDate={selectedDate1}
              onDateChange={setSelectedDate1}
              dateFormat="dd.MM.yyyy"
              placeholderText="Velg dato"
              className="border border-gray1 rounded-[8px] flex gap-2 items-center p-2.5 md:py-[10px] md:px-4 cursor-pointer shadow-shadow1 h-[40px] w-max"
            />
          </div>
        </div>
        <div className="mb-2 flex flex-col desktop:flex-row desktop:items-center justify-between bg-lightGreen rounded-[12px] py-3 px-3 gap-2 md:px-4">
          <div className="flex flex-col lg:flex-row gap-2 md:gap-3 lg:items-center">
            <div className="flex items-center border border-gray1 shadow-shadow1 bg-[#fff] gap-2 rounded-lg py-[10px] px-[14px] relative">
              <img src={Ic_search} alt="search" />
              <input
                type="text"
                placeholder="Søk i leads"
                className="focus-within:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <X
                  className="text-primary cursor-pointer h-5 w-5 absolute right-[14px]"
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>
            <div className="shadow-shadow1 border border-gray1 rounded-[8px] flex flex-col sm:flex-row overflow-hidden sm:w-max">
              <div
                className={`p-2.5 md:py-3 md:px-4 text-black2 font-medium text-[13px] sm:text-sm border-b sm:border-b-0 sm:border-r border-gray1 cursor-pointer ${
                  selectedFilter === "Til oppfølgning" && "bg-white"
                }`}
                onClick={() => setSelectedFilter("Til oppfølgning")}
              >
                Til oppfølgning
              </div>
              <div
                className={`p-2.5 md:py-3 md:px-4 text-black2 font-medium text-[13px] sm:text-sm cursor-pointer border-b sm:border-b-0 sm:border-r border-gray1 ${
                  selectedFilter === "Fremtidige oppgaver" && "bg-white"
                }`}
                onClick={() => setSelectedFilter("Fremtidige oppgaver")}
              >
                Fremtidige oppgaver
              </div>
              <div
                className={`p-2.5 md:py-3 md:px-4 text-black2 font-medium text-[13px] sm:text-sm cursor-pointer ${
                  selectedFilter === "Avsluttede leads" && "bg-white"
                }`}
                onClick={() => setSelectedFilter("Avsluttede leads")}
              >
                Avsluttede leads
              </div>
            </div>
          </div>
          <div className="flex gap-2 md:gap-3 items-center">
            <div
              className="border border-gray1 rounded-[8px] flex gap-2 items-center p-2.5 md:py-[10px] md:px-4 cursor-pointer shadow-shadow1 h-[40px] bg-[#fff]"
              onClick={downloadExcel}
            >
              <img src={Ic_download} alt="" />
              <span className="text-black font-medium text-sm">Eksporter</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray2 shadow-shadow2 overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup: any) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header: any) => (
                    <TableHead key={header.id} className="h-8 text-sm">
                      <div
                        className="flex items-center cursor-pointer select-none"
                        onClick={() => {
                          const column = header.column.columnDef.header;
                          if (sortColumn === column) {
                            setSortDirection(
                              sortDirection === "asc" ? "desc" : "asc"
                            );
                          } else {
                            setSortColumn(column as string);
                            setSortDirection("asc");
                          }
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {sortColumn === header.column.columnDef.header && (
                          <span className="text-darkBlack">
                            &nbsp;{sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : sortedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows?.length &&
                table.getRowModel().rows.map((row: any) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell: any) => (
                      <TableCell key={cell.id} className="px-3 md:px-6 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center py-4 px-6 border-t border-gray2">
            <button
              className="px-[14px] py-2 rounded-lg disabled:opacity-50 shadow-shadow1 border border-gray1 text-black font-semibold text-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Forrige
            </button>
            <span className="text-black text-sm">
              Side <span className="font-semibold">{page}</span> av{" "}
              <span className="font-semibold">{table.getPageCount()}</span>
            </span>
            <button
              className="px-[14px] py-2 rounded-lg disabled:opacity-50 shadow-shadow1 border border-gray1 text-black font-semibold text-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Neste
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
