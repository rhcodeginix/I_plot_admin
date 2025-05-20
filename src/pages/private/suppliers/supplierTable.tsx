/* eslint-disable react-hooks/exhaustive-deps */
import { Loader2, Pencil, Trash } from "lucide-react";
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
import Ic_filter from "../../../assets/images/Ic_filter.svg";
import DateRangePicker from "../../../components/ui/daterangepicker";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../../components/common/button";
import Modal from "../../../components/common/modal";
import { fetchAdminDataByEmail, fetchSupplierData } from "../../../lib/utils";

export const SupplierTable = () => {
  const [page, setPage] = useState(1);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<any>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "suppliers", id));
      fetchSuppliersData();
      setShowConfirm(false);
      toast.success("Delete successfully", { position: "top-right" });
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const fetchSuppliersData = async () => {
    setIsLoading(true);

    try {
      let q = query(collection(db, "suppliers"), orderBy("updatedAt", "desc"));

      const querySnapshot = await getDocs(q);

      const data: any = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const filterData: any = [];
      const findSupData: any = await fetchSupplierData(permission);
      if (findSupData) {
        filterData.push(findSupData);
      }

      if (email === "andre.finger@gmail.com") {
        setSuppliers(data);
      } else {
        setSuppliers(filterData);
      }
    } catch (error) {
      console.error("Error fetching husmodell data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return suppliers.filter((model: any) => {
      let matchesSearch = model?.company_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      const modelDate = new Date(model.updatedAt);

      if (startDate !== null && endDate !== null) {
        const matchDate = modelDate >= startDate && modelDate <= endDate;
        matchesSearch = matchesSearch && matchDate;
      }

      return matchesSearch;
    });
  }, [suppliers, searchTerm, startDate, endDate]);

  useEffect(() => {
    fetchSuppliersData();
  }, [permission]);

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
          accessorKey: "logo",
          header: "Logo",
          cell: ({ row }: any) => (
            <img src={row.original.photo} alt="logo" className="h-5" />
          ),
        },
        {
          accessorKey: "selskapsnavn",
          header: "Selskapsnavn",
          cell: ({ row }: any) => (
            <p className="font-semibold text-sm text-darkBlack">
              {row.original.company_name}
            </p>
          ),
        },
        {
          accessorKey: "type",
          header: "Type",
          cell: ({ row }: any) => (
            <p className="text-sm text-darkBlack">
              {row.original.type_partner}
            </p>
          ),
        },
        {
          accessorKey: "Produkter",
          header: "Produkter",
          cell: ({ row }: any) => (
            <p className="text-sm text-darkBlack">{row.original.Produkter}</p>
          ),
        },
        {
          accessorKey: "Sistendret",
          header: "Sist endret",
          cell: ({ row }: any) => (
            <p className="text-sm font-semibold text-black">
              {row.original.updatedAt}
            </p>
          ),
        },
        {
          accessorKey: "adresse",
          header: "Adresse",
          cell: ({ row }: any) => (
            <div>
              <p className="text-black text-sm mb-[2px]">
                {row.original.Adresse}
              </p>
            </div>
          ),
        },
        email === "andre.finger@gmail.com"
          ? {
              id: "action",
              header: "Action",
              cell: ({ row }: any) => (
                <>
                  <div className="flex items-center justify-center gap-3">
                    <Pencil
                      className="h-5 w-5 text-primary cursor-pointer"
                      onClick={() =>
                        navigate(`/edit-til-leverandor/${row.original.id}`)
                      }
                    />
                    <Trash
                      className="h-5 w-5 text-primary cursor-pointer"
                      onClick={() => confirmDelete(row.original.id)}
                    />
                  </div>
                </>
              ),
            }
          : null,
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
        <div className="flex gap-3 items-center">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
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
                  className="w-1/2 sm:w-auto"
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
