"use client";

import React, { useState, useMemo } from "react";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { MaintenanceLog, MaintenanceStatus } from "@/types/api";
import { DataTable } from "@/components/ui/DataTable";
import { RequestMaintenanceForm, RequestFormValues } from "@/components/maintenance/RequestMaintenanceForm";
import { Wrench, Calendar, Plus } from "lucide-react";
import { cn } from "@/components/utils";
import { Button } from "@/components/ui/Button";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import {
  useListMaintenanceLogsQuery,
  useCreateMaintenanceLogMutation,
  useCloseMaintenanceLogMutation,
} from "@/store/slices/maintenanceApiSlice";
import { useGetVehiclesQuery } from "@/store/slices/vehiclesApiSlice";

const TABS = ["History", "Upcoming"];

const STATUS_STYLES: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.OPEN]: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  [MaintenanceStatus.IN_PROGRESS]: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  [MaintenanceStatus.CLOSED]: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
};

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState("History");
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  const [historyPagination, setHistoryPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [upcomingPagination, setUpcomingPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // RTK Query — History: CLOSED logs
  const {
    data: historyResponse,
    isLoading: isHistoryLoading,
    isFetching: isHistoryFetching,
  } = useListMaintenanceLogsQuery({
    page: historyPagination.pageIndex + 1,
    limit: historyPagination.pageSize,
    status: MaintenanceStatus.CLOSED,
  });

  // RTK Query — Upcoming: OPEN logs
  const {
    data: upcomingResponse,
    isLoading: isUpcomingLoading,
  } = useListMaintenanceLogsQuery({
    page: upcomingPagination.pageIndex + 1,
    limit: upcomingPagination.pageSize,
    status: MaintenanceStatus.OPEN,
  });

  // RTK Query — In-Progress for warning banner
  const { data: inProgressResponse } = useListMaintenanceLogsQuery({
    page: 1,
    limit: 50,
    status: MaintenanceStatus.IN_PROGRESS,
  });

  const { data: vehiclesResponse } = useGetVehiclesQuery();

  const [createMaintenanceLog, { isLoading: isCreating }] = useCreateMaintenanceLogMutation();
  const [closeMaintenanceLog] = useCloseMaintenanceLogMutation();

  const historyLogs = historyResponse?.data?.docs ?? [];
  const historyPageCount = historyResponse?.data?.totalPages ?? 0;

  const upcomingLogs = upcomingResponse?.data?.docs ?? [];
  const upcomingPageCount = upcomingResponse?.data?.totalPages ?? 0;

  const inProgressLogs = inProgressResponse?.data?.docs ?? [];

  // Vehicles for request form
  const vehicles = useMemo(() =>
    (vehiclesResponse?.data ?? []).map((v) => ({
      id: v.id,
      registration: v.registrationNumber,
      make: v.type,   // using type as make
      model: v.name,  // using name as model
    })),
    [vehiclesResponse]
  );

  // Stats from data
  const stats = useMemo(() => ({
    vehiclesInShop: inProgressLogs.length,
    scheduledServices: upcomingResponse?.data?.totalDocs ?? 0,
    completedThisMonth: historyResponse?.data?.totalDocs ?? 0,
    totalCost: historyLogs.reduce((sum, l) => sum + l.cost, 0),
  }), [inProgressLogs, upcomingResponse, historyResponse, historyLogs]);

  const vehiclesInShopList = useMemo(() =>
    inProgressLogs.map((l) =>
      l.vehicle?.registrationNumber ?? l.vehicleId
    ),
    [inProgressLogs]
  );

  const columns = useMemo<ColumnDef<MaintenanceLog>[]>(() => [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-primary font-bold tracking-wider cursor-pointer hover:underline text-xs">
          {row.original.id.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      accessorKey: "vehicle",
      header: "Vehicle",
      cell: ({ row }) => (
        <span className="font-semibold text-secondary-foreground text-sm">
          {row.original.vehicle?.registrationNumber ?? row.original.vehicleId}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span
          className="text-secondary-foreground truncate max-w-[200px] block"
          title={row.original.description}
        >
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: "cost",
      header: "Cost",
      cell: ({ row }) => (
        <span className="text-secondary-foreground font-mono">
          KES {row.original.cost.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "startDate",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-secondary-foreground">
          {new Date(row.original.startDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold capitalize whitespace-nowrap",
            STATUS_STYLES[status]
          )}>
            {status.replace("_", " ")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const isOpen = row.original.status !== MaintenanceStatus.CLOSED;
        if (!isOpen) return null;
        return (
          <button
            onClick={async () => {
              if (confirm("Close this maintenance log?")) {
                try { await closeMaintenanceLog(row.original.id).unwrap(); }
                catch (err: any) { alert(err?.data?.message ?? "Failed to close log."); }
              }
            }}
            className="text-xs text-emerald-400 hover:underline cursor-pointer font-semibold"
          >
            Close
          </button>
        );
      },
    },
  ], [closeMaintenanceLog]);

  const handleRequestSubmit = async (data: RequestFormValues) => {
    try {
      await createMaintenanceLog({
        vehicleId: data.vehicleId,
        description: data.description,
        cost: 0,
        startDate: data.date,
      }).unwrap();
      setRequestModalOpen(false);
      setActiveTab("Upcoming");
    } catch (err: any) {
      alert(err?.data?.message ?? "Failed to create maintenance request.");
    }
  };

  const isLoading = isHistoryLoading || isUpcomingLoading;

  return (
    <div className="space-y-6">
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Vehicles In Shop" value={String(stats.vehiclesInShop)} />
        <StatsCard title="Scheduled Services" value={String(stats.scheduledServices)} />
        <StatsCard title="Completed / Closed" value={String(stats.completedThisMonth)} />
        <StatsCard
          title="History Cost Total"
          value={`KES ${stats.totalCost.toLocaleString()}`}
          color="text-blue-400"
        />
      </div>

      {/* In-shop warning banner */}
      {vehiclesInShopList.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400 text-sm">
          <Wrench size={16} className="shrink-0 text-amber-400" />
          <div className="flex flex-wrap items-center gap-1.5 font-medium">
            <span>Vehicles currently in shop (unavailable for dispatch):</span>
            {vehiclesInShopList.map((veh) => (
              <span
                key={veh}
                className="bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 text-xs font-mono font-bold"
              >
                {veh}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs list with Request Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-lg border border-border/50 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                activeTab === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          onClick={() => setRequestModalOpen(true)}
          className="flex items-center gap-2 h-9 px-3 text-xs"
        >
          <Plus size={14} />
          <span>Request Maintenance</span>
        </Button>
      </div>

      {/* Tab Panels */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeTab === "History" ? (
        <DataTable
          columns={columns}
          data={historyLogs}
          pageCount={historyPageCount}
          pagination={historyPagination}
          onPaginationChange={setHistoryPagination}
          emptyState={
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-muted-foreground text-sm">No maintenance history logs.</p>
            </div>
          }
        />
      ) : (
        <div className="space-y-4 max-w-2xl">
          {upcomingLogs.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-card relative overflow-hidden group hover:border-primary/40 transition-colors"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />

              <div className="pl-3 space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-primary font-bold text-xs">
                    {item.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="font-bold text-foreground text-sm">
                    {item.vehicle?.name ?? item.vehicleId}
                  </span>
                  <span className="inline-block bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-secondary-foreground">
                  <span className="font-semibold text-foreground">
                    {item.vehicle?.registrationNumber ?? ""}
                  </span>
                  {item.vehicle && <span className="mx-1.5">•</span>}
                  <span>{item.description}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors pr-1">
                <Calendar size={14} />
                <span className="text-xs font-mono font-medium">
                  {new Date(item.startDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {upcomingLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-xl border border-border">
              <p className="text-muted-foreground text-sm">No upcoming services scheduled.</p>
            </div>
          )}

          {/* Upcoming pagination */}
          {upcomingPageCount > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                disabled={upcomingPagination.pageIndex <= 0}
                onClick={() => setUpcomingPagination(p => ({ ...p, pageIndex: p.pageIndex - 1 }))}
                className="px-3 py-1.5 text-xs border border-border rounded-lg disabled:opacity-40 hover:bg-secondary transition-colors cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs text-muted-foreground">
                Page {upcomingPagination.pageIndex + 1} of {upcomingPageCount}
              </span>
              <button
                disabled={upcomingPagination.pageIndex + 1 >= upcomingPageCount}
                onClick={() => setUpcomingPagination(p => ({ ...p, pageIndex: p.pageIndex + 1 }))}
                className="px-3 py-1.5 text-xs border border-border rounded-lg disabled:opacity-40 hover:bg-secondary transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {isHistoryFetching && !isHistoryLoading && (
        <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground flex items-center gap-2 shadow-lg">
          <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
          Refreshing...
        </div>
      )}

      <Modal
        openState={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        header={
          <ModalHeader
            title="Request Maintenance"
            subtitle="Create a new maintenance log request"
          />
        }
        className="w-[95vw] max-w-150"
      >
        <RequestMaintenanceForm
          onSubmit={handleRequestSubmit}
          onCancel={() => setRequestModalOpen(false)}
          vehicles={vehicles}
          isSubmitting={isCreating}
        />
      </Modal>
    </div>
  );
}

function StatsCard({
  title, value, color = "text-foreground",
}: {
  title: string; value: string; color?: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-2">
      <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">{title}</p>
      <p className={cn("text-2xl font-bold font-mono tracking-tight", color)}>{value}</p>
    </div>
  );
}
