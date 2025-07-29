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
import Ic_search from "../../../assets/images/Ic_search.svg";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { formatDateTime } from "../../../lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
export const LeadTable = () => {
  const [page, setPage] = useState(1);
  const [RoomConfigurator, setRoomConfigurator] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoomConfiguratorData = async () => {
    setIsLoading(true);
    try {
      let q = query(
        collection(db, "room_configurator"),
        orderBy("updatedAt", "desc")
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

  useEffect(() => {
    setIsLoading(true);
    const fetchFilteredModels = async () => {

      const results: any[] = [];

      for (const model of RoomConfigurator) {
        let office: any = null;

        if (model?.createDataBy?.email) {
          try {
            const q = query(
              collection(db, "admin"),
              where("email", "==", model.createDataBy.email)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              office = querySnapshot.docs[0].data().office;
            }
          } catch (error) {
            console.error("Error fetching admin data:", error);
          }
        }

        const matchesSearch = model.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

        const matchesOffice =
          !officeFilter || officeFilter === "All" || office === officeFilter;

        if (matchesSearch && matchesOffice) {
          results.push(model);
        }
      }

      setIsLoading(false);
      setFilteredData(results);
    };

    fetchFilteredModels();
  }, [RoomConfigurator, searchTerm, officeFilter]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "Navn",
        header: "Navn",
        cell: ({ row }) => (
          <div className="flex gap-2 items-center justify-between">
            <p className="text-sm font-medium text-black w-max">
              {row.original?.name}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "Kundenavn",
        header: "Kundenavn",
        cell: ({ row }) => (
          <div className="flex gap-2 items-center justify-between">
            <p className="text-sm font-medium text-black w-max">
              {row.original?.Kundenavn ??
                row.original?.Prosjektdetaljer?.Tiltakshaver ??
                "-"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "Anleggsadresse",
        header: "Anleggsadresse",
        cell: ({ row }) => (
          <p className="text-sm font-medium text-black w-max">
            {row.original?.Anleggsadresse ??
              row.original?.Prosjektdetaljer?.Byggeadresse ??
              "-"}
          </p>
        ),
      },
      {
        accessorKey: "Kundenummer",
        header: "BP prosjektnummer",
        cell: ({ row }) => (
          <p className="text-sm font-medium text-black w-max">
            {row.original?.Kundenummer ??
              row.original?.Prosjektdetaljer?.Kundenr ??
              "-"}
          </p>
        ),
      },
      {
        accessorKey: "Boligkonsulent",
        header: "Boligkonsulent",
        cell: ({ row }) => (
          <p className="text-sm font-medium text-black w-max">
            {row.original?.createDataBy?.name ?? "-"}
          </p>
        ),
      },
      {
        accessorKey: "Serienavn",
        header: "Serienavn",
        cell: ({ row }) => (
          <div className="flex gap-2 items-center justify-between">
            <p className="text-sm font-medium text-black w-max">
              {row.original?.husmodell_name ??
                row.original?.Prosjektdetaljer?.VelgSerie ??
                "-"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "TypeProsjekt",
        header: "TypeProsjekt",
        cell: ({ row }) => (
          <p className="text-sm font-medium text-black w-max">
            {row.original?.TypeProsjekt ??
              row.original?.Prosjektdetaljer?.TypeProsjekt ??
              "-"}
          </p>
        ),
      },
      {
        accessorKey: "sisteoppdatertav",
        header: "Sist oppdatert",
        cell: ({ row }) => (
          <p className="text-sm font-medium text-black w-max">
            {formatDateTime(row.original?.updatedAt)}
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
          Leads
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
          <div className="mb-2 flex gap-2 flex-col lg:flex-row lg:items-center justify-between bg-lightPurple rounded-[12px] py-3 px-4">
            <div className="flex items-center border border-gray1 shadow-shadow1 bg-[#fff] gap-2 rounded-lg py-[10px] px-[14px]">
              <img src={Ic_search} alt="search" />
              <input
                type="text"
                placeholder="Søk etter lead"
                className="focus-within:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => {
                        const url = `https://boligkonfigurator.mintomt.no/Room-Configurator/${row.original?.id}`;

                        const currIndex = 0;
                        const currVerticalIndex = 1;
                        localStorage.setItem(
                          "currIndexBolig",
                          currIndex.toString()
                        );
                        localStorage.setItem(
                          "currVerticalIndex",
                          currVerticalIndex.toString()
                        );

                        window.open(url, "_blank");
                      }}
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
