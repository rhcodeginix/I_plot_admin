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
import DateRangePicker from "../../../components/ui/daterangepicker";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../../components/common/button";
import Modal from "../../../components/common/modal";
import { fetchAdminDataByEmail } from "../../../lib/utils";

export const LeadTable = () => {
  const [page, setPage] = useState(1);
  const [bankLead, setBankLead] = useState([]);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<any>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<string>("");

  const [permission, setPermission] = useState<any>(null);
  const [Role, setRole] = useState<any>(null);
  const [Office, setOffice] = useState<any>(null);
  const [IsAdmin, setIsAdmin] = useState<any>(null);
  const email = localStorage.getItem("Iplot_admin");

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();

      if (data) {
        const finalSupData = data?.supplier;
        setPermission(finalSupData);
        if (data?.role) {
          setRole(data?.role);
        }
        if (data?.office) {
          setOffice(data?.office);
        }
        setIsAdmin(data?.is_admin);
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

  const getData = async (email: string) => {
    try {
      if (email) {
        const q = query(collection(db, "admin"), where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          return querySnapshot.docs[0].data();
        }
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
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

      const docsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filteredData = await Promise.all(
        docsData.map(async (item: any) => {
          if (IsAdmin === true) {
            return item;
          } else if (IsAdmin === false) {
            const email = item?.createDataBy?.email;
            if (!email) return null;

            const userData = await getData(email);

            return userData?.office === Office ? item : null;
          }
          return item;
        })
      );

      const data = filteredData.filter((item) => item !== null);

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

      const sortedData: any = data.sort((a: any, b: any) => {
        const dateA = parseNorwegianDate(a.updatedAt);
        const dateB = parseNorwegianDate(b.updatedAt);
        return dateB.getTime() - dateA.getTime();
      });

      setBankLead(sortedData);
    } catch (error) {
      console.error("Error fetching bank lead data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Role) {
      fetchBankLeadData();
    }
  }, [permission, status, Role, Office, IsAdmin]);

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

  const [showModal, setShowModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOption && selectedId) {
      try {
        await updateDoc(doc(db, "bank_leads", selectedId), {
          status: selectedOption,
          updatedAt: new Date().toISOString(),
        });
        setShowModal(false);
        setSelectedId(null);
        toast.success("Status updated");
        fetchBankLeadData();
      } catch (error) {
        console.error("Error updating status", error);
      }
    }
  };

  const handleEditPopup = () => {
    if (showModal) {
      setShowModal(false);
    } else {
      setShowModal(true);
    }
  };
  const columns = useMemo<ColumnDef<any>[]>(
    () =>
      [
        {
          accessorKey: "id",
          header: "Id",
          cell: ({ row }: any) => (
            <Link
              to={`/bank-leads-detail/${row.original?.id}`}
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
                kr {numberToNorwegian(sum)}
              </p>
            );
          },
        },
        {
          accessorKey: "status",
          header: "Status",
          cell: ({ row }: any) => (
            <div className="flex items-center gap-2">
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
              <Pencil
                className="h-[18px] w-[18px] text-primary cursor-pointer"
                onClick={() => {
                  setShowModal(true);
                  setSelectedId(row.original.id);
                  setSelectedOption(row.original.status);
                }}
              />
            </div>
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
                    navigate(`/bank-leads-detail/${row.original?.id}`)
                  }
                />
              ) : (
                <div className="flex items-center gap-3">
                  <Pencil
                    className="h-5 w-5 text-primary cursor-pointer"
                    onClick={() =>
                      navigate(`/edit-bank-leads/${row.original.id}`)
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
    [email, navigate, permission, status]
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
        <div className="flex gap-3 items-center">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
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
                    className="border border-purple bg-purple text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {showModal && (
        <Modal onClose={handleEditPopup} isOpen={true}>
          <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-xl w-[300px] shadow-lg relative">
              <form onSubmit={handleSubmit}>
                <h2 className="text-sm md:text-base desktop:text-lg font-semibold mb-4">
                  Change Status
                </h2>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      value="Sent"
                      checked={selectedOption === "Sent"}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="accent-primary h-4 w-4"
                    />
                    Sent
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      value="Approved"
                      checked={selectedOption === "Approved"}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="accent-primary h-4 w-4"
                    />
                    Approved
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      value="Rejected"
                      checked={selectedOption === "Rejected"}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="accent-primary h-4 w-4"
                    />
                    Rejected
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      value="In Process"
                      checked={selectedOption === "In Process"}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="accent-primary h-4 w-4"
                    />
                    In Process
                  </label>
                </div>

                <div className="flex justify-center mt-5 w-full gap-5 items-center">
                  <div onClick={() => setShowModal(false)}>
                    <Button
                      text="Avbryt"
                      className="border border-gray2 text-black text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                    />
                  </div>
                  <div>
                    <Button
                      text="Bekrefte"
                      className="border border-purple bg-purple text-white text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                      type="submit"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
