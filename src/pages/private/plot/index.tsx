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

export const Plot = () => {
  const [page, setPage] = useState(1);
  const [plots, setPlots] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlotsData = async () => {
    setIsLoading(true);

    try {
      const querySnapshot = await getDocs(collection(db, "empty_plot"));
      const data: any = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPlots(data);
    } catch (error) {
      console.error("Error fetching plot data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return plots.filter((model: any) => {
      const addressData =
        model.CadastreDataFromApi?.presentationAddressApi?.response?.item
          ?.formatted;

      if (!addressData) return false;

      const line1 = addressData.line1?.toLowerCase() || "";
      const line2 = addressData.line2?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();

      return line1.includes(search) || line2.includes(search);
    });
  }, [plots, searchTerm]);

  useEffect(() => {
    fetchPlotsData();
  }, []);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "tomt_navn",
        header: "Tomt navn",
        cell: ({ row }) => {
          const address =
            row.original?.CadastreDataFromApi?.presentationAddressApi?.response
              ?.item?.formatted;
          return (
            <p className="font-semibold text-sm text-darkBlack w-max">
              {address?.line1} {address?.line2}
            </p>
          );
        },
      },
      {
        accessorKey: "kommunenummer",
        header: "Kommunenummer",
        cell: ({ row }) => (
          <p className="text-sm font-semibold text-black w-max">
            {row.original.lamdaDataFromApi?.searchParameters?.kommunenummer}
          </p>
        ),
      },
      {
        accessorKey: "bruksnummer",
        header: "Bruksnummer",
        cell: ({ row }) => (
          <p className="text-sm text-darkBlack w-max">
            {row.original.lamdaDataFromApi?.searchParameters?.bruksnummer}
          </p>
        ),
      },
      {
        accessorKey: "gardsnummer",
        header: "Gardsnummer",
        cell: ({ row }) => (
          <p className="text-sm text-darkBlack w-max">
            {row.original.lamdaDataFromApi?.searchParameters?.gardsnummer}
          </p>
        ),
      },
      {
        accessorKey: "plot_size",
        header: "Plot size",
        cell: ({ row }) => (
          <div>
            <p className="text-black text-sm mb-[2px] w-max">
              {
                row.original.additionalData?.answer?.bya_calculations?.input
                  ?.plot_size
              }
            </p>
          </div>
        ),
      },
      {
        accessorKey: "view_count",
        header: "Antall eiendomsvisninger",
        cell: ({ row }) => (
          <div>
            <p className="text-black text-sm mb-[2px] w-max">
              {row.original.view_count || 0}
            </p>
          </div>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <Eye
            className="h-5 w-5 text-primary cursor-pointer"
            onClick={() => navigate(`/se-plot/${row.original.id}`)}
          />
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
      <div className="p-4 md:px-6 pt-6 pb-16 flex flex-col gap-4 md:gap-6">
        <h1 className="text-darkBlack font-medium text-xl md:text-2xl desktop:text-[30px]">
          Alle tomter
        </h1>
        <div>
          <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between bg-lightGreen rounded-[12px] py-3 px-3 md:px-4 gap-2">
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
