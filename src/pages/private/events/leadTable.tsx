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
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { fetchAdminData, formatDateTime } from "../../../lib/utils";
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
        collection(db, "projects"),
        where("placeOrder", "==", true),
        where("is_deleted", "==", false)
      );
      const querySnapshot = await getDocs(q);

      const data: any = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a: any, b: any) => {
          const dateA = a.createdAt?.toDate
            ? a.createdAt.toDate()
            : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate
            ? b.createdAt.toDate()
            : new Date(b.createdAt);
          return dateB - dateA;
        });

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

  const fetchUserData = async (id: string) => {
    if (!id) return null;

    try {
      const officeData = await fetchAdminData(id);
      if (officeData) {
        return officeData;
      }
      return null;
    } catch (error) {
      console.error("Error fetching office data:", error);
      return null;
    }
  };

  const fetchTagData = async (id: string) => {
    if (!id) return null;

    try {
      const officeQuery = query(
        collection(db, "housemodell_configure_broker"),
        where("id", "==", id)
      );

      const querySnapshot = await getDocs(officeQuery);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
        };
      }

      return null;
    } catch (error) {
      console.error("Error fetching tag data:", error);
      return null;
    }
  };

  const [filteredData, setFilteredData] = useState<any[]>([]);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);

        const categoryIds = new Set<string>();
        const userIds = new Set<string>();

        for (const item of RoomConfigurator) {
          if (item?.category_id) categoryIds.add(item.category_id);
          if (item?.created_by) userIds.add(item.created_by);
        }

        const fetchTags = async () => {
          const result: Record<string, any> = {};
          await Promise.all(
            Array.from(categoryIds).map(async (id) => {
              const tag = await fetchTagData(id);
              if (tag) result[id] = tag;
            })
          );
          return result;
        };

        const fetchUsers = async () => {
          const result: Record<string, any> = {};
          await Promise.all(
            Array.from(userIds).map(async (id) => {
              const user = await fetchUserData(id);
              if (user) result[id] = user;
            })
          );
          return result;
        };

        const [tagMap, userMap] = await Promise.all([
          fetchTags(),
          fetchUsers(),
        ]);

        const allKunder = RoomConfigurator.map((item: any) => {
          const tagData = item?.category_id ? tagMap[item.category_id] : null;
          const userData = item?.created_by ? userMap[item.created_by] : null;

          return {
            ...item,
            husmodell_name: item?.VelgSerie || tagData?.husmodell_name || null,
            parentId: item.category_id,
            createDataBy: userData || null,
            tag: tagData?.tag || null,
            placeOrder: item?.placeOrder || false,
            configurator:
              item?.Plantegninger?.length > 0
                ? item.Plantegninger.some((room: any) => !room.configurator)
                : true,
            createdAt: item?.createdAt || item?.createdAt || null,
            kundeId: item?.uniqueId,
            id: item?.uniqueId,
            self_id: item?.self_id,
            name: item?.name,
          };
        });

        const filtered = allKunder.filter((kunde: any) => {
          const matchesSearch =
            !searchTerm ||
            kunde.Kundenavn?.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesOffice =
            !officeFilter ||
            officeFilter === "All" ||
            kunde?.office_id === officeFilter;
          return matchesSearch && matchesOffice;
        });

        const sorted = filtered.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        setFilteredData(sorted);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getData();
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
            {row.original?.createDataBy?.f_name
              ? `${row.original?.createDataBy?.f_name} ${row.original?.createDataBy?.l_name}`
              : row.original?.createDataBy?.name}
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
            {formatDateTime(row.original?.createdAt)}
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
          <div className="mb-2 flex gap-2 flex-col lg:flex-row lg:items-center justify-between bg-lightGreen rounded-[12px] py-3 px-4">
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
                        const url = `https://boligkonfigurator.mintomt.no/Room-Configurator/${row.original?.parentId}/${row.original?.self_id}`;

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
