/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import Ic_filter from "../../../assets/images/Ic_filter.svg";
import Ic_map from "../../../assets/images/Ic_map.svg";
import Ic_download from "../../../assets/images/Ic_download.svg";
import * as XLSX from "xlsx";
import DatePickerComponent from "../../../components/ui/datepicker";
import { Ellipsis, Loader2 } from "lucide-react";
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
import Ic_search from "../../../assets/images/Ic_search.svg";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import {
  convertToFullDateString,
  fetchAdminDataByEmail,
  formatDateOnly,
  formatTimestamp,
} from "../../../lib/utils";
import { HouseModelCell } from "./houseRow";
import { StatusCell } from "./statusRow";
import { BrokerCell } from "./brokerRow";
import { monthMap } from "./myLeadsDetail";

const calculateDateRange = (range: string) => {
  const currentDate = new Date();
  let startDate: Date;
  let endDate: Date = currentDate;

  switch (range) {
    case "12 måneder":
      startDate = new Date(currentDate);
      startDate.setFullYear(currentDate.getFullYear() - 1);
      break;
    case "30 dager":
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 30);
      break;
    case "7 dager":
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 7);
      break;
    case "24 timer":
      startDate = new Date(currentDate);
      startDate.setHours(currentDate.getHours() - 24);
      break;
    default:
      return null;
  }

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};

export const TODOTable = () => {
  const [selectedDate1, setSelectedDate1] = useState<Date | null>(null);

  const [page, setPage] = useState(1);
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState<string | null>(
    null
  );

  const email = localStorage.getItem("Iplot_admin");
  const [LoginUserId, setLoginUserId] = useState<any>(null);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAdminDataByEmail();

      if (data) {
        if (data?.id) {
          setLoginUserId(data?.id);
        }
      }
    };

    getData();
  }, []);

  // const fetchLeadsData = async () => {
  //   setIsLoading(true);
  //   try {
  //     const leadsSnapshot = await getDocs(
  //       query(
  //         collection(db, "leads_from_supplier"),
  //         orderBy("updatedAt", "desc")
  //       )
  //     );

  //     const leadsWithFollowupsPromises = leadsSnapshot.docs.map(
  //       async (leadDoc) => {
  //         const leadId = leadDoc.id;
  //         const leadData = leadDoc.data();

  //         const followupsRef = collection(
  //           db,
  //           "leads_from_supplier",
  //           leadId,
  //           "followups"
  //         );
  //         const followupsSnapshot = await getDocs(followupsRef);

  //         const followups = followupsSnapshot.docs.map((doc) => ({
  //           id: doc.id,
  //           ...doc.data(),
  //         }));

  //         if (followups.length > 1) {
  //           const sortedFollowups = [...followups].sort((a: any, b: any) => {
  //             const getTimestamp = (item: any): number => {
  //               if (typeof item.updatedAt === "string") {
  //                 const [datePart, timePart] = item.updatedAt
  //                   .split("|")
  //                   .map((s: string) => s.trim());
  //                 const [day, monthName, year] = datePart.split(" ");
  //                 const engMonth =
  //                   monthMap[monthName.toLowerCase()] || monthName;

  //                 const dateStr = `${engMonth} ${day}, ${year} ${timePart}`;
  //                 const parsed = new Date(dateStr).getTime();
  //                 return isNaN(parsed) ? 0 : parsed;
  //               } else if (item.updatedAt?.toMillis) {
  //                 return item.updatedAt.toMillis();
  //               } else {
  //                 return item.date?.seconds ? item.date.seconds * 1000 : 0;
  //               }
  //             };

  //             return getTimestamp(b) - getTimestamp(a);
  //           });

  //           const lastFollowup = sortedFollowups[0];

  //           return {
  //             id: leadId,
  //             ...leadData,
  //             followups: lastFollowup,
  //           };
  //         } else if (followups.length === 1) {
  //           const f: any = followups[0];
  //           if (f.Hurtigvalg !== "initial" && f.type !== "initial") {
  //             return {
  //               id: leadId,
  //               ...leadData,
  //               followups: followups[0],
  //             };
  //           } else {
  //             return null;
  //           }
  //         } else {
  //           return null;
  //         }
  //       }
  //     );

  //     const resolvedLeads = await Promise.all(leadsWithFollowupsPromises);
  //     const leadsWithFollowups: any = resolvedLeads.filter(Boolean);

  //     const getTimestamp = (item: any): number => {
  //       const updatedAt = item.followups?.updatedAt;

  //       if (typeof updatedAt === "string") {
  //         const [datePart, timePart] = updatedAt
  //           .split("|")
  //           .map((s: string) => s.trim());
  //         const [day, monthName, year] = datePart.split(" ");
  //         const engMonth = monthMap[monthName.toLowerCase()] || monthName;

  //         const dateStr = `${engMonth} ${day}, ${year} ${timePart}`;
  //         const parsed = new Date(dateStr).getTime();
  //         return isNaN(parsed) ? 0 : parsed;
  //       } else if (updatedAt?.toMillis) {
  //         return updatedAt.toMillis();
  //       } else {
  //         return item.followups?.date?.seconds
  //           ? item.followups.date.seconds * 1000
  //           : 0;
  //       }
  //     };

  //     leadsWithFollowups.sort(
  //       (a: any, b: any) => getTimestamp(b) - getTimestamp(a)
  //     );

  //     setLeads(leadsWithFollowups);
  //   } catch (error) {
  //     console.error("Error fetching leads with followups:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const fetchLeadsData = async () => {
  //   setIsLoading(true);
  //   try {
  //     const leadsSnapshot = await getDocs(
  //       query(
  //         collection(db, "leads_from_supplier"),
  //         orderBy("updatedAt", "desc")
  //       )
  //     );

  //     const filterLeadsPromises = leadsSnapshot.docs.map(async (leadDoc) => {
  //       const leadId = leadDoc.id;
  //       const leadData = leadDoc.data();

  //       const houseRef = collection(
  //         db,
  //         "leads_from_supplier",
  //         leadId,
  //         "preferred_house_model"
  //       );
  //       const houseSnapshot = await getDocs(houseRef);

  //       const house: any = houseSnapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }));

  //       const isAssignedToUser = house.some((hou: any) => {
  //         return String(hou?.Tildelt) === String(LoginUserId);
  //       });

  //       if (isAssignedToUser) {
  //         return { leadId, leadData };
  //       } else {
  //         return null;
  //       }
  //     });

  //     const resolvedFilteredLeads: any = await Promise.all(filterLeadsPromises);

  //     const filteredLeadsOnly: any = resolvedFilteredLeads.filter(Boolean);

  //     const leadsWithFollowupsPromises = filteredLeadsOnly.map(
  //       async ({ leadId, leadData }: any) => {
  //         const followupsRef = collection(
  //           db,
  //           "leads_from_supplier",
  //           leadId,
  //           "followups"
  //         );
  //         const followupsSnapshot = await getDocs(followupsRef);

  //         const followups = followupsSnapshot.docs.map((doc) => ({
  //           id: doc.id,
  //           ...doc.data(),
  //         }));

  //         if (followups.length > 1) {
  //           const sortedFollowups = [...followups].sort((a: any, b: any) => {
  //             const getTimestamp = (item: any): number => {
  //               if (typeof item.updatedAt === "string") {
  //                 const [datePart, timePart] = item.updatedAt
  //                   .split("|")
  //                   .map((s: string) => s.trim());
  //                 const [day, monthName, year] = datePart.split(" ");
  //                 const engMonth =
  //                   monthMap[monthName.toLowerCase()] || monthName;
  //                 const dateStr = `${engMonth} ${day}, ${year} ${timePart}`;
  //                 const parsed = new Date(dateStr).getTime();
  //                 return isNaN(parsed) ? 0 : parsed;
  //               } else if (item.updatedAt?.toMillis) {
  //                 return item.updatedAt.toMillis();
  //               } else {
  //                 return item.date?.seconds ? item.date.seconds * 1000 : 0;
  //               }
  //             };

  //             return getTimestamp(b) - getTimestamp(a);
  //           });

  //           const lastFollowup = sortedFollowups[0];

  //           return {
  //             id: leadId,
  //             ...leadData,
  //             followups: lastFollowup,
  //           };
  //         } else if (followups.length === 1) {
  //           return {
  //             id: leadId,
  //             ...leadData,
  //             followups: followups[0],
  //           };
  //         } else {
  //           return {
  //             id: leadId,
  //             ...leadData,
  //             followups: [],
  //           };
  //         }
  //       }
  //     );

  //     const resolvedLeads = await Promise.all(leadsWithFollowupsPromises);
  //     const leadsWithFollowups: any = resolvedLeads.filter(Boolean);

  //     const getTimestamp = (item: any): number => {
  //       const updatedAt = item.followups?.updatedAt;

  //       if (typeof updatedAt === "string") {
  //         const [datePart, timePart] = updatedAt
  //           .split("|")
  //           .map((s: string) => s.trim());
  //         const [day, monthName, year] = datePart.split(" ");
  //         const engMonth = monthMap[monthName.toLowerCase()] || monthName;
  //         const dateStr = `${engMonth} ${day}, ${year} ${timePart}`;
  //         const parsed = new Date(dateStr).getTime();
  //         return isNaN(parsed) ? 0 : parsed;
  //       } else if (updatedAt?.toMillis) {
  //         return updatedAt.toMillis();
  //       } else {
  //         return item.followups?.date?.seconds
  //           ? item.followups.date.seconds * 1000
  //           : 0;
  //       }
  //     };

  //     leadsWithFollowups.sort(
  //       (a: any, b: any) => getTimestamp(b) - getTimestamp(a)
  //     );

  //     setLeads(leadsWithFollowups);
  //   } catch (error) {
  //     console.error("Error fetching leads with followups:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const fetchLeadsData = async () => {
    setIsLoading(true);
    try {
      const assignedModelsSnapshot = await getDocs(
        query(
          collectionGroup(db, "preferred_house_model"),
          where("Tildelt", "==", String(LoginUserId))
        )
      );

      const leadIds = Array.from(
        new Set(
          assignedModelsSnapshot.docs.map((doc) => doc.ref.parent.parent?.id)
        )
      );

      const leadDocs: any = await Promise.all(
        leadIds.map((leadId) =>
          getDocs(
            collection(db, "leads_from_supplier", String(leadId), "followups")
          ).then((followupsSnapshot) => {
            const followups = followupsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            followups.sort((a, b) => {
              const getTimestamp = (item: any): number => {
                if (typeof item.updatedAt === "string") {
                  const [datePart, timePart] = item.updatedAt
                    .split("|")
                    .map((s: string) => s.trim());
                  const [day, monthName, year] = datePart.split(" ");
                  const engMonth =
                    monthMap[monthName.toLowerCase()] || monthName;
                  const dateStr = `${engMonth} ${day}, ${year} ${timePart}`;
                  return new Date(dateStr).getTime();
                } else if (item.updatedAt?.toMillis) {
                  return item.updatedAt.toMillis();
                } else {
                  return item.date?.seconds ? item.date.seconds * 1000 : 0;
                }
              };
              return getTimestamp(b) - getTimestamp(a);
            });

            return getDoc(doc(db, "leads_from_supplier", String(leadId))).then(
              (leadDoc) => ({
                id: String(leadId),
                ...leadDoc.data(),
                followups: followups[0] || [],
              })
            );
          })
        )
      );

      leadDocs.sort((a: any, b: any) => {
        const getTimestamp = (item: any): number => {
          const updatedAt = item.followups?.updatedAt;
          if (typeof updatedAt === "string") {
            const [datePart, timePart] = updatedAt
              .split("|")
              .map((s: string) => s.trim());
            const [day, monthName, year] = datePart.split(" ");
            const engMonth = monthMap[monthName.toLowerCase()] || monthName;
            const dateStr = `${engMonth} ${day}, ${year} ${timePart}`;
            return new Date(dateStr).getTime();
          } else if (updatedAt?.toMillis) {
            return updatedAt.toMillis();
          } else {
            return item.followups?.date?.seconds
              ? item.followups.date.seconds * 1000
              : 0;
          }
        };
        return getTimestamp(b) - getTimestamp(a);
      });

      setLeads(leadDocs);
    } catch (error) {
      console.error("Error fetching fast leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return leads.filter((model: any) => {
      const search = searchTerm.toLowerCase();
      const leadSource = model?.leadSource?.toLowerCase();
      const leadKilde = model?.leadData?.kilde?.toLowerCase();
      const leadName = model?.leadData?.name?.toLowerCase();

      let matchesSearch =
        leadSource?.includes(search) ||
        leadKilde?.includes(search) ||
        leadName?.includes(search);

      if (!matchesSearch) return false;
      const modelDate: any = convertToFullDateString(model.createdAt);

      if (selectedDate1 !== null) {
        const matchDate = modelDate === formatDateOnly(selectedDate1);
        matchesSearch = matchesSearch && matchDate;
      }
      if (selectedDateRange !== null) {
        const { startDate, endDate }: any =
          calculateDateRange(selectedDateRange);

        const isWithinDateRange =
          modelDate >= startDate && modelDate <= endDate;

        matchesSearch = matchesSearch && isWithinDateRange;
      }
      return matchesSearch;
    });
  }, [leads, searchTerm, selectedDate1, selectedDateRange]);

  useEffect(() => {
    if (LoginUserId) {
      fetchLeadsData();
    }
  }, [LoginUserId]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "Status",
        header: "Status",
        cell: ({ row }) => <StatusCell id={row.original.id} />,
      },
      {
        accessorKey: "kunde",
        header: "Kunde",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 w-max">
            <div className="w-8 h-8 rounded-full border border-gray1 bg-gray3 flex items-center justify-center">
              {row.original.leadData.name[0]}
            </div>
            <div>
              <Link
                to={`/my-leads-details/${row.original.id}`}
                className="font-medium text-purple text-sm mb-[2px]"
              >
                {row.original.leadData.name}
              </Link>
              <p className="text-xs text-gray">{row.original.leadData.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "Husmodell",
        header: "Husmodell",
        cell: ({ row }) => <HouseModelCell id={row.original.id} />,
      },
      {
        accessorKey: "Opprettet kl",
        header: "Opprettet kl",
        cell: ({ row }) => (
          <p className="text-sm font-semibold text-black w-max">
            {formatTimestamp(row.original.createdAt)}
          </p>
        ),
      },
      {
        accessorKey: "Telefonnummer",
        header: "Telefonnummer",
        cell: ({ row }) => (
          <p className="text-sm font-semibold text-black w-max">
            {row.original.leadData.telefon}
          </p>
        ),
      },
      {
        accessorKey: "Broker",
        header: "Broker",
        cell: ({ row }) => <BrokerCell id={row.original.id} />,
      },
      {
        accessorKey: "adresse",
        header: "Adresse",
        cell: ({ row }) => (
          <>
            {row.original.address ? (
              <div className="flex items-center gap-3 w-max">
                <img src={Ic_map} alt="map" className="w-10 h-10" />
                <div>
                  <p className="text-black text-sm mb-[2px] font-medium">
                    Sokkabekveien 77
                  </p>
                  <span className="text-gray text-xs">3478 Nærsnes</span>
                </div>
              </div>
            ) : (
              <p className="text-center">-</p>
            )}
          </>
        ),
      },
      {
        accessorKey: "Oppdatert kl",
        header: "Oppdatert kl",
        cell: ({ row }) => (
          <p className="text-sm font-semibold text-black w-max">
            {formatTimestamp(row.original.updatedAt)}
          </p>
        ),
      },
      {
        accessorKey: "Siste aktivitet",
        header: "Siste aktivitet",
        cell: ({ row }) => (
          <p className="text-sm font-semibold text-black w-[500px]">
            {row.original.leadData?.notaterFørsteSamtale}
          </p>
        ),
      },
      {
        id: "handling",
        header: "Handling",
        cell: () => (
          <button className="h-8 w-8 flex items-center justify-center">
            <Ellipsis className="h-4 w-4 text-gray-500" />
          </button>
        ),
      },
    ],
    [email, navigate, page]
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
  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads From Supplier");

    XLSX.writeFile(wb, "leads_from_supplier.xlsx");
  };
  return (
    <>
      <div className="px-4 md:px-6 pt-6 pb-16 flex flex-col gap-4 md:gap-6">
        <div className="flex lg:items-center flex-col lg:flex-row gap-2 justify-between">
          <div className="shadow-shadow1 border border-gray1 rounded-[8px] flex w-max">
            <div
              className={`p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm cursor-pointer ${
                selectedDateRange === "12 måneder" && "bg-gray2"
              }`}
              onClick={() => setSelectedDateRange("12 måneder")}
            >
              12 måneder
            </div>
            <div
              className={`p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm border border-t-0 border-b-0 border-gray1 cursor-pointer ${
                selectedDateRange === "30 dager" && "bg-gray2"
              }`}
              onClick={() => setSelectedDateRange("30 dager")}
            >
              30 dager
            </div>
            <div
              className={`p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm cursor-pointer border-r border-gray1 ${
                selectedDateRange === "7 dager" && "bg-gray2"
              }`}
              onClick={() => setSelectedDateRange("7 dager")}
            >
              7 dager
            </div>
            <div
              className={`p-2.5 md:py-[10px] md:px-4 text-black2 font-medium text-[13px] sm:text-sm cursor-pointer ${
                selectedDateRange === "24 timer" && "bg-gray2"
              }`}
              onClick={() => setSelectedDateRange("24 timer")}
            >
              24 timer
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
            <DatePickerComponent
              selectedDate={selectedDate1}
              onDateChange={setSelectedDate1}
              dateFormat="MM/dd/yyyy"
              placeholderText="Select dates"
              className="border border-gray1 rounded-[8px] flex gap-2 items-center p-2.5 md:py-[10px] md:px-4 cursor-pointer shadow-shadow1 h-[40px] w-max"
            />
          </div>
        </div>
        <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between bg-lightPurple rounded-[12px] py-3 px-3 gap-2 md:px-4">
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
          <div className="flex gap-3 items-center">
            <div
              className="border border-gray1 rounded-[8px] flex gap-2 items-center p-2.5 md:py-[10px] md:px-4 cursor-pointer shadow-shadow1 h-[40px] bg-[#fff]"
              onClick={downloadExcel}
            >
              <img src={Ic_download} alt="" />
              <span className="text-black font-medium text-sm">Eksporter</span>
            </div>
            <div className="border border-gray1 rounded-[8px] flex gap-2 items-center p-2.5 md:py-[10px] md:px-4 cursor-pointer shadow-shadow1 h-[40px] bg-[#fff]">
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
    </>
  );
};
