import { Eye, Loader2 } from "lucide-react";
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
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { convertTimestamp } from "../../../lib/utils";

export const Users = () => {
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const fetchUsersData = async () => {
    setIsLoading(true);

    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const data: any = await Promise.all(
        querySnapshot.docs.map(async (userDoc) => {
          const propertiesCollectionRef = collection(
            db,
            "users",
            userDoc.id,
            "property"
          );
          const propertiesSnapshot = await getDocs(propertiesCollectionRef);

          return {
            id: userDoc.id,
            ...userDoc.data(),
            propertyCount: propertiesSnapshot.size,
          };
        })
      );

      setUsers(data);
    } catch (error) {
      console.error("Error fetching users data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return users.filter((model: any) => {
      const name = model?.name?.toLowerCase() || "";
      return name.includes(searchTerm.toLowerCase());
    });
  }, [users, searchTerm]);

  useEffect(() => {
    fetchUsersData();
  }, []);

  const getSortableValue = (row: any, column: string) => {
    let val = row;

    switch (column) {
      case "Navn": {
        const value = val?.name || val?.f_name || val?.l_name;
        if (value === null || value === undefined) return "";
        if (typeof value === "string") return value.toLowerCase();
        if (typeof value === "number") return value;
        return value ?? "";
      }
      case "E-post":
        if (val?.email === null || val?.email === undefined) return "";
        if (typeof val?.email === "string") return val?.email.toLowerCase();
        if (typeof val?.email === "number") return val?.email;
        return val?.email ?? "";
      case "Søk Eiendom Count":
        if (val?.propertyCount === null || val?.propertyCount === undefined)
          return 0;
        if (typeof val?.propertyCount === "string")
          return val?.propertyCount.toLowerCase();
        if (typeof val?.propertyCount === "number") return val?.propertyCount;
        return val?.propertyCount ?? "";
      case "Date registrated": {
        const createdAt = val?.createdAt;
        const date = convertTimestamp(
          createdAt?.seconds,
          createdAt?.nanoseconds
        );

        return date ?? 0;
      }
      case "OppdatertKlokke": {
        const updatedAt = val?.updatedAt;
        const date = convertTimestamp(
          updatedAt?.seconds,
          updatedAt?.nanoseconds
        );

        return date ?? 0;
      }
      case "Antall pålogginger":
        if (val?.loginCount === null || val?.loginCount === undefined) return 0;
        if (typeof val?.loginCount === "string")
          return val?.loginCount.toLowerCase();
        if (typeof val?.loginCount === "number") return val?.loginCount;
        return val?.loginCount ?? "";
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
  }, [filteredData, sortColumn, sortDirection]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "Navn",
        header: "Navn",
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-3 w-max">
              <div className="w-9 h-9 rounded-full flex items-center justify-center border-gray1 border bg-gray3">
                {row.original.name[0]}
              </div>
              <p className="font-medium text-black text-sm mb-[2px]">
                {row.original.name}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "E-post",
        header: "E-post",
        cell: ({ row }) => (
          <p className="text-sm text-gray">{row.original.email}</p>
        ),
      },
      {
        accessorKey: "Søk Eiendom Count",
        header: "Søk Eiendom Count",
        cell: ({ row }) => (
          <p className="text-sm text-darkBlack">
            {row.original?.propertyCount}
          </p>
        ),
      },
      {
        accessorKey: "Date registrated",
        header: "Date registrated",
        cell: ({ row }) => (
          <p className="text-sm font-semibold text-black">
            {row.original.createdAt
              ? convertTimestamp(
                  row.original.createdAt?.seconds,
                  row.original.createdAt?.nanoseconds
                )
              : "-"}
          </p>
        ),
      },
      {
        accessorKey: "OppdatertKlokke",
        header: "OppdatertKlokke",
        cell: ({ row }) => (
          <p className="text-sm font-semibold text-black">
            {row.original.updatedAt
              ? convertTimestamp(
                  row.original.updatedAt?.seconds,
                  row.original.updatedAt?.nanoseconds
                )
              : "-"}
          </p>
        ),
      },
      {
        accessorKey: "Antall pålogginger",
        header: "Antall pålogginger",
        cell: ({ row }) => (
          <p className="text-sm text-darkBlack">
            {row.original?.loginCount ? row.original?.loginCount : 0}
          </p>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <>
            <div className="flex items-center justify-center gap-3">
              <Eye
                className="h-5 w-5 text-primary cursor-pointer"
                onClick={() => navigate(`/se-user/${row.original.id}`)}
              />
            </div>
          </>
        ),
      },
    ],
    [navigate]
  );

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
  return (
    <>
      <div className="px-4 md:px-6 pt-6 pb-16 flex flex-col gap-4 md:gap-6">
        <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
          Alle brukere
        </h1>
        <div>
          <div className="mb-2 flex items-center justify-between bg-lightPurple rounded-[12px] py-3 px-4">
            <div className="flex items-center border border-gray1 shadow-shadow1 bg-[#fff] gap-2 rounded-lg py-[10px] px-[14px]">
              <img src={Ic_search} alt="search" />
              <input
                type="text"
                placeholder="Søk"
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
                      <TableHead key={header.id} className="h-8 text-sm">
                        {/* {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )} */}
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
      </div>
    </>
  );
};
