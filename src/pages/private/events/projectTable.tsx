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

export const ProjectTable = () => {
  const [page, setPage] = useState(1);
  const [houseModels, setHouseModels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("");

  const [activeTab, setActiveTab] = useState<"Bolig" | "Hytte" | "Prosjekt">(
    "Bolig"
  );

  const fetchHusmodellData = async () => {
    setIsLoading(true);
    try {
      let q = query(
        collection(db, "housemodell_configure_broker"),
        orderBy("updatedAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const data: any = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHouseModels(data);
    } catch (error) {
      console.error("Error fetching husmodell data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHusmodellData();
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
    const fetchFilteredData = async () => {
      setIsLoading(true);

      const results: any[] = [];

      for (const item of houseModels as any) {
        let office: any = null;

        if (item?.createDataBy?.email) {
          try {
            const q = query(
              collection(db, "admin"),
              where("email", "==", item?.createDataBy?.email)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              office = querySnapshot.docs[0].data().office;
            }
          } catch (error) {
            console.error("Error fetching admin data:", error);
          }
        }

        if (
          item?.KundeInfo &&
          Array.isArray(item.KundeInfo) &&
          item.KundeInfo.length > 0
        ) {
          const filteredKunder = item.KundeInfo.map((kunde: any) => {
            return {
              ...kunde,
              photo: item.photo || null,
              husmodell_name: kunde?.VelgSerie || item?.husmodell_name || null,
              parentId: item.id,
              createDataBy: item?.createDataBy || null,
              tag: item?.tag || null,
              placeOrder: item?.placeOrder || false,
              configurator:
                kunde?.Plantegninger &&
                kunde.Plantegninger.length > 0 &&
                kunde.Plantegninger.some((room: any) => !room.configurator)
                  ? false
                  : true,
            };
          }).filter((kunde: any) => {
            const matchesSearch =
              !searchTerm ||
              kunde.Kundenavn?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter =
              !selectedFilter ||
              selectedFilter === "" ||
              kunde.husmodell_name === selectedFilter;
            const ofcFilter =
              !officeFilter ||
              officeFilter === "All" ||
              office === officeFilter;
            const matchesTypeProsjekt =
              !activeTab ||
              kunde.tag?.toLowerCase() === activeTab.toLowerCase();

            return (
              matchesSearch && matchesFilter && matchesTypeProsjekt && ofcFilter
            );
          });

          results.push(...filteredKunder);
        }
      }
      setIsLoading(false);

      setFilteredData(results);
    };

    fetchFilteredData();
  }, [houseModels, searchTerm, selectedFilter, activeTab, officeFilter]);

  const columns = useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        accessorKey: "Kundenavn",
        header: "Kundenavn",
        cell: ({ row }) => (
          <p className="text-sm font-medium text-black w-max">
            {row.original?.Kundenavn}
          </p>
        ),
      },
      {
        accessorKey: "Anleggsadresse",
        header: "Anleggsadresse",
        cell: ({ row }) => (
          <p className="text-sm font-medium text-black w-max">
            {row.original?.Anleggsadresse}
          </p>
        ),
      },
      {
        accessorKey: "Kundenummer",
        header: "BP prosjektnummer",
        cell: ({ row }) => (
          <p className="text-sm font-medium text-black w-max">
            {row.original?.Kundenummer}
          </p>
        ),
      },
      {
        accessorKey: "Boligkonsulent",
        header: "Boligkonsulent",
        cell: ({ row }) => (
          <p className="text-sm font-medium text-black w-max">
            {row.original?.createDataBy?.name}
          </p>
        ),
      },
      {
        accessorKey: "TypeProsjekt",
        header: "TypeProsjekt",
        cell: ({ row }) => (
          <p className="text-sm font-medium text-black w-max">
            {row.original?.TypeProsjekt ?? "-"}
          </p>
        ),
      },
      {
        accessorKey: "Status",
        header: "Status",
        cell: ({ row }) => (
          <>
            {row.original?.placeOrder ? (
              <p className="text-sm font-medium text-green w-max bg-lightGreen py-1 px-2 rounded-full">
                Overført til oppmelding
              </p>
            ) : row.original?.configurator ? (
              <p className="text-sm font-medium text-primary w-max bg-lightPurple py-1 px-2 rounded-full">
                Ferdig konfiguert
              </p>
            ) : (
              <p className="text-sm font-medium text-black w-max bg-gray2 py-1 px-2 rounded-full">
                Under behandling
              </p>
            )}
          </>
        ),
      },
      {
        accessorKey: "sisteoppdatertav",
        header: "Siste oppdatert av",
        cell: ({ row }) => (
          <p className="text-sm font-medium text-black w-max">
            {formatDateTime(row.original?.updatedAt)}
          </p>
        ),
      },
    ];

    if (activeTab !== "Prosjekt") {
      baseColumns.splice(3, 0, {
        accessorKey: "Serienavn",
        header: "Serienavn",
        cell: ({ row }) => (
          <p className="text-sm font-medium text-black w-max">
            {row.original?.husmodell_name}
          </p>
        ),
      });
    }

    return baseColumns;
  }, [navigate, activeTab]);

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
          Prosjekter
        </h1>
        <div>
          <div className="mb-5 flex justify-center">
            <div className="flex gap-1.5">
              {["Bolig", "Hytte", "Prosjekt"].filter(Boolean).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab as "Bolig" | "Hytte" | "Prosjekt");
                    setSelectedFilter("");
                    setPage(1);
                  }}
                  className={`px-2 md:px-4 py-2 text-sm font-medium ${
                    activeTab === tab
                      ? "border-b-2 border-purple text-purple"
                      : "text-gray-500"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
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
            <div className="shadow-shadow1 border border-gray1 rounded-[8px] flex flex-col sm:flex-row overflow-hidden sm:w-max">
              {activeTab !== "Prosjekt" && (
                <div
                  className={`p-2.5 md:py-3 md:px-4 text-black2 font-medium text-[13px] sm:text-sm border-b sm:border-b-0 sm:border-r border-gray1 cursor-pointer ${
                    selectedFilter === "" && "bg-white"
                  }`}
                  onClick={() => {
                    setPage(1);
                    setSelectedFilter("");
                  }}
                >
                  Alle
                </div>
              )}
              {activeTab === "Bolig" && (
                <div
                  className={`p-2.5 md:py-3 md:px-4 text-black2 font-medium text-[13px] sm:text-sm cursor-pointer ${
                    selectedFilter === "Nostalgi" && "bg-white"
                  }`}
                  onClick={() => {
                    setPage(1);
                    setSelectedFilter("Nostalgi");
                  }}
                >
                  Nostalgi
                </div>
              )}
              {activeTab === "Hytte" && (
                <div
                  className={`p-2.5 md:py-3 md:px-4 text-black2 font-medium text-[13px] sm:text-sm cursor-pointer ${
                    selectedFilter === "Karakter" && "bg-white"
                  }`}
                  onClick={() => {
                    setPage(1);
                    setSelectedFilter("Karakter");
                  }}
                >
                  Karakter
                </div>
              )}
              {activeTab === "Bolig" && (
                <div
                  className={`p-2.5 md:py-3 md:px-4 text-black2 font-medium text-[13px] sm:text-sm border-b border-t sm:border-t-0 sm:border-b-0 sm:border-r sm:border-l border-gray1 cursor-pointer ${
                    selectedFilter === "Herskapelig" && "bg-white"
                  }`}
                  onClick={() => {
                    setPage(1);
                    setSelectedFilter("Herskapelig");
                  }}
                >
                  Herskapelig
                </div>
              )}
              {activeTab === "Hytte" && (
                <div
                  className={`p-2.5 md:py-3 md:px-4 text-black2 font-medium text-[13px] sm:text-sm border-b border-t sm:border-t-0 sm:border-b-0 sm:border-r sm:border-l border-gray1 cursor-pointer ${
                    selectedFilter === "Tur" && "bg-white"
                  }`}
                  onClick={() => {
                    setSelectedFilter("Tur");
                    setPage(1);
                  }}
                >
                  Tur
                </div>
              )}
              {activeTab !== "Prosjekt" && (
                <div
                  className={`p-2.5 md:py-3 md:px-4 text-black2 font-medium text-[13px] sm:text-sm cursor-pointer border-b sm:border-b-0 sm:border-r border-gray1 ${
                    selectedFilter === "Moderne" && "bg-white"
                  }`}
                  onClick={() => {
                    setPage(1);
                    setSelectedFilter("Moderne");
                  }}
                >
                  Moderne
                </div>
              )}
              {activeTab === "Bolig" && (
                <div
                  className={`p-2.5 md:py-3 md:px-4 text-black2 font-medium text-[13px] sm:text-sm cursor-pointer ${
                    selectedFilter === "Funkis" && "bg-white"
                  }`}
                  onClick={() => {
                    setPage(1);
                    setSelectedFilter("Funkis");
                  }}
                >
                  Funkis
                </div>
              )}
              {activeTab === "Hytte" && (
                <div
                  className={`p-2.5 md:py-3 md:px-4 text-black2 font-medium text-[13px] sm:text-sm cursor-pointer ${
                    selectedFilter === "V-serie" && "bg-white"
                  }`}
                  onClick={() => {
                    setPage(1);
                    setSelectedFilter("V-serie");
                  }}
                >
                  V-serie
                </div>
              )}
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
                        const url = `https://boligkonfigurator.mintomt.no/se-series/${row.original.parentId}/edit-husmodell/${row.original?.uniqueId}`;

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
