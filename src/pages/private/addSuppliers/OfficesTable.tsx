/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
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
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Modal from "../../../components/common/modal";
import Button from "../../../components/common/button";

export const OfficesTable: React.FC<{ setEditId: any; setActiveTab: any }> = ({
  setEditId,
  setActiveTab,
}) => {
  const [page, setPage] = useState(1);
  const [offices, setOffices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "office", id));
      toast.success("Slettet", { position: "top-right" });
      fetchOfficeData();
      setShowConfirm(false);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleConfirmPopup = () => {
    if (showConfirm) {
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  const fetchOfficeData = async () => {
    setIsLoading(true);
    try {
      let querySnapshot;
      if (id) {
        const officeQuery = query(
          collection(db, "office"),
          where("data.supplier", "==", id)
        );

        querySnapshot = await getDocs(officeQuery);
      } else {
        querySnapshot = await getDocs(collection(db, "office"));
      }
      const data: any = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOffices(data);
    } catch (error) {
      console.error("Error fetching husmodell data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficeData();
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const confirmDelete = (id: string) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const filteredData = useMemo(() => {
    return offices.filter((model: any) =>
      model?.data?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [offices, searchTerm]);

  const getuserData = async (id: string) => {
    try {
      const q = query(collection(db, "admin"), where("office", "==", id));

      const querySnapshot = await getDocs(q);

      let data: any = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return data;
    } catch (error) {
      console.error("Error fetching husmodell data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "Navn",
        header: "Navn",
        cell: ({ row }) => (
          <p className="font-semibold text-black text-sm w-max">
            {row.original?.data?.name}
          </p>
        ),
      },
      {
        accessorKey: "Adresse",
        header: "Adresse",
        cell: ({ row }) => (
          <p className="font-semibold text-black text-sm w-max">
            {row.original?.data?.Adresse}
          </p>
        ),
      },
      {
        accessorKey: "",
        header: "Antall brukere",
        cell: ({ row }) => {
          const [usersData, setUsersData] = useState<any>(null);

          useEffect(() => {
            const fetchData = async () => {
              const data = await getuserData(row.original?.id);
              setUsersData(data);
            };
            fetchData();
          }, [row.original?.id]);

          return (
            <div className="w-max">
              <p className="font-semibold text-black text-sm w-max">
                {usersData && usersData?.length}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "Finansiering",
        header: "Finansiering",
        cell: ({ row }) => (
          <p className="font-semibold text-black text-sm w-max">
            {row.original?.data?.is_financing === true ? "Ja" : "Nei"}
          </p>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <>
            <div className="flex items-center justify-center gap-3">
              <Pencil
                className="h-5 w-5 text-primary cursor-pointer"
                onClick={() => {
                  setEditId(row.original.id);
                  setActiveTab("Legg til kontor");
                }}
              />
              <Trash
                className="h-5 w-5 text-primary cursor-pointer"
                onClick={() => confirmDelete(row.original.id)}
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
      <div className="flex sm:items-center justify-between bg-lightGreen rounded-[12px] py-3 px-3 md:px-4 flex-col sm:flex-row gap-2 mb-2  ">
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
