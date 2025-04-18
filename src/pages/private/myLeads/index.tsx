/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import Ic_filter from "../../../assets/images/Ic_filter.svg";
import Ic_map from "../../../assets/images/Ic_map.svg";
import Ic_download from "../../../assets/images/Ic_download.svg";
import * as XLSX from "xlsx";
import DatePickerComponent from "../../../components/ui/datepicker";
import { Ellipsis, Loader2 } from "lucide-react";
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
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import {
  convertToFullDateString,
  fetchAdminDataByEmail,
  fetchSupplierData,
  formatDateOnly,
  formatTimestamp,
} from "../../../lib/utils";
import { HouseModelCell } from "./houseRow";
import { StatusCell } from "./statusRow";

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

export const MyLeads = () => {
  const [selectedDate1, setSelectedDate1] = useState<Date | null>(null);

  const [page, setPage] = useState(1);
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState<string | null>(
    null
  );

  const [permission, setPermission] = useState<any>(null);
  const email = sessionStorage.getItem("Iplot_admin");

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();
      if (data) {
        const finalData = data?.modulePermissions?.find(
          (item: any) => item.name === "Leverandører"
        );
        setPermission(finalData?.permissions);
      }
    };

    getData();
  }, []);

  const fetchLeadsData = async () => {
    setIsLoading(true);
    try {
      let q = query(
        collection(db, "leads_from_supplier"),
        orderBy("updatedAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      const data: any = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLeads(data);
    } catch (error) {
      console.error("Error fetching leads data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return leads.filter((model: any) => {
      const search = searchTerm.toLowerCase();
      const leadSource = model?.leadSource?.toLowerCase();
      const leadKilde = model?.leadData?.kilde?.toLowerCase();
      const leadName = model?.leadData?.name?.toLowerCase();

      let matchesSearch =
        leadSource?.includes(search) ||
        leadKilde?.includes(search) ||
        leadName?.includes(search);

      if (!matchesSearch) return false;
      const modelDate: any = convertToFullDateString(model.createdAt);

      if (selectedDate1 !== null) {
        const matchDate = modelDate === formatDateOnly(selectedDate1);
        matchesSearch = matchesSearch && matchDate;
      }
      if (selectedDateRange !== null) {
        const { startDate, endDate }: any =
          calculateDateRange(selectedDateRange);

        const isWithinDateRange =
          modelDate >= startDate && modelDate <= endDate;

        matchesSearch = matchesSearch && isWithinDateRange;
      }
      return matchesSearch;
    });
  }, [leads, searchTerm, selectedDate1, selectedDateRange]);

  useEffect(() => {
    fetchLeadsData();
  }, []);
  const getData = async (id: string) => {
    const data = await fetchSupplierData(id);
    if (data) {
      return data;
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
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
                className="font-medium text-purple text-sm mb-[2px]"
              >
                {row.original.leadData.name}
              </Link>
              <p className="text-xs text-gray">{row.original.leadData.email}</p>
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
        accessorKey: "Opprettet kl",
        header: "Opprettet kl",
        cell: ({ row }) => (
          <p className="text-sm font-semibold text-black w-max">
            {formatTimestamp(row.original.createdAt)}
          </p>
        ),
      },
      {
        accessorKey: "Telefonnummer",
        header: "Telefonnummer",
        cell: ({ row }) => (
          <p className="text-sm font-semibold text-black w-max">
            {row.original.leadData.telefon}
          </p>
        ),
      },
      {
        accessorKey: "Broker",
        header: "Broker",
        cell: ({ row }) => {
          const [leverandorData, setLeverandorData] = useState<any>(null);

          useEffect(() => {
            const fetchData = async () => {
              const data = await getData(row.original.supplierId);
              setLeverandorData(data);
            };
            fetchData();
          }, [row.original.supplierId]);

          return (
            <div className="flex items-start gap-3 w-max">
              <div className="w-8 h-8 rounded-full border border-gray1 bg-gray3 flex items-center justify-center">
                {leverandorData?.Kontaktperson[0]}
              </div>
              <div>
                <p className="font-medium text-black text-sm mb-[2px]">
                  {leverandorData?.Kontaktperson}
                </p>
                <p className="text-xs text-gray">
                  {leverandorData?.KontaktpersonEPost}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "adresse",
        header: "Adresse",
        cell: ({ row }) => (
          <>
            {row.original.address ? (
              <div className="flex items-center gap-3 w-max">
                <img src={Ic_map} alt="map" className="w-10 h-10" />
                <div>
                  <p className="text-black text-sm mb-[2px] font-medium">
                    Sokkabekveien 77
                  </p>
                  <span className="text-gray text-xs">3478 Nærsnes</span>
                </div>
              </div>
            ) : (
              <p className="text-center">-</p>
            )}
          </>
        ),
      },
      {
        accessorKey: "Status",
        header: "Status",
        cell: ({ row }) => <StatusCell id={row.original.id} />,
      },
      {
        accessorKey: "Oppdatert kl",
        header: "Oppdatert kl",
        cell: ({ row }) => (
          <p className="text-sm font-semibold text-black w-max">
            {formatTimestamp(row.original.updatedAt)}
          </p>
        ),
      },
      {
        accessorKey: "Oppdatert kl",
        header: "Oppdatert kl",
        cell: ({ row }) => (
          <p className="text-sm font-semibold text-black w-[500px]">
            {row.original.leadData?.notaterFørsteSamtale}
          </p>
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
    ],
    [email, navigate, permission]
  );

  const pageSize = 10;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

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
    pageCount: Math.ceil(filteredData.length / pageSize),
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
    const ws = XLSX.utils.json_to_sheet(filteredData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads From Supplier");

    XLSX.writeFile(wb, "leads_from_supplier.xlsx");
  };
  return (
    <>
      <div className="px-6 pt-6 pb-16 flex flex-col gap-6">
        <h1 className="text-darkBlack font-medium text-[30px]">
          Lead List for Fiellheimhytta
        </h1>
        <div className="flex items-center justify-between">
          <div className="shadow-shadow1 border border-gray1 rounded-[8px] flex">
            <div
              className={`py-[10px] px-4 text-black2 font-medium text-sm cursor-pointer ${
                selectedDateRange === "12 måneder" && "bg-gray2"
              }`}
              onClick={() => setSelectedDateRange("12 måneder")}
            >
              12 måneder
            </div>
            <div
              className={`py-[10px] px-4 text-black2 font-medium text-sm border border-t-0 border-b-0 border-gray1 cursor-pointer ${
                selectedDateRange === "30 dager" && "bg-gray2"
              }`}
              onClick={() => setSelectedDateRange("30 dager")}
            >
              30 dager
            </div>
            <div
              className={`py-[10px] px-4 text-black2 font-medium text-sm cursor-pointer border-r border-gray1 ${
                selectedDateRange === "7 dager" && "bg-gray2"
              }`}
              onClick={() => setSelectedDateRange("7 dager")}
            >
              7 dager
            </div>
            <div
              className={`py-[10px] px-4 text-black2 font-medium text-sm cursor-pointer ${
                selectedDateRange === "24 timer" && "bg-gray2"
              }`}
              onClick={() => setSelectedDateRange("24 timer")}
            >
              24 timer
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <DatePickerComponent
              selectedDate={selectedDate1}
              onDateChange={setSelectedDate1}
              dateFormat="MM/dd/yyyy"
              placeholderText="Select dates"
              className="border border-gray1 rounded-[8px] flex gap-2 items-center py-[10px] px-4 cursor-pointer shadow-shadow1 h-[40px] w-max"
            />
            <div className="border border-gray1 rounded-[8px] flex gap-2 items-center py-[10px] px-4 cursor-pointer shadow-shadow1 h-[40px]">
              <img src={Ic_filter} alt="" />
              <span className="text-black font-medium text-sm">Filters</span>
            </div>
          </div>
        </div>
        <div className="mb-2 flex items-center justify-between bg-lightPurple rounded-[12px] py-3 px-4">
          <div className="flex items-center border border-gray1 shadow-shadow1 bg-[#fff] gap-2 rounded-lg py-[10px] px-[14px]">
            <img src={Ic_search} alt="search" />
            <input
              type="text"
              placeholder="Søk i leads"
              className="focus-within:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 items-center">
            <div
              className="border border-gray1 rounded-[8px] flex gap-2 items-center py-[10px] px-4 cursor-pointer shadow-shadow1 h-[40px] bg-[#fff]"
              onClick={downloadExcel}
            >
              <img src={Ic_download} alt="" />
              <span className="text-black font-medium text-sm">Eksporter</span>
            </div>
            <div className="border border-gray1 rounded-[8px] flex gap-2 items-center py-[10px] px-4 cursor-pointer shadow-shadow1 h-[40px] bg-[#fff]">
              <img src={Ic_filter} alt="" />
              <span className="text-black font-medium text-sm">Filter</span>
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
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
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
              ) : filteredData.length === 0 ? (
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
                      <TableCell key={cell.id} className="px-6 py-3">
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
