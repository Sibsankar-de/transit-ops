"use client";

import React, { useState, useMemo } from "react";
import { ColumnDef, SortingState, PaginationState } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { RequestMaintenanceForm, RequestFormValues } from "@/components/maintenance/RequestMaintenanceForm";
import { Wrench, Calendar, AlertTriangle } from "lucide-react";
import { cn } from "@/components/utils";

interface MaintenanceLog {
  id: string;
  vehicle: string;
  type: string;
  description: string;
  mechanic: string;
  cost: number;
  date: string;
  status: "In Progress" | "Completed" | "Scheduled";
}

const INITIAL_LOGS: MaintenanceLog[] = [
  {
    id: "MNT-0412",
    vehicle: "KEB 103W",
    type: "Engine Repair",
    description: "Major engine overhaul — oil leak in cylinder 4",
    mechanic: "Auto Excellence",
    cost: 84000,
    date: "2025-07-10",
    status: "In Progress",
  },
  {
    id: "MNT-0411",
    vehicle: "KJA 445R",
    type: "Tire Replacement",
    description: "All 8 tires replaced — excessive wear",
    mechanic: "TireMaster",
    cost: 62000,
    date: "2025-07-09",
    status: "In Progress",
  },
  {
    id: "MNT-0410",
    vehicle: "KAA 201Z",
    type: "Brake Service",
    description: "Brake pad and rotor replacement",
    mechanic: "Auto Excellence",
    cost: 22500,
    date: "2025-07-06",
    status: "Completed",
  },
  {
    id: "MNT-0409",
    vehicle: "KBC 014K",
    type: "Oil Change",
    description: "Routine oil and filter change",
    mechanic: "Depot Bay 2",
    cost: 8500,
    date: "2025-07-04",
    status: "Completed",
  },
];

const INITIAL_UPCOMING: MaintenanceLog[] = [
  {
    id: "MNT-0413",
    vehicle: "KDB 552Y",
    type: "Engine Check",
    description: "Scheduled 10,000 km engine diagnostic",
    mechanic: "Internal Garage",
    cost: 0,
    date: "2025-07-18",
    status: "Scheduled",
  },
  {
    id: "MNT-0414",
    vehicle: "KHA 112P",
    type: "Transmission",
    description: "Transmission fluid and filter service",
    mechanic: "Internal Garage",
    cost: 0,
    date: "2025-07-20",
    status: "Scheduled",
  },
];

const VEHICLES = [
  { id: "v1", registration: "KAA 201Z", make: "Isuzu", model: "FTR" },
  { id: "v2", registration: "KBC 014K", make: "Mitsubishi", model: "Fuso FJ" },
  { id: "v3", registration: "KDB 552Y", make: "Mercedes", model: "Actros" },
  { id: "v4", registration: "KEB 103W", make: "MAN", model: "TGS 26.440" },
  { id: "v5", registration: "KFA 291C", make: "Toyota", model: "Hiace" },
  { id: "v6", registration: "KGA 387H", make: "Scania", model: "R560" },
  { id: "v7", registration: "KHA 112P", make: "Hino", model: "500 FC" },
  { id: "v8", registration: "KJA 445R", make: "Volvo", model: "FH16" },
  { id: "v9", registration: "KKA 771X", make: "DAF", model: "XF 440" },
  { id: "v10", registration: "KLA 002B", make: "Isuzu", model: "NQR" },
];

const TABS = ["History", "Upcoming", "+ Request"];

export default function MaintenancePage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>(INITIAL_LOGS);
  const [upcoming, setUpcoming] = useState<MaintenanceLog[]>(INITIAL_UPCOMING);
  const [activeTab, setActiveTab] = useState("History");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Aggregated Stats
  const stats = useMemo(() => {
    const totalCost = logs.reduce((sum, item) => sum + item.cost, 0);
    return {
      vehiclesInShop: logs.filter((l) => l.status === "In Progress").length,
      scheduledServices: upcoming.length,
      completedThisMonth: logs.filter((l) => l.status === "Completed").length,
      totalCost,
    };
  }, [logs, upcoming]);

  // List of vehicles in shop
  const vehiclesInShopList = useMemo(() => {
    return logs
      .filter((l) => l.status === "In Progress")
      .map((l) => l.vehicle);
  }, [logs]);

  // Slicing + Sorting for History DataTable
  const sortedAndPaginatedLogs = useMemo(() => {
    let result = [...logs];

    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      result.sort((a, b) => {
        let valA = a[id as keyof MaintenanceLog];
        let valB = b[id as keyof MaintenanceLog];

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
  }, [logs, sorting, pagination]);

  const pageCount = Math.ceil(logs.length / pagination.pageSize);

  const columns = useMemo<ColumnDef<MaintenanceLog>[]>(() => {
    return [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <span className="font-mono text-primary font-bold tracking-wider cursor-pointer hover:underline">
            {row.original.id}
          </span>
        ),
      },
      {
        accessorKey: "vehicle",
        header: "Vehicle",
        cell: ({ row }) => (
          <span className="font-semibold text-secondary-foreground">
            {row.original.vehicle}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {row.original.type}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="text-secondary-foreground truncate max-w-[200px] block" title={row.original.description}>
            {row.original.description}
          </span>
        ),
      },
      {
        accessorKey: "mechanic",
        header: "Mechanic",
        cell: ({ row }) => (
          <span className="text-secondary-foreground">
            {row.original.mechanic}
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
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-secondary-foreground">{row.original.date}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          const statusStyle =
            status === "In Progress"
              ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
              : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
          return (
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold capitalize whitespace-nowrap",
                statusStyle
              )}
            >
              {status}
            </span>
          );
        },
      },
    ];
  }, []);

  const handleRequestSubmit = (data: RequestFormValues) => {
    const selectedVeh = VEHICLES.find((v) => v.id === data.vehicleId);
    const newLog: MaintenanceLog = {
      id: `MNT-0${400 + logs.length + upcoming.length + 5}`,
      vehicle: selectedVeh ? selectedVeh.registration : "Unknown",
      type: data.type,
      description: data.description,
      mechanic: data.mechanic || "Internal Garage",
      cost: 0,
      date: data.date,
      status: "Scheduled",
    };
    setUpcoming((prev) => [newLog, ...prev]);
    setActiveTab("Upcoming");
  };

  return (
    <div className="space-y-6">
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Vehicles In Shop" value={String(stats.vehiclesInShop)} />
        <StatsCard title="Scheduled Services" value={String(stats.scheduledServices)} />
        <StatsCard title="Completed This Month" value={String(stats.completedThisMonth)} />
        <StatsCard
          title="Total Cost (Jul)"
          value={`KES ${stats.totalCost.toLocaleString()}`}
          color="text-blue-400"
        />
      </div>

      {/* Warning Banner */}
      {vehiclesInShopList.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400 text-sm">
          <Wrench size={16} className="shrink-0 text-amber-400" />
          <div className="flex flex-wrap items-center gap-1.5 font-medium">
            <span>Vehicles currently in shop (unavailable for dispatch):</span>
            {vehiclesInShopList.map((veh, i) => (
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

      {/* Tabs list */}
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

      {/* Tab Panels */}
      {activeTab === "History" && (
        <DataTable
          columns={columns}
          data={sortedAndPaginatedLogs}
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          emptyState={
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-muted-foreground text-sm">No maintenance history logs.</p>
            </div>
          }
        />
      )}

      {activeTab === "Upcoming" && (
        <div className="space-y-4 max-w-2xl">
          {upcoming.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-card relative overflow-hidden group hover:border-primary/40 transition-colors"
            >
              {/* Left Accent line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />

              <div className="pl-3 space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-primary font-bold text-xs">
                    {item.id}
                  </span>
                  <span className="font-bold text-foreground text-sm">
                    {item.type}
                  </span>
                  <span className="inline-block bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-secondary-foreground">
                  <span className="font-semibold text-foreground">{item.vehicle}</span>
                  <span className="mx-1.5">•</span>
                  <span>{item.description}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors pr-1">
                <Calendar size={14} />
                <span className="text-xs font-mono font-medium">{item.date}</span>
              </div>
            </div>
          ))}

          {upcoming.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-xl border border-border">
              <p className="text-muted-foreground text-sm">No upcoming services scheduled.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "+ Request" && (
        <RequestMaintenanceForm onSubmit={handleRequestSubmit} vehicles={VEHICLES} />
      )}
    </div>
  );
}

function StatsCard({
  title,
  value,
  color = "text-foreground",
}: {
  title: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-2">
      <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
        {title}
      </p>
      <p className={cn("text-2xl font-bold font-mono tracking-tight", color)}>
        {value}
      </p>
    </div>
  );
}
