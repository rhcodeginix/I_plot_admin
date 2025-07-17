/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { Loader2 } from "lucide-react";
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
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import {
  fetchAdminData,
  formatDateOnly,
  formatDateTime,
} from "../../../lib/utils";
import { useNavigate } from "react-router-dom";
import DatePickerComponent from "../../../components/ui/datepicker";
import { calculateDateRange } from "../myLeads/leads";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

export const PDFTable = () => {
  const [page, setPage] = useState(1);
  const [RoomConfigurator, setRoomConfigurator] = useState<any>([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate1, setSelectedDate1] = useState<Date | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<string | null>(
    null
  );

  const fetchRoomConfiguratorData = async () => {
    setIsLoading(true);
    try {
      let q = query(
        collection(db, "boligconfigurator_count"),
        where("type", "==", "PDF")
      );
      const querySnapshot = await getDocs(q);

      const data: any = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRoomConfigurator(data);
    } catch (error) {
      console.error("Error fetching husmodell data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomConfiguratorData();
  }, []);

  const [officeFilter, setOfficeFilter] = useState("All");

  const [offices, setOffices] = useState([]);

  const fetchOfficeData = async () => {
    try {
      let querySnapshot = await getDocs(collection(db, "office"));

      const data: any = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOffices(data);
    } catch (error) {
      console.error("Error fetching husmodell data:", error);
    }
  };

  useEffect(() => {
    fetchOfficeData();
  }, []);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const getData = async (id: string) => {
    const data = await fetchAdminData(id);
    if (data) {
      return data;
    }
    return null;
  };

  useEffect(() => {
    const filterDataAsync = async () => {
      setIsLoading(true);
      const result: any[] = [];

      for (const model of RoomConfigurator) {
        const date = new Date(model?.timeStamp);
        const modalDate = date?.toISOString().split("T")[0];

        let office: any = null;
        if (model?.created_by) {
          const data = await getData(model?.created_by);
          office = data?.office;
        }

        if (selectedDate1 !== null) {
          if (modalDate !== formatDateOnly(selectedDate1)) continue;
        }

        if (officeFilter && officeFilter !== "All" && office !== officeFilter) {
          continue;
        }

        if (selectedDateRange !== null) {
          const { startDate, endDate }: any =
            calculateDateRange(selectedDateRange);
          const isWithinDateRange =
            modalDate >= startDate && modalDate <= endDate;
          if (!isWithinDateRange) continue;
        }

        result.push(model);
      }

      setIsLoading(false);
      setFilteredData(result);
    };

    filterDataAsync();
  }, [RoomConfigurator, selectedDate1, selectedDateRange, officeFilter]);

  const fetchDocumentData = async (id: string) => {
    try {
      if (id) {
        const supplierDocRef = doc(db, "room_configurator", id);
        const docSnap = await getDoc(supplierDocRef);

        if (docSnap.exists()) {
          return docSnap.data();
        }
      }
    } catch (error) {
      console.error("Error fetching supplier data:", error);
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "Prosjektnavn",
        header: "Prosjektnavn",
        cell: ({ row }) => {
          const [docData, setDocData] = useState<any>(null);

          useEffect(() => {
            const fetchData = async () => {
              const data = await fetchDocumentData(row.original?.document_id);
              setDocData(data);
            };
            fetchData();
          }, [row.original?.document_id]);

          return (
            <p className="text-sm font-medium text-black w-max">
              {docData?.name ?? "-"}
            </p>
          );
        },
      },
      {
        accessorKey: "Anleggsadresse",
        header: "Anleggsadresse",
        cell: ({ row }) => {
          const [docData, setDocData] = useState<any>(null);

          useEffect(() => {
            const fetchData = async () => {
              const data = await fetchDocumentData(row.original?.document_id);
              setDocData(data);
            };
            fetchData();
          }, [row.original?.document_id]);

          return (
            <p className="text-sm font-medium text-black w-max">
              {docData?.Anleggsadresse}
            </p>
          );
        },
      },
      {
        accessorKey: "created_by",
        header: "Boligkonsulent",
        cell: ({ row }) => {
          const [adminData, setAdminData] = useState<any>(null);

          useEffect(() => {
            const fetchData = async () => {
              const data = await getData(row.original?.created_by);
              setAdminData(data);
            };
            fetchData();
          }, [row.original?.created_by]);

          return (
            <p className="text-sm font-medium text-black w-max">
              {adminData?.f_name
                ? `${adminData?.f_name} ${adminData?.l_name}`
                : adminData?.name}
            </p>
          );
        },
      },
      {
        accessorKey: "timeStamp",
        header: "Opprett på",
        cell: ({ row }) => (
          <p className="text-sm font-medium text-black w-max">
            {formatDateTime(row.original?.timeStamp)}
          </p>
        ),
      },
    ],
    [navigate]
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

  return (
    <>
      <div className="px-4 md:px-6 pt-6 pb-16 flex flex-col gap-4 md:gap-6">
        <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
          PDF
        </h1>
        <div>
          <div className="w-[300px] ml-auto mb-4">
            <Select
              onValueChange={(value) => {
                setOfficeFilter(value);
              }}
              value={officeFilter}
            >
              <SelectTrigger
                className={`bg-white rounded-[8px] border text-black border-gray1`}
              >
                <SelectValue placeholder="Enter Type partner" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectGroup>
                  <SelectItem value={"All"}>All</SelectItem>
                  {offices.map((log: any, index) => (
                    <SelectItem value={log?.id} key={index}>
                      {log?.data?.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="mb-6 flex lg:items-center flex-col lg:flex-row gap-2 justify-between">
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
          <div className="rounded-lg border border-gray2 shadow-shadow2 overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup: any) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header: any) => (
                      <TableHead
                        key={header.id}
                        className="h-8 text-sm whitespace-nowrap"
                      >
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
      </div>
    </>
  );
};
