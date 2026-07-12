"use client";

import React, { useState, useMemo } from "react";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { DriverStatus } from "@/enums/driverStatus.enum";
import { Driver } from "@/types/api";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { SearchIcon } from "@/components/ui/SearchInput";
import { AddDriverModal } from "@/components/drivers/AddDriverModal";
import { EditDriverModal } from "@/components/drivers/EditDriverModal";
import { DriverFormValues } from "@/components/drivers/DriverForm";
import { Pencil, Plus, AlertTriangle } from "lucide-react";
import { cn } from "@/components/utils";
import {
  useGetDriversQuery,
  useCreateDriverMutation,
  useUpdateDriverMutation,
} from "@/store/slices/driversApiSlice";

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

const DEFAULT_PAGE_SIZE = 10;

export default function DriversPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // RTK Query — server-side pagination
  const { data: response, isLoading, isFetching } = useGetDriversQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  const [createDriver] = useCreateDriverMutation();
  const [updateDriver] = useUpdateDriverMutation();

  const drivers = response?.data?.docs ?? [];
  const pageCount = response?.data?.totalPages ?? 0;

  // Client-side search filter (applied on top of server page for instant UX)
  const filteredDrivers = useMemo(() => {
    if (!search && !statusFilter) return drivers;
    return drivers.filter((d) => {
      const matchesSearch =
        !search ||
        d.licenseNumber.toLowerCase().includes(search.toLowerCase()) ||
        (d.user?.name ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, search, statusFilter]);

  const getExpiryStyle = (dateStr: string) => {
    const expiry = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { className: "text-red-400 font-semibold flex items-center gap-1", warn: true };
    if (diffDays <= 60) return { className: "text-amber-400 font-semibold flex items-center gap-1", warn: true };
    return { className: "text-secondary-foreground", warn: false };
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return "bg-emerald-500";
    if (score >= 75) return "bg-amber-500";
    return "bg-red-500";
  };

  const columns = useMemo<ColumnDef<Driver>[]>(() => [
    {
      accessorKey: "user.name",
      header: "Name",
      cell: ({ row, table }) => {
        const name = row.original.user?.name ?? row.original.userId;
        const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
        const bgCol = AVATAR_BG_COLORS[table.getRowModel().rows.indexOf(row) % AVATAR_BG_COLORS.length];
        return (
          <div className="flex items-center gap-3">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0", bgCol)}>
              {initials}
            </div>
            <span className="font-semibold text-foreground">{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "licenseNumber",
      header: "License No.",
      cell: ({ row }) => (
        <span className="font-mono text-secondary-foreground text-xs">{row.original.licenseNumber}</span>
      ),
    },
    {
      accessorKey: "licenseCategory",
      header: "Category",
      cell: ({ row }) => (
        <span className="inline-block bg-secondary text-foreground text-xs px-2 py-0.5 rounded border border-border font-semibold">
          {row.original.licenseCategory}
        </span>
      ),
    },
    {
      accessorKey: "licenseExpiryDate",
      header: "Expiry",
      cell: ({ row }) => {
        const expiryStyle = getExpiryStyle(row.original.licenseExpiryDate);
        const dateStr = new Date(row.original.licenseExpiryDate).toLocaleDateString();
        return (
          <span className={expiryStyle.className}>
            {dateStr}
            {expiryStyle.warn && <AlertTriangle size={14} className="shrink-0" />}
          </span>
        );
      },
    },
    {
      accessorKey: "safetyScore",
      header: "Safety Score",
      cell: ({ row }) => {
        const score = row.original.safetyScore;
        return (
          <div className="flex items-center gap-3 min-w-[120px]">
            <div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden border border-border/50">
              <div
                className={cn("h-full rounded-full", getSafetyScoreColor(score))}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className={cn("text-xs font-bold font-mono",
              score >= 90 ? "text-emerald-400" : score >= 75 ? "text-amber-400" : "text-red-400"
            )}>
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
        <span className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold capitalize whitespace-nowrap",
          STATUS_STYLES[row.original.status]
        )}>
          {row.original.status.toLowerCase().replace(/_/g, " ")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      meta: { className: "text-right" },
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            className="p-1.5 h-8 w-8 flex items-center justify-center border-border hover:bg-secondary"
            onClick={() => { setSelectedDriver(row.original); setEditModalOpen(true); }}
            aria-label="Edit Driver"
          >
            <Pencil size={15} />
          </Button>
        </div>
      ),
    },
  ], []);

  const handleAddDriver = async (data: DriverFormValues) => {
    try {
      // NOTE: The DriverForm does not yet collect a userId (linked User account).
      // Until the form is updated, the userId will need to be passed by the parent
      // or selected via a User lookup field. Using empty string as temporary placeholder.
      await createDriver({
        userId: "", // TODO: Add userId lookup field to DriverForm
        licenseNumber: data.licenseNo,
        licenseCategory: data.category,
        licenseExpiryDate: data.expiry,
      }).unwrap();
      setAddModalOpen(false);
    } catch (err: any) {
      alert(err?.data?.message ?? "Failed to create driver.");
    }
  };

  const handleEditDriver = async (data: DriverFormValues) => {
    if (!selectedDriver) return;
    try {
      await updateDriver({
        id: selectedDriver.id,
        data: {
          licenseNumber: data.licenseNo,
          licenseCategory: data.category,
          licenseExpiryDate: data.expiry,
          safetyScore: data.safetyScore,
          status: data.status,
        },
      }).unwrap();
      setEditModalOpen(false);
      setSelectedDriver(null);
    } catch (err: any) {
      alert(err?.data?.message ?? "Failed to update driver.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative flex items-center">
          <Input
            placeholder="Search by name or license..."
            value={search}
            onChange={(e: any) => {
              setSearch(e.target.value);
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
              ...Object.values(DriverStatus).map((s) => ({
                key: s,
                value: s.toLowerCase().replace(/_/g, " "),
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

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredDrivers}
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={setPagination}
          emptyState={
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-muted-foreground text-sm">No drivers found.</p>
            </div>
          }
        />
      )}

      {isFetching && !isLoading && (
        <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground flex items-center gap-2 shadow-lg">
          <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
          Refreshing...
        </div>
      )}

      <AddDriverModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddDriver}
      />
      <EditDriverModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedDriver(null); }}
        driver={selectedDriver}
        onSave={handleEditDriver}
      />
    </div>
  );
}
