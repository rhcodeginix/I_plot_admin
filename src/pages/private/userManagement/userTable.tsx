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
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../../components/common/button";
import Modal from "../../../components/common/modal";
import { fetchAdminDataByEmail } from "../../../lib/utils";

export const UserTable: React.FC<{ role: any }> = ({ role }) => {
  const [page, setPage] = useState(1);
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supplier, setSupplier] = useState<any>(null);
  const [Role, setRole] = useState<any>(null);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();

      if (data) {
        if (data?.role) {
          setRole(data?.role);
        }
        if (data?.supplier) {
          setSupplier(data?.supplier);
        }
      }
    };

    getData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const q = query(collection(db, "admin"), where("id", "==", id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await deleteDoc(docRef);
        fetchAdminData();
        setShowConfirm(false);
        toast.success("Deleted successfully", { position: "top-right" });
      } else {
        console.error("Document with adminId not found:", id);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "admin"));
      let data: any = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((item: any) => item.role === role);
      if (Role && Role === "Agent") {
        data = data.filter((item: any) => item.supplier === supplier);
      }

      const sortedData = data.sort((a: any, b: any) => {
        return b.updatedAt.toDate() - a.updatedAt.toDate();
      });

      setAdmins(sortedData);
    } catch (error) {
      console.error("Error fetching husmodell data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (admins.length === 0) return [];
    return admins.filter((model: any) =>
      (model?.name || model?.f_name || model?.l_name)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [admins, searchTerm]);

  useEffect(() => {
    fetchAdminData();
  }, [role, Role]);

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
    () => [
      {
        accessorKey: "photo",
        header: "Avatar",
        cell: ({ row }) => (
          <>
            {row.original.photo ? (
              <div className="w-10">
                <img src={row.original.photo} alt="logo" className="w-full" />
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full flex items-center justify-center border border-primary bg-lightPurple">
                  {!row.original.f_name
                    ? row.original.name[0]
                    : `${row.original.f_name[0]}`}
                </div>
              </>
            )}
          </>
        ),
      },
      {
        accessorKey: "Navn",
        header: "Navn",
        cell: ({ row }) => (
          <p className="font-semibold text-sm text-darkBlack w-max">
            {!row.original.f_name
              ? row.original.name
              : `${row.original.f_name} ${row.original.l_name}`}
          </p>
        ),
      },
      {
        accessorKey: "email",
        header: "E-post",
        cell: ({ row }) => (
          <p className="text-sm text-darkBlack">{row.original.email}</p>
        ),
      },
      {
        accessorKey: "role",
        header: "Rolle",
        cell: ({ row }) => (
          <p className="text-sm text-darkBlack">{row.original.role}</p>
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
                  if (role === "Admin") {
                    navigate(`/edit-user/${row.original.id}`);
                  } else if (role === "Bankansvarlig") {
                    navigate(`/edit-bank-user/${row.original.id}`);
                  } else if (role === "Agent") {
                    navigate(`/edit-agent-user/${row.original.id}`);
                  }
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
    [navigate, role]
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
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between bg-lightPurple rounded-[12px] py-3 px-3 md:px-4">
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
