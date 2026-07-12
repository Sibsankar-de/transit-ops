"use client";

import React, { useState, useMemo } from "react";
import { ColumnDef, SortingState, PaginationState } from "@tanstack/react-table";
import { DriverStatus } from "@/enums/driverStatus.enum";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { SearchIcon } from "@/components/ui/SearchInput";
import { AddDriverModal } from "@/components/drivers/AddDriverModal";
import { EditDriverModal } from "@/components/drivers/EditDriverModal";
import { DriverFormValues } from "@/components/drivers/DriverForm";
import { Eye, Pencil, Plus, AlertTriangle } from "lucide-react";
import { cn } from "@/components/utils";

interface Driver {
  id: string;
  name: string;
  licenseNo: string;
  category: string;
  expiry: string;
  contact: string;
  safetyScore: number;
  status: DriverStatus;
}

const INITIAL_DRIVERS: Driver[] = [
  {
    id: "d1",
    name: "Felix Mutua",
    licenseNo: "DL-KE-04421",
    category: "CE",
    expiry: "2026-10-15",
    contact: "+254 712 441 200",
    safetyScore: 94,
    status: DriverStatus.AVAILABLE,
  },
  {
    id: "d2",
    name: "Grace Wanjiku",
    licenseNo: "DL-KE-08812",
    category: "C",
    expiry: "2026-08-18", // Will trigger amber warning (expires soon relative to 2026-07-12)
    contact: "+254 722 331 101",
    safetyScore: 88,
    status: DriverStatus.ON_TRIP,
  },
  {
    id: "d3",
    name: "Samuel Kiprop",
    licenseNo: "DL-KE-11203",
    category: "E",
    expiry: "2026-08-22", // Will trigger amber warning
    contact: "+254 733 224 300",
    safetyScore: 76,
    status: DriverStatus.ON_TRIP,
  },
  {
    id: "d4",
    name: "Amina Hassan",
    licenseNo: "DL-KE-03345",
    category: "CE",
    expiry: "2026-11-30",
    contact: "+254 700 119 877",
    safetyScore: 91,
    status: DriverStatus.AVAILABLE,
  },
  {
    id: "d5",
    name: "Peter Njoroge",
    licenseNo: "DL-KE-09901",
    category: "B",
    expiry: "2026-06-30", // Will trigger red warning (already expired relative to 2026-07-12)
    contact: "+254 724 881 220",
    safetyScore: 62,
    status: DriverStatus.SUSPENDED,
  },
  {
    id: "d6",
    name: "Joyce Otieno",
    licenseNo: "DL-KE-07712",
    category: "D",
    expiry: "2027-01-20",
    contact: "+254 733 991 044",
    safetyScore: 97,
    status: DriverStatus.AVAILABLE,
  },
  {
    id: "d7",
    name: "Brian Kamau",
    licenseNo: "DL-KE-02212",
    category: "CE",
    expiry: "2027-04-10",
    contact: "+254 711 233 900",
    safetyScore: 85,
    status: DriverStatus.OFF_DUTY,
  },
  {
    id: "d8",
    name: "Miriam Achieng",
    licenseNo: "DL-KE-14401",
    category: "C",
    expiry: "2026-08-05",
    contact: "+254 725 882 110",
    safetyScore: 89,
    status: DriverStatus.AVAILABLE,
  },
  {
    id: "d9",
    name: "David Odhiambo",
    licenseNo: "DL-KE-05521",
    category: "E",
    expiry: "2026-08-01",
    contact: "+254 701 445 322",
    safetyScore: 71,
    status: DriverStatus.OFF_DUTY,
  },
  {
    id: "d10",
    name: "Lydia Wambua",
    licenseNo: "DL-KE-12309",
    category: "CE",
    expiry: "2026-12-14",
    contact: "+254 720 779 003",
    safetyScore: 93,
    status: DriverStatus.AVAILABLE,
  },
];

const STATUS_STYLES: Record<DriverStatus, string> = {
  [DriverStatus.AVAILABLE]: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  [DriverStatus.ON_TRIP]: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  [DriverStatus.OFF_DUTY]: "bg-slate-500/15 text-slate-400 border border-slate-500/30",
  [DriverStatus.SUSPENDED]: "bg-red-500/15 text-red-400 border border-red-500/30",
};

const AVATAR_BG_COLORS = [
  "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  "bg-pink-500/20 text-pink-400 border border-pink-500/30",
];

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // Expiry Date Warning logic relative to current date (2026-07-12)
  const getExpiryStyle = (dateStr: string) => {
    const expiry = new Date(dateStr);
    const now = new Date("2026-07-12");
    const diff = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { className: "text-red-400 font-semibold flex items-center gap-1", warn: true, color: "red" };
    } else if (diffDays <= 60) {
      return { className: "text-amber-400 font-semibold flex items-center gap-1", warn: true, color: "amber" };
    }
    return { className: "text-secondary-foreground", warn: false, color: "" };
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return "bg-emerald-500";
    if (score >= 75) return "bg-amber-500";
    return "bg-red-500";
  };

  // Filtering
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const matchesSearch =
        search === "" ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.licenseNo.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "" || d.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [drivers, search, statusFilter]);

  // Sorting + Pagination
  const sortedAndPaginatedDrivers = useMemo(() => {
    let result = [...filteredDrivers];

    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      result.sort((a, b) => {
        let valA = a[id as keyof Driver];
        let valB = b[id as keyof Driver];

        if (typeof valA === "string" && typeof valB === "string") {
          return desc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        } else {
          return desc
            ? (valB as number) - (valA as number)
            : (valA as number) - (valB as number);
        }
      });
    }

    const start = pagination.pageIndex * pagination.pageSize;
    return result.slice(start, start + pagination.pageSize);
  }, [filteredDrivers, sorting, pagination]);

  const pageCount = Math.ceil(filteredDrivers.length / pagination.pageSize);

  const columns = useMemo<ColumnDef<Driver>[]>(() => {
    return [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const initials = row.original.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          const bgCol = AVATAR_BG_COLORS[row.index % AVATAR_BG_COLORS.length];

          return (
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                  bgCol
                )}
              >
                {initials}
              </div>
              <span className="font-semibold text-foreground">
                {row.original.name}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "licenseNo",
        header: "License No.",
        cell: ({ row }) => (
          <span className="font-mono text-secondary-foreground text-xs">
            {row.original.licenseNo}
          </span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="inline-block bg-secondary text-foreground text-xs px-2 py-0.5 rounded border border-border font-semibold">
            {row.original.category}
          </span>
        ),
      },
      {
        accessorKey: "expiry",
        header: "Expiry",
        cell: ({ row }) => {
          const expiryStyle = getExpiryStyle(row.original.expiry);
          return (
            <span className={expiryStyle.className}>
              {row.original.expiry}
              {expiryStyle.warn && (
                <AlertTriangle size={14} className="shrink-0" />
              )}
            </span>
          );
        },
      },
      {
        accessorKey: "contact",
        header: "Contact",
        cell: ({ row }) => (
          <span className="text-secondary-foreground">{row.original.contact}</span>
        ),
      },
      {
        accessorKey: "safetyScore",
        header: "Safety Score",
        cell: ({ row }) => {
          const score = row.original.safetyScore;
          const barColor = getSafetyScoreColor(score);
          return (
            <div className="flex items-center gap-3 min-w-[120px]">
              <div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden border border-border/50">
                <div
                  className={cn("h-full rounded-full", barColor)}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className={cn("text-xs font-bold font-mono", score >= 90 ? "text-emerald-400" : score >= 75 ? "text-amber-400" : "text-red-400")}>
                {score}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold capitalize whitespace-nowrap",
              STATUS_STYLES[row.original.status]
            )}
          >
            {row.original.status.toLowerCase()}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        meta: {
          className: "text-right",
        },
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              className="p-1.5 h-8 w-8 flex items-center justify-center border-border hover:bg-secondary"
              onClick={() => {
                setSelectedDriver(row.original);
                setEditModalOpen(true);
              }}
              aria-label="Edit Driver"
            >
              <Pencil size={15} />
            </Button>
          </div>
        ),
      },
    ];
  }, [drivers]);

  const handleAddDriver = (data: DriverFormValues) => {
    const newDriver: Driver = {
      id: `d${Date.now()}`,
      name: data.name,
      licenseNo: data.licenseNo,
      category: data.category,
      expiry: data.expiry,
      contact: data.contact,
      safetyScore: data.safetyScore,
      status: data.status,
    };
    setDrivers((prev) => [newDriver, ...prev]);
    setAddModalOpen(false);
  };

  const handleEditDriver = (data: DriverFormValues) => {
    if (!selectedDriver) return;
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === selectedDriver.id
          ? {
              ...d,
              name: data.name,
              licenseNo: data.licenseNo,
              category: data.category,
              expiry: data.expiry,
              contact: data.contact,
              safetyScore: data.safetyScore,
              status: data.status,
            }
          : d
      )
    );
    setEditModalOpen(false);
    setSelectedDriver(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative flex items-center">
          <Input
            placeholder="Search by name or license..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            icon={<SearchIcon />}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          <Select
            placeholder="All Status"
            value={statusFilter}
            options={[
              { key: "", value: "All Status" },
              ...Object.values(DriverStatus).map((status) => ({
                key: status,
                value: status.toLowerCase().replace(/_/g, " "),
              })),
            ]}
            onChange={(val) => {
              setStatusFilter(val);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="w-[150px]"
          />

          <Button
            variant="primary"
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 h-10 px-4"
          >
            <Plus size={16} />
            <span>Add Driver</span>
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={sortedAndPaginatedDrivers}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        emptyState={
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-muted-foreground text-sm">No drivers found.</p>
          </div>
        }
      />

      <AddDriverModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddDriver}
      />

      <EditDriverModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedDriver(null);
        }}
        driver={selectedDriver}
        onSave={handleEditDriver}
      />
    </div>
  );
}
