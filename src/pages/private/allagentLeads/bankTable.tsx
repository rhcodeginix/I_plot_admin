/* eslint-disable react-hooks/exhaustive-deps */
import { Eye, Loader2, Pencil, Trash } from "lucide-react";
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
import Ic_filter from "../../../assets/images/Ic_filter.svg";
import DateRangePicker from "../../../components/ui/daterangepicker";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../../components/common/button";
import Modal from "../../../components/common/modal";
import { fetchAdminDataByEmail } from "../../../lib/utils";

export const BankTable = () => {
  const [page, setPage] = useState(1);
  const [bankLead, setBankLead] = useState([]);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<any>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const currentPath = location.pathname;

  const [permission, setPermission] = useState<any>(null);
  const email = localStorage.getItem("Iplot_admin");

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();
      if (data) {
        const finalSupData = data?.supplier;
        setPermission(finalSupData);
      }
    };

    getData();
  }, []);

  const filteredData = useMemo(() => {
    return bankLead.filter((model: any) => {
      const modelDate = new Date(model.createdAt);

      if (startDate && endDate) {
        return modelDate >= startDate && modelDate <= endDate;
      }

      if (startDate && !endDate) {
        return modelDate >= startDate;
      }

      if (!startDate && endDate) {
        return modelDate <= endDate;
      }

      return true;
    });
  }, [bankLead, startDate, endDate]);

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "bank_leads", id));
      fetchBankLeadData();
      setShowConfirm(false);
      toast.success("Slettet", { position: "top-right" });
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const fetchBankLeadData = async () => {
    setIsLoading(true);

    try {
      // let q;
      // if (email === "andre.finger@gmail.com") {
      //   q = query(collection(db, "bank_leads"), orderBy("updatedAt", "desc"));
      // } else {
      //   q = query(
      //     collection(db, "bank_leads"),
      //     where("supplierId", "==", permission)
      //   );
      // }
      let q;

      if (currentPath === "/active-agent-leads") {
        q = query(
          collection(db, "bank_leads"),
          where("status", "==", "Approved")
        );
      } else {
        q = query(collection(db, "bank_leads"), orderBy("updatedAt", "desc"));
      }

      const querySnapshot = await getDocs(q);

      const data: any = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBankLead(data);
    } catch (error) {
      console.error("Error fetching bank lead data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBankLeadData();
  }, [permission, currentPath]);

  const handleConfirmPopup = () => {
    if (showConfirm) {
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  const confirmDelete = (id: string) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () =>
      [
        {
          accessorKey: "id",
          header: "Id",
          cell: ({ row }: any) => (
            <Link
              to={`/agent-leads-detail/${row.original?.id}`}
              className="text-sm text-darkBlack"
            >
              #{row.original?.id?.substring(0, 4)}...
            </Link>
          ),
        },
        {
          accessorKey: "name",
          header: "Navn",
          cell: ({ row }: any) => (
            <div className="flex items-center text-sm text-darkBlack w-max">
              {row.original?.Kunden?.Kundeinformasjon[0]?.f_name}{" "}
              {row.original?.Kunden?.Kundeinformasjon[0]?.l_name}
            </div>
          ),
        },
        {
          accessorKey: "Anleggsadresse",
          header: "Anleggsadresse",
          cell: ({ row }: any) => (
            <div className="flex items-center text-sm text-darkBlack w-max">
              {row.original?.plotHusmodell?.plot?.address}
            </div>
          ),
        },
        {
          accessorKey: "Forhandler",
          header: "Forhandler",
          cell: ({ row }: any) => (
            <div className="flex items-center text-sm text-darkBlack w-max">
              {/* {row.original?.Kunden?.Kundeinformasjon[0]?.EPost} */}
              BoligPartner
            </div>
          ),
        },
        {
          accessorKey: "Konsulent",
          header: "Konsulent",
          cell: ({ row }: any) => (
            <div className="flex items-center text-sm text-darkBlack w-max">
              {row.original?.createDataBy?.name}
            </div>
          ),
        },
        {
          accessorKey: "Lead sendt videre",
          header: "Lead sendt videre",
          cell: ({ row }: any) => (
            <p className="text-sm font-semibold text-black w-max">
              {row.original.createdAt}
            </p>
          ),
        },
        {
          accessorKey: "Tilbudspris",
          header: "Tilbudspris",
          cell: ({ row }: any) => {
            const plotData = row.original?.plotHusmodell?.plot;
            const houseData = row.original?.plotHusmodell?.house;

            function norwegianToNumber(str: any) {
              if (typeof str !== "string") return 0;
              return Number(str.replace(/\s/g, ""));
            }

            const sum =
              norwegianToNumber(plotData?.tomtekostnader) +
              norwegianToNumber(houseData?.byggekostnader);

            function numberToNorwegian(num: any) {
              return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            }

            return (
              <p className="text-sm font-semibold text-black w-max">
                {numberToNorwegian(sum)} NOK
              </p>
            );
          },
        },
        {
          accessorKey: "status",
          header: "Status",
          cell: ({ row }: any) => (
            <>
              {row.original.status === "Sent" ? (
                <p className="text-xs text-[#A27200] w-max bg-[#FFF6E0] py-0.5 px-2 rounded-[16px]">
                  {row.original.status}
                </p>
              ) : row.original.status === "Rejected" ? (
                <p className="text-xs text-[#A20000] w-max bg-[#FFE0E0] py-0.5 px-2 rounded-[16px]">
                  {row.original.status}
                </p>
              ) : row.original.status === "Approved" ? (
                <p className="text-xs text-[#00857A] bg-[#E0FFF5] w-max py-0.5 px-2 rounded-[16px]">
                  {row.original.status}
                </p>
              ) : (
                row.original.status === "In Process" && (
                  <p className="text-xs text-[#C84D00] bg-[#FFEAE0] w-max py-0.5 px-2 rounded-[16px]">
                    {row.original.status}
                  </p>
                )
              )}
            </>
          ),
        },
        {
          id: "action",
          header: "Action",
          cell: ({ row }: any) => (
            <>
              {currentPath === "/active-agent-leads" ? (
                <Eye
                  className="h-5 w-5 text-primary cursor-pointer"
                  onClick={() =>
                    navigate(`/agent-leads-detail/${row.original?.id}?step=2`)
                  }
                />
              ) : (
                <div className="flex items-center gap-3">
                  <Pencil
                    className="h-5 w-5 text-primary cursor-pointer"
                    onClick={() =>
                      navigate(`/edit-agent-leads/${row.original.id}`)
                    }
                  />
                  <Trash
                    className="h-5 w-5 text-primary cursor-pointer"
                    onClick={() => confirmDelete(row.original.id)}
                  />
                </div>
              )}
            </>
          ),
        },
      ].filter(Boolean) as ColumnDef<any>[],
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

  return (
    <>
      <div className="flex items-center justify-between bg-lightPurple rounded-[12px] py-3 px-4">
        <div className="hidden sm:block"></div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
            className="w-full"
          />
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
            className="px-[14px] py-2 rounded-lg disabled:opacity-50 shadow-shadow1 border border-gray1 text-black text-sm"
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

      {showConfirm && (
        <Modal onClose={handleConfirmPopup} isOpen={true}>
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-lg font-bold">
                Er du sikker på at du vil slette?
              </p>
              <div className="flex justify-center mt-5 w-full gap-5 items-center">
                <div
                  onClick={() => setShowConfirm(false)}
                  
                >
                  <Button
                    text="Avbryt"
                    className="border border-gray2 text-black text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                  />
                </div>
                <div onClick={() => handleDelete(selectedId)}>
                  <Button
                    text="Bekrefte"
                    className="border border-purple bg-purple text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
