/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { Copy, Eye, Loader2, Pencil, Trash } from "lucide-react";
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
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import {
  fetchAdminDataByEmail,
  fetchSupplierData,
  formatDateTime,
} from "../../../lib/utils";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Modal from "../../../components/common/modal";
import Button from "../../../components/common/button";

export const HusmodellerTable = () => {
  const [page, setPage] = useState(1);
  const [houseModels, setHouseModels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmCopy, setShowConfirmCopy] = useState(false);
  const [selectedId, setSelectedId] = useState<any>(null);
  const [suppliersId, setSuppliersId] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [permission, setPermission] = useState<any>(null);
  const [supp, setSupp] = useState<any>(null);
  const [role, setRole] = useState<any>(null);
  const email = localStorage.getItem("Iplot_admin");

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();
      if (data) {
        if (data?.role) {
          setRole(data?.role);
        }
        if (data?.supplier) {
          setSupp(data?.supplier);
        }

        const finalData = data?.modulePermissions?.find(
          (item: any) => item.name === "Husmodell"
        );
        setPermission(finalData?.permissions);
      }
    };

    getData();
  }, []);

  const getData = async (id: string) => {
    const data = await fetchSupplierData(id);
    if (data) {
      return data;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const oldSupplierDocRef = doc(db, "suppliers", suppliersId);
      const oldSupplierData = await fetchSupplierData(suppliersId);
      const formatter = new Intl.DateTimeFormat("nb-NO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      await updateDoc(oldSupplierDocRef, {
        ...oldSupplierData,
        id: suppliersId,
        updatedAt: formatter.format(new Date()),
        Produkter: Math.max(
          oldSupplierData?.Produkter === 0 ? 0 : oldSupplierData?.Produkter - 1
        ),
      });
      await deleteDoc(doc(db, "house_model", id));
      toast.success("Slettet", { position: "top-right" });
      fetchHusmodellData();
      setShowConfirm(false);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };
  const handleCopy = async (id: string) => {
    try {
      const oldSupplierDocRef = doc(db, "suppliers", suppliersId);
      const oldSupplierData = await fetchSupplierData(suppliersId);
      const formatter = new Intl.DateTimeFormat("nb-NO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      await updateDoc(oldSupplierDocRef, {
        ...oldSupplierData,
        id: suppliersId,
        updatedAt: formatter.format(new Date()),
        Produkter: Math.max(oldSupplierData?.Produkter + 1),
      });

      const oldHouseModelRef = doc(db, "house_model", id);
      const oldHouseModelSnap = await getDoc(oldHouseModelRef);

      if (!oldHouseModelSnap.exists()) {
        throw new Error("Document does not exist.");
      }

      const oldHouseModelData = oldHouseModelSnap.data();
      const formatDate = (date: Date) => {
        return date
          .toLocaleString("sv-SE", { timeZone: "UTC" })
          .replace(",", "");
      };
      const newHouseModelRef = collection(db, "house_model");
      await addDoc(newHouseModelRef, {
        ...oldHouseModelData,
        createdAt: formatDate(new Date()),
      });

      toast.success("Copied successfully", { position: "top-right" });
      fetchHusmodellData();
      setShowConfirmCopy(false);
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

  const handleConfirmCopyPopup = () => {
    if (showConfirmCopy) {
      setShowConfirmCopy(false);
    } else {
      setShowConfirmCopy(true);
    }
  };

  const fetchHusmodellData = async () => {
    setIsLoading(true);
    try {
      let q;
      // if (email === "andre.finger@gmail.com") {
      if (role === "Agent") {
        q = query(
          collection(db, "house_model"),
          where("Husdetaljer.Leverandører", "==", supp)
        );
      } else {
        q = query(collection(db, "house_model"), orderBy("updatedAt", "desc"));
      }
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
  }, [role, supp]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const confirmDelete = (id: string, supplierId: string) => {
    setSelectedId(id);
    setSuppliersId(supplierId);
    setShowConfirm(true);
  };

  const confirmCopy = (id: string, supplierId: string) => {
    setSelectedId(id);
    setSuppliersId(supplierId);
    setShowConfirmCopy(true);
  };

  const filteredData = useMemo(() => {
    return houseModels.filter((model: any) =>
      model.Husdetaljer?.husmodell_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [houseModels, searchTerm]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "husmodell",
        header: "Husmodell",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 w-max">
            <img
              src={row.original.Husdetaljer.photo}
              alt="Husmodell"
              className="w-8 h-8 rounded-full"
            />
            <p className="font-medium text-sm text-purple">
              {row.original.Husdetaljer.husmodell_name}
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
              const data = await getData(row.original.Husdetaljer.Leverandører);
              setLeverandorData(data);
            };
            fetchData();
          }, [row.original.Husdetaljer.Leverandører]);

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
        accessorKey: "kategori",
        header: "Kategori",
        cell: ({ row }) => (
          <p className="text-sm text-gray w-max">Herskapelig</p>
        ),
      },
      {
        accessorKey: "husdetaljer",
        header: "Husdetaljer",
        cell: ({ row }) => (
          <p className="text-sm text-gray w-max">
            <span className="font-bold">
              {row.original.Husdetaljer.BRATotal}
            </span>{" "}
            m<sup>2</sup>.{" "}
            <span className="font-bold">
              {row.original.Husdetaljer.Soverom}
            </span>{" "}
            soverom,{" "}
            <span className="font-bold">{row.original.Husdetaljer.Bad}</span>{" "}
            bad
          </p>
        ),
      },
      {
        accessorKey: "sisteoppdatertav",
        header: "Siste oppdatert av",
        cell: ({ row }) => (
          <div className="flex items-start gap-3 w-max">
            <img
              src={row.original?.updateDataBy?.photo}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="font-medium text-black text-sm mb-[2px]">
                {row.original?.updateDataBy?.name}
              </p>
              <p className="text-xs text-gray">
                {formatDateTime(row.original.updatedAt)}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <>
            <div className="flex items-center justify-center gap-3">
              {((permission && permission?.edit) ||
                email === "andre.finger@gmail.com") && (
                <Pencil
                  className="h-5 w-5 text-primary cursor-pointer"
                  onClick={() => navigate(`/edit-husmodell/${row.original.id}`)}
                />
              )}
              {((permission && permission?.delete) ||
                email === "andre.finger@gmail.com") && (
                <Trash
                  className="h-5 w-5 text-primary cursor-pointer"
                  onClick={() =>
                    confirmDelete(
                      row.original.id,
                      row.original.Husdetaljer.Leverandører
                    )
                  }
                />
              )}
              <Eye
                className="h-5 w-5 text-primary cursor-pointer"
                onClick={() => navigate(`/se-husmodell/${row.original.id}`)}
              />
              {((permission && permission?.duplicate) ||
                email === "andre.finger@gmail.com") && (
                <Copy
                  className="h-5 w-5 text-primary cursor-pointer"
                  onClick={() =>
                    confirmCopy(
                      row.original.id,
                      row.original.Husdetaljer.Leverandører
                    )
                  }
                />
              )}
            </div>
          </>
        ),
      },
    ],
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
      <div className="flex sm:items-center justify-between bg-lightPurple rounded-[12px] py-3 px-3 md:px-4 flex-col sm:flex-row gap-2">
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

        <div className="border border-gray1 rounded-[8px] flex gap-2 items-center py-[10px] px-4 cursor-pointer shadow-shadow1 h-[40px] bg-[#fff]">
          <img src={Ic_filter} alt="" />
          <span className="text-black font-medium text-sm">Filter</span>
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

      {showConfirmCopy && (
        <Modal onClose={handleConfirmCopyPopup} isOpen={true}>
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-sm md:text-base desktop:text-lg font-bold">
                Er du sikker på at du vil kopiere?
              </p>
              <div className="flex justify-center mt-5 w-full gap-5 items-center">
                <div onClick={() => setShowConfirmCopy(false)}>
                  <Button
                    text="Avbryt"
                    className="border border-gray2 text-black text-sm rounded-[8px] h-[40px] font-medium relative px-4 py-[10px] flex items-center gap-2"
                  />
                </div>
                <div onClick={() => handleCopy(selectedId)}>
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
