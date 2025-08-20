/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
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
import DateRangePicker from "../../../components/ui/daterangepicker";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../../components/common/button";
import Modal from "../../../components/common/modal";
import {
  fetchAdminData,
  fetchAdminDataByEmail,
  fetchSupplierData,
} from "../../../lib/utils";

export const BankTable = () => {
  const [page, setPage] = useState(1);
  const [bankLead, setBankLead] = useState([]);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<any>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [supplierMap, setSupplierMap] = useState<Record<string, any>>({});
  const [adminMap, setAdminMap] = useState<Record<string, any>>({});

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
      let q;

      if (status === "Active") {
        q = query(
          collection(db, "bank_leads"),
          where("status", "==", "Approved")
        );
      } else {
        q = query(collection(db, "bank_leads"));
      }

      const querySnapshot = await getDocs(q);

      const data: any = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const norwegianMonths: { [key: string]: string } = {
        januar: "January",
        februar: "February",
        mars: "March",
        april: "April",
        mai: "May",
        juni: "June",
        juli: "July",
        august: "August",
        september: "September",
        oktober: "October",
        november: "November",
        desember: "December",
      };
      const parseNorwegianDate = (dateStr: string): Date => {
        const parts = dateStr.toLowerCase().split(" ");
        if (parts.length !== 3) return new Date(dateStr);

        const [day, norwegianMonth, year] = parts;
        const englishMonth = norwegianMonths[norwegianMonth] || norwegianMonth;
        return new Date(`${day} ${englishMonth} ${year}`);
      };

      const sortedData = data.sort((a: any, b: any) => {
        const dateA = parseNorwegianDate(a.updatedAt);
        const dateB = parseNorwegianDate(b.updatedAt);
        return dateB.getTime() - dateA.getTime();
      });

      setBankLead(sortedData);

      const supplierIds = sortedData
        .map((b: any) => b.Kunden?.Kundeinformasjon[0]?.supplier)
        .filter(Boolean);
      const supplierDataMap: Record<string, any> = {};
      await Promise.all(
        supplierIds.map(async (id: any) => {
          const data = await fetchSupplierData(id);
          if (data) supplierDataMap[id] = data;
        })
      );
      setSupplierMap(supplierDataMap);

      const adminIds = sortedData.map((b: any) => b.created_by).filter(Boolean);
      const adminDataMap: Record<string, any> = {};
      await Promise.all(
        adminIds.map(async (id: any) => {
          const data = await fetchAdminData(id);
          if (data) adminDataMap[id] = data;
        })
      );
      setAdminMap(adminDataMap);
    } catch (error) {
      console.error("Error fetching bank lead data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBankLeadData();
  }, [permission, status]);

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
          cell: ({ row }: any) => {
            const supplierId =
              row.original?.Kunden?.Kundeinformasjon[0]?.supplier;
            const supplierData = supplierMap[supplierId];
            return (
              <div className="flex items-center text-sm text-darkBlack w-max">
                {supplierData?.company_name ?? "-"}
              </div>
            );
          },
        },
        {
          accessorKey: "Konsulent",
          header: "Konsulent",
          cell: ({ row }: any) => {
            const adminData = adminMap[row.original?.created_by];
            return (
              <div className="flex items-center text-sm text-darkBlack w-max">
                {adminData
                  ? `${adminData?.f_name ?? adminData.name} ${
                      adminData?.l_name ?? ""
                    }`
                  : row.original?.createDataBy?.name}
              </div>
            );
          },
        },
        {
          accessorKey: "Lead sent",
          header: "Lead sent",
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
                kr {numberToNorwegian(sum)}
              </p>
            );
          },
        },
        {
          accessorKey: "status",
          header: "Status",
          cell: ({ row }: any) => (
            <>
              {row.original.status === "Sent" ||
              row.original.status === "Ikke sendt" ? (
                <p className="text-xs text-[#A27200] w-max bg-[#FFF6E0] py-0.5 px-2 rounded-[16px]">
                  {row.original.status}
                </p>
              ) : row.original.status === "Rejected" ? (
                <p className="text-xs text-[#A20000] w-max bg-[#FFE0E0] py-0.5 px-2 rounded-[16px]">
                  Avsluttet
                </p>
              ) : row.original.status === "Approved" ? (
                <p className="text-xs text-[#00857A] bg-[#E0FFF5] w-max py-0.5 px-2 rounded-[16px]">
                  Kunde fått svar
                </p>
              ) : row.original.status === "In Process" ? (
                <p className="text-xs text-[#C84D00] bg-[#FFEAE0] w-max py-0.5 px-2 rounded-[16px]">
                  Aktiv kunde
                </p>
              ) : (
                row.original.status === "Tilbud" && (
                  <p className="text-xs text-[#0000FF] bg-[#C3EEFA] w-max py-0.5 px-2 rounded-[16px]">
                    Kunde kontaktet
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
              {status === "Active" ? (
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
    [supplierMap, adminMap, email, navigate, permission, status]
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
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between bg-lightGreen rounded-[12px] py-3 px-4">
        <div className="shadow-shadow1 border border-gray1 rounded-[8px] flex w-max overflow-hidden">
          <div
            className={`p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm border-r border-gray1 cursor-pointer ${
              status === "" ? "bg-white" : ""
            }`}
            onClick={() => setStatus("")}
          >
            Alle
          </div>
          <div
            className={`p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm cursor-pointer ${
              status === "Active" ? "bg-white" : ""
            }`}
            onClick={() => setStatus("Active")}
          >
            Aktive kunder
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
            className="w-full"
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
              <p className="text-sm md:text-base desktop:text-lg font-bold">
                Er du sikker på at du vil slette?
              </p>
              <div className="flex justify-center mt-5 w-full gap-5 items-center">
                <div onClick={() => setShowConfirm(false)}>
                  <Button
                    text="Avbryt"
                    className="border border-gray2 text-black text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                  />
                </div>
                <div onClick={() => handleDelete(selectedId)}>
                  <Button
                    text="Bekrefte"
                    className="border border-primary bg-primary text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
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
