/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
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
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import {
  convertTimestamp,
  fetchAdminDataByEmail,
  fetchSupplierData,
} from "../../../lib/utils";
// import NorkartMap from "../../../components/map";
import { useNavigate } from "react-router-dom";
import GoogleMapComponent from "../../../components/ui/map";

export const BankleadsTable = () => {
  const [page, setPage] = useState(1);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const email = localStorage.getItem("Iplot_admin");
  const [permission, setPermission] = useState<any>(null);
  const [role, setRole] = useState<any>(null);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();
      if (data) {
        if (data?.role) {
          setRole(data?.role);
        }
        const finalData = data?.supplier;
        setPermission(finalData);
      }
    };

    getData();
  }, [permission]);

  const fetchLeadsData = async () => {
    setIsLoading(true);

    try {
      let leadBankTrue;
      if (email === "andre.finger@gmail.com" || role === "Admin") {
        leadBankTrue = query(
          collection(db, "leads"),
          where("IsoptForBank", "==", true)
        );
      } else {
        leadBankTrue = query(
          collection(db, "leads"),
          where("IsoptForBank", "==", true),
          where(
            "finalData.husmodell.Husdetaljer.Leverandører",
            "==",
            String(permission)
          )
        );
      }
      const querySnapshot = await getDocs(leadBankTrue);

      const data: any = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sortedData = data.sort((a: any, b: any) => {
        return b.updatedAt.toDate() - a.updatedAt.toDate();
      });
      const excludedEmails = [
        "drashti.doubledotts@gmail.com",
        "abc@gmail.com",
        "keren@arnhoff.no",
        "simen@askerhaandverk.no",
        "ole@nestegg.no",
        "fenger@iplot.no",
        "drashtisavani22@gmail.com",
        "rudraksh.shukla98@gmail.com",
        "tanmaymundra01@gmail.com",
      ];
      const finalData = sortedData.filter((a: any) => {
        return a?.user?.email && !excludedEmails.includes(a.user.email);
      });

      setLeads(finalData);
    } catch (error) {
      console.error("Error fetching leads data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return leads.filter((model: any) =>
      model.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leads, searchTerm]);

  useEffect(() => {
    fetchLeadsData();
  }, [permission]);

  const pageSize = 10;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [page, filteredData]);

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
          <div className="flex items-start gap-3 w-max">
            <div className="w-8 h-8 rounded-full border border-gray1 bg-gray3 flex items-center justify-center">
              {row.original.user.name[0]}
            </div>
            <div>
              <p className="font-medium text-black text-sm mb-[2px]">
                {row.original.user.name}
              </p>
              <p className="text-xs text-gray">{row.original.user.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "husmodell",
        header: "Husmodell",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 w-max">
            <img
              src={row.original.finalData.husmodell.Husdetaljer.photo}
              alt="Husmodell"
              className="w-8 h-8 rounded-full"
            />
            <p className="font-medium text-sm text-darkBlack">
              {row.original.finalData.husmodell.Husdetaljer.husmodell_name}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "leverandor",
        header: "Leverandør",
        cell: ({ row }) => {
          const [leverandorData, setLeverandorData] = useState<any>(null);

          useEffect(() => {
            const fetchData = async () => {
              const data = await getData(
                row.original.finalData.husmodell.Husdetaljer.Leverandører
              );
              setLeverandorData(data);
            };
            fetchData();
          }, [row.original.finalData.husmodell.Husdetaljer.Leverandører]);

          return (
            <div className="w-[140px]">
              <img
                src={leverandorData?.photo}
                alt="leverandor"
                className="w-full"
              />
            </div>
          );
        },
      },
      {
        accessorKey: "adresse",
        header: "Adresse",
        cell: ({ row }) => (
          <>
            {row.original.finalData?.plot ? (
              <div className="flex items-start gap-3 w-max">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {row.original.finalData?.plot?.lamdaDataFromApi?.coordinates
                    ?.convertedCoordinates && (
                    // <NorkartMap
                    //   coordinates={
                    //     row.original.finalData?.plot?.lamdaDataFromApi
                    //       ?.coordinates?.convertedCoordinates
                    //   }
                    // />
                    <GoogleMapComponent
                      coordinates={
                        row.original.finalData?.plot?.lamdaDataFromApi
                          ?.coordinates?.convertedCoordinates
                      }
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium text-black text-sm mb-[2px]">
                    {
                      row.original.finalData?.plot?.CadastreDataFromApi
                        ?.presentationAddressApi.response.item.formatted.line1
                    }
                  </p>
                  <p className="text-xs text-gray">
                    {
                      row.original.finalData?.plot?.CadastreDataFromApi
                        ?.presentationAddressApi.response.item.formatted.line2
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="px-9">-</div>
            )}
          </>
        ),
      },
      {
        accessorKey: "leadSent",
        header: "Lead sendt",
        cell: ({ row }) => (
          <p className="text-sm font-semibold text-black w-max">
            {convertTimestamp(
              row.original.updatedAt?.seconds,
              row.original.updatedAt?.nanoseconds
            )}
          </p>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Eye
              className="h-5 w-5 text-primary cursor-pointer"
              onClick={() => navigate(`/se-bankleads/${row.original.id}`)}
            />
          </div>
        ),
      },
    ],
    []
  );

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
      <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between bg-lightGreen rounded-[12px] py-3 px-2 gap-2 md:px-4">
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
              table.getRowModel().rows.map((row: any) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/se-bankleads/${row.original.id}`)}
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
    </>
  );
};
